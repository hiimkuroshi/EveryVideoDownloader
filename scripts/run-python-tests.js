'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const testArgs = ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py'];
const configured = String(process.env.EVERYVIDEO_PYTHON || '').trim();
const candidates = [
  configured,
  path.join(rootDir, '.runtime', 'python', 'python.exe'),
  path.join(rootDir, '.venv', 'Scripts', 'python.exe'),
  path.join(rootDir, 'venv', 'Scripts', 'python.exe'),
  process.platform === 'win32' ? 'py.exe' : 'python3',
  process.platform === 'win32' ? 'python.exe' : 'python',
].filter((candidate, index, list) => candidate && list.indexOf(candidate) === index);

for (const command of candidates) {
  if (path.isAbsolute(command) && !fs.existsSync(command)) continue;
  const basename = path.basename(command).toLowerCase();
  const args = basename === 'py.exe' || basename === 'py' ? ['-3', ...testArgs] : testArgs;
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: { ...process.env, PYTHONPATH: path.join(rootDir, 'core') },
    stdio: 'inherit',
  });
  if (!result.error) process.exit(result.status ?? 1);
}

console.error('No usable Python runtime found. Run setup or set EVERYVIDEO_PYTHON.');
process.exit(1);
