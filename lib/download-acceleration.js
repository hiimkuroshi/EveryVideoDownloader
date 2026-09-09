'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CONNECTION_PROFILES = Object.freeze({
  4: { split: 4, minSplit: '4M' },
  8: { split: 8, minSplit: '2M' },
  16: { split: 16, minSplit: '1M' },
});

const ENGINE_VALUES = new Set(['auto', 'native', 'aria2c']);
const CONNECTION_VALUES = new Set(Object.keys(CONNECTION_PROFILES).map(Number));
const BILIBILI_HOSTS = new Set(['bilibili.com', 'b23.tv']);

function isFile(filePath) {
  try {
    return Boolean(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isBilibiliUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
    return BILIBILI_HOSTS.has(hostname)
      || hostname.endsWith('.bilibili.com')
      || hostname.endsWith('.b23.tv');
  } catch {
    return false;
  }
}

function normalizeEngine(value) {
  return ENGINE_VALUES.has(String(value || '').toLowerCase())
    ? String(value).toLowerCase()
    : 'auto';
}

function normalizeConnections(value) {
  const parsed = Number.parseInt(value, 10);
  return CONNECTION_VALUES.has(parsed) ? parsed : 8;
}

function findExecutableOnPath(fileNames, envPath = process.env.PATH) {
  for (const entry of String(envPath || '').split(path.delimiter).filter(Boolean)) {
    for (const fileName of fileNames) {
      const candidate = path.join(entry.replace(/^"|"$/g, ''), fileName);
      if (isFile(candidate)) return candidate;
    }
  }
  return null;
}

function resolveAria2Command({ rootDir = path.resolve(__dirname, '..'), env = process.env } = {}) {
  const configured = String(env.EVERYVIDEO_ARIA2C || '').trim();
  if (isFile(configured)) return configured;

  const localNames = process.platform === 'win32'
    ? ['aria2c.exe', 'aria2c']
    : ['aria2c', 'aria2c.exe'];
  const localCandidates = localNames.flatMap((name) => [
    path.join(rootDir, name),
    path.join(rootDir, 'bin', name),
    path.join(rootDir, '.runtime', 'aria2', name),
  ]);
  return localCandidates.find(isFile) || findExecutableOnPath(localNames, env.PATH);
}

function getConnectionProfile(connections) {
  return CONNECTION_PROFILES[normalizeConnections(connections)];
}

function buildAria2Args(aria2Path, connections) {
  const profile = getConnectionProfile(connections);
  return [
    '--downloader', aria2Path,
    '--downloader', 'dash,m3u8:native',
    '--downloader-args', `aria2c:-x${profile.split} -s${profile.split} -k${profile.minSplit}`,
  ];
}

function buildDownloadAcceleration({
  url,
  engine = 'auto',
  connections = 8,
  httpChunkSize = '',
  aria2Path = resolveAria2Command(),
} = {}) {
  const requestedEngine = normalizeEngine(engine);
  const normalizedConnections = normalizeConnections(connections);
  const isBili = isBilibiliUrl(url);
  const canUseAria2 = isBili && Boolean(aria2Path);

  // The acceleration profile is deliberately scoped to Bilibili. Keep the
  // existing native behavior for other providers even if the user leaves an
  // aria2 preference in a persisted config.
  if (!isBili) {
    return {
      requestedEngine,
      actualEngine: 'native',
      isBilibili: false,
      connections: normalizedConnections,
      error: null,
      args: [],
      chunkIgnored: false,
    };
  }

  const shouldUseAria2 = requestedEngine === 'aria2c'
    || (requestedEngine === 'auto' && canUseAria2);

  if (requestedEngine === 'aria2c' && !aria2Path) {
    return {
      requestedEngine,
      actualEngine: 'unavailable',
      isBilibili: isBili,
      connections: normalizedConnections,
      error: 'Không tìm thấy aria2c. Hãy đặt aria2c.exe trong bin/ hoặc EVERYVIDEO_ARIA2C trên PATH.',
      args: [],
      chunkIgnored: false,
    };
  }

  if (!shouldUseAria2) {
    return {
      requestedEngine,
      actualEngine: 'native',
      isBilibili: isBili,
      connections: normalizedConnections,
      error: null,
      args: [],
      chunkIgnored: false,
    };
  }

  return {
    requestedEngine,
    actualEngine: 'aria2c',
    isBilibili: isBili,
    connections: normalizedConnections,
    error: null,
    args: buildAria2Args(aria2Path, normalizedConnections),
    chunkIgnored: Boolean(httpChunkSize && httpChunkSize !== 'none' && httpChunkSize !== 'default'),
  };
}

module.exports = {
  buildAria2Args,
  buildDownloadAcceleration,
  getConnectionProfile,
  isBilibiliUrl,
  normalizeConnections,
  normalizeEngine,
  resolveAria2Command,
};
