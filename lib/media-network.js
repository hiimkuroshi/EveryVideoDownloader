'use strict';

const http = require('node:http');
const https = require('node:https');
const dns = require('node:dns').promises;
const ipaddr = require('ipaddr.js');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36';

function resourceMethod(status, method) {
  return status === 303 || ([301, 302].includes(status) && method === 'POST') ? 'GET' : method;
}

function normalizeUrl(value, base) {
  if (typeof value !== 'string' || !value.trim() || value.length > 16384) throw new Error('INVALID_URL');
  let input = value.trim().replace(/&amp;/g, '&');
  if (!base && !/^[a-z][a-z\d+.-]*:/i.test(input)) input = `https://${input}`;
  const url = new URL(input, base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('INVALID_URL');
  url.hash = '';
  return url.href;
}

function isPublicAddress(address) {
  try {
    let parsed = ipaddr.parse(address);
    if (parsed.kind() === 'ipv6' && parsed.isIPv4MappedAddress()) parsed = parsed.toIPv4Address();
    return parsed.range() === 'unicast';
  } catch { return false; }
}

function safeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).filter(([key]) => /^(referer|user-agent|origin|accept|accept-language)$/i.test(key)));
}

function publicError(error) {
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return 'TIMEOUT';
  return /^(INVALID_URL|PRIVATE_ADDRESS|TOO_LARGE|TOO_MANY_REDIRECTS|HTTP_\d+|NETWORK_ERROR|TIMEOUT)$/.test(error?.message)
    ? error.message : 'NETWORK_ERROR';
}

function createMediaNetwork({ allowPrivate = false, lookup = dns.lookup, timeoutMs = 12000 } = {}) {
  async function addressesFor(value, signal) {
    const url = new URL(normalizeUrl(value));
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = await new Promise((resolve, reject) => {
      const aborted = () => reject(signal.reason);
      signal?.addEventListener('abort', aborted, { once: true });
      lookup(host, { all: true, verbatim: true }).then(resolve, reject).finally(() => signal?.removeEventListener('abort', aborted));
      if (signal?.aborted) aborted();
    });
    signal?.throwIfAborted();
    if (!addresses.length || (!allowPrivate && addresses.some(item => !isPublicAddress(item.address)))) {
      throw new Error('PRIVATE_ADDRESS');
    }
    return addresses;
  }

  async function openStream(value, { headers = {}, signal, method = 'GET', body, redirects = 0, followRedirects = true } = {}) {
    signal?.throwIfAborted();
    if (redirects > 5) throw new Error('TOO_MANY_REDIRECTS');
    const url = new URL(normalizeUrl(value));
    const addresses = await addressesFor(url.href, signal);
    const address = addresses[0];
    const response = await new Promise((resolve, reject) => {
      const transport = url.protocol === 'https:' ? https : http;
      const request = transport.request(url, {
        method, signal,
        headers: { 'User-Agent': USER_AGENT, ...headers, 'Accept-Encoding': 'identity' },
        lookup: (_host, options, callback) => options.all
          ? callback(null, addresses) : callback(null, address.address, address.family),
      }, resolve);
      request.setTimeout(timeoutMs, () => request.destroy(new Error('TIMEOUT')));
      request.once('error', reject);
      request.end(body);
    });
    if (followRedirects && [301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
      const target = normalizeUrl(response.headers.location, url.href);
      response.destroy();
      const nextHeaders = { ...headers };
      if (new URL(target).origin !== url.origin) {
        for (const key of Object.keys(nextHeaders)) if (/^(cookie|authorization)$/i.test(key)) delete nextHeaders[key];
      }
      const nextMethod = resourceMethod(response.statusCode, method);
      return openStream(target, { headers: nextHeaders, signal, method: nextMethod, body: nextMethod === method ? body : undefined, redirects: redirects + 1 });
    }
    return { url: url.href, status: response.statusCode, headers: response.headers, stream: response };
  }

  async function read(value, { maxBytes = 2 * 1024 * 1024, truncate = true, ...options } = {}) {
    const resource = await openStream(value, options);
    const chunks = [];
    let size = 0;
    let truncated = false;
    try {
      for await (const chunk of resource.stream) {
        const available = maxBytes - size;
        chunks.push(chunk.subarray(0, available));
        size += Math.min(chunk.length, available);
        if (chunk.length >= available) {
          truncated = true;
          if (!truncate) throw new Error('TOO_LARGE');
          break;
        }
      }
    } finally { resource.stream.destroy(); }
    return { ...resource, stream: undefined, body: Buffer.concat(chunks), truncated };
  }

  return { addressesFor, openStream, read };
}

module.exports = { createMediaNetwork, normalizeUrl, isPublicAddress, safeHeaders, publicError, USER_AGENT };
