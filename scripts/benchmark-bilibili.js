'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = process.env.BENCHMARK_SERVER || 'http://localhost:3000';
const VIDEO_URL = process.env.BENCHMARK_URL || 'https://www.bilibili.com/video/BV1opg36pEPf/';
const FORMAT = process.env.BENCHMARK_FORMAT || '30080+30280';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36';
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const outputRoot = process.env.BENCHMARK_OUTPUT
  ? path.resolve(process.env.BENCHMARK_OUTPUT)
  : path.join(ROOT_DIR, 'Download', `Bilibili-Benchmark-BV1opg36pEPf-${timestamp}`);
const ffprobe = process.platform === 'win32'
  ? path.join(ROOT_DIR, '.runtime', 'ffmpeg', 'ffprobe.exe')
  : 'ffprobe';
const requestedCases = String(process.env.BENCHMARK_CASES || '').split(',').map((value) => value.trim()).filter(Boolean);
const repeatCount = Math.max(1, Number.parseInt(process.env.BENCHMARK_REPEAT || '1', 10) || 1);

const CDN = Object.freeze({
  auto: 'auto',
  fastest: 'fastest',
  aliov: 'upos-sz-mirroraliov.bilivideo.com',
  cosov: 'upos-sz-mirrorcosov.bilivideo.com',
  akamai: 'upos-hz-mirrorakam.akamaized.net',
  ali: 'upos-sz-mirrorali.bilivideo.com',
  cos: 'upos-sz-mirrorcos.bilivideo.com',
  hw: 'upos-sz-mirrorhw.bilivideo.com',
  bos: 'upos-sz-mirrorbos.bilivideo.com',
  'allow-p2p': 'allow_p2p',
});

const cases = [
  { id: 'auto-x8-auto', group: 'engine', engine: 'auto', connections: 8, cdn: 'auto', chunk: 'none', fragments: 8 },
  { id: 'aria2-x4-auto', group: 'engine', engine: 'aria2c', connections: 4, cdn: 'auto', chunk: 'none', fragments: 8 },
  { id: 'aria2-x8-auto', group: 'engine', engine: 'aria2c', connections: 8, cdn: 'auto', chunk: 'none', fragments: 8 },
  { id: 'aria2-x16-auto', group: 'engine', engine: 'aria2c', connections: 16, cdn: 'auto', chunk: 'none', fragments: 8 },

  { id: 'native-f1-none', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: 'none', fragments: 1 },
  { id: 'native-f4-none', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: 'none', fragments: 4 },
  { id: 'native-f8-none', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: 'none', fragments: 8 },
  { id: 'native-f8-5m', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: '5M', fragments: 8 },
  { id: 'native-f8-10m', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: '10M', fragments: 8 },
  { id: 'native-f8-100m', group: 'native', engine: 'native', connections: 8, cdn: 'auto', chunk: '100M', fragments: 8 },

  ...['fastest', 'aliov', 'cosov', 'akamai', 'ali', 'cos', 'hw', 'bos', 'allow-p2p'].map((cdn) => ({
    id: `auto-x8-${cdn}`,
    group: 'cdn',
    engine: 'auto',
    connections: 8,
    cdn,
    chunk: 'none',
    fragments: 8,
  })),

  { id: 'auto-x8-anti-off', group: 'toggle', engine: 'auto', connections: 8, cdn: 'auto', chunk: 'none', fragments: 8, antiP2p: false },
  { id: 'auto-x8-geo-off', group: 'toggle', engine: 'auto', connections: 8, cdn: 'auto', chunk: 'none', fragments: 8, geoBypass: false },
];
const selectedCases = requestedCases.length
  ? cases.filter((testCase) => requestedCases.includes(testCase.id))
  : cases;
