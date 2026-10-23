'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const root = path.resolve(__dirname, '..');
const publicRoot = path.resolve(process.argv[2] || path.join(root, 'public'));
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(root, '.runtime', 'playwright');
const { chromium } = require('playwright');
const requests = [];
const downloadRequests = [];
let server;
let browser;

const assets = [
  { id: 'audio', type: 'audio', title: 'Audio sample', url: 'https://cdn.example/audio?quality=320&signature=fixture', ext: 'mp3', quality: '320 kbps', status: 'verified' },
  { id: 'video', type: 'video', video_only: true, audio_asset_id: 'audio', title: '<img src=x onerror="window.injected=true">', url: 'https://cdn.example/video.mp4', ext: 'mp4', status: 'verified' },
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
  app.get('/api/media-download', (req, res) => {
    downloadRequests.push(req.query);
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
      formats: [
        { format_id: '720', url: 'https://cdn.example/video.mp4', ext: 'mp4', protocol: 'https', vcodec: 'h264', acodec: 'aac', width: 1280, height: 720, resolution: '1280x720', filesize: 1048576 },
        { format_id: '1080', url: 'https://cdn.example/video1080.mp4', ext: 'mp4', vcodec: 'h264', acodec: 'none', height: 1080, resolution: '1920x1080' },
        { format_id: 'a1', url: 'https://cdn.example/audio.m4a', ext: 'm4a', vcodec: 'none', acodec: 'aac', abr: 128 },
        { format_id: 'a2', url: 'https://cdn.example/audio2.m4a', ext: 'm4a', vcodec: 'none', acodec: 'aac', abr: 256 },
      ],
    } : null;
    res.json({ resolution_id: 'fixture', source_url: `https://${req.body.url.replace(/^https?:\/\//, '')}`, title: 'Mixed sources', assets: req.body.url.includes('/empty') ? [] : assets, info, warnings: [], browser_used: false });
  });
  app.use(express.static(publicRoot));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  const formatsTab = page.locator('#formatExplorerTab');
  const sourcesTab = page.locator('#mediaSourcesTab');
  assert.equal(await formatsTab.getAttribute('aria-selected'), 'true');
  assert.equal(await sourcesTab.isDisabled(), true);
  assert.equal(await page.locator('#tableModeContainer').isVisible(), true);
  const analyze = async url => {
    await page.locator('#url').fill(url);
    await page.locator('#checkBtn').click();
    await page.waitForFunction(() => !document.getElementById('checkBtn').disabled);
  };
  await analyze('unlisted.example/mixed');
  assert.equal(requests[0].browserMode, 'auto');
  assert.equal(await page.locator('.media-asset').count(), 6);
  assert.equal(await page.locator('.format-explorer-card').isVisible(), false);
  assert.equal(await sourcesTab.getAttribute('aria-selected'), 'true');
  assert.equal(await formatsTab.isDisabled(), true);
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
  const videoCard = page.locator('.media-asset').nth(1);
  assert.equal(await videoCard.locator('select').inputValue(), 'audio');
  assert.equal(await videoCard.locator('.btn-primary').textContent(), 'Tải video có tiếng');
  await videoCard.locator('.btn-primary').click();
  await videoCard.locator('.media-download-status').filter({ hasText: 'sample.mp3' }).waitFor();
  assert.equal(downloadRequests.at(-1).audio_asset_id, 'audio');
  await videoCard.locator('select').selectOption('none');
  for (const lang of ['en', 'zh', 'ja', 'vi']) {
    await page.locator('#appLanguageSelect').selectOption(lang);
    const buttonLabel = await page.locator('.media-asset-actions button').first().textContent();
    assert.ok(buttonLabel && !buttonLabel.startsWith('media'), lang);
    assert.equal(await page.locator('.media-asset').count(), 6);
    assert.equal(await page.locator('.media-asset').nth(1).locator('select').inputValue(), 'none', 'Language changes retain audio choices');
  }
  const output = process.env.EVERYVIDEO_UI_EVIDENCE_DIR || path.join(root, 'output', 'playwright');
  fs.mkdirSync(output, { recursive: true });
  await page.locator('[data-media-filter="video"]').click();
  await page.screenshot({ path: path.join(output, 'audio-merge-desktop.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 375, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: path.join(output, 'audio-merge-mobile.png'), animations: 'disabled' });
  await page.locator('[data-media-filter="all"]').click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(output, 'media-discovery-desktop.png'), animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, theme);
    const position = await page.locator('[data-media-discovery]').boundingBox();
    const sidebar = await page.locator('.workstation-sidebar').boundingBox();
    assert.ok(position.y < sidebar.y, 'Mobile sources should precede the optional download settings');
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
  assert.equal(await page.locator('#tableModeContainer').isVisible(), true, 'Native results must open the table');
  assert.equal(await page.locator('.preset-selection-panel').isVisible(), false);
  assert.equal(await page.locator('[data-media-discovery]').isVisible(), false);
  assert.equal(await formatsTab.getAttribute('aria-selected'), 'true');
  assert.equal(await sourcesTab.isDisabled(), false);
  assert.equal(await page.locator('[data-media-source-count]').textContent(), '(6)');
  await page.locator('#formatSearchInput').fill('720');
  await page.locator('#formatsTableBody input[type="checkbox"]').first().check();
  const requestCount = requests.length;
  await sourcesTab.click();
  assert.equal(await page.locator('.format-explorer-card').isVisible(), false);
  assert.equal(await page.locator('[data-media-discovery]').isVisible(), true);
  await page.locator('[data-media-filter="audio"]').click();
  for (const lang of ['en', 'zh', 'ja', 'vi']) {
    await page.locator('#appLanguageSelect').selectOption(lang);
    assert.equal(await sourcesTab.getAttribute('aria-selected'), 'true', 'Changing language must retain the active tab');
    assert.equal(await page.locator('.media-asset').count(), 2);
    assert.ok(!(await formatsTab.textContent()).includes('explorerFormatsTab'));
  }
  await formatsTab.click();
  assert.equal(await page.locator('#formatSearchInput').inputValue(), '720');
  assert.equal(await page.locator('#formatsTableBody input[type="checkbox"]').first().isChecked(), true);
  await page.locator('#typeFilterPills [data-filter="video"]').click();
  await sourcesTab.click();
  assert.equal(await page.locator('[data-media-filter="audio"]').getAttribute('aria-pressed'), 'true');
  assert.ok((await page.locator('[data-media-filter="audio"]').getAttribute('class')).includes('active'));
  await sourcesTab.press('Home');
  assert.equal(await formatsTab.getAttribute('aria-selected'), 'true');
  await formatsTab.press('ArrowRight');
  assert.equal(await sourcesTab.getAttribute('aria-selected'), 'true');
  await sourcesTab.press('ArrowLeft');
  assert.equal(await formatsTab.getAttribute('aria-selected'), 'true');
  await formatsTab.press('End');
  assert.equal(await sourcesTab.getAttribute('aria-selected'), 'true');
  assert.equal(requests.length, requestCount, 'Switching tabs must reuse results');
  await formatsTab.click();
  await page.locator('[data-mode="cards"]').click();
  await analyze('unlisted.example/native');
  assert.equal(await formatsTab.getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#tableModeContainer').isVisible(), true, 'Each analysis must return to the table');
  await page.locator('#formatsTableBody tr[data-id="1080"]').click();
  assert.equal(await page.locator('#audioMergeHelperBox').isVisible(), true);
  assert.equal(await page.locator('#customFormatInput').inputValue(), '1080+bestaudio');
  await page.locator('#selectedAudioTrack').selectOption('a2');
  assert.equal(await page.locator('#customFormatInput').inputValue(), '1080+a2');
  await page.locator('#enableAudioMerge').uncheck();
  assert.equal(await page.locator('#customFormatInput').inputValue(), '1080');
  await page.locator('#enableAudioMerge').check();
  assert.equal(await page.locator('#customFormatInput').inputValue(), '1080+a2');
  await page.locator('#formatsTableBody tr[data-id="720"] input').check();
  await page.locator('#addSelectedToQueueBtn').click();
  const queuedFormats = await page.evaluate(() => downloadQueue.map(item => item.format));
  assert.deepEqual(queuedFormats, ['1080+a2', '720'], 'Queued video-only formats must retain the chosen audio; combined formats remain unchanged');
  await page.locator('#formatsTableBody tr[data-id="1080"]').click();
  await page.screenshot({ path: path.join(output, 'format-audio-helper.png'), animations: 'disabled' });
  await page.locator('#formatsTableBody tr[data-id="720"]').click();
  assert.equal(await page.locator('#customFormatInput').inputValue(), '720');
  assert.equal(await page.locator('#audioMergeHelperBox').isVisible(), false);
  await page.locator('#formatsTableBody tr[data-id="a1"]').click();
  assert.equal(await page.locator('#customFormatInput').inputValue(), 'a1');
  for (const size of [{ width: 1440, height: 1000 }, { width: 375, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${size.width} ${theme}`);
    }
    await page.screenshot({ path: path.join(output, `format-table-${size.width}.png`), animations: 'disabled' });
  }
  assert.deepEqual(errors, []);
  console.log('Media UI passed: table-first results, secondary source tab, keyboard navigation, retained selections/filters, four languages, desktop/mobile themes, analyze/empty/error, clipboard and download/cancel.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  server?.closeAllConnections();
  if (server) await new Promise(resolve => server.close(resolve));
});
