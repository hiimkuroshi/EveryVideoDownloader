// =============================================================================
// EveryVideoDownloader — Unified Standalone Server (Powered by yt-dlp)
// =============================================================================

const express = require('express');
const cors = require('cors');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// Protect process from unexpected crashes
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// -- Portable Dynamic Paths (Relative to this folder) -------------------------
const CORE_DIR = path.join(__dirname, 'core');
const DOWNLOADS_DIR = path.join(__dirname, 'Download');
const DEFAULT_DOWNLOAD_PATH = path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s');

// Detect Python executable command
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';

/**
 * Helper to spawn yt_dlp Python package
 */
function spawnYtDlp(args, options = {}) {
  const fullArgs = ['-u', '-m', 'yt_dlp', ...args];
  const env = { ...process.env, PYTHONUNBUFFERED: '1', PYTHONPATH: CORE_DIR, ...(options.env || {}) };
  return spawn(PYTHON_CMD, fullArgs, { ...options, env });
}

/**
 * Helper to execute yt_dlp Python package via execFile
 */
function execFileYtDlp(args, options = {}, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const fullArgs = ['-u', '-m', 'yt_dlp', ...args];
  const env = { ...process.env, PYTHONUNBUFFERED: '1', PYTHONPATH: CORE_DIR, ...(options.env || {}) };
  return execFile(PYTHON_CMD, fullArgs, { ...options, env }, callback);
}

// Ensure Download folder exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Check if local ffmpeg exists in root folder or bin
const LOCAL_FFMPEG = fs.existsSync(path.join(__dirname, 'ffmpeg.exe'))
  ? __dirname
  : (fs.existsSync(path.join(__dirname, 'bin', 'ffmpeg.exe')) ? path.join(__dirname, 'bin') : null);

// Active download child processes store for cancel/pause support
const activeDownloads = new Map();

// -- Persistent User Configuration Manager (config.json) -----------------------
const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadPersistentConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          downloadFolder: DOWNLOADS_DIR,
          bilibiliAvoidP2p: true,
          bilibiliUposHost: 'auto',
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.warn('[Config] Error reading config.json:', err.message);
  }
  return {
    downloadFolder: DOWNLOADS_DIR,
    bilibiliAvoidP2p: true,
    bilibiliUposHost: 'auto',
  };
}

function savePersistentConfig(updates) {
  try {
    const current = loadPersistentConfig();
    const merged = { ...current, ...updates };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf8');
    console.log('[Config] Saved persistent configuration:', merged);
    return merged;
  } catch (err) {
    console.error('[Config] Error writing config.json:', err.message);
    return null;
  }
}

// -- Middleware ---------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// GET & POST /api/config — Get / Update dynamic & persistent server config
// =============================================================================
app.get('/api/config', (req, res) => {
  const cfg = loadPersistentConfig();
  res.json({
    downloadFolder: cfg.downloadFolder || DOWNLOADS_DIR,
    hasLocalFfmpeg: !!LOCAL_FFMPEG,
    ...cfg,
  });
});

app.post('/api/config', (req, res) => {
  const { downloadFolder, ...otherSettings } = req.body || {};
  const updates = {};

  if (downloadFolder && typeof downloadFolder === 'string') {
    const norm = path.resolve(downloadFolder.trim());
    updates.downloadFolder = norm;
    if (!fs.existsSync(norm)) {
      try { fs.mkdirSync(norm, { recursive: true }); } catch (e) {}
    }
  }

  Object.assign(updates, otherSettings);
  const saved = savePersistentConfig(updates);
  return res.json({ success: true, config: saved });
});

