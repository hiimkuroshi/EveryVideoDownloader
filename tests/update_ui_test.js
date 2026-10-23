'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const publicRoot = path.resolve(process.argv[2] || path.join(root, 'public'));
const evidence = path.resolve(process.env.UPDATE_TEST_EVIDENCE || path.join(root, 'output/reports/github-update-check-20261023'));
let server;
let browser;

(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  let calls = 0;
  let delay = 0;
  let code = 200;
  let result = { currentVersion: '1.2.0', status: 'available', latestVersion: '1.10.0',
    releaseUrl: 'https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.10.0' };
  const app = express();
  app.use(express.json());
  app.get('/api/config', (_req, res) => res.json({ appVersion: '1.2.0', hasAria2c: false }));
  app.post('/api/config', (_req, res) => res.json({ success: true }));
  app.get('/api/check-update', async (_req, res) => {
    calls++;
    await new Promise(resolve => setTimeout(resolve, delay));
    res.status(code).json(result);
  });
  app.use(express.static(publicRoot));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('#tabBtnSettings').click();
  await page.waitForFunction(() => document.getElementById('appCurrentVersion').textContent === 'v1.2.0');
  assert.equal(calls, 0, 'Opening settings must not query GitHub automatically');
  const button = page.locator('#checkUpdateBtn');
  const status = page.locator('#appUpdateStatus');
  const link = page.locator('#appUpdateLink');
  assert.equal(await link.isVisible(), false);
  delay = 200;
  await button.click();
  assert.equal(await button.isDisabled(), true);
  await page.locator('#settingsLanguageSelect').selectOption('en');
  assert.equal(await button.textContent(), 'Checking…');
  await page.waitForFunction(() => !document.getElementById('checkUpdateBtn').disabled);
  assert.equal(calls, 1);
  assert.equal(await status.textContent(), 'Version v1.10.0 is available on GitHub.');
  assert.equal(await link.isVisible(), true);
  assert.equal(await link.getAttribute('href'), result.releaseUrl);
  assert.equal(await link.getAttribute('target'), '_blank');
  for (const lang of ['vi', 'zh', 'ja', 'en']) {
    await page.locator('#settingsLanguageSelect').selectOption(lang);
    assert.ok((await status.textContent()).includes('v1.10.0'));
    assert.ok(!(await status.textContent()).includes('{version}'));
    assert.equal(await link.isVisible(), true);
  }
  assert.equal(calls, 1, 'Language changes must preserve results without requesting again');
  await page.screenshot({ path: path.join(evidence, 'update-available-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
    await page.screenshot({ path: path.join(evidence, `update-mobile-${theme}.png`) });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.ok((await button.boundingBox()).height >= 44);
  }
  const check = async () => {
    await button.click();
    await page.waitForFunction(() => !document.getElementById('checkUpdateBtn').disabled);
  };
  delay = 0;
  for (const state of ['latest', 'ahead', 'no-release']) {
    result = { ...result, status: state, latestVersion: '1.2.0' };
    await check();
    assert.equal(await status.getAttribute('data-state'), state);
    assert.equal(await link.isVisible(), false);
  }
  code = 503;
  for (const error of ['RATE_LIMITED', 'TIMEOUT', 'NETWORK_ERROR', 'INVALID_RELEASE']) {
    result = { error };
    await check();
    assert.equal(await status.getAttribute('data-state'), 'error');
    assert.equal(await link.isVisible(), false);
  }
  code = 200;
  result = { currentVersion: '1.2.0', status: 'available', latestVersion: '<img src=x onerror=alert(1)>',
    releaseUrl: 'javascript:alert(1)' };
  await check();
  assert.equal(await link.isVisible(), false, 'Unsafe links must never become clickable');
  result.releaseUrl = 'https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.10.0';
  await check();
  assert.equal(await status.locator('img').count(), 0, 'Release labels must remain plain text');
  assert.deepEqual(errors, []);
  console.log('Update UI passed: manual check, busy state, four languages, all results/errors, safe links/text, mobile dark/light.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  await new Promise(resolve => server ? server.close(resolve) : resolve());
});
