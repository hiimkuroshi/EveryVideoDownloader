'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
assert.equal(process.platform, 'win32', 'Build this Windows package on Windows.');
const required = [
  '.runtime/python/python.exe', '.runtime/python/python314._pth',
  '.runtime/ffmpeg/ffmpeg.exe', '.runtime/ffmpeg/ffprobe.exe',
  '.runtime/aria2/aria2-1.37.0-win-64bit-build1/aria2c.exe',
  'bin/folder_picker.exe', 'desktop/icon.ico', 'desktop/licenses/FFmpeg-GPL-3.0.txt',
  'desktop/licenses/FFmpeg-build.txt',
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `Missing desktop resource: ${file}`);
const python = spawnSync(path.join(root, '.runtime/python/python.exe'), ['-B', '-c', 'import yt_dlp, ssl, sqlite3; print(yt_dlp.version.__version__)'], { encoding: 'utf8', windowsHide: true });
assert.equal(python.status, 0, `Bundled Python/core failed: ${python.stderr || python.error}`);
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.runtime/playwright');
const { chromium } = require('playwright');
assert.ok(fs.readdirSync(process.env.PLAYWRIGHT_BROWSERS_PATH).some(name => name.startsWith('chromium_headless_shell-')), 'Run npm run setup:browser first.');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<title>EveryVideo runtime check</title>');
    assert.equal(await page.title(), 'EveryVideo runtime check');
  } finally { await browser.close(); }
  console.log(`Desktop runtime ready: Python/core ${python.stdout.trim()}, FFmpeg, aria2, Chromium.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