// =============================================================================
// GET /api/translate — Google Translate Free API proxy
// =============================================================================
app.get('/api/translate', async (req, res) => {
  const { text, to = 'vi' } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  try {
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Google Translate responded with ${response.status}`);
    }

    const data = await response.json();
    let translated = '';
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0].map(chunk => chunk[0] || '').join('');
    }

    return res.json({ original: text, translated: translated || text });
  } catch (err) {
    console.error('[/api/translate] Error:', err.message);
    return res.status(500).json({ error: err.message, original: text, translated: text });
  }
});

// =============================================================================
// GET /api/proxy-image — Image Proxy to bypass 403 hotlink protection (Bilibili etc.)
// =============================================================================
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    let referer = 'https://www.bilibili.com/';
    if (url.includes('youtube.com') || url.includes('ytimg.com')) {
      referer = 'https://www.youtube.com/';
    } else if (url.includes('tiktok.com')) {
      referer = 'https://www.tiktok.com/';
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('[/api/proxy-image] Error:', err.message);
    return res.status(500).send('Image proxy error: ' + err.message);
  }
});

// =============================================================================
// GET /api/download-thumbnail — Instant Direct Save or yt-dlp Thumbnail Extraction
// =============================================================================
app.get('/api/download-thumbnail', async (req, res) => {
  const { url, thumbUrl, title, browser, output = DOWNLOADS_DIR } = req.query;
  if (!url && !thumbUrl) {
    return res.status(400).json({ error: 'Missing url or thumbUrl parameter' });
  }

  const targetDir = path.resolve(output);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. High-Speed Direct Download if thumbUrl is provided (Completes in ~100ms)
  if (thumbUrl && thumbUrl.startsWith('http')) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };
      if (thumbUrl.includes('bilibili') || thumbUrl.includes('hdslb.com')) {
        headers['Referer'] = 'https://www.bilibili.com/';
      }

      const imgRes = await fetch(thumbUrl, { headers });
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const safeTitle = (title || 'thumbnail')
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 120);
        const fileName = `${safeTitle || 'video'}_thumb.jpg`;
        const filePath = path.join(targetDir, fileName);
        fs.writeFileSync(filePath, buffer);
        console.log('[/api/download-thumbnail] Instant direct saved to:', filePath);
        return res.json({ 
          success: true, 
          path: targetDir, 
          fileName,
          message: 'Đã tải ảnh thumbnail HD thành công: ' + fileName 
        });
      }
    } catch (err) {
      console.warn('[/api/download-thumbnail] Direct fetch fallback to yt-dlp:', err.message);
    }
  }

  // 2. Fallback to yt-dlp Extraction
  const args = ['--write-thumbnail', '--skip-download', '--no-playlist'];
  if (fs.existsSync(LOCAL_FFMPEG)) {
    args.push('--ffmpeg-location', __dirname);
    args.push('--convert-thumbnails', 'jpg');
  }
  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  }
  args.push('-o', path.join(targetDir, '%(title)s.%(ext)s'));
  args.push(url);

  execFileYtDlp(args, (error, stdout, stderr) => {
    if (error) {
      console.error('[/api/download-thumbnail] yt-dlp error:', stderr || error.message);
      return res.status(500).json({ error: stderr || error.message });
    }
    return res.json({ 
      success: true, 
      path: targetDir,
      message: 'Đã tải ảnh thumbnail HD của video thành công vào thư mục: ' + targetDir 
    });
  });
});

// =============================================================================
// Helper: Convert Subtitle content (WebVTT, XML, JSON3) to standard SubRip (.SRT) format
// =============================================================================
function formatTimeSec(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function extractCuesFromText(text) {
  const cues = [];
  if (!text) return cues;

  // 1. Try WebVTT / SRT (lines with -->)
  const blocks = text.trim().split(/\n\s*\n/).slice(0, 50);
  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    const timeLineIdx = lines.findIndex(l => l.includes('-->'));
    if (timeLineIdx !== -1) {
      let timeLine = lines[timeLineIdx].trim();
      timeLine = timeLine.replace(/-->\s*([0-9:,\.]+)\s+.*$/, '--> $1');
      const content = lines.slice(timeLineIdx + 1).map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
      if (content) {
        cues.push({ time: timeLine, text: content });
      }
    }
  }
  if (cues.length > 0) return cues;

  // 2. Try YouTube XML (<text start="X" dur="Y">Text</text>)
  const xmlRegex = /<text\s+start="([0-9\.]+)"(?:\s+dur="([0-9\.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
  let m;
  while ((m = xmlRegex.exec(text)) !== null && cues.length < 50) {
    const startSec = parseFloat(m[1]) || 0;
    const durSec = parseFloat(m[2]) || 2;
    const endSec = startSec + durSec;
    const timeLine = `${formatTimeSec(startSec)} --> ${formatTimeSec(endSec)}`;
    const content = m[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (content) cues.push({ time: timeLine, text: content });
  }
  if (cues.length > 0) return cues;

  // 3. Try YouTube JSON3 ({ events: [ { tStartMs, dDurationMs, segs: [{ utf8 }] } ] })
  try {
    const data = JSON.parse(text);
    if (data.events && Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (!ev.segs) continue;
        const startSec = (ev.tStartMs || 0) / 1000;
        const durSec = (ev.dDurationMs || 2000) / 1000;
        const timeLine = `${formatTimeSec(startSec)} --> ${formatTimeSec(startSec + durSec)}`;
        const content = ev.segs.map(s => s.utf8 || '').join('').trim();
        if (content && content !== '\n') {
          cues.push({ time: timeLine, text: content });
        }
        if (cues.length >= 50) break;
      }
    }
  } catch (e) {}

  return cues;
}

function vttToSrt(vttText) {
  if (!vttText) return '';
  const cues = extractCuesFromText(vttText);
  if (cues.length > 0) {
    return cues.map((c, i) => `${i + 1}\n${c.time.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2')}\n${c.text}`).join('\n\n') + '\n';
  }

  let text = vttText.replace(/^WEBVTT[^\n]*\n+/i, '');
  text = text.replace(/^(?:NOTE|STYLE|REGION)[\s\S]*?\n\n/gm, '');

  const blocks = text.trim().split(/\n\s*\n/);
  const srtBlocks = [];
  let index = 1;

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    if (!lines.length) continue;

    let timeLineIdx = lines.findIndex(l => l.includes('-->'));
    if (timeLineIdx === -1) continue;

    let timeLine = lines[timeLineIdx];
    timeLine = timeLine
      .replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2')
      .replace(/(\d{2}:\d{2})\.(\d{3})/g, '00:$1,$2');

    timeLine = timeLine.replace(/-->\s*([0-9:,\.]+)\s+.*$/, '--> $1');

    const cueTextLines = lines.slice(timeLineIdx + 1)
      .map(l => l.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    if (cueTextLines.length) {
      srtBlocks.push(`${index}\n${timeLine}\n${cueTextLines.join('\n')}`);
      index++;
    }
  }

  return srtBlocks.join('\n\n') + '\n';
}

async function fetchSubtitleRawContent(subUrl) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Referer': 'https://www.youtube.com/'
  };
  let subRes = await fetch(subUrl, { headers });
  if (!subRes.ok) throw new Error(`HTTP ${subRes.status}: ${subRes.statusText}`);
  let text = await subRes.text();

  if (text.startsWith('#EXTM3U')) {
    const match = text.match(/https?:\/\/[^\r\n]+/);
    if (match) {
      const segRes = await fetch(match[0], { headers });
      if (segRes.ok) text = await segRes.text();
    }
  }
  return text;
}

