'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, spawnSync } = require('node:child_process');
const express = require('express');
const { createMediaNetwork } = require('../lib/media-network');
const { createMediaResolver } = require('../lib/media-resolver');
const { installMediaRoutes } = require('../lib/media-routes');
const { discoverBrowser } = require('../lib/media-browser');

const root = path.resolve(__dirname, '..');
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'everyvideo-media-'));
const runtimeRoot = process.env.EVERYVIDEO_TEST_RESOURCES_DIR || root;
const ffmpeg = path.join(runtimeRoot, '.runtime', 'ffmpeg', 'ffmpeg.exe');
const ffprobe = path.join(runtimeRoot, '.runtime', 'ffmpeg', 'ffprobe.exe');
const python = path.join(runtimeRoot, '.runtime', 'python', 'python.exe');
let server;
let second;
const engineProcesses = [];
let manifestClientConnected = false;

function run(command, args) {
  const result = spawnSync(command, args, { windowsHide: true, encoding: 'utf8', cwd: workspace });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function serveBytes(req, res, body, mime) {
  const match = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let start = 0, end = body.length - 1;
  if (match) { start = Number(match[1]); end = Math.min(Number(match[2]) || end, end); res.status(206).set('Content-Range', `bytes ${start}-${end}/${body.length}`); }
  res.set({ 'Content-Type': mime, 'Content-Length': end - start + 1 });
  res.end(body.subarray(start, end + 1));
}

async function download(origin, resolved, asset, extra = '', expectError = false) {
  const params = new URLSearchParams({ resolution_id: resolved.resolution_id, asset_id: asset.id });
  const response = await fetch(`${origin}/api/media-download?${params}${extra}`);
  const events = (await response.text()).split('\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  if (events.findLast(event => event.done)?.code !== 0 && !expectError) console.error(events.filter(event => event.output || event.error).slice(-8));
  return events.findLast(event => event.done);
}

async function main() {
  assert.ok(fs.existsSync(ffmpeg) && fs.existsSync(python), 'Portable ffmpeg and Python are required for the media integration suite');
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:a', 'libmp3lame', '-b:a', '128k', path.join(workspace, 'tone.mp3')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(workspace, 'tone.mp3'), '-c:a', 'aac', path.join(workspace, 'tone.m4a')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(workspace, 'tone.mp3'), '-c:a', 'libopus', path.join(workspace, 'tone.opus')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=160x90:d=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(workspace, 'clip.mp4')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=8x8:d=0.1', '-frames:v', '1', path.join(workspace, 'image.webp')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(workspace, 'clip.mp4'), '-c', 'copy', '-f', 'hls', '-hls_time', '0.5', '-hls_playlist_type', 'vod', path.join(workspace, 'playlist.m3u8')]);
  run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(workspace, 'clip.mp4'), '-c', 'copy', '-f', 'dash', path.join(workspace, 'manifest.mpd')]);
  const audio = fs.readFileSync(path.join(workspace, 'tone.mp3'));
  const video = fs.readFileSync(path.join(workspace, 'clip.mp4'));
  const image = fs.readFileSync(path.join(workspace, 'image.webp'));
  const app = express();
  app.use(express.json());
  const fixture = express();
  fixture.get('/frame', (_req, res) => res.type('html').send('<audio src="/frame-audio"></audio>'));
  fixture.get('/frame-audio', (req, res) => serveBytes(req, res, audio, 'audio/mpeg'));
  second = fixture.listen(0);
  await new Promise(resolve => second.once('listening', resolve));
  const frameOrigin = `http://localhost:${second.address().port}`;
  app.get('/mixed', (_req, res) => res.type('html').send(`<title>Unlisted mixed page</title><audio src="/audio?st=fixture"></audio><video src="/video" poster="/cover.jpg"></video><img srcset="/cover.jpg 1x, /second-image 2x"><iframe src="${frameOrigin}/frame"></iframe><a href="/playlist.m3u8">HLS</a><a href="/manifest.mpd">DASH</a>`));
  app.get('/images', (_req, res) => res.type('html').send('<title>Image gallery</title><img src="/cover.jpg"><picture><source srcset="/second-image 2x"></picture>'));
  app.get('/empty', (_req, res) => res.type('html').send('<title>No media here</title><p>Text only</p>'));
  app.get('/native', (_req, res) => res.type('html').send('<title>Separate native streams</title>'));
  app.get('/denied-page', (_req, res) => res.type('html').send('<audio src="/denied"></audio><img src="/cover.jpg">'));
  app.get('/denied', (_req, res) => res.sendStatus(403));
  app.get('/audio', (req, res) => serveBytes(req, res, audio, 'audio/mpeg'));
  app.get('/video', (req, res) => serveBytes(req, res, video, 'video/mp4'));
  app.get('/header-video', (req, res) => req.headers.origin === 'https://video-origin.example' ? serveBytes(req, res, video, 'video/mp4') : res.sendStatus(403));
  app.get('/header-audio', (req, res) => !req.headers.origin ? serveBytes(req, res, fs.readFileSync(path.join(workspace, 'tone.m4a')), 'audio/mp4') : res.sendStatus(403));
  for (const route of ['/cover.jpg', '/second-image']) app.get(route, (req, res) => serveBytes(req, res, image, 'image/webp'));
  app.get('/redirect', (_req, res) => res.redirect('/video'));
  app.get('/private-redirect', (_req, res) => res.redirect('http://169.254.169.254/latest/meta-data'));
  app.get('/dynamic', (_req, res) => res.cookie('fixture_session', 'anonymous-fixture').type('html').send(`<title>Dynamic page</title><script>fetch('/api-source', {method:'POST'}).then(r=>r.json()).then(data=>{const a=document.createElement('audio');a.src=data.source;document.body.append(a);const img=document.createElement('img');img.src='/second-image';document.body.append(img)})</script>`));
  app.post('/api-source', (_req, res) => res.json({ source: '/session-audio' }));
  app.get('/session-redirect', (_req, res) => res.cookie('fixture_session', 'anonymous-fixture').redirect('/session-target'));
  app.get('/session-target', (_req, res) => res.type('html').send('<audio src="/session-audio"></audio>'));
  app.get('/session-audio', (req, res) => req.headers.cookie?.includes('fixture_session=anonymous-fixture') ? serveBytes(req, res, audio, 'audio/mpeg') : res.sendStatus(403));
  app.get('/slow', (req, res) => {
    res.set('Content-Type', 'audio/mpeg');
    if (req.headers.range) return serveBytes(req, res, audio, 'audio/mpeg');
    const timer = setInterval(() => res.write(audio), 100);
    res.on('close', () => clearInterval(timer));
  });
  app.get('/slow-page', (_req, res) => res.type('html').send('<audio src="/slow"></audio>'));
  app.get('/slow-playlist.m3u8', (_req, res) => res.type('application/vnd.apple.mpegurl').send('#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:1\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:1,\nslow-segment.ts\n#EXT-X-ENDLIST\n'));
  app.get('/slow-segment.ts', (_req, res) => {
    manifestClientConnected = true;
    res.type('video/mp2t');
    const bytes = fs.readFileSync(path.join(workspace, 'playlist0.ts'));
    const timer = setInterval(() => res.write(bytes), 100);
    res.on('close', () => clearInterval(timer));
  });
  app.use(express.static(workspace));
  const network = createMediaNetwork({ allowPrivate: true, timeoutMs: 2000 });
  const resolver = createMediaResolver({ network, browser: (url, options) => discoverBrowser(url, { ...options, durationMs: 1000 }), extract: async url => {
    if (!url.endsWith('/native')) throw new Error('Unknown website');
    const base = new URL(url).origin;
    return { id: 'fixture', title: 'Separate native streams', webpage_url: url, formats: [
      { format_id: 'v', url: `${base}/header-video`, ext: 'mp4', vcodec: 'h264', acodec: 'none', height: 90, http_headers: { Origin: 'https://video-origin.example' } },
      { format_id: 'a', url: `${base}/header-audio`, ext: 'm4a', vcodec: 'none', acodec: 'aac', abr: 128 },
    ] };
  } });
  const active = new Map();
  installMediaRoutes(app, {
    resolver, downloadsDir: path.join(workspace, 'downloads'), activeDownloads: active,
    spawnResolved: descriptor => {
      const child = spawn(python, ['-u', process.env.EVERYVIDEO_TEST_HELPER || path.join(root, 'scripts', 'download-resolved-media.py')], { windowsHide: true, env: { ...process.env, PYTHONPATH: path.join(root, 'core') } });
      engineProcesses.push(child);
      child.stdin.end(JSON.stringify({ ...descriptor, ffmpeg_location: path.dirname(ffmpeg) }));
      return child;
    },
  });
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const resolve = async (pathname, browserMode = 'off') => {
    const response = await fetch(`${origin}/api/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: origin + pathname, browserMode }) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return response.json();
  };
  const mixed = await resolve('/mixed');
  assert.equal(mixed.info, null);
  assert.ok(mixed.warnings.includes('EXTRACTOR_UNAVAILABLE'));
  assert.ok(mixed.assets.some(asset => asset.source_page.includes('localhost:') && asset.type === 'audio' && asset.status === 'verified'));
  assert.deepEqual(new Set(mixed.assets.map(asset => asset.type)), new Set(['audio', 'video', 'image', 'manifest']));
  assert.ok(mixed.assets.every(asset => !asset.audio_asset_id), 'Unrelated generic page media must not be automatically paired');
  const native = await resolve('/native');
  const nativeVideo = native.assets.find(asset => asset.video_only);
  const nativeAudio = native.assets.find(asset => asset.audio_only);
  assert.equal(nativeVideo.audio_asset_id, nativeAudio.id);
  assert.equal(nativeVideo.format, undefined, 'Internal format headers must stay on the server');
  const automatic = await download(origin, native, nativeVideo);
  assert.equal(automatic.code, 0);
  assert.equal(path.extname(automatic.file), '.mp4');
  const assertAV = file => {
    const probe = JSON.parse(run(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', file]));
    assert.deepEqual(new Set(probe.streams.map(stream => stream.codec_type)), new Set(['video', 'audio']));
    assert.equal(probe.streams.find(stream => stream.codec_type === 'video').codec_name, 'h264');
    assert.equal(probe.streams.find(stream => stream.codec_type === 'video').height, 90, 'The selected video quality is preserved');
    return probe;
  };
  assert.equal(assertAV(automatic.file).streams.find(stream => stream.codec_type === 'audio').codec_name, 'aac');
  const rawVideo = await download(origin, native, nativeVideo, '&audio_asset_id=none');
  assert.deepEqual(fs.readFileSync(rawVideo.file), video, 'Raw video-only download remains available');
  const manual = await download(origin, mixed, mixed.assets.find(asset => asset.type === 'video'), `&audio_asset_id=${mixed.assets.find(asset => asset.type === 'audio').id}`);
  assert.equal(manual.code, 0);
  assertAV(manual.file);
  const wrongTrack = await download(origin, native, nativeVideo, `&audio_asset_id=${nativeVideo.id}`, true);
  assert.equal(wrongTrack.error, 'INVALID_AUDIO_TRACK');
  const originalAudio = resolver.getAsset(native.resolution_id, nativeAudio.id).asset;
  const audioUrl = originalAudio.url;
  originalAudio.url = `${origin}/denied`;
  const missingAudio = await download(origin, native, nativeVideo, '', true);
  assert.equal(missingAudio.error, 'ACCESS_REQUIRED', 'Missing audio must fail instead of reporting a silent video as successful');
  originalAudio.url = audioUrl;
  const manifestMerge = await download(origin, mixed, mixed.assets.find(asset => asset.url.endsWith('/playlist.m3u8')), `&audio_asset_id=${mixed.assets.find(asset => asset.type === 'audio').id}`);
  assert.equal(manifestMerge.code, 0);
  assertAV(manifestMerge.file);
  const opus = await resolve('/tone.opus');
  const mkvSources = await resolve('/mixed');
  // Explicit selections must still refer to the same registered resolution.
  const internal = resolver.getAsset(mkvSources.resolution_id, mkvSources.assets.find(asset => asset.type === 'audio').id).asset;
  Object.assign(internal, { url: opus.assets[0].url, ext: 'opus', mime: 'audio/ogg' });
  const mkv = await download(origin, mkvSources, mkvSources.assets.find(asset => asset.type === 'video'), `&audio_asset_id=${internal.id}`);
  assert.equal(mkv.code, 0);
  assert.equal(path.extname(mkv.file), '.mkv');
  assert.equal(assertAV(mkv.file).streams.find(stream => stream.codec_type === 'audio').codec_name, 'opus');
  const cover = mixed.assets.find(asset => asset.url.endsWith('/cover.jpg'));
  assert.equal(cover.ext, 'webp');
  const preview = await fetch(`${origin}/api/media-preview?${new URLSearchParams({ resolution_id: mixed.resolution_id, asset_id: cover.id })}`);
  assert.equal(preview.headers.get('content-type'), 'image/webp');
  assert.deepEqual(Buffer.from(await preview.arrayBuffer()), image);
  const imageDownload = await download(origin, mixed, cover);
  assert.equal(imageDownload.code, 0);
  assert.match(imageDownload.file, /\.webp$/);
  assert.deepEqual(fs.readFileSync(imageDownload.file), image);
  const audioAsset = mixed.assets.find(asset => asset.url.includes('/audio?'));
  const audioDownload = await download(origin, mixed, audioAsset);
  assert.equal(audioDownload.code, 0);
  assert.deepEqual(fs.readFileSync(audioDownload.file), audio);
  const collision = await download(origin, mixed, audioAsset);
  assert.notEqual(collision.file, audioDownload.file);
  const parallel = await Promise.all([download(origin, mixed, audioAsset), download(origin, mixed, audioAsset)]);
  assert.ok(parallel.every(result => result.code === 0));
  assert.notEqual(parallel[0].file, parallel[1].file, 'Concurrent downloads must reserve distinct filenames');
  assert.equal((await resolve('/images')).assets.filter(asset => asset.type === 'image').length, 2);
  assert.equal((await resolve('/empty')).assets.length, 0);
  const denied = await resolve('/denied-page');
  assert.ok(denied.assets.some(asset => asset.status === 'access_required'));
  assert.ok(denied.assets.some(asset => asset.type === 'image' && asset.status === 'verified'));
  assert.equal((await resolve('/redirect')).assets[0].type, 'video');
  const invalid = await fetch(`${origin}/api/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: 'file:///etc/passwd' }) });
  assert.equal(invalid.status, 400);
  const strict = createMediaNetwork({ lookup: async host => [{ address: host === 'public.example' ? '8.8.8.8' : '127.0.0.1', family: 4 }] });
  await assert.rejects(strict.addressesFor('http://internal.example/'), /PRIVATE_ADDRESS/);
  const expired = createMediaResolver({ network, ttlMs: -1 });
  const old = await expired.resolve(origin + '/images', { browserMode: 'off' });
  assert.throws(() => expired.getAsset(old.resolution_id, old.assets[0].id), /RESOLUTION_EXPIRED/);

  const dynamic = await resolve('/dynamic', 'auto');
  assert.ok(dynamic.browser_used, JSON.stringify(dynamic.warnings));
  const sessionAudio = dynamic.assets.find(asset => asset.url.endsWith('/session-audio'));
  assert.ok(sessionAudio);
  assert.equal(sessionAudio.status, 'verified');
  assert.equal(sessionAudio.requires_session, true);
  assert.ok(!JSON.stringify(dynamic).includes('anonymous-fixture'), 'Private session cookies must not be sent to the client');
  assert.ok(dynamic.assets.some(asset => asset.type === 'image' && asset.sources.includes('dom')));
  const sessionDownload = await download(origin, dynamic, sessionAudio);
  assert.equal(sessionDownload.code, 0, JSON.stringify(sessionDownload));
  assert.deepEqual(fs.readFileSync(sessionDownload.file), audio, 'Browser Range requests must not truncate downloaded files');
  const redirectSession = await resolve('/session-redirect', 'always');
  assert.ok(redirectSession.assets.some(asset => asset.url.endsWith('/session-audio') && asset.status === 'verified' && asset.requires_session), 'Browser redirect responses must retain their session cookies');

  for (const name of ['playlist.m3u8', 'manifest.mpd']) {
    const manifest = mixed.assets.find(asset => asset.url.endsWith(name));
    assert.equal(manifest.status, 'verified');
    const completed = await download(origin, mixed, manifest);
    assert.equal(completed.code, 0, JSON.stringify(completed));
    const probe = JSON.parse(run(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', completed.file]));
    assert.ok(probe.streams.some(stream => stream.codec_type === 'video' && stream.codec_name === 'h264'));
    assert.ok(Number(probe.format.duration) >= 0.9);
  }
  const slow = await resolve('/slow-page');
  const cancel = new AbortController();
  const response = await fetch(`${origin}/api/media-download?${new URLSearchParams({ resolution_id: slow.resolution_id, asset_id: slow.assets[0].id })}`, { signal: cancel.signal });
  await response.body.getReader().read();
  await new Promise(resolve => setTimeout(resolve, 350));
  cancel.abort();
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.equal(active.size, 0);
  assert.ok(!fs.readdirSync(path.join(workspace, 'downloads')).some(file => file.endsWith('.part')));
  assert.ok(!fs.readdirSync(path.join(workspace, 'downloads')).some(file => file.endsWith('.lock')));
  const slowManifest = await resolve('/slow-playlist.m3u8');
  const manifestCancel = new AbortController();
  const manifestResponse = await fetch(`${origin}/api/media-download?${new URLSearchParams({ resolution_id: slowManifest.resolution_id, asset_id: slowManifest.assets[0].id })}`, { signal: manifestCancel.signal });
  await manifestResponse.body.getReader().read();
  const untilRequested = Date.now() + 5000;
  while (!manifestClientConnected && Date.now() < untilRequested) await new Promise(resolve => setTimeout(resolve, 50));
  assert.ok(manifestClientConnected, 'Manifest cancellation must run after the fragment downloader starts');
  manifestCancel.abort();
  const untilCleaned = Date.now() + 5000;
  const remaining = () => fs.readdirSync(path.join(workspace, 'downloads')).some(file => file.startsWith('.everyvideo-media-') || file.endsWith('.lock'));
  while ((remaining() || engineProcesses.at(-1).exitCode === null) && Date.now() < untilCleaned) await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(remaining(), false, 'Cancelled engine downloads must clean their own staging directory and reservation');
  assert.notEqual(engineProcesses.at(-1).exitCode, null, 'Cancelled manifest downloads must stop Python');
  console.log('Media integration passed: automatic same-content merge, raw video, manual pairing, MP4/MKV codecs + FFprobe, HLS with separate audio, invalid/unavailable audio, direct/preview/session/collision/cancel and HLS/DASH.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  server?.closeAllConnections(); second?.closeAllConnections();
  await Promise.all([server, second].filter(Boolean).map(instance => new Promise(resolve => instance.close(resolve))));
  assert.ok(path.resolve(workspace).startsWith(path.join(os.tmpdir(), 'everyvideo-media-')));
  fs.rmSync(workspace, { recursive: true, force: true });
});
