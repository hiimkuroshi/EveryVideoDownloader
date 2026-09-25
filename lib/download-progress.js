'use strict';

const { StringDecoder } = require('node:string_decoder');

function createProcessLineParser(onLine) {
  const decoder = new StringDecoder('utf8');
  let pending = '';

  function consume(text) {
    pending += text;
    const parts = pending.split(/[\r\n]/);
    pending = parts.pop();
    for (const part of parts) {
      if (part.trim()) onLine(part.trim());
    }
  }

  return {
    write(chunk) {
      consume(decoder.write(chunk));
    },
    flush() {
      consume(decoder.end());
      if (pending.trim()) onLine(pending.trim());
      pending = '';
    },
  };
}

function parseAria2Progress(line) {
  const match = line.match(/^\[#[a-f\d]+\s+[^/\s]+\/([^\s(]+)\((\d+(?:\.\d+)?)%\)/i);
  if (!match) return null;

  const percent = Number(match[2]);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;

  return {
    percent,
    size: match[1],
    speed: line.match(/\bDL:([^\s\]]+)/)?.[1] || null,
    eta: line.match(/\bETA:([^\s\]]+)/)?.[1] || null,
  };
}

module.exports = { createProcessLineParser, parseAria2Progress };
