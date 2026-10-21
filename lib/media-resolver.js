'use strict';

const { randomUUID } = require('node:crypto');
const { createMediaNetwork, normalizeUrl, publicError } = require('./media-network');
const { discoverHtml, extractorAssets, mediaType, mediaExtension } = require('./media-discovery');
const { discoverBrowser } = require('./media-browser');

const MAX_ASSETS = 120;
const TTL_MS = 15 * 60 * 1000;

function takeBalanced(assets, limit) {
  const groups = new Map();
  for (const asset of assets) {
    if (!groups.has(asset.type)) groups.set(asset.type, []);
    groups.get(asset.type).push(asset);
  }
  const queue = [];
  while (queue.length < limit && [...groups.values()].some(items => items.length)) {
    for (const items of groups.values()) {
      if (items.length && queue.length < limit) queue.push(items.shift());
    }
  }
  return queue;
}

function verificationQueue(assets, limit = 40) {
  return takeBalanced(assets.filter(asset => asset.status === 'unverified'), limit);
}

async function mapConcurrent(items, limit, task) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) { const index = cursor++; await task(items[index], index); }
  }));
}

function mergeAssets(input) {
  const byUrl = new Map();
  for (const asset of input) {
    if (!asset?.url) continue;
    const previous = byUrl.get(asset.url);
    if (!previous) byUrl.set(asset.url, { ...asset, id: randomUUID(), sources: [asset.source], status: 'unverified' });
    else {
      previous.sources = [...new Set([...previous.sources, asset.source])];
      if (asset.source === 'extractor' || asset.source === 'json' || previous.type === 'unknown') Object.assign(previous, asset);
      if (asset.role) previous.role = asset.role;
      if (asset.private_headers) previous.private_headers = asset.private_headers;
    }
  }
  const rank = { audio: 0, video: 1, manifest: 2, subtitle: 3, image: 4, unknown: 5 };
  const sort = (a, b) => (rank[a.type] ?? 5) - (rank[b.type] ?? 5);
  return takeBalanced([...byUrl.values()].sort(sort), MAX_ASSETS).sort(sort);
}

function assetResponse(asset) {
  const { private_headers, format, fragment_urls, ...visible } = asset;
  const headers = { ...visible.headers };
  return { ...visible, headers, ext: mediaExtension(asset), requires_session: !!private_headers };
}

