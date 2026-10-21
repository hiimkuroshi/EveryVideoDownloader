'use strict';

const cheerio = require('cheerio');
const { normalizeUrl, safeHeaders } = require('./media-network');

const EXTENSIONS = {
  audio: ['mp3', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'wav', 'flac'],
  video: ['mp4', 'webm', 'mkv', 'mov', 'm4v', 'avi', 'flv', 'ogv'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp'],
  subtitle: ['srt', 'vtt', 'ass', 'ssa', 'ttml'],
  manifest: ['m3u8', 'mpd'],
};

function mediaType(url = '', mime = '', body = Buffer.alloc(0)) {
  const contentType = mime.split(';')[0].trim().toLowerCase();
  const ext = new URL(url || 'https://invalid.example/').pathname.split('.').pop().toLowerCase();
  if (/mpegurl|dash\+xml/.test(contentType) || body.subarray(0, 64).toString().trimStart().startsWith('#EXTM3U') || /<MPD[\s>]/.test(body.subarray(0, 2048).toString())) return 'manifest';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('image/')) return 'image';
  if (/vtt|subrip|ttml/.test(contentType)) return 'subtitle';
  if (body.subarray(0, 3).toString() === 'ID3' || (body[0] === 0xff && (body[1] & 0xe0) === 0xe0)) return 'audio';
  if (body.subarray(4, 8).toString() === 'ftyp') return 'video';
  if (body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || body.subarray(0, 3).equals(Buffer.from([255, 216, 255])) || body.subarray(8, 12).toString() === 'WEBP' || body.subarray(0, 3).toString() === 'GIF') return 'image';
  if (contentType && !/octet-stream|text\/plain/.test(contentType)) return null;
  return Object.keys(EXTENSIONS).find(type => EXTENSIONS[type].includes(ext)) || null;
}

