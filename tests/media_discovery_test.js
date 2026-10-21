'use strict';

const assert = require('node:assert/strict');
const { discoverHtml, decodeHydration, jsonCandidates, mediaType, mediaExtension } = require('../lib/media-discovery');
const { normalizeUrl, isPublicAddress, safeHeaders, createMediaNetwork } = require('../lib/media-network');
const { mergeAssets, verificationQueue } = require('../lib/media-resolver');
const { filenameFor } = require('../lib/media-routes');

async function main() {
  assert.equal(normalizeUrl('unknown-domain.example/watch/42'), 'https://unknown-domain.example/watch/42');
  assert.equal(normalizeUrl('../song.mp3?a=1&st=fixture#t=3', 'https://example.com/watch/42'), 'https://example.com/song.mp3?a=1&st=fixture');
  for (const url of ['file:///etc/passwd', 'data:audio/mp3,xxx', 'javascript:alert(1)', 'https://user:password@example.com']) assert.throws(() => normalizeUrl(url));
  for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '0.0.0.0', '::1', 'fe80::1', 'fc00::1', '::ffff:127.0.0.1']) assert.equal(isPublicAddress(address), false, address);
  for (const address of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111']) assert.equal(isPublicAddress(address), true, address);
  assert.deepEqual(safeHeaders({ Cookie: 'fixture', Authorization: 'fixture', Referer: 'https://example.com/' }), { Referer: 'https://example.com/' });
  const blocked = createMediaNetwork({ lookup: async () => [{ address: '127.0.0.1', family: 4 }] });
  await assert.rejects(blocked.addressesFor('https://public-looking.example'), /PRIVATE_ADDRESS/);

  const html = `<title>Mixed media</title><base href="https://cdn.example/assets/">
    <audio src="a.mp3?st=fixture"><source src="data:audio/mp3,ignored"></audio>
    <video poster="cover.jpg"><source src="movie.mp4"></video>
    <img alt="Gallery" src="small.png" srcset="medium.png 2x, large.webp 3x" data-src="lazy.jpg">
    <picture><source srcset="wide.avif 1x"></picture><div style="background-image:url(bg.png)"></div>
    <meta property="og:image" content="cover.jpg"><iframe src="https://player.example/embed/7"></iframe>
    <script type="application/ld+json">{"name":"Clip","contentUrl":"https://api.example/no-extension","thumbnailUrl":"https://cdn.example/thumb.jpg"}</script>
    <script>player.setup({file:'https://cdn.example/master.m3u8?st=fixture'})</script>`;
  const found = discoverHtml(html, 'https://unlisted.example/page');
  for (const file of ['a.mp3?st=fixture', 'movie.mp4', 'cover.jpg', 'medium.png', 'large.webp', 'wide.avif', 'lazy.jpg', 'bg.png']) assert.ok(found.assets.some(asset => asset.url === `https://cdn.example/assets/${file}`), file);
  assert.ok(found.assets.some(asset => asset.url === 'https://api.example/no-extension' && asset.source === 'json'));
  assert.ok(found.assets.some(asset => asset.type === 'manifest'));
  assert.deepEqual(found.frames, ['https://player.example/embed/7']);
  assert.equal(found.title, 'Mixed media');

  const pool = [{ data: 1 }, { track: 2 }, { name: 3, streamURL: 4 }, 'Hydrated song', [5, 8], { stream: 6, typeUI: 7 }, 'https://cdn.example/a.mp3', '320kbps', { stream: 9, onlyVIP: 10 }, 'https://cdn.example/private.flac', true];
  const hydrated = decodeHydration(pool);
  const json = jsonCandidates(hydrated, 'https://unlisted.example/song');
  assert.equal(json.length, 1);
  assert.equal(json[0].title, 'Hydrated song');
  assert.equal(json[0].quality, '320kbps');
  const structured = discoverHtml(`<script type="application/json">${JSON.stringify({ tracks: [{ stream: 'https://cdn.example/public.mp3' }, { stream: 'https://cdn.example/private.flac', onlyVIP: true }] })}</script>`, 'https://example.com/');
  assert.deepEqual(structured.assets.map(asset => asset.url), ['https://cdn.example/public.mp3']);
  const cyclic = { image: 'https://cdn.example/image.png' }; cyclic.self = cyclic;
  assert.equal(jsonCandidates(cyclic, 'https://example.com/').length, 1);
  assert.equal(jsonCandidates({ thumbnailUrl: 'https://cdn.example/no-extension' }, 'https://example.com/')[0].type, 'image');

  assert.equal(mediaType('https://example.com/no-extension', 'audio/mpeg'), 'audio');
  assert.equal(mediaType('https://example.com/no-extension', 'application/octet-stream', Buffer.from('ID3')), 'audio');
  assert.equal(mediaType('https://example.com/false.mp4', 'text/html', Buffer.from('<html>login</html>')), null);
  assert.equal(mediaType('https://example.com/no-extension', 'text/plain', Buffer.from('#EXTM3U\n')), 'manifest');
  assert.equal(mediaExtension({ url: 'https://example.com/image.jpg', type: 'image', mime: 'image/webp' }), 'webp');
  assert.doesNotMatch(filenameFor({ url: 'https://example.com/image.jpg', type: 'image', mime: 'image/webp', title: '../CON' }), /[\\/]/);
  assert.equal(filenameFor({ url: 'https://example.com/image.jpg', type: 'image', mime: 'image/webp', title: 'CON' }), '_CON.webp');
  const merged = mergeAssets([{ url: 'https://example.com/a.mp3?st=one', type: 'audio', source: 'html' }, { url: 'https://example.com/a.mp3?st=one', type: 'audio', source: 'network' }, { url: 'https://example.com/a.mp3?st=two', type: 'audio', source: 'html' }]);
  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0].sources, ['html', 'network']);
  const crowded = [...Array.from({ length: 45 }, () => ({ type: 'audio', status: 'unverified' })), ...Array.from({ length: 45 }, () => ({ type: 'image', status: 'unverified' }))];
  assert.equal(verificationQueue(crowded).filter(asset => asset.type === 'image').length, 20, 'Audio lists must not consume all image verification slots');
  const manyAudio = Array.from({ length: 130 }, (_value, index) => ({ url: `https://example.com/${index}.mp3`, type: 'audio', source: 'json' }));
  const capped = mergeAssets([...manyAudio, { url: 'https://example.com/cover.jpg', type: 'image', source: 'html' }]);
  assert.equal(capped.length, 120);
  assert.ok(capped.some(asset => asset.type === 'image'), 'The asset cap must preserve different media types');
  console.log('Media parser/security checks passed: unknown domains, HTML/JSON/Nuxt, MIME, signed queries and private IPv4/IPv6.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
