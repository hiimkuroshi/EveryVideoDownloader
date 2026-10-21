'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cli = path.join(path.dirname(require.resolve('playwright/package.json')), 'cli.js');
const result = spawnSync(process.execPath, [cli, 'install', 'chromium', '--only-shell'], {
  stdio: 'inherit', windowsHide: true,
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.join(__dirname, '..', '.runtime', 'playwright') },
});
process.exit(result.status ?? 1);