function mediaExtension(asset) {
  const mimeExt = { 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/flac': 'flac', 'audio/ogg': 'ogg', 'video/mp4': 'mp4', 'video/webm': 'webm', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'text/vtt': 'vtt' };
  const mime = (asset.mime || '').split(';')[0];
  if (mimeExt[mime]) return mimeExt[mime];
  const ext = new URL(asset.url).pathname.split('.').pop().toLowerCase();
  return Object.values(EXTENSIONS).flat().includes(ext) ? ext : asset.ext || (asset.type === 'image' ? 'img' : 'bin');
}

function candidate(value, base, details = {}) {
  try {
    const url = normalizeUrl(value, base);
    const type = details.type || mediaType(url);
    if (!type && !details.possibleMedia) return null;
    return { url, type: type || 'unknown', source_page: base, source: 'html', ...details, headers: safeHeaders({ Referer: base, ...details.headers }) };
  } catch { return null; }
}

function decodeHydration(pool) {
  const cache = new Map();
  function decode(index, depth = 0) {
    if (!Number.isInteger(index) || index < 0 || index >= pool.length || depth > 40) return null;
    if (cache.has(index)) return cache.get(index);
    const value = pool[index];
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return decode(value[1], depth + 1);
    const result = Array.isArray(value) ? [] : {};
    cache.set(index, result);
    for (const [key, ref] of Object.entries(value)) result[key] = decode(ref, depth + 1);
    return result;
  }
  return decode(0);
}

function jsonCandidates(value, base) {
  const assets = [];
  const seen = new Set();
  let visited = 0;
  function walk(item, inherited = {}, key = '', depth = 0) {
    if (++visited > 15000 || depth > 40) return;
    if (typeof item === 'string') {
      if (!/^(?:https?:\/\/|\/|\.\.\/|\.\/)/i.test(item) && !/\.(?:mp3|m4a|mp4|webm|m3u8|mpd|jpg|png|webp|vtt)(?:\?|$)/i.test(item)) return;
      const isImage = /image|thumbnail|poster|cover|picture/i.test(key);
      const asset = candidate(item, base, { ...inherited, ...(isImage ? { type: 'image' } : {}), ...(/thumbnail|poster|cover/i.test(key) ? { role: 'thumbnail' } : {}), source: 'json', possibleMedia: /stream|audio|video|download|contenturl/i.test(key) });
      if (asset) assets.push(asset);
      return;
    }
    if (!item || typeof item !== 'object' || seen.has(item)) return;
    seen.add(item);
    if (item.onlyVIP === true || item.has_drm === true || /^(unavailable|blocked|restricted)$/i.test(item.availability || '')) return;
    const details = { ...inherited };
    if (typeof (item.title || item.name) === 'string') details.title = (item.title || item.name).slice(0, 250);
    if (item.typeUI || item.quality) details.quality = String(item.typeUI || item.quality).slice(0, 80);
    if (Number.isFinite(item.duration)) details.duration = item.duration;
    for (const [field, child] of Object.entries(item)) walk(child, details, field, depth + 1);
  }
  walk(value);
  return assets;
}

function discoverHtml(html, pageUrl) {
  const $ = cheerio.load(html);
  let base = pageUrl;
  try { base = normalizeUrl($('base[href]').attr('href'), pageUrl); } catch {}
  const assets = [];
  const add = (value, details) => { const asset = candidate(value, base, details); if (asset) assets.push(asset); };
  const title = $('meta[property="og:title"]').attr('content') || $('title').first().text().trim() || new URL(pageUrl).hostname;
  $('audio, video').each((_i, element) => {
    const node = $(element);
    const type = element.tagName;
    add(node.attr('src'), { type, title });
    node.find('source').each((_j, source) => add($(source).attr('src'), { type: /mpegurl|dash/i.test($(source).attr('type') || '') ? 'manifest' : type, title, mime: $(source).attr('type') || '' }));
    add(node.attr('poster'), { type: 'image', title, role: 'thumbnail' });
  });
  $('img, picture source').each((_i, element) => {
    const node = $(element);
    const details = { type: 'image', title: node.attr('alt') || title };
    for (const field of ['src', 'data-src', 'data-original', 'data-lazy-src']) add(node.attr(field), details);
    const srcset = node.attr('srcset') || node.attr('data-srcset') || '';
    for (const source of srcset.split(',')) add(source.trim().split(/\s+/)[0], details);
  });
  $('meta[property], meta[name]').each((_i, element) => {
    const node = $(element);
    const name = node.attr('property') || node.attr('name');
    if (/^(og|twitter):(image|video|audio)(:url|:secure_url)?$/.test(name)) add(node.attr('content'), { type: name.includes('image') ? 'image' : name.includes('audio') ? 'audio' : 'video', role: name.includes('image') ? 'thumbnail' : undefined, title });
  });
  $('track[src], a[href], link[href]').each((_i, element) => add($(element).attr('src') || $(element).attr('href'), { title }));
  for (const match of html.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi)) add(match[1], { type: 'image', title });
  $('script').each((_i, element) => {
    const node = $(element);
    const text = node.text();
    if (text.length > 1500000) return;
    if (/json/i.test(node.attr('type') || '') || /^\s*[\[{]/.test(text)) {
      try {
        const data = JSON.parse(text);
        assets.push(...jsonCandidates(node.attr('id') === '__NUXT_DATA__' && Array.isArray(data) ? decodeHydration(data) : data, pageUrl));
        return; // Preserve access/DRM restrictions in structured records.
      } catch {}
    }
    for (const match of text.matchAll(/(?:https?:\\?\/\\?\/|\/)[^\s"'<>`]+?\.(?:mp3|m4a|aac|ogg|opus|wav|flac|mp4|webm|m3u8|mpd|jpg|jpeg|png|webp|avif|vtt)(?:\?[^\s"'<>`]*)?/gi)) {
      add(match[0].replace(/\\\//g, '/'), { title, source: 'script' });
    }
  });
  const frames = $('iframe[src]').map((_i, element) => {
    try { return normalizeUrl($(element).attr('src'), base); } catch { return null; }
  }).get();
  return { title: title.slice(0, 250), assets, frames: frames.slice(0, 4) };
}

function extractorAssets(info) {
  if (!info) return [];
  const assets = [];
  const entries = info.entries || [info];
  for (const entry of entries.filter(Boolean).slice(0, 20)) {
    const base = entry.webpage_url || info.webpage_url;
    for (const format of entry.formats || (entry.url ? [entry] : [])) {
      if (!format.url || format.has_drm) continue;
      const type = /m3u8|dash/.test(format.protocol || '') ? 'manifest' : format.vcodec === 'none' ? 'audio' : 'video';
      const asset = candidate(format.url, base, { type, source: 'extractor', title: entry.title, quality: format.format_note || format.resolution || (format.abr ? `${format.abr} kbps` : format.format_id), ext: format.ext, format_id: format.format_id, protocol: format.protocol, headers: safeHeaders({ ...entry.http_headers, ...format.http_headers }), extractor_page: base, extractor_format: format.format_id, fragment_urls: (format.fragments || []).map(f => f.url).filter(Boolean), format });
      if (asset) assets.push(asset);
    }
    for (const image of entry.thumbnails || (entry.thumbnail ? [{ url: entry.thumbnail }] : [])) {
      const asset = candidate(image.url, base, { type: 'image', role: 'thumbnail', source: 'extractor', title: entry.title });
      if (asset) assets.push(asset);
    }
    for (const [language, tracks] of Object.entries(entry.subtitles || {})) {
      for (const track of tracks) {
        const asset = candidate(track.url, base, { type: 'subtitle', source: 'extractor', title: `${entry.title} · ${language}`, ext: track.ext });
        if (asset) assets.push(asset);
      }
    }
  }
  return assets;
}

module.exports = { discoverHtml, jsonCandidates, decodeHydration, candidate, mediaType, mediaExtension, extractorAssets };