// =============================================================================
// GET /api/download-subtitle — Instant Subtitle Download (.SRT / .VTT)
// =============================================================================
app.get('/api/download-subtitle', async (req, res) => {
  const { url, subUrl, lang = 'vi', format = 'srt', title, browser, output = DOWNLOADS_DIR } = req.query;

  if (!url && !subUrl) {
    return res.status(400).json({ error: 'Missing url or subUrl parameter' });
  }

  const targetDir = path.resolve(output);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const safeTitle = (title || 'video')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video';

  const ext = (format || 'srt').toLowerCase();
  const fileName = `${safeTitle}.${lang}.${ext}`;
  const filePath = path.join(targetDir, fileName);

  // 1. Instant Direct Subtitle Download via Stream URL (<100ms)
  if (subUrl && subUrl.startsWith('http')) {
    try {
      let content = await fetchSubtitleRawContent(subUrl);
      if (ext === 'srt') {
        content = vttToSrt(content);
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('[/api/download-subtitle] Instant saved subtitle to:', filePath);
      return res.json({
        success: true,
        path: targetDir,
        fileName,
        filePath,
        message: `Đã tải phụ đề [${lang.toUpperCase()}] thành công: ${fileName}`
      });
    } catch (err) {
      console.warn('[/api/download-subtitle] Direct fetch fallback to yt-dlp:', err.message);
    }
  }

  // 2. Fallback to yt-dlp Subtitle Extraction
  const args = ['--write-subs', '--write-auto-subs', '--sub-lang', lang, '--sub-format', ext, '--skip-download', '--no-playlist'];
  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  }
  args.push('-o', path.join(targetDir, '%(title)s.%(ext)s'));
  args.push(url);

  execFileYtDlp(args, (error, stdout, stderr) => {
    if (error) {
      console.error('[/api/download-subtitle] yt-dlp error:', stderr || error.message);
      return res.status(500).json({ error: stderr || error.message });
    }
    return res.json({
      success: true,
      path: targetDir,
      fileName,
      message: `Đã tải phụ đề [${lang.toUpperCase()}] thành công vào thư mục: ${targetDir}`
    });
  });
});

