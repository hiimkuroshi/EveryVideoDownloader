'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildDownloadAcceleration,
  normalizeConnections,
  resolveAria2Command,
} = require('../lib/download-acceleration');

const biliUrl = 'https://www.bilibili.com/video/BV1test';
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'everyvideo-aria2-'));
const localAria2 = path.join(tempRoot, 'bin', 'aria2c.exe');
fs.mkdirSync(path.dirname(localAria2), { recursive: true });
fs.writeFileSync(localAria2, 'test-binary');

try {
  assert.equal(normalizeConnections('8'), 8);
  assert.equal(normalizeConnections('32'), 8);

  assert.equal(resolveAria2Command({ rootDir: tempRoot, env: {} }), localAria2);

  const auto = buildDownloadAcceleration({
    url: biliUrl,
    engine: 'auto',
    connections: 8,
    httpChunkSize: '100M',
    aria2Path: localAria2,
  });
  assert.equal(auto.actualEngine, 'aria2c');
  assert.equal(auto.chunkIgnored, true);
  assert.deepEqual(auto.args.slice(0, 4), ['--downloader', localAria2, '--downloader', 'dash,m3u8:native']);
  assert.match(auto.args[5], /-x8 -s8 -k2M/);

  const low = buildDownloadAcceleration({ url: biliUrl, engine: 'aria2c', connections: 4, aria2Path: localAria2 });
  assert.match(low.args[5], /-x4 -s4 -k4M/);
  const high = buildDownloadAcceleration({ url: biliUrl, engine: 'aria2c', connections: 16, aria2Path: localAria2 });
  assert.match(high.args[5], /-x16 -s16 -k1M/);

  const native = buildDownloadAcceleration({ url: biliUrl, engine: 'native', httpChunkSize: '10M' });
  assert.equal(native.actualEngine, 'native');
  assert.equal(native.chunkIgnored, false);
  assert.deepEqual(native.args, []);

  const nonBili = buildDownloadAcceleration({
    url: 'https://example.com/video.mp4',
    engine: 'auto',
    aria2Path: localAria2,
  });
  assert.equal(nonBili.actualEngine, 'native');

  const nonBiliExplicit = buildDownloadAcceleration({
    url: 'https://example.com/video.mp4',
    engine: 'aria2c',
    aria2Path: null,
  });
  assert.equal(nonBiliExplicit.actualEngine, 'native');
  assert.equal(nonBiliExplicit.error, null);

  const missing = buildDownloadAcceleration({ url: biliUrl, engine: 'aria2c', aria2Path: null });
  assert.equal(missing.actualEngine, 'unavailable');
  assert.match(missing.error, /aria2c/);

  console.log('Download acceleration unit tests passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
