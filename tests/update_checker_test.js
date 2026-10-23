'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { API_URL, RELEASES_URL, compareVersions, createUpdateChecker } = require('../lib/update-checker');
const response = (status, data) => ({ status, ok: status === 200, json: async () => data });
const release = tag_name => ({ tag_name, draft: false, prerelease: false });

test('versions compare numerically, including prerelease precedence and build metadata', () => {
  for (const [a, b, expected] of [
    ['v1.10.0', '1.9.9', 1], ['1.2.10', '1.2.9', 1], ['2.0.0', '10.0.0', -1],
    ['v1.2.0', '1.2.0+local', 0], ['1.2.0-rc.10', '1.2.0-rc.2', 1],
    ['1.2.0', '1.2.0-rc.1', 1], ['1.2.0-alpha', '1.2.0-alpha.1', -1],
    ['1.2.0-1', '1.2.0-alpha', -1], ['1.2.0-beta', '1.2.0-alpha', 1],
  ]) assert.equal(compareVersions(a, b), expected, `${a} vs ${b}`);
  for (const invalid of ['', 'main', '1.2', '01.2.0', '1.2.0-01', '1.2.0-alpha..1', '1.2.0+a..b']) {
    assert.throws(() => compareVersions(invalid, '1.2.0'), /INVALID_VERSION/);
  }
});

test('stable releases produce available, latest and ahead states with a trusted URL', async () => {
  for (const [tag, status] of [['v1.3.0', 'available'], ['v1.2.0', 'latest'], ['v1.1.0', 'ahead']]) {
    const check = createUpdateChecker({ currentVersion: '1.2.0', fetchImpl: async (url, options) => {
      assert.equal(url, API_URL);
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal);
      assert.equal(options.headers.Accept, 'application/vnd.github+json');
      return response(200, { ...release(tag), html_url: 'javascript:alert(1)' });
    } });
    const result = await check();
    assert.equal(result.status, status);
    assert.equal(result.currentVersion, '1.2.0');
    assert.equal(result.releaseUrl, `${RELEASES_URL}/tag/${tag}`);
  }
});

test('prereleases, drafts, malformed JSON and invalid tags never claim the app is up to date', async () => {
  for (const data of [null, {}, release('main'), release('v1.3.0-rc.1'),
    { ...release('v1.3.0'), draft: true }, { ...release('v1.3.0'), prerelease: true }]) {
    const result = await createUpdateChecker({ fetchImpl: async () => response(200, data) })();
    assert.equal(result.error, 'INVALID_RELEASE');
    assert.equal(result.status, undefined);
  }
  const result = await createUpdateChecker({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('bad JSON'); } }) })();
  assert.ok(result.error);
});

test('HTTP and network failures have explicit states', async () => {
  for (const [code, error] of [[403, 'RATE_LIMITED'], [429, 'RATE_LIMITED'], [500, 'GITHUB_UNAVAILABLE']]) {
    const result = await createUpdateChecker({ fetchImpl: async () => response(code) })();
    assert.equal(result.error, error);
  }
  assert.equal((await createUpdateChecker({ fetchImpl: async () => response(404) })()).status, 'no-release');
  assert.equal((await createUpdateChecker({ fetchImpl: async () => { throw new Error('offline'); } })()).error, 'NETWORK_ERROR');
});

test('timeout also covers waiting for the response body', async () => {
  const result = await createUpdateChecker({ timeoutMs: 10, fetchImpl: async (_url, { signal }) => ({
    status: 200, ok: true, json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  }) })();
  assert.equal(result.error, 'TIMEOUT');
});

test('simultaneous checks share one request, cache expires and failures can be retried', async () => {
  let clock = 1000000;
  let calls = 0;
  const check = createUpdateChecker({ currentVersion: '1.2.0', now: () => clock, cacheMs: 100, failureCacheMs: 20, fetchImpl: async () => {
    calls++;
    return response(calls === 2 ? 429 : 200, release('v1.3.0'));
  } });
  await Promise.all([check(), check(), check()]);
  assert.equal(calls, 1);
  assert.equal((await check()).cached, true);
  clock += 101;
  assert.equal((await check()).error, 'RATE_LIMITED');
  assert.equal((await check()).cached, true);
  assert.equal(calls, 2);
  clock += 21;
  assert.equal((await check()).status, 'available');
  assert.equal(calls, 3);
});