// =============================================================================
// GET /api/preview-subtitle — Preview First Cues of Subtitle
// =============================================================================
app.get('/api/preview-subtitle', async (req, res) => {
  const { subUrl } = req.query;
  if (!subUrl || !subUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Missing or invalid subUrl parameter' });
  }

  try {
    const text = await fetchSubtitleRawContent(subUrl);
    const cues = extractCuesFromText(text);

    return res.json({ success: true, cues: cues.slice(0, 25), total: cues.length });
  } catch (err) {
    console.error('[/api/preview-subtitle] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// GET /api/browse-folder — Modern Windows 10/11 Explorer Folder Picker Dialog
// =============================================================================
const FOLDER_PICKER_EXE = path.join(__dirname, 'bin', 'folder_picker.exe');

app.get('/api/browse-folder', (req, res) => {
  const defaultDir = path.resolve(req.query.current || DOWNLOADS_DIR);

  // 1. Primary: Native Windows 10/11 Explorer IFileOpenDialog (TopMost + UTF-8 + Direct Navigation)
  if (fs.existsSync(FOLDER_PICKER_EXE)) {
    return execFile(FOLDER_PICKER_EXE, [defaultDir], { encoding: 'utf8', timeout: 180000 }, (err, stdout) => {
      const selected = stdout ? stdout.trim().split(/\r?\n/).filter(Boolean).pop() : '';
      if (selected && fs.existsSync(selected)) {
        savePersistentConfig({ downloadFolder: selected });
        return res.json({ success: true, path: selected });
      }
      return res.json({ success: false, path: null });
    });
  }

  // 2. Secondary Fallback: PowerShell Dialog with TopMost
  const psScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "Chọn thư mục lưu trữ video EveryVideoDownloader"
$dialog.ShowNewFolderButton = $true
if (Test-Path '${defaultDir.replace(/'/g, "''")}') {
    $dialog.SelectedPath = '${defaultDir.replace(/'/g, "''")}'
}
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
$form.Opacity = 0
$form.ShowInTaskbar = $false
$form.Show()
$form.BringToFront()
$result = $dialog.ShowDialog($form)
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    [System.Console]::WriteLine("CHOSEN:" + $dialog.SelectedPath)
}
$form.Dispose()
`;

  const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
  execFile('powershell.exe', ['-NoProfile', '-STA', '-EncodedCommand', b64], { timeout: 180000 }, (err, stdout) => {
    if (stdout && stdout.includes('CHOSEN:')) {
      const match = stdout.match(/CHOSEN:(.*)/);
      const selected = match ? match[1].trim() : '';
      if (selected && fs.existsSync(selected)) {
        savePersistentConfig({ downloadFolder: selected });
        return res.json({ success: true, path: selected });
      }
    }
    return res.json({ success: false, path: null });
  });
});

// =============================================================================
// GET & POST /api/open-folder — Instant Open Windows File Explorer (<10ms)
// =============================================================================
const handleOpenFolder = (req, res) => {
  const rawPath = req.query.path || req.body?.path || DOWNLOADS_DIR;
  let targetDir = path.resolve(rawPath);
  
  // Normalize Windows backslashes
  targetDir = targetDir.replace(/\//g, '\\');

  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (e) {}
  }

  // 1. Immediately return HTTP response so browser UI never waits
  res.json({ success: true, path: targetDir, message: 'Đã mở thư mục trong File Explorer.' });

  // 2. Launch explorer directly via spawn with detached & unref (Instant, No cmd wrapper, No blocking)
  try {
    const child = spawn('explorer.exe', [targetDir], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
  } catch (err) {
    console.error('[/api/open-folder] spawn error:', err);
    try {
      const fallback = spawn('cmd.exe', ['/c', 'start', '', targetDir], {
        detached: true,
        stdio: 'ignore'
      });
      fallback.unref();
    } catch (e) {}
  }
};

app.get('/api/open-folder', handleOpenFolder);
app.post('/api/open-folder', handleOpenFolder);

// =============================================================================
// GET /api/translate — Multilingual Title Translation (vi, en, zh-CN, ja)
// =============================================================================
app.get('/api/translate', async (req, res) => {
  const text = req.query.text;
  const target = req.query.to || 'vi';
  if (!text) return res.json({ translated: '' });

  // Map 2-letter codes to Google Translate codes
  const langMap = {
    'vi': 'vi',
    'en': 'en',
    'zh': 'zh-CN',
    'ja': 'ja'
  };
  const tl = langMap[target] || target;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation failed');
    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedText = data[0].map(item => item[0]).filter(Boolean).join('');
      return res.json({ translated: translatedText });
    }
    return res.json({ translated: text });
  } catch (err) {
    return res.json({ translated: text });
  }
});

// Check if a URL belongs to Douyin
function isDouyinUrl(url) {
  if (!url) return false;
  return /douyin\.com|iesdouyin\.com/i.test(url);
}

// Check if a URL belongs to TikTok
function isTikTokUrl(url) {
  if (!url) return false;
  return /tiktok\.com/i.test(url);
}

// In-memory cache for Douyin ttwid security cookie
let cachedTtwid = '';
let ttwidExpireTime = 0;

async function getTtwidCookie() {
  if (cachedTtwid && Date.now() < ttwidExpireTime) {
    return cachedTtwid;
  }
  try {
    const res = await fetch('https://ttwid.bytedance.com/ttwid/union/register/', {
      method: 'POST',
      body: JSON.stringify({
        region: 'cn', aid: 1768, needFid: 'false', service: 'www.ixigua.com',
        migrate_info: { ticket: '', src: 'uc' }, cbUrlProtocol: 'https', union: 'true'
      }),
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    for (const c of setCookies) {
      if (c.includes('ttwid=')) {
        cachedTtwid = c.split(';')[0];
        ttwidExpireTime = Date.now() + 3600 * 1000; // cache for 1 hour
        return cachedTtwid;
      }
    }
  } catch (e) {
    console.warn('[/api/douyin] getTtwidCookie error:', e.message);
  }
  return '';
}

// Extract video ID from direct or shortened Douyin URL
async function extractDouyinVideoId(url) {
  if (!url) return null;
  const directMatch = url.match(/(?:video\/|note\/)(\d+)/) || url.match(/\/(\d{19})\b/);
  if (directMatch) return directMatch[1];

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const finalUrl = res.url || '';
    const match = finalUrl.match(/(?:video\/|note\/)(\d+)/) || finalUrl.match(/\/(\d{19})\b/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// Fetch full Douyin metadata including 4K, 2K, 1080p, 720p H.264/H.265 via PC Client endpoint
async function fetchDouyinMetadata(url) {
  try {
    const videoId = await extractDouyinVideoId(url);
    if (!videoId) return null;

    const cookie = await getTtwidCookie();
    const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}&aid=6383&version_name=23.5.0&device_platform=windows&os=windows`;

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Cookie': cookie
      }
    });

    if (!res.ok) return null;
    const json = await res.json();
    const item = json.aweme_detail;
    if (!item) return null;

    const v = item.video || {};
    const formats = [];
    const seenUrls = new Set();

    for (let i = 0; i < (v.bit_rate || []).length; i++) {
      const b = v.bit_rate[i];
      const playUrl = b.play_addr?.url_list?.[0];
      if (!playUrl || seenUrls.has(playUrl)) continue;
      seenUrls.add(playUrl);

      const w = b.play_addr?.width || 0;
      const h = b.play_addr?.height || 0;
      const isH265 = !!(b.is_bytevc1 || b.is_h265);
      const codec = isH265 ? 'h265' : 'h264';

      let qualityLabel = `${w}x${h}`;
      let note = b.gear_name || '';

      if (h >= 2160 || w >= 3840) qualityLabel += ' (4K UHD)';
      else if (h >= 1440 || w >= 2560) qualityLabel += ' (2K QHD)';
      else if (h >= 1080 || w >= 1920) qualityLabel += ' (1080p Full HD)';
      else if (h >= 720 || w >= 1280) qualityLabel += ' (720p HD)';
      else if (h >= 540) qualityLabel += ' (540p)';

      note += ` [${codec.toUpperCase()}]`;

      formats.push({
        format_id: `douyin_${b.gear_name || 'stream'}_${codec}_${i}`,
        format_note: note,
        ext: 'mp4',
        resolution: qualityLabel,
        width: w,
        height: h,
        fps: b.FPS || 30,
        filesize: b.play_addr?.data_size || null,
        vcodec: codec,
        acodec: 'aac',
        url: playUrl,
        tbr: Math.round((b.bit_rate || 0) / 1000) || null,
      });
    }

    // Add Audio MP3 format
    if (item.music?.play_url?.url_list?.[0]) {
      formats.push({
        format_id: 'douyin_audio',
        format_note: 'Âm thanh gốc (Audio MP3)',
        ext: 'mp3',
        resolution: 'audio only',
        vcodec: 'none',
        acodec: 'mp3',
        filesize: null,
        url: item.music.play_url.url_list[0],
        tbr: 128
      });
    }

    return {
      id: videoId,
      title: item.desc || 'Douyin Video',
      description: item.desc || '',
      uploader: item.author?.nickname || 'Douyin Creator',
      uploader_id: item.author?.unique_id || item.author?.short_id || '',
      thumbnail: v.cover?.url_list?.[0] || v.origin_cover?.url_list?.[0] || '',
      duration: Math.round((v.duration || 0) / 1000),
      view_count: item.statistics?.play_count || 0,
      like_count: item.statistics?.digg_count || 0,
      comment_count: item.statistics?.comment_count || 0,
      extractor: 'douyin',
      extractor_key: 'Douyin',
      webpage_url: url,
      formats,
      _douyin_direct: true,
    };
  } catch (err) {
    console.warn('[/api/info] Douyin API resolver error:', err.message);
  }
  return null;
}

