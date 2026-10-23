'use strict';

const { version: APP_VERSION } = require('../package.json');
const REPOSITORY = 'hiimkuroshi/EveryVideoDownloader';
const RELEASES_URL = `https://github.com/${REPOSITORY}/releases`;
const API_URL = `https://api.github.com/repos/${REPOSITORY}/releases/latest`;

function parseVersion(value) {
  if (typeof value !== 'string' || value.length > 128) return null;
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(value);
  if (!match) return null;
  const prerelease = match[4]?.split('.') || [];
  if (prerelease.some(part => !part || (/^\d+$/.test(part) && part.length > 1 && part[0] === '0'))
      || match[5]?.split('.').some(part => !part)) return null;
  return { numbers: match.slice(1, 4).map(BigInt), prerelease };
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) throw new Error('INVALID_VERSION');
  for (let i = 0; i < 3; i++) {
    if (a.numbers[i] !== b.numbers[i]) return a.numbers[i] > b.numbers[i] ? 1 : -1;
  }
  if (!a.prerelease.length || !b.prerelease.length) {
    return a.prerelease.length === b.prerelease.length ? 0 : (a.prerelease.length ? -1 : 1);
  }
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const x = a.prerelease[i];
    const y = b.prerelease[i];
    if (x === y) continue;
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    const xn = /^\d+$/.test(x);
    const yn = /^\d+$/.test(y);
    if (xn && yn) return BigInt(x) > BigInt(y) ? 1 : -1;
    if (xn !== yn) return xn ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}

function createUpdateChecker({ fetchImpl = globalThis.fetch, currentVersion = APP_VERSION,
  now = Date.now, timeoutMs = 10000, cacheMs = 5 * 60 * 1000, failureCacheMs = 30000 } = {}) {
  let cached;
  let expiresAt = 0;
  let pending;

  async function request() {
    const base = { currentVersion, releaseUrl: RELEASES_URL, checkedAt: new Date(now()).toISOString() };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(API_URL, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': `EveryVideo/${APP_VERSION}`,
          'X-GitHub-Api-Version': '2026-03-10' },
        signal: controller.signal,
        redirect: 'error',
      });
      if (response.status === 404) return { ...base, status: 'no-release' };
      if (response.status === 403 || response.status === 429) return { ...base, error: 'RATE_LIMITED' };
      if (!response.ok) return { ...base, error: 'GITHUB_UNAVAILABLE' };
      const release = await response.json();
      const version = parseVersion(release?.tag_name);
      if (!version || version.prerelease.length || release.draft || release.prerelease) {
        return { ...base, error: 'INVALID_RELEASE' };
      }
      const comparison = compareVersions(release.tag_name, currentVersion);
      return { ...base, status: comparison > 0 ? 'available' : (comparison < 0 ? 'ahead' : 'latest'),
        latestVersion: release.tag_name.replace(/^v/, ''),
        releaseUrl: `${RELEASES_URL}/tag/${encodeURIComponent(release.tag_name)}` };
    } catch {
      return { ...base, error: controller.signal.aborted ? 'TIMEOUT' : 'NETWORK_ERROR' };
    } finally {
      clearTimeout(timer);
    }
  }

  return async function checkForUpdates() {
    if (cached && now() < expiresAt) return { ...cached, cached: true };
    if (!pending) {
      pending = request().then(result => {
        cached = result;
        expiresAt = now() + (result.error ? failureCacheMs : cacheMs);
        return { ...result, cached: false };
      }).finally(() => { pending = null; });
    }
    return pending;
  };
}

module.exports = { APP_VERSION, API_URL, RELEASES_URL, compareVersions, createUpdateChecker };
