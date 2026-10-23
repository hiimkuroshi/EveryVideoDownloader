'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const { _electron: electron } = require('playwright');
const { listPackage } = require('@electron/asar');

const root = path.resolve(__dirname, '..');
const executablePath = path.resolve(process.argv[2] || path.join(root, 'dist/win-unpacked/EveryVideo.exe'));
const resources = path.join(path.dirname(executablePath), 'resources');
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
const testRoot = fs.mkdtempSync(path.join(root, 'output', 'desktop-smoke-'));
const data = path.join(testRoot, 'app-data');
const downloads = path.join(testRoot, 'downloads');
const fixtureDir = path.join(testRoot, 'fixtures');
fs.mkdirSync(fixtureDir, { recursive: true });
const env = {
  ...process.env,
  PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`,
  EVERYVIDEO_DATA_DIR: data,
  EVERYVIDEO_DOWNLOADS_DIR: downloads,
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.NODE_OPTIONS;
delete env.NODE_PATH;
let application;
let fixtureServer;

function tool(executable, args, options = {}) {
  const result = spawnSync(executable, args, { windowsHide: true, encoding: 'utf8', env, cwd: testRoot, ...options });
  assert.equal(result.status, 0, `${path.basename(executable)} failed: ${result.stderr || result.error}`);
  return result.stdout;
}

function descendants(pid) {
  const powershell = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const rows = JSON.parse(tool(powershell, ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name | ConvertTo-Json -Compress']));
  const result = [];
  const parents = [pid];
  while (parents.length) {
    const parent = parents.shift();
    for (const row of rows.filter(item => item.ParentProcessId === parent)) {
      result.push(row);
      parents.push(row.ProcessId);
    }
  }
  return result;
}

async function api(page, route, options) {
  return page.evaluate(async ({ route, options }) => {
    const response = await fetch(route, options);
    return { status: response.status, data: await response.json() };
  }, { route, options });
}

async function start() {
  application = await electron.launch({ executablePath, env, timeout: 45000 });
  const page = await application.firstWindow();
  await page.waitForSelector('#checkForm', { timeout: 30000 });
  return page;
}

async function beginDownload(page, url, extra = {}) {
  await page.evaluate(({ url, extra }) => {
    window.desktopSmokeEvents = [];
    window.desktopSmokeStream = new EventSource(`/api/download?${new URLSearchParams({ url, ...extra })}`);
    window.desktopSmokeStream.onmessage = event => {
      const message = JSON.parse(event.data);
      window.desktopSmokeEvents.push(message);
      if (message.done) window.desktopSmokeStream.close();
    };
  }, { url, extra });
}

async function waitDone(page) {
  await page.waitForFunction(() => window.desktopSmokeEvents.some(event => event.done), { timeout: 45000 });
  const events = await page.evaluate(() => window.desktopSmokeEvents);
  assert.equal(events.find(event => event.done).code, 0, JSON.stringify(events.filter(event => event.error || event.output).slice(-12)));
}

(async () => {
  assert.ok(fs.existsSync(executablePath), 'Run npm run desktop:pack first.');
  const files = listPackage(path.join(resources, 'app.asar')).map(file => file.replace(/\\/g, '/'));
  for (const forbidden of ['config.json', 'cookies.txt', 'project-vault', 'Download', 'scratch', 'output', '.git']) {
    assert.ok(!files.some(file => file === `/${forbidden}` || file.startsWith(`/${forbidden}/`)), `Private root packaged: ${forbidden}`);
  }
  assert.ok(files.includes('/node_modules/playwright-core/LICENSE'), 'Playwright license missing.');
  assert.ok(fs.existsSync(path.join(resources, 'core/yt_dlp/extractor/youtube/jsc/_builtin/vendor/yt.solver.core.js')));
  assert.ok(!fs.existsSync(path.join(resources, '.runtime/playwright/.links')));
  const nodeVersion = tool(executablePath, ['-e', 'process.stdout.write(process.versions.node)'], { env: { ...env, ELECTRON_RUN_AS_NODE: '1' } });
  assert.ok(Number(nodeVersion.split('.')[0]) >= 22, 'Embedded Node runtime is too old.');
  tool(path.join(resources, '.runtime/python/python.exe'), ['-B', '-c', 'import yt_dlp, ssl, sqlite3']);
  tool(path.join(resources, '.runtime/aria2/aria2c.exe'), ['--version']);
  const browserCheck = `process.env.PLAYWRIGHT_BROWSERS_PATH=${JSON.stringify(path.join(resources, '.runtime/playwright'))};
    const {chromium}=require(${JSON.stringify(path.join(resources, 'app.asar/node_modules/playwright'))});
    (async()=>{const browser=await chromium.launch({headless:true}); try { const page=await browser.newPage(); await page.setContent('<title>bundled-browser</title>'); if(await page.title()!=='bundled-browser') throw Error('Browser failed'); } finally { await browser.close(); }})().catch(error=>{console.error(error);process.exitCode=1});`;
  tool(executablePath, ['-e', browserCheck], { env: { ...env, ELECTRON_RUN_AS_NODE: '1' } });
  const ffmpeg = path.join(resources, '.runtime/ffmpeg/ffmpeg.exe');
  const ffprobe = path.join(resources, '.runtime/ffmpeg/ffprobe.exe');
  tool(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=10', '-f', 'lavfi', '-i', 'sine=frequency=880', '-t', '2', '-c:v', 'libx264', '-c:a', 'aac', '-f', 'dash', 'manifest.mpd'], { cwd: fixtureDir });
  tool(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', 'manifest.mpd', '-c', 'copy', 'sample.mp4'], { cwd: fixtureDir });
  fixtureServer = http.createServer((request, response) => {
    const basename = path.basename(new URL(request.url, 'http://fixture').pathname);
    const file = path.join(fixtureDir, basename === 'slow.mp4' ? 'sample.mp4' : basename);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
    const size = fs.statSync(file).size;
    const mime = basename.endsWith('.mpd') ? 'application/dash+xml' : basename.endsWith('.mp4') ? 'video/mp4' : 'video/iso.segment';
    const range = /bytes=(\d+)-(\d*)/.exec(request.headers.range || '');
    const startByte = range ? Number(range[1]) : 0;
    const endByte = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    response.writeHead(range ? 206 : 200, {
      'Content-Type': mime, 'Content-Length': endByte - startByte + 1, 'Accept-Ranges': 'bytes',
      ...(range ? { 'Content-Range': `bytes ${startByte}-${endByte}/${size}` } : {}),
    });
    if (request.method === 'HEAD') return response.end();
    fs.createReadStream(file, { start: startByte, end: endByte }).pipe(response);
  });
  await new Promise(resolve => fixtureServer.listen(0, '127.0.0.1', resolve));
  const fixtureOrigin = `http://127.0.0.1:${fixtureServer.address().port}`;
  let page = await start();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal(await page.evaluate(() => typeof require), 'undefined', 'Renderer can access Node.');
  const preferences = await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
  assert.equal(preferences.sandbox, true);
  assert.equal(preferences.contextIsolation, true);
  const origin = new URL(page.url()).origin;
  assert.equal((await fetch(`${origin}/api/config`)).status, 403, 'Unauthenticated API accepted.');
  const cookies = await application.context().cookies();
  const cookie = cookies.find(item => item.name === 'everyvideo_session');
  assert.ok(cookie.httpOnly);
  assert.equal((await fetch(`${origin}/api/config`, { headers: { Cookie: `${cookie.name}=${cookie.value}`, Origin: 'https://untrusted.invalid' } })).status, 403);
  const config = await api(page, '/api/config');
  assert.equal(config.status, 200);
  assert.equal(config.data.hasLocalFfmpeg, true);
  assert.equal(config.data.hasAria2c, true);
  assert.equal(config.data.downloadFolder, downloads);
  const metadata = await api(page, `/api/info?${new URLSearchParams({ url: `${fixtureOrigin}/sample.mp4` })}`);
  assert.equal(metadata.status, 200, JSON.stringify(metadata.data));
  assert.ok(metadata.data.formats?.length || metadata.data.url);
  const dashMetadata = await api(page, `/api/info?${new URLSearchParams({ url: `${fixtureOrigin}/manifest.mpd` })}`);
  assert.equal(dashMetadata.status, 200);
  const selectedVideo = await page.evaluate(info => {
    currentVideoData = info;
    processAndRenderFormats(info.formats);
    const video = parsedFormats.find(item => item.type === 'video');
    if (!video || !audioOnlyFormats.length) throw new Error('Separate DASH streams missing');
    selectFormatFromTable(video);
    return { id: video.id, format: selectedFormatValue };
  }, dashMetadata.data);
  assert.equal(selectedVideo.format, `${selectedVideo.id}+bestaudio`, 'Selecting an exact video ID must include audio by default');
  await beginDownload(page, `${fixtureOrigin}/manifest.mpd`, { format: selectedVideo.format, merge_output_format: 'mp4', output: downloads, custom_filename: 'exact-video-with-audio' });
  await waitDone(page);
  const exactFile = fs.readdirSync(downloads).find(file => file.startsWith('exact-video-with-audio') && file.endsWith('.mp4'));
  assert.ok(exactFile, 'Exact video with automatic audio missing');
  const exactProbe = JSON.parse(tool(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', path.join(downloads, exactFile)]));
  assert.deepEqual(new Set(exactProbe.streams.map(stream => stream.codec_type)), new Set(['video', 'audio']));
  await beginDownload(page, `${fixtureOrigin}/manifest.mpd`, { format: 'bestvideo+bestaudio', merge_output_format: 'mkv', output: downloads });
  await waitDone(page);
  const merged = fs.readdirSync(downloads).find(file => file.endsWith('.mkv'));
  assert.ok(merged, 'Merged output missing.');
  const probe = JSON.parse(tool(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', path.join(downloads, merged)]));
  assert.ok(probe.streams.some(stream => stream.codec_type === 'video'));
  assert.ok(probe.streams.some(stream => stream.codec_type === 'audio'));
  await beginDownload(page, `${fixtureOrigin}/slow.mp4`, { output: downloads, custom_filename: 'cancel-check', rate_limit: '1K' });
  await page.waitForFunction(() => window.desktopSmokeEvents.some(event => /\[download\].*%/.test(event.output || '')), { timeout: 30000 });
  const downloadId = await page.evaluate(() => window.desktopSmokeEvents.find(event => event.started).downloadId);
  assert.equal((await api(page, `/api/cancel-download?downloadId=${encodeURIComponent(downloadId)}`)).data.success, true);
  await page.waitForFunction(() => window.desktopSmokeEvents.some(event => event.done), { timeout: 15000 });
  await api(page, '/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ desktopSmokeTest: 'persisted' }) });
  await page.screenshot({ path: path.join(testRoot, 'desktop.png') });
  assert.deepEqual(errors, [], 'Renderer errors.');
  await application.close();
  application = null;
  assert.equal(JSON.parse(fs.readFileSync(path.join(data, 'config.json'), 'utf8')).desktopSmokeTest, 'persisted');
  page = await start();
  assert.equal((await api(page, '/api/config')).data.desktopSmokeTest, 'persisted');
  await beginDownload(page, `${fixtureOrigin}/slow.mp4`, { output: downloads, custom_filename: 'close-check', rate_limit: '1K' });
  await page.waitForFunction(() => window.desktopSmokeEvents.some(event => /\[download\].*%/.test(event.output || '')), { timeout: 30000 });
  const processes = descendants(application.process().pid);
  assert.ok(processes.some(item => item.Name.toLowerCase() === 'python.exe'), 'No active bundled downloader before close.');
  const oldOrigin = new URL(page.url()).origin;
  await application.close();
  application = null;
  await assert.rejects(fetch(`${oldOrigin}/api/config`), 'Backend still listens after desktop quit.');
  for (const item of processes) {
    assert.throws(() => process.kill(item.ProcessId, 0), `Process left after quit: ${item.Name} (${item.ProcessId})`);
  }
  console.log(`Desktop smoke passed: isolated UI, authenticated loopback API, bundled Node/Python/aria2/Chromium, extraction, DASH merge/FFprobe, cancel, persistence, active download tree shutdown. Embedded Node ${nodeVersion}.`);
  console.log(`Evidence: ${testRoot}`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (application) await application.close().catch(() => {});
  if (fixtureServer) await new Promise(resolve => fixtureServer.close(resolve));
});