// Fetch TikTok metadata via direct high-speed resolver
async function fetchTikTokMetadata(url) {
  try {
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.code === 0 && data.data) {
      const d = data.data;
      const formats = [];

      if (d.hdplay) {
        formats.push({
          format_id: 'hd',
          format_note: 'HD (Không logo watermark)',
          ext: 'mp4',
          resolution: `${d.width || 1080}x${d.height || 1920}`,
          width: d.width || 1080,
          height: d.height || 1920,
          filesize: d.hd_size || d.size || null,
          vcodec: 'h264',
          acodec: 'aac',
          url: d.hdplay,
          tbr: Math.round((d.hd_size || d.size || 0) * 8 / (d.duration || 1) / 1024) || 1200,
        });
      }

      if (d.play) {
        formats.push({
          format_id: 'no-watermark',
          format_note: 'Gốc (Không logo watermark)',
          ext: 'mp4',
          resolution: `${d.width || 720}x${d.height || 1280}`,
          width: d.width || 720,
          height: d.height || 1280,
          filesize: d.size || null,
          vcodec: 'h264',
          acodec: 'aac',
          url: d.play,
          tbr: Math.round((d.size || 0) * 8 / (d.duration || 1) / 1024) || 800,
        });
      }

      if (d.wmplay) {
        formats.push({
          format_id: 'watermark',
          format_note: 'Kèm logo TikTok (Watermark)',
          ext: 'mp4',
          resolution: `${d.width || 720}x${d.height || 1280}`,
          width: d.width || 720,
          height: d.height || 1280,
          filesize: d.wm_size || null,
          vcodec: 'h264',
          acodec: 'aac',
          url: d.wmplay,
        });
      }

      if (d.music) {
        formats.push({
          format_id: 'audio-only',
          format_note: 'Âm thanh gốc (Audio MP3)',
          ext: 'mp3',
          resolution: 'audio only',
          vcodec: 'none',
          acodec: 'mp3',
          filesize: null,
          url: d.music,
          tbr: 128,
        });
      }

      return {
        id: String(d.id || 'tiktok_video'),
        title: d.title || 'TikTok Video',
        description: d.title || '',
        uploader: d.author?.nickname || 'TikTok Creator',
        uploader_id: d.author?.unique_id || '',
        thumbnail: d.cover || d.origin_cover || '',
        duration: d.duration || 0,
        view_count: d.play_count || 0,
        like_count: d.digg_count || 0,
        comment_count: d.comment_count || 0,
        extractor: 'tiktok',
        extractor_key: 'TikTok',
        webpage_url: url,
        formats: formats.length > 0 ? formats : [
          {
            format_id: 'default',
            format_note: 'Video MP4',
            ext: 'mp4',
            resolution: '720x1280',
            vcodec: 'h264',
            acodec: 'aac',
            url: d.play || d.wmplay
          }
        ],
        _tiktok_direct: true,
      };
    }
  } catch (err) {
    console.warn('[/api/info] TikTok API resolver error:', err.message);
  }
  return null;
}

// =============================================================================
// GET /api/cancel-download — Cancel an ongoing download process
// =============================================================================
app.get('/api/cancel-download', (req, res) => {
  const { downloadId } = req.query;
  if (!downloadId) {
    return res.status(400).json({ error: 'Missing downloadId' });
  }

  const task = activeDownloads.get(downloadId);
  if (task) {
    if (typeof task.kill === 'function' && !task.killed) {
      task.kill('SIGTERM');
    } else if (typeof task.abort === 'function') {
      task.abort();
    }
    activeDownloads.delete(downloadId);
    console.log(`[/api/cancel-download] Cancelled download task ${downloadId}`);
    return res.json({ success: true, message: 'Đã dừng tiến trình tải xuống.' });
  }

  return res.json({ success: false, message: 'Không tìm thấy tiến trình tải đang chạy.' });
});

// =============================================================================
// GET /api/info — Fetch video or playlist metadata as JSON
// =============================================================================
app.get('/api/info', async (req, res) => {
  const { url, browser, playlist, bilibili_upos_host, bilibili_avoid_p2p } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing required query parameter: url' });
  }

  // 1. Direct high-speed resolver for Douyin (unlocked 4K, 2K, 1080p Full HD)
  if (isDouyinUrl(url)) {
    const douyinInfo = await fetchDouyinMetadata(url);
    if (douyinInfo) {
      console.log('[/api/info] Fetched Douyin metadata with full 1080p/4K formats.');
      return res.json(douyinInfo);
    }
  }

  // 2. Direct high-speed resolver for TikTok to bypass WAF captcha challenge
  if (isTikTokUrl(url)) {
    const ttInfo = await fetchTikTokMetadata(url);
    if (ttInfo) {
      console.log('[/api/info] Fetched TikTok metadata via direct engine.');
      return res.json(ttInfo);
    }
  }

  const args = ['-J'];
  
  if (playlist !== 'true') {
    args.push('--no-playlist');
  }

  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  } else if (fs.existsSync(path.join(__dirname, 'cookies.txt'))) {
    args.push('--cookies', path.join(__dirname, 'cookies.txt'));
  }

  if (LOCAL_FFMPEG) {
    args.push('--ffmpeg-location', LOCAL_FFMPEG);
  }

  // Use Node.js runtime as portable JS engine for yt-dlp
  args.push('--js-runtimes', 'node');

  // Bilibili Anti-P2P CDN & Custom UPOS host
  const biliExtractorArgs = [];
  if (bilibili_avoid_p2p && (bilibili_avoid_p2p === 'false' || bilibili_avoid_p2p === 'allow_p2p')) {
    biliExtractorArgs.push('avoid_p2p=false');
  }
  if (bilibili_upos_host && bilibili_upos_host !== 'auto' && bilibili_upos_host !== 'default' && bilibili_upos_host !== 'none') {
    biliExtractorArgs.push(`upos_host=${bilibili_upos_host}`);
  }
  if (biliExtractorArgs.length > 0) {
    args.push('--extractor-args', `bilibili:${biliExtractorArgs.join(';')}`);
  }

  args.push(url);

  execFileYtDlp(args, { maxBuffer: 35 * 1024 * 1024 }, async (error, stdout, stderr) => {
    if (error) {
      const message = stderr?.trim() || error.message;
      console.error('[/api/info] Error:', message);

      // Secondary fallback for Douyin / TikTok if initial check didn't catch it
      if (isDouyinUrl(url)) {
        const fallbackDouyin = await fetchDouyinMetadata(url);
        if (fallbackDouyin) return res.json(fallbackDouyin);
      }
      if (isTikTokUrl(url)) {
        const fallbackInfo = await fetchTikTokMetadata(url);
        if (fallbackInfo) return res.json(fallbackInfo);
      }

      return res.status(500).json({ error: message });
    }

    try {
      const info = JSON.parse(stdout);
      return res.json(info);
    } catch (parseErr) {
      console.error('[/api/info] JSON parse error:', parseErr.message);
      return res.status(500).json({ error: 'Failed to parse yt-dlp output as JSON' });
    }
  });
});

