'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const http = require('node:http');
const { spawn, spawnSync, execFile } = require('node:child_process');
const { chromium } = require('playwright');
const { version } = require('../package.json');

const root = path.resolve(__dirname, '..');
const portable = path.join(root, `dist/EveryVideo-${version}-Portable-x64.exe`);
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
const testRoot = fs.mkdtempSync(path.join(root, 'output', 'desktop-smoke-portable-'));
const dataDir = path.join(testRoot, 'app-data');
const env = {
  ...process.env,
  PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`,
  EVERYVIDEO_DATA_DIR: dataDir,
  EVERYVIDEO_DOWNLOADS_DIR: path.join(testRoot, 'downloads'),
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.NODE_OPTIONS;
delete env.NODE_PATH;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let child;
let browser;
let fixture;

(async () => {
  assert.ok(fs.existsSync(portable), 'Run npm run desktop:build first.');
  const sample = path.join(testRoot, 'sample.mp4');
  const generated = spawnSync(path.join(root, 'dist/win-unpacked/resources/.runtime/ffmpeg/ffmpeg.exe'),
    ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=size=160x90:rate=5', '-t', '1', '-c:v', 'libx264', sample],
    { env, windowsHide: true, encoding: 'utf8' });
  assert.equal(generated.status, 0, generated.stderr);
  fixture = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': fs.statSync(sample).size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(sample).pipe(res);
  });
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  child = spawn(portable, [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1'], {
    env, cwd: testRoot, windowsHide: true, stdio: 'ignore',
  });
  let spawnError;
  child.once('error', error => { spawnError = error; });
  let ready = false;
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null) throw new Error(`Portable exited before opening (${child.exitCode}).`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(250);
  }
  assert.ok(ready, 'Portable did not start within 60 seconds.');
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.waitForEvent('page');
  await page.waitForSelector('#checkForm', { timeout: 30000 });
  const config = await page.evaluate(async () => (await fetch('/api/config')).json());
  assert.equal(config.hasLocalFfmpeg, true);
  assert.equal(config.hasAria2c, true);
  assert.equal(config.downloadFolder, env.EVERYVIDEO_DOWNLOADS_DIR);
  const metadata = await page.evaluate(async url => {
    const response = await fetch(`/api/info?${new URLSearchParams({ url })}`);
    return { status: response.status, data: await response.json() };
  }, `http://127.0.0.1:${fixture.address().port}/sample.mp4`);
  assert.equal(metadata.status, 200, JSON.stringify(metadata.data));
  assert.ok(metadata.data.formats?.length || metadata.data.url);
  await page.screenshot({ path: path.join(testRoot, 'portable.png') });
  const origin = new URL(page.url()).origin;
  await page.close();
  const quitDeadline = Date.now() + 20000;
  while (child.exitCode === null && Date.now() < quitDeadline) await delay(100);
  assert.equal(child.exitCode, 0, 'Portable wrapper did not exit cleanly.');
  await assert.rejects(fetch(`${origin}/api/config`), 'Portable backend still running.');
  console.log('Portable smoke passed: actual wrapper extraction/startup, UI, bundled Python extraction, FFmpeg/aria2 discovery, isolated settings and clean exit with system-only PATH.');
  console.log(`Evidence: ${testRoot}`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close().catch(() => {});
  if (child?.pid && child.exitCode === null) {
    await new Promise(resolve => execFile(path.join(process.env.SystemRoot, 'System32/taskkill.exe'), ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }, resolve));
  }
  if (fixture) await new Promise(resolve => fixture.close(resolve));
});