const plannedCases = selectedCases.flatMap((testCase) => Array.from({ length: repeatCount }, (_, index) => ({
  ...testCase,
  baseId: testCase.id,
  repeat: index + 1,
  id: repeatCount > 1 ? `${testCase.id}-r${index + 1}` : testCase.id,
})));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redact(value) {
  return String(value || '')
    .replace(/https?:\/\/\S+/gi, '[url-redacted]')
    .replace(/(?:SESSDATA|DedeUserID|bili_jct)=[^\s&]+/gi, '[cookie-redacted]');
}

function toMiB(value, unit) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return unit.toLowerCase() === 'kib' ? parsed / 1024 : parsed;
}

function buildQuery(testCase, outputDir) {
  const query = new URLSearchParams({
    url: VIDEO_URL,
    format: FORMAT,
    browser: 'none',
    bilibili_download_engine: testCase.engine,
    bilibili_aria2_connections: String(testCase.connections),
    bilibili_upos_host: CDN[testCase.cdn],
    bilibili_avoid_p2p: String(testCase.antiP2p !== false),
    concurrent_fragments: String(testCase.fragments),
    http_chunk_size: testCase.chunk,
    geo_bypass: String(testCase.geoBypass !== false),
    user_agent: USER_AGENT,
    custom_filename: testCase.id,
    output: outputDir,
  });
  return query;
}

function parseSseEvent(block) {
  const data = block.split(/\r?\n/).find((line) => line.startsWith('data:'));
  if (!data) return null;
  try {
    return JSON.parse(data.slice(5).trim());
  } catch {
    return null;
  }
}

function probeFile(filePath) {
  const result = spawnSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration,size',
    '-show_entries', 'stream=codec_type,codec_name,width,height,channels',
    '-of', 'json',
    filePath,
  ], { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) {
    return { ok: false, error: redact(result.stderr || result.error?.message || 'ffprobe failed') };
  }
  try {
    const json = JSON.parse(result.stdout);
    const streams = Array.isArray(json.streams) ? json.streams : [];
    const hasVideo = streams.some((stream) => stream.codec_type === 'video');
    const hasAudio = streams.some((stream) => stream.codec_type === 'audio');
    return {
      ok: hasVideo && hasAudio,
      duration: Number(json.format?.duration || 0),
      size: Number(json.format?.size || 0),
      streams: streams.map((stream) => ({
        type: stream.codec_type,
        codec: stream.codec_name,
        width: stream.width,
        height: stream.height,
        channels: stream.channels,
      })),
      error: hasVideo && hasAudio ? null : 'Missing video/audio stream',
    };
  } catch {
    return { ok: false, error: 'Invalid ffprobe JSON' };
  }
}