// =============================================================================
// GET /api/download — Start a download and stream progress via SSE
// =============================================================================
app.get('/api/download', async (req, res) => {
  const {
    url,
    format,
    browser,
    playlist,
    subtitles,
    thumbnail,
    metadata,
    rate_limit,
    username,
    password,
    output_template,
    output,
    user_agent,
    proxy,
    convert_thumbnails,
    sponsorblock_mark,
    extractor_retries,
    embed_chapters,
    write_description,
    write_comments,
    geo_bypass,
    force_ipv4,
    restrict_filenames,
    no_overwrites,
    audio_format,
    audio_quality,
    recode_video,
    merge_output_format,
    sub_lang,
    sub_format,
    concurrent_fragments,
    http_chunk_size,
    sleep_interval,
    max_sleep_interval,
    download_id,
    custom_filename,
    bilibili_upos_host,
    bilibili_avoid_p2p,
  } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing required query parameter: url' });
  }

  const downloadId = download_id || `dl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // -- SSE headers ------------------------------------------------------------
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ downloadId, started: true, custom_filename: custom_filename || null });
  if (custom_filename && custom_filename.trim()) {
    sendEvent({ downloadId, output: `[filename] Tên file lưu: ${custom_filename.trim()}` });
  }

  // 1. Direct high-speed download for Douyin (4K, 2K, 1080p, 720p, MP3)
  if (isDouyinUrl(url)) {
    try {
      const douyinData = await fetchDouyinMetadata(url);
      if (douyinData && douyinData.formats?.length > 0) {
        let chosen = null;
        let ext = 'mp4';

        if (format === 'douyin_audio' || format === 'audio-only' || audio_format) {
          chosen = douyinData.formats.find(f => f.format_id === 'douyin_audio') || douyinData.formats[0];
          ext = 'mp3';
        } else if (format) {
          chosen = douyinData.formats.find(f => f.format_id === format) ||
                   douyinData.formats.find(f => f.resolution.includes(format)) ||
                   douyinData.formats[0];
          ext = chosen.ext || 'mp4';
        } else {
          chosen = douyinData.formats[0];
          ext = chosen.ext || 'mp4';
        }

        const directStreamUrl = chosen?.url;
        if (!directStreamUrl) throw new Error('No stream URL found for selected Douyin format');

        const rawTitle = (custom_filename && custom_filename.trim()) ? custom_filename.trim() : (douyinData.title || 'douyin_video');
        const safeTitle = rawTitle
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 150) || 'douyin_video';

        const targetDir = path.resolve(output || DOWNLOADS_DIR);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${safeTitle}.${ext}`;
        const filePath = path.join(targetDir, fileName);

        console.log(`[/api/download] [${downloadId}] Downloading direct Douyin (${chosen.resolution}) to: ${filePath}`);
        sendEvent({ downloadId, output: `[download] Destination: ${filePath}` });
        sendEvent({ downloadId, output: `[Douyin-Engine] Chất lượng: ${chosen.resolution} - Codec: ${chosen.vcodec?.toUpperCase()}` });

        const abortController = new AbortController();
        activeDownloads.set(downloadId, {
          abort: () => abortController.abort(),
          killed: false,
        });

        const cookie = await getTtwidCookie();
        const videoRes = await fetch(directStreamUrl, {
          signal: abortController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/128.0.0.0',
            'Referer': 'https://www.douyin.com/',
            'Cookie': cookie
          }
        });

        if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}: ${videoRes.statusText}`);

        const totalBytes = parseInt(videoRes.headers.get('content-length') || String(chosen.filesize || 0), 10);
        const fileStream = fs.createWriteStream(filePath);
        const reader = videoRes.body.getReader();

        let receivedBytes = 0;
        let startTime = Date.now();
        let lastReport = 0;
        let windowStart = Date.now();
        let windowBytes = 0;
        let rollingSpeed = 0;

        while (true) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Douyin stream stalled (timeout 15s)')), 15000));
          const { done, value } = await Promise.race([readPromise, timeoutPromise]);
          if (done) break;

          fileStream.write(Buffer.from(value));
          receivedBytes += value.length;
          windowBytes += value.length;

          const now = Date.now();
          const winElapsed = (now - windowStart) / 1000;
          if (winElapsed >= 0.4) {
            rollingSpeed = windowBytes / winElapsed;
            windowBytes = 0;
            windowStart = now;
          }

          if (now - lastReport > 200 || receivedBytes === totalBytes) {
            lastReport = now;
            const speed = rollingSpeed || (receivedBytes / ((now - startTime) / 1000 || 0.001));
            const speedStr = (speed / 1048576).toFixed(2) + 'MiB/s';
            const pct = totalBytes > 0 ? ((receivedBytes / totalBytes) * 100).toFixed(1) : '50.0';
            const remainingBytes = Math.max(0, totalBytes - receivedBytes);
            const etaSec = speed > 0 ? Math.round(remainingBytes / speed) : 0;
            const etaMin = Math.floor(etaSec / 60);
            const etaRem = etaSec % 60;
            const etaStr = `${String(etaMin).padStart(2, '0')}:${String(etaRem).padStart(2, '0')}`;
            const totalStr = totalBytes > 0 ? (totalBytes / 1048576).toFixed(2) + 'MiB' : 'Unknown';

            sendEvent({
              downloadId,
              output: `[download]  ${pct}% of ~${totalStr} at  ${speedStr} ETA ${etaStr}`
            });
          }
        }

        fileStream.end();
        console.log(`[/api/download] [${downloadId}] Douyin download finished successfully: ${filePath}`);
        sendEvent({ downloadId, output: `100% of ${filePath}` });
        sendEvent({ downloadId, done: true, code: 0, file: filePath });
        activeDownloads.delete(downloadId);
        return res.end();
      }
    } catch (dyErr) {
      if (dyErr.name === 'AbortError') {
        console.log(`[/api/download] [${downloadId}] Douyin download aborted.`);
        activeDownloads.delete(downloadId);
        sendEvent({ downloadId, done: true, code: 1 });
        return res.end();
      }
      console.warn(`[/api/download] [${downloadId}] Douyin direct download failed, falling back to yt-dlp:`, dyErr.message);
      sendEvent({ downloadId, output: `[Douyin-Engine] Fallback to yt-dlp engine: ${dyErr.message}` });
    }
  }

  // 2. Direct high-speed download for TikTok (No watermark HD & Audio MP3)
  if (isTikTokUrl(url)) {
    try {
      const tiktokData = await fetchTikTokDirectMetadata(url);
      if (tiktokData && tiktokData.formats?.length > 0) {
        const isAudio = format === 'tiktok_audio' || format === 'audio-only' || audio_format;
        const chosen = isAudio 
          ? (tiktokData.formats.find(f => f.format_id === 'tiktok_audio') || tiktokData.formats[0])
          : (tiktokData.formats.find(f => f.format_id === 'tiktok_nowm') || tiktokData.formats[0]);

        const ext = isAudio ? 'mp3' : 'mp4';
        const directUrl = chosen.url;
        if (!directUrl) throw new Error('No stream URL found for selected TikTok format');

        const rawTitle = (custom_filename && custom_filename.trim()) ? custom_filename.trim() : (tiktokData.title || 'tiktok_video');
        const safeTitle = rawTitle
          .replace(/[\\/:*?"<>|]/g, '_')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 150) || 'tiktok_video';

        const targetDir = path.resolve(output || DOWNLOADS_DIR);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${safeTitle}.${ext}`;
        const filePath = path.join(targetDir, fileName);

        console.log(`[/api/download] [${downloadId}] Downloading direct TikTok to: ${filePath}`);
        sendEvent({ downloadId, output: `[download] Destination: ${filePath}` });

        const abortController = new AbortController();
        activeDownloads.set(downloadId, {
          abort: () => abortController.abort(),
          killed: false,
        });

        const videoRes = await fetch(directUrl, {
          signal: abortController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/128.0.0.0',
            'Referer': 'https://www.tiktok.com/'
          }
        });

        if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}: ${videoRes.statusText}`);

        const totalBytes = parseInt(videoRes.headers.get('content-length') || '0', 10);
        const fileStream = fs.createWriteStream(filePath);
        const reader = videoRes.body.getReader();

        let receivedBytes = 0;
        let startTime = Date.now();
        let lastReport = 0;
        let windowStart = Date.now();
        let windowBytes = 0;
        let rollingSpeed = 0;

        while (true) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TikTok stream stalled (timeout 15s)')), 15000));
          const { done, value } = await Promise.race([readPromise, timeoutPromise]);
          if (done) break;

          fileStream.write(Buffer.from(value));
          receivedBytes += value.length;
          windowBytes += value.length;

          const now = Date.now();
          const winElapsed = (now - windowStart) / 1000;
          if (winElapsed >= 0.4) {
            rollingSpeed = windowBytes / winElapsed;
            windowBytes = 0;
            windowStart = now;
          }

          if (now - lastReport > 200 || (totalBytes > 0 && receivedBytes === totalBytes)) {
            lastReport = now;
            const speed = rollingSpeed || (receivedBytes / ((now - startTime) / 1000 || 0.001));
            const speedStr = (speed / 1048576).toFixed(2) + 'MiB/s';
            const pct = totalBytes > 0 ? ((receivedBytes / totalBytes) * 100).toFixed(1) : '50.0';
            const remainingBytes = Math.max(0, totalBytes - receivedBytes);
            const etaSec = speed > 0 ? Math.round(remainingBytes / speed) : 0;
            const etaMin = Math.floor(etaSec / 60);
            const etaRem = etaSec % 60;
            const etaStr = `${String(etaMin).padStart(2, '0')}:${String(etaRem).padStart(2, '0')}`;
            const totalStr = totalBytes > 0 ? (totalBytes / 1048576).toFixed(2) + 'MiB' : 'Unknown';

            sendEvent({
              downloadId,
              output: `[download]  ${pct}% of ~${totalStr} at  ${speedStr} ETA ${etaStr}`
            });
          }
        }

        fileStream.end();
        console.log(`[/api/download] [${downloadId}] TikTok download finished successfully: ${filePath}`);
        sendEvent({ downloadId, output: `100% of ${filePath}` });
        sendEvent({ downloadId, done: true, code: 0, file: filePath });
        activeDownloads.delete(downloadId);
        return res.end();
      }
    } catch (ttErr) {
      if (ttErr.name === 'AbortError') {
        console.log(`[/api/download] [${downloadId}] TikTok download aborted.`);
        activeDownloads.delete(downloadId);
        sendEvent({ downloadId, done: true, code: 1 });
        return res.end();
      }
      console.warn(`[/api/download] [${downloadId}] TikTok direct download failed, falling back to yt-dlp:`, ttErr.message);
      sendEvent({ downloadId, output: `[TikTok-Engine] Fallback to yt-dlp engine: ${ttErr.message}` });
    }
  }

  const args = ['--newline'];

  // Format selection
  args.push('-f', format || 'bv*+ba/b');

  // Browser cookies (or local cookies.txt file)
  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  } else if (fs.existsSync(path.join(__dirname, 'cookies.txt'))) {
    args.push('--cookies', path.join(__dirname, 'cookies.txt'));
  }

  // Playlist handling
  if (playlist === 'true') {
    args.push('--yes-playlist');
  } else {
    args.push('--no-playlist');
  }

  // Subtitles
  if (subtitles === 'true') {
    args.push('--write-auto-subs', '--write-subs', '--embed-subs');
    if (sub_lang) {
      args.push('--sub-lang', sub_lang);
    }
    if (sub_format) {
      args.push('--sub-format', sub_format);
    }
  }

  // Thumbnail embedding
  if (thumbnail === 'true') {
    args.push('--embed-thumbnail');
  }

  // Metadata embedding
  if (metadata === 'true') {
    args.push('--embed-metadata');
  }

  // Rate limiting
  if (rate_limit) {
    args.push('--limit-rate', rate_limit);
  }

  // Authentication
  if (username) args.push('-u', username);
  if (password) args.push('-p', password);

  // Custom output filename template resolution
  let effectiveOutputTemplate = output_template;
  if (custom_filename && custom_filename.trim()) {
    let cleanName = custom_filename.trim().replace(/[\\/:*?"<>|]/g, '_');
    if (!cleanName.includes('%(ext)s')) {
      cleanName = cleanName.replace(/\.[a-zA-Z0-9]{2,4}$/, '');
      effectiveOutputTemplate = `${cleanName}.%(ext)s`;
    } else {
      effectiveOutputTemplate = cleanName;
    }
  }

  // Output destination
  if (output && effectiveOutputTemplate) {
    args.push('-o', path.join(output, effectiveOutputTemplate));
  } else if (output) {
    args.push('-o', path.join(output, '%(title)s.%(ext)s'));
  } else if (effectiveOutputTemplate) {
    args.push('-o', effectiveOutputTemplate);
  } else {
    args.push('-o', DEFAULT_DOWNLOAD_PATH);
  }

  if (user_agent) args.push('--user-agent', user_agent);
  if (proxy) args.push('--proxy', proxy);
  if (convert_thumbnails) args.push('--convert-thumbnails', convert_thumbnails);
  if (sponsorblock_mark) args.push('--sponsorblock-mark', sponsorblock_mark);
  if (extractor_retries) args.push('--extractor-retries', extractor_retries);
  if (embed_chapters === 'true') args.push('--embed-chapters');
  if (write_description === 'true') args.push('--write-description');
  if (write_comments === 'true') args.push('--write-comments');
  if (geo_bypass === 'true') args.push('--geo-bypass');
  if (force_ipv4 === 'true') args.push('-4');
  if (restrict_filenames === 'true') args.push('--restrict-filenames');
  if (no_overwrites === 'true') args.push('--no-overwrites');

  // Audio post-processing
  if (audio_format) args.push('--audio-format', audio_format);
  if (audio_quality) args.push('--audio-quality', audio_quality);

  // Video re-encoding / container
  if (recode_video) args.push('--recode-video', recode_video);
  if (merge_output_format) args.push('--merge-output-format', merge_output_format);

  // Subtitle options
  if (sub_lang) args.push('--sub-lang', sub_lang);
  if (sub_format) args.push('--sub-format', sub_format);

  // Anti-stall, network resiliency and adaptive buffer flags
  args.push('--socket-timeout', '30');
  args.push('--retries', '20');
  args.push('--fragment-retries', '50');
  args.push('--retry-sleep', 'fragment:exp=1:10');
  args.push('--file-access-retries', '5');

  // Acceleration options
  if (concurrent_fragments) {
    args.push('--concurrent-fragments', concurrent_fragments);
  }
  if (http_chunk_size && http_chunk_size !== 'none' && http_chunk_size !== 'default') {
    args.push('--http-chunk-size', http_chunk_size);
  }

  // Local FFmpeg location if present
  if (LOCAL_FFMPEG) {
    args.push('--ffmpeg-location', LOCAL_FFMPEG);
  }

  // Use Node.js runtime as portable JS engine for yt-dlp
  args.push('--js-runtimes', 'node');

  // Bilibili Anti-P2P CDN & Custom UPOS host
  const biliExtractorArgs = [];
  if (bilibili_avoid_p2p && (bilibili_avoid_p2p === 'false' || bilibili_avoid_p2p === 'allow_p2p')) {
    biliExtractorArgs.push('avoid_p2p=false');
  }
  if (bilibili_upos_host && bilibili_upos_host !== 'auto' && bilibili_upos_host !== 'default' && bilibili_upos_host !== 'none') {
    biliExtractorArgs.push(`upos_host=${bilibili_upos_host}`);
  }
  if (biliExtractorArgs.length > 0) {
    args.push('--extractor-args', `bilibili:${biliExtractorArgs.join(';')}`);
  }

  // Target URL
  args.push(url);

  console.log(`[/api/download] [${downloadId}] Spawning Python yt_dlp with args:`, args.join(' '));

  const child = spawnYtDlp(args);
  activeDownloads.set(downloadId, child);

  child.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      sendEvent({ downloadId, output: line });
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      sendEvent({ downloadId, error: line });
    }
  });

  child.on('close', (code) => {
    console.log(`[/api/download] [${downloadId}] yt-dlp exited with code ${code}`);
    activeDownloads.delete(downloadId);
    sendEvent({ downloadId, done: true, code });
    res.end();
  });

  req.on('close', () => {
    if (activeDownloads.has(downloadId)) {
      const task = activeDownloads.get(downloadId);
      if (task) {
        if (typeof task.kill === 'function' && !task.killed) {
          task.kill('SIGTERM');
        } else if (typeof task.abort === 'function') {
          task.abort();
        }
        console.log(`[/api/download] [${downloadId}] Client disconnected — cleaned up task`);
      }
      activeDownloads.delete(downloadId);
    }
  });
});

// =============================================================================
// Start Server
// =============================================================================
app.listen(PORT, () => {
  console.log(`EveryVideoDownloader server running at http://localhost:${PORT}`);
});

