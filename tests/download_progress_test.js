'use strict';

const assert = require('node:assert/strict');
const { createProcessLineParser, parseAria2Progress } = require('../lib/download-progress');

const progress = parseAria2Progress('[#87ef66 256KiB/1.0MiB(25%) CN:1 DL:294KiB ETA:2s]');
assert.deepEqual(progress, {
  percent: 25,
  size: '1.0MiB',
  speed: '294KiB',
  eta: '2s',
});

const lines = [];
const parser = createProcessLineParser(line => lines.push(line));
parser.write(Buffer.from('[download]  12.')); 
parser.write(Buffer.from('5% at 1MiB/s\r[#abc123 256KiB/1.0MiB(25%) CN:1 DL:1MiB ETA:1s]'));
parser.flush();

assert.deepEqual(lines, [
  '[download]  12.5% at 1MiB/s',
  '[#abc123 256KiB/1.0MiB(25%) CN:1 DL:1MiB ETA:1s]',
]);

console.log('Download progress tests passed: chunked CR/LF and aria2 progress are parsed.');
