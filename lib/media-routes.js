'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const { createProcessLineParser } = require('./download-progress');
const { mediaType, mediaExtension } = require('./media-discovery');
const { normalizeUrl, publicError } = require('./media-network');

function filenameFor(asset) {
  const ext = asset.type === 'manifest' ? (asset.ext && !['m3u8', 'mpd'].includes(asset.ext) ? asset.ext : 'mp4') : mediaExtension(asset);
  let name = (asset.title || new URL(asset.url).pathname.split('/').pop() || 'media').replace(/[\\/:*?"<>|\x00-\x1f%]/g, '_').trim().slice(0, 130);
  name = name.replace(/\.(mp3|m4a|wav|flac|mp4|webm|jpg|jpeg|png|webp|gif|avif|svg|m3u8|mpd|vtt|srt)$/i, '').replace(/[. ]+$/, '') || 'media';
  if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(name)) name = `_${name}`;
  if (asset.quality) name += `_${String(asset.quality).replace(/[^a-z\d.-]+/gi, '_').slice(0, 40)}`;
  return `${name}.${ext}`;
}

async function checkManifest(asset, network, signal, visited = new Set(), depth = 0) {
  if (visited.has(asset.url)) return;
  if (visited.size >= 12 || depth > 3) throw new Error('MANIFEST_LIMIT');
  visited.add(asset.url);
  const resource = await network.read(asset.url, { headers: { ...asset.headers, ...asset.private_headers }, signal, maxBytes: 1024 * 1024, truncate: false });
  if (resource.status >= 400) throw new Error(`HTTP_${resource.status}`);
  const text = resource.body.toString();
  let targets = [];
  if (text.trimStart().startsWith('#EXTM3U')) {
    targets = [...text.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#')), ...[...text.matchAll(/URI="([^"]+)"/g)].map(match => match[1])];
  } else if (/<MPD[\s>]/.test(text)) {
    targets = [...text.matchAll(/<(?:BaseURL|Location)[^>]*>([^<]+)<\//g)].map(match => match[1]);
    targets.push(...[...text.matchAll(/(?:media|initialization|sourceURL)="([^"]+)"/g)].map(match => match[1].replace(/\$[^$]+\$/g, '1')));
  } else throw new Error('INVALID_MANIFEST');
  for (const target of targets.slice(0, 200)) {
    const url = normalizeUrl(target.trim(), resource.url);
    await network.addressesFor(url, signal);
    if (/\.m3u8(?:\?|$)/i.test(url)) await checkManifest({ ...asset, url }, network, signal, visited, depth + 1);
  }
}

function mergedExtension(video, audio) {
  const videoExt = mediaExtension(video);
  const audioExt = mediaExtension(audio);
  if (videoExt === 'mp4' && ['m4a', 'aac', 'mp3'].includes(audioExt)) return 'mp4';
  if (videoExt === 'webm' && ['webm', 'opus', 'ogg'].includes(audioExt)) return 'webm';
  return 'mkv';
}

function installMediaRoutes(app, { resolver, downloadsDir, spawnResolved, activeDownloads = new Map() }) {
  app.post('/api/resolve', async (req, res) => {
    const controller = new AbortController();
    res.on('close', () => { if (!res.writableEnded) controller.abort(); });
    res.setHeader('Cache-Control', 'no-store');
    try {
      const { url, browserMode = 'auto', ...options } = req.body || {};
      if (!['auto', 'always', 'off'].includes(browserMode)) return res.status(400).json({ error: 'INVALID_BROWSER_MODE' });
      const result = await resolver.resolve(url, { ...options, browserMode }, controller.signal);
      if (!res.destroyed) res.json(result);
    } catch (error) {
      if (!res.destroyed) res.status(error.message === 'PRIVATE_ADDRESS' || error.message === 'INVALID_URL' || error instanceof TypeError ? 400 : 502).json({ error: publicError(error) });
    }
  });

  app.get('/api/media-preview', async (req, res) => {
    const controller = new AbortController();
    res.on('close', () => { if (!res.writableEnded) controller.abort(); });
    try {
      const { asset } = resolver.getAsset(req.query.resolution_id, req.query.asset_id);
      if (asset.type !== 'image') return res.status(400).end();
      const resource = await resolver.network.read(asset.url, { headers: { ...asset.headers, ...asset.private_headers }, signal: controller.signal, maxBytes: 8 * 1024 * 1024, truncate: false });
      const mime = resource.headers['content-type'] || '';
      if (resource.status >= 400 || !/^image\//i.test(mime)) return res.status(502).end();
      res.set({ 'Content-Type': mime, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" });
      res.end(resource.body);
    } catch { if (!res.destroyed) res.status(410).end(); }
  });

  app.get('/api/media-download', async (req, res) => {
    const controller = new AbortController();
    const id = `media_${randomUUID()}`;
    let child;
    let partial;
    let lockFile;
    let outputFile;
    let engineDir;
    controller.signal.addEventListener('abort', () => {
      if (!child?.pid || child.exitCode !== null) return;
      if (process.platform === 'win32') execFile('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }, () => {});
      else child.kill('SIGTERM');
    }, { once: true });
    const emit = event => { if (!res.destroyed) res.write(`data: ${JSON.stringify({ downloadId: id, ...event })}\n\n`); };
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.on('close', () => {
      controller.abort();
      activeDownloads.delete(id);
    });
    activeDownloads.set(id, controller);
    emit({ started: true });
    try {
      let { session, asset } = resolver.getAsset(req.query.resolution_id, req.query.asset_id);
      const audioId = req.query.audio_asset_id ?? asset.audio_asset_id;
      let audio = audioId && audioId !== 'none' ? resolver.getAsset(session.id, audioId).asset : null;
      if (audio && (!['video', 'manifest'].includes(asset.type) || asset.audio_only || !(audio.audio_only || audio.type === 'audio') || asset.id === audio.id)) throw new Error('INVALID_AUDIO_TRACK');
      const verifySource = async source => {
        await resolver.verify(source, controller.signal);
        if (source.status === 'access_required' || [404, 410].includes(source.http_status)) {
          const refreshed = await resolver.resolve(session.url, session.options, controller.signal);
          const replacement = refreshed.assets.find(item => new URL(item.url).origin + new URL(item.url).pathname === new URL(source.url).origin + new URL(source.url).pathname);
          if (replacement) {
            source = resolver.getAsset(refreshed.resolution_id, replacement.id).asset;
            await resolver.verify(source, controller.signal);
          }
        }
        if (source.status !== 'verified') throw new Error(source.status === 'access_required' ? 'ACCESS_REQUIRED' : 'MEDIA_UNAVAILABLE');
        return source;
      };
      asset = await verifySource(asset);
      if (audio) audio = await verifySource(audio);
      controller.signal.throwIfAborted();
      const directory = path.resolve(req.query.output || downloadsDir);
      fs.mkdirSync(directory, { recursive: true });
      const mergeExt = audio ? mergedExtension(asset, audio) : null;
      const rawFileName = filenameFor(asset);
      const fileName = audio ? `${rawFileName.slice(0, -path.extname(rawFileName).length)}.${mergeExt}` : rawFileName;
      let file = path.join(directory, fileName);
      for (let index = 1; fs.existsSync(file) || fs.existsSync(`${file}.part`) || fs.existsSync(`${file}.lock`); index++) {
        if (index > 10000) throw new Error('FILENAME_LIMIT');
        const ext = path.extname(fileName);
        file = path.join(directory, `${fileName.slice(0, -ext.length)} (${index})${ext}`);
      }
      lockFile = `${file}.lock`;
      fs.closeSync(fs.openSync(lockFile, 'wx'));
      outputFile = file;
      const needsEngine = audio || asset.type === 'manifest' || asset.fragment_urls?.length || !['http', 'https', undefined].includes(asset.protocol);
      if (needsEngine) {
        for (const source of [asset, audio].filter(Boolean)) {
          await resolver.network.addressesFor(source.url, controller.signal);
          if (source.type === 'manifest') await checkManifest(source, resolver.network, controller.signal);
          for (const target of source.fragment_urls || []) await resolver.network.addressesFor(target, controller.signal);
        }
        controller.signal.throwIfAborted();
        engineDir = fs.mkdtempSync(path.join(directory, '.everyvideo-media-'));
        const engineOutput = path.join(engineDir, path.basename(file));
        const descriptor = { ...asset, headers: { ...asset.headers, ...asset.private_headers }, output: engineOutput };
        if (audio) {
          descriptor.audio = { ...audio, headers: { ...audio.headers, ...audio.private_headers } };
          descriptor.merge_ext = mergeExt;
          emit({ output: '[Merger] Downloading video and audio, then merging into one file.' });
        }
        child = spawnResolved(descriptor);
        const clean = line => line.replace(/https?:\/\/[^\s"'<>]+/g, '[media URL]');
        const parser = createProcessLineParser(line => emit({ output: clean(line) }));
        const errors = createProcessLineParser(line => emit({ output: clean(line) }));
        child.stdout.on('data', data => parser.write(data));
        child.stderr.on('data', data => errors.write(data));
        const code = await new Promise((resolve, reject) => {
          child.once('error', reject);
          child.once('close', resolve);
        });
        parser.flush(); errors.flush();
        if (code !== 0 || !fs.existsSync(engineOutput)) throw new Error('MEDIA_DOWNLOAD_FAILED');
        controller.signal.throwIfAborted();
        fs.renameSync(engineOutput, file);
      } else {
        const resource = await resolver.network.openStream(asset.url, { headers: { ...asset.headers, ...asset.private_headers }, signal: controller.signal });
        if (resource.status !== 200 || !mediaType(resource.url, resource.headers['content-type'] || '')) { resource.stream.destroy(); throw new Error('MEDIA_UNAVAILABLE'); }
        partial = `${file}.part`;
        const total = Number(resource.headers['content-length']) || 0;
        let received = 0;
        let lastUpdate = 0;
        resource.stream.on('data', chunk => {
          received += chunk.length;
          if (Date.now() - lastUpdate < 250) return;
          lastUpdate = Date.now();
          emit({ progress: { percent: total ? received / total * 100 : null, downloaded: received, total }, output: total ? `${Math.round(received / total * 100)}%` : `${received} bytes` });
        });
        await pipeline(resource.stream, fs.createWriteStream(partial, { flags: 'wx' }), { signal: controller.signal });
        fs.renameSync(partial, file);
        partial = null;
      }
      emit({ done: true, code: 0, file, fileName: path.basename(file) });
    } catch (error) {
      const message = /^(RESOLUTION_EXPIRED|ASSET_NOT_FOUND|ACCESS_REQUIRED|MEDIA_UNAVAILABLE|MEDIA_DOWNLOAD_FAILED|MANIFEST_LIMIT|INVALID_MANIFEST|FILENAME_LIMIT|INVALID_AUDIO_TRACK)$/.test(error.message) ? error.message : publicError(error);
      emit({ error: message, done: true, code: 1 });
    } finally {
      if (partial) await fs.promises.unlink(partial).catch(() => {});
      if (engineDir && path.dirname(engineDir) === path.dirname(outputFile) && path.basename(engineDir).startsWith('.everyvideo-media-')) {
        await fs.promises.rm(engineDir, { recursive: true, force: true }).catch(() => {});
      }
      if (lockFile) await fs.promises.unlink(lockFile).catch(() => {});
      activeDownloads.delete(id);
      res.end();
    }
  });
}

module.exports = { installMediaRoutes, filenameFor, checkManifest };