function createMediaResolver({ network = createMediaNetwork(), extract = async () => null, browser = discoverBrowser, ttlMs = TTL_MS } = {}) {
  const sessions = new Map();

  async function scanPage(url, signal, visited = new Set(), depth = 0) {
    if (visited.has(url) || visited.size >= 5) return { assets: [], title: '' };
    visited.add(url);
    const resource = await network.read(url, { signal, maxBytes: 2 * 1024 * 1024 });
    if (resource.status >= 400) throw new Error(`HTTP_${resource.status}`);
    const mime = resource.headers['content-type'] || '';
    const type = mediaType(resource.url, mime, resource.body);
    if (type) return { title: new URL(resource.url).pathname.split('/').pop() || new URL(url).hostname, assets: [{ url: resource.url, type, mime, source: 'http', source_page: url, headers: { Referer: url } }], dynamic: false };
    if (!/html|xhtml/.test(mime) && !/^\s*<!doctype html|^\s*<html/i.test(resource.body.toString())) return { title: new URL(url).hostname, assets: [], dynamic: false };
    const html = resource.body.toString();
    const found = discoverHtml(html, resource.url);
    if (depth < 2) for (const frame of found.frames) {
      try { found.assets.push(...(await scanPage(frame, signal, visited, depth + 1)).assets); } catch {}
    }
    return { ...found, dynamic: /<script\b[^>]*(?:src=|type=["']?module)|<script[^>]*>[\s\S]{80}/i.test(html) };
  }

  async function verify(asset, signal) {
    try {
      const result = await network.read(asset.url, { headers: { ...asset.headers, ...asset.private_headers, Range: 'bytes=0-4095' }, signal, maxBytes: 4096 });
      asset.http_status = result.status;
      if (result.status >= 400) { asset.status = [401, 403].includes(result.status) ? 'access_required' : 'unavailable'; return; }
      const detected = mediaType(result.url, result.headers['content-type'] || '', result.body);
      if (!detected) { asset.status = 'not_media'; return; }
      if (asset.type !== 'manifest' || detected === 'manifest') asset.type = detected;
      asset.mime = (result.headers['content-type'] || '').split(';')[0];
      asset.status = 'verified';
      const total = result.headers['content-range']?.match(/\/(\d+)$/)?.[1] || result.headers['content-length'];
      if (total) asset.filesize = Number(total);
      asset.ext = mediaExtension(asset);
    } catch (error) {
      asset.status = error.message === 'PRIVATE_ADDRESS' ? 'blocked' : 'unverified';
      asset.reason = publicError(error);
    }
  }

  async function resolve(value, options = {}, externalSignal) {
    const url = normalizeUrl(value);
    const signal = externalSignal ? AbortSignal.any([externalSignal, AbortSignal.timeout(45000)]) : AbortSignal.timeout(45000);
    await network.addressesFor(url, signal);
    const warnings = [];
    const [html, extraction] = await Promise.allSettled([scanPage(url, signal), extract(url, options, signal)]);
    const page = html.status === 'fulfilled' ? html.value : { title: new URL(url).hostname, assets: [], dynamic: true };
    if (html.status === 'rejected') warnings.push(publicError(html.reason));
    const info = extraction.status === 'fulfilled' ? extraction.value : null;
    if (!info && extraction.status === 'rejected') warnings.push('EXTRACTOR_UNAVAILABLE');
    let assets = mergeAssets([...extractorAssets(info), ...page.assets]);
    // Avoid probing every platform format and triggering CDN throttling before download.
    for (const asset of assets) if (asset.sources.includes('extractor')) asset.status = 'available';
    await mapConcurrent(verificationQueue(assets), 5, asset => verify(asset, signal));
    const hasPlayable = assets.some(asset => ['audio', 'video', 'manifest'].includes(asset.type) && ['verified', 'available'].includes(asset.status));
    let browserUsed = false;
    if (options.browserMode === 'always' || (options.browserMode !== 'off' && page.dynamic && !hasPlayable)) {
      const rendered = await browser(url, { network, signal });
      warnings.push(...rendered.warnings);
      browserUsed = rendered.used;
      const existing = new Map(assets.map(asset => [asset.url, asset]));
      assets = mergeAssets([...assets, ...rendered.assets]);
      for (const asset of assets) {
        const previous = existing.get(asset.url);
        const sessionChanged = asset.private_headers?.Cookie !== previous?.private_headers?.Cookie;
        if (previous && ['verified', 'available'].includes(previous.status) && !sessionChanged) Object.assign(asset, { status: previous.status, mime: previous.mime, filesize: previous.filesize, id: previous.id });
      }
      await mapConcurrent(verificationQueue(assets), 5, asset => verify(asset, signal));
    }
    assets = assets.filter(asset => !['not_media', 'blocked'].includes(asset.status));
    for (const [id, session] of sessions) if (session.expiresAt < Date.now()) sessions.delete(id);
    if (sessions.size >= 30) sessions.delete(sessions.keys().next().value);
    const id = randomUUID();
    sessions.set(id, { id, url, options, assets, expiresAt: Date.now() + ttlMs });
    return { resolution_id: id, source_url: url, title: info?.title || page.title, assets: assets.map(assetResponse), info, browser_used: browserUsed, warnings: [...new Set(warnings)], truncated: assets.length >= MAX_ASSETS, expires_at: new Date(Date.now() + ttlMs).toISOString() };
  }

  function getAsset(id, assetId) {
    const session = sessions.get(id);
    if (!session || session.expiresAt < Date.now()) { sessions.delete(id); throw new Error('RESOLUTION_EXPIRED'); }
    const asset = session.assets.find(item => item.id === assetId);
    if (!asset) throw new Error('ASSET_NOT_FOUND');
    return { session, asset };
  }

  return { resolve, getAsset, verify, network };
}

module.exports = { createMediaResolver, mergeAssets, mapConcurrent, verificationQueue };
