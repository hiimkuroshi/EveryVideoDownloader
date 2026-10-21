'use strict';

const path = require('node:path');
const { candidate, discoverHtml, mediaType, jsonCandidates } = require('./media-discovery');
const { publicError, safeHeaders } = require('./media-network');

process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(__dirname, '..', '.runtime', 'playwright');

async function discoverBrowser(url, { network, signal, durationMs = 6500 } = {}) {
  const { chromium } = require('playwright');
  let browser;
  const assets = [];
  const warnings = [];
  let requestCount = 0;
  let transferred = 0;
  try {
    signal?.throwIfAborted();
    browser = await chromium.launch({ headless: true, timeout: 10000 });
    const abort = () => { browser.close().catch(() => {}); };
    signal?.addEventListener('abort', abort, { once: true });
    const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
    const page = await context.newPage();
    await context.route('**/*', async route => {
      const request = route.request();
      if (++requestCount > 100 || transferred > 16 * 1024 * 1024 || !['GET', 'POST'].includes(request.method())) return route.abort();
      try {
        const headers = await request.allHeaders();
        const resource = await network.read(request.url(), { headers: { ...safeHeaders(headers), ...(headers.cookie ? { Cookie: headers.cookie } : {}), ...(headers.range ? { Range: headers.range } : {}), ...(headers['content-type'] ? { 'Content-Type': headers['content-type'] } : {}) }, method: request.method(), body: request.postDataBuffer(), signal, maxBytes: 2 * 1024 * 1024, followRedirects: false });
        transferred += resource.body.length;
        // Let Chromium process redirects and Set-Cookie together in its isolated session.
        const mime = resource.headers['content-type'] || '';
        const type = mediaType(resource.url, mime, resource.body);
        if (type && resource.status < 400) {
          const asset = candidate(resource.url, url, { type, source: 'network', mime, headers: safeHeaders(headers) });
          if (asset) assets.push(asset);
        } else if (/json/.test(mime) && resource.body.length < 1500000) {
          try { assets.push(...jsonCandidates(JSON.parse(resource.body.toString()), url).map(asset => ({ ...asset, source: 'network' }))); } catch {}
        }
        const responseHeaders = Object.fromEntries(Object.entries(resource.headers).filter(([key]) => !/^(content-length|content-encoding|transfer-encoding|connection)$/i.test(key)).map(([key, value]) => [key, Array.isArray(value) ? value.join(key === 'set-cookie' ? '\n' : ', ') : String(value)]));
        await route.fulfill({ status: resource.status, headers: responseHeaders, body: resource.body });
      } catch { await route.abort().catch(() => {}); }
    });
    // WebSockets can connect outside HTTP routing; media discovery uses HTTP responses.
    await context.routeWebSocket('**/*', socket => socket.close());
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 }); }
    catch (error) { if (signal?.aborted) throw error; warnings.push('BROWSER_NAVIGATION_INCOMPLETE'); }
    const until = Date.now() + durationMs;
    while (Date.now() < until && !signal?.aborted && !page.isClosed()) {
      for (const frame of page.frames().slice(0, 5)) {
        try {
          const rendered = discoverHtml(await frame.content(), frame.url());
          assets.push(...rendered.assets.map(asset => ({ ...asset, source: 'dom' })));
          const dynamic = await frame.evaluate(() => {
            const result = [];
            for (const node of document.querySelectorAll('audio,video')) {
              if (node.currentSrc) result.push({ url: node.currentSrc, type: node.tagName.toLowerCase() });
              node.muted = true;
              node.play().catch(() => {});
            }
            for (const node of document.querySelectorAll('img')) if (node.currentSrc) result.push({ url: node.currentSrc, type: 'image', title: node.alt });
            for (const node of Array.from(document.querySelectorAll('*')).slice(0, 1500)) {
              const style = getComputedStyle(node).backgroundImage;
              for (const match of style.matchAll(/url\(["']?([^"')]+)["']?\)/g)) result.push({ url: match[1], type: 'image' });
            }
            window.scrollBy(0, Math.min(window.innerHeight, 800));
            return result;
          });
          assets.push(...dynamic.map(asset => candidate(asset.url, frame.url(), { ...asset, source: 'dom' })).filter(Boolean));
        } catch {}
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    // Preserve cookies from this isolated page session only in server-side descriptors.
    for (const asset of assets) {
      const cookies = await context.cookies(asset.url).catch(() => []);
      if (cookies.length) asset.private_headers = { Cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ') };
    }
    signal?.removeEventListener('abort', abort);
    return { assets, warnings, used: true };
  } catch (error) {
    return { assets, warnings: [browser ? publicError(error) : 'BROWSER_UNAVAILABLE'], used: false };
  } finally { await browser?.close().catch(() => {}); }
}

module.exports = { discoverBrowser };
