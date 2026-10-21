'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { performance } = require('node:perf_hooks');
const { spawn, execFile } = require('node:child_process');
const { chromium } = require('playwright');
const { version } = require('../package.json');

const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
const output = fs.mkdtempSync(path.join(root, 'output/desktop-smoke-startup-'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function measure(label, executablePath, iteration) {
  assert.ok(fs.existsSync(executablePath), `Missing executable: ${executablePath}`);
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const env = {
    ...process.env,
    PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`,
    EVERYVIDEO_DATA_DIR: path.join(output, label),
    EVERYVIDEO_DOWNLOADS_DIR: path.join(output, 'downloads'),
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  const started = performance.now();
  const child = spawn(executablePath, [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1'], {
    env, cwd: output, windowsHide: true, stdio: 'ignore',
  });
  let browser;
  let error;
  child.once('error', failure => { error = failure; });
  try {
    let ready = false;
    const deadline = performance.now() + 90000;
    while (performance.now() < deadline) {
      if (error) throw error;
      assert.equal(child.exitCode, null, 'App exited before opening.');
      try { ready = (await fetch(`http://127.0.0.1:${port}/json/version`)).ok; } catch {}
      if (ready) break;
      await pause(100);
    }
    assert.ok(ready, 'App startup timed out.');
    const debugReadyMs = performance.now() - started;
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.waitForEvent('page');
    await page.waitForSelector('#checkForm', { timeout: 30000 });
    await page.evaluate(async () => {
      const response = await fetch('/api/config');
      if (!response.ok) throw Error('Backend not ready.');
    });
    const interactiveMs = performance.now() - started;
    await page.close();
    const quitDeadline = performance.now() + 20000;
    while (child.exitCode === null && performance.now() < quitDeadline) await pause(100);
    assert.equal(child.exitCode, 0, 'Application did not exit cleanly.');
    return { label, iteration, debugReadyMs: Math.round(debugReadyMs), interactiveMs: Math.round(interactiveMs) };
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (child.pid && child.exitCode === null) {
      await new Promise(resolve => execFile(path.join(process.env.SystemRoot, 'System32/taskkill.exe'), ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }, resolve));
    }
  }
}

(async () => {
  const records = [];
  const folderExecutable = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist/win-unpacked/EveryVideo.exe');
  for (let iteration = 1; iteration <= 2; iteration++) {
    for (const [label, executablePath] of [
      ['folder', folderExecutable],
      ['self-extracting', path.join(root, `dist/EveryVideo-${version}-Portable-x64.exe`)],
    ]) {
      const result = await measure(label, executablePath, iteration);
      records.push(result);
      console.log(JSON.stringify(result));
    }
  }
  fs.writeFileSync(path.join(output, 'startup.json'), JSON.stringify(records, null, 2));
  console.log(`Evidence: ${output}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
