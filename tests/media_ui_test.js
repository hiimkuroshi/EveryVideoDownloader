'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const root = path.resolve(__dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(root, '.runtime', 'playwright');
const { chromium } = require('playwright');
const requests = [];
let server;
let browser;

const assets = [
  { id: 'audio', type: 'audio', title: 'Audio sample', url: 'https://cdn.example/audio?quality=320&signature=fixture', ext: 'mp3', quality: '320 kbps', status: 'verified' },
  { id: 'video', type: 'video', title: '<img src=x onerror="window.injected=true">', url: 'https://cdn.example/video.mp4', ext: 'mp4', status: 'verified' },
  { id: 'image', type: 'image', role: 'thumbnail', title: 'Cover', url: 'https://cdn.example/cover.jpg', ext: 'webp', status: 'verified' },
  { id: 'manifest', type: 'manifest', title: 'Adaptive stream', url: 'https://cdn.example/master.m3u8', ext: 'mp4', status: 'verified' },
  { id: 'subtitle', type: 'subtitle', title: 'Captions', url: 'https://cdn.example/en.vtt', ext: 'vtt', status: 'verified' },
  { id: 'denied', type: 'audio', title: 'Restricted sample', url: 'https://cdn.example/restricted.mp3', ext: 'mp3', status: 'access_required' },
];

async function main() {
  const app = express();
  app.use(express.json());
  app.get('/api/config', (_req, res) => res.json({ hasAria2c: false }));
  app.post('/api/config', (_req, res) => res.json({ success: true }));
  app.get('/api/translate', (req, res) => res.json({ translated: req.query.text }));
  app.get('/api/media-preview', (_req, res) => res.type('svg').send('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#ef6b59"/></svg>'));
  app.get('/api/media-download', (_req, res) => {
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
    res.write('data: {"started":true}\n\n');
    const timer = setTimeout(() => res.end('data: {"done":true,"code":0,"fileName":"sample.mp3"}\n\n'), 1000);
    res.on('close', () => clearTimeout(timer));
  });
  app.post('/api/resolve', (req, res) => {
    requests.push(req.body);
    if (req.body.url.includes('/invalid')) return res.status(400).json({ error: 'INVALID_URL' });
    const info = req.body.url.includes('/native') ? {
      id: 'fixture', title: 'Native platform video', extractor: 'Fixture', duration: 20,
      formats: [{ format_id: '720', url: 'https://cdn.example/video.mp4', ext: 'mp4', protocol: 'https', vcodec: 'h264', acodec: 'aac', width: 1280, height: 720, resolution: '1280x720', filesize: 1048576 }],
    } : null;
    res.json({ resolution_id: 'fixture', source_url: `https://${req.body.url.replace(/^https?:\/\//, '')}`, title: 'Mixed sources', assets: req.body.url.includes('/empty') ? [] : assets, info, warnings: [], browser_used: false });
  });
  app.use(express.static(path.join(root, 'public')));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  const analyze = async url => {
    await page.locator('#url').fill(url);
    await page.locator('#checkBtn').click();
    await page.waitForFunction(() => !document.getElementById('checkBtn').disabled);
  };
  await analyze('unlisted.example/mixed');
  assert.equal(requests[0].browserMode, 'auto');
  assert.equal(await page.locator('.media-asset').count(), 6);
  assert.equal(await page.locator('.format-explorer-card').isVisible(), false);
  assert.equal(await page.locator('#emptyHeroCard').isVisible(), false);
  assert.equal(await page.evaluate(() => window.injected), undefined);
  assert.equal(await page.locator('.media-asset h3').nth(1).textContent(), assets[1].title);
  await page.locator('[data-media-filter="audio"]').click();
  assert.equal(await page.locator('.media-asset').count(), 2);
  const first = page.locator('.media-asset').first();
  await first.locator('.media-asset-actions button').nth(0).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), assets[0].url);
  assert.equal(await page.locator('.media-asset').last().locator('.btn-primary').isDisabled(), true);
  await first.locator('.btn-primary').click();
  await page.waitForFunction(() => document.querySelector('[data-media-filter]').disabled);
  await first.locator('.media-download-status').filter({ hasText: 'sample.mp3' }).waitFor();
  assert.equal(await page.locator('[data-media-filter]').first().isDisabled(), false);
  await first.locator('.btn-primary').click();
  await first.locator('.media-asset-actions button').nth(2).click();
  assert.equal(await first.locator('.media-download-status').textContent(), 'Đã hủy');
  assert.equal(await page.locator('[data-media-filter]').first().isDisabled(), false);
  await page.locator('[data-media-filter="all"]').click();
  for (const lang of ['en', 'zh', 'ja', 'vi']) {
    await page.locator('#appLanguageSelect').selectOption(lang);
    const buttonLabel = await page.locator('.media-asset-actions button').first().textContent();
    assert.ok(buttonLabel && !buttonLabel.startsWith('media'), lang);
    assert.equal(await page.locator('.media-asset').count(), 6);
  }
  const output = path.join(root, 'output', 'playwright');
  fs.mkdirSync(output, { recursive: true });
  await page.screenshot({ path: path.join(output, 'media-discovery-desktop.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, theme);
    const position = await page.locator('[data-media-discovery]').boundingBox();
    assert.ok(position.y < 400, 'Mobile sources should precede the optional download settings');
  }
  await page.screenshot({ path: path.join(output, 'media-discovery-mobile.png'), animations: 'disabled' });
  await page.locator('[data-media-deep]').check();
  await analyze('unlisted.example/empty');
  assert.equal(requests.at(-1).browserMode, 'always');
  assert.equal(await page.locator('.media-asset').count(), 0);
  assert.ok(await page.locator('.media-empty').isVisible());
  await analyze('unlisted.example/invalid');
  assert.equal(await page.locator('[data-media-discovery]').isVisible(), false);
  await analyze('unlisted.example/native');
  assert.ok(await page.locator('#videoHeroCard').isVisible());
  assert.ok(await page.locator('.format-explorer-card').isVisible());
  assert.deepEqual(errors, []);
  console.log('Media UI passed: analyze/partial/empty/error, URL clipboard, filters, download/cancel, four languages, safe labels, desktop/mobile themes and native format workflow.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  server?.closeAllConnections();
  if (server) await new Promise(resolve => server.close(resolve));
});