async function runCase(testCase) {
  const caseDir = path.join(outputRoot, testCase.id);
  fs.mkdirSync(caseDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const result = {
    ...testCase,
    cdnValue: CDN[testCase.cdn],
    startedAt,
    status: 'failed',
    doneCode: null,
    actualEngine: null,
    actualConnections: null,
    selectedCdn: null,
    chunkIgnored: null,
    fallback: null,
    speedsMiBps: [],
    errors: [],
    files: [],
  };

  try {
    const response = await fetch(`${BASE_URL}/api/download?${buildQuery(testCase, caseDir)}`);
    if (!response.ok || !response.body) {
      result.errors.push(`HTTP ${response.status}`);
      result.elapsedSeconds = (Date.now() - started) / 1000;
      return result;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;
    while (!done) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        const event = parseSseEvent(block);
        if (!event) continue;
        if (event.diagnostic === 'download-engine') {
          result.actualEngine = event.engine;
          result.actualConnections = event.connections;
          result.chunkIgnored = event.chunkIgnored;
        }
        if (event.diagnostic === 'cdn') result.selectedCdn = event.host;
        if (event.diagnostic === 'fallback') result.fallback = event;
        if (event.error) result.errors.push(redact(event.error));
        if (event.output) {
          const match = String(event.output).match(/at\s+(\d+(?:\.\d+)?)\s*(MiB|KiB)\/s/i);
          if (match) result.speedsMiBps.push(toMiB(match[1], match[2]));
        }
        if (event.done) {
          result.doneCode = event.code;
          done = true;
        }
      }
    }
  } catch (error) {
    result.errors.push(redact(error.message));
  }

  result.elapsedSeconds = (Date.now() - started) / 1000;
  result.files = fs.readdirSync(caseDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== 'case-result.json')
    .map((entry) => {
      const filePath = path.join(caseDir, entry.name);
      const stat = fs.statSync(filePath);
      return { name: entry.name, size: stat.size };
    });
  const media = result.files.find((file) => /\.(mp4|mkv|webm|m4a|mp3)$/i.test(file.name));
  if (media) {
    result.ffprobe = probeFile(path.join(caseDir, media.name));
  } else {
    result.ffprobe = { ok: false, error: 'No media output' };
  }
  result.status = result.doneCode === 0 && result.ffprobe.ok ? 'pass' : 'failed';
  result.videoSpeedMiBps = result.speedsMiBps[0] || null;
  result.audioSpeedMiBps = result.speedsMiBps[1] || null;
  result.stable = result.status === 'pass' && !result.fallback && result.errors.length === 0;
  fs.writeFileSync(path.join(caseDir, 'case-result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  const configResponse = await fetch(`${BASE_URL}/api/config`);
  const config = configResponse.ok ? await configResponse.json() : null;
  const report = {
    benchmark: {
      videoUrl: VIDEO_URL,
      format: FORMAT,
      outputRoot,
      startedAt: new Date().toISOString(),
      scope: `${repeatCount} run(s) per selected option; same video and format; media integrity required for pass`,
      selectedCases: selectedCases.map((testCase) => testCase.id),
    },
    capability: config ? {
      hasAria2c: config.hasAria2c,
      hasLocalFfmpeg: config.hasLocalFfmpeg,
      defaultEngine: config.bilibiliDownloadEngine,
      defaultConnections: config.bilibiliAria2Connections,
      defaultCdn: config.bilibiliUposHost,
    } : null,
    results: [],
  };

  if (!plannedCases.length) throw new Error('No benchmark cases selected');
  for (let index = 0; index < plannedCases.length; index += 1) {
    const testCase = plannedCases[index];
    process.stdout.write(`[${index + 1}/${plannedCases.length}] ${testCase.id} ... `);
    const result = await runCase(testCase);
    report.results.push(result);
    console.log(`${result.status} ${result.videoSpeedMiBps ?? '-'} MiB/s${result.selectedCdn ? ` (${result.selectedCdn})` : ''}${result.errors.length ? ` — ${result.errors[0]}` : ''}`);
    if (index < plannedCases.length - 1) await sleep(1800);
  }

  const stable = report.results.filter((result) => result.stable).sort((a, b) => (b.videoSpeedMiBps || 0) - (a.videoSpeedMiBps || 0));
  report.summary = {
    total: report.results.length,
    passed: report.results.filter((result) => result.status === 'pass').length,
    stable: stable.length,
    failed: report.results.filter((result) => result.status !== 'pass').length,
    fastestStable: stable.slice(0, 10).map((result) => ({
      id: result.id,
      group: result.group,
      engine: result.actualEngine,
      connections: result.actualConnections,
      cdn: result.selectedCdn || result.cdnValue,
      videoSpeedMiBps: result.videoSpeedMiBps,
      audioSpeedMiBps: result.audioSpeedMiBps,
      elapsedSeconds: result.elapsedSeconds,
    })),
  };
  fs.writeFileSync(path.join(outputRoot, 'benchmark-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`\nReport: ${path.join(outputRoot, 'benchmark-report.json')}`);
  console.log(`Stable cases: ${stable.length}/${report.results.length}`);
}

main().catch((error) => {
  console.error(redact(error.stack || error.message));
  process.exitCode = 1;
});
