// =============================================================================
// EveryVideoDownloader — Unified Standalone Server (Powered by yt-dlp)
// =============================================================================

const express = require('express');
const cors = require('cors');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// -- Portable Dynamic Paths (Relative to this folder) -------------------------
const YTDLP_PATH = path.join(__dirname, 'yt-dlp.exe');
const DOWNLOADS_DIR = path.join(__dirname, 'Download');
const DEFAULT_DOWNLOAD_PATH = path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s');

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

// -- Middleware ---------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// GET /api/config — Get dynamic server configuration & paths
// =============================================================================
app.get('/api/config', (req, res) => {
  res.json({
    downloadFolder: DOWNLOADS_DIR,
    hasLocalFfmpeg: !!LOCAL_FFMPEG,
  });
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
// GET /api/download-thumbnail — Save SINGLE thumbnail only (ALWAYS --no-playlist)
// =============================================================================
app.get('/api/download-thumbnail', (req, res) => {
  const { url, browser, output = DOWNLOADS_DIR } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const args = ['--write-thumbnail', '--skip-download', '--no-playlist', '--convert-thumbnails', 'jpg'];
  
  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  }

  args.push('-o', path.join(output, '%(title)s.%(ext)s'));
  args.push(url);

  console.log('[/api/download-thumbnail] Single thumbnail download args:', args.join(' '));

  execFile(YTDLP_PATH, args, (error, stdout, stderr) => {
    if (error) {
      console.error('[/api/download-thumbnail] Error:', stderr || error.message);
      return res.status(500).json({ error: stderr || error.message });
    }
    return res.json({ success: true, message: 'Đã tải ảnh thumbnail HD của video thành công vào thư mục Download!' });
  });
});

// =============================================================================
// GET /api/browse-folder — Open Native Windows Folder Picker Dialog
// =============================================================================
app.get('/api/browse-folder', (req, res) => {
  const defaultDir = req.query.current || DOWNLOADS_DIR;
  const psScript = `
[System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "Chọn thư mục lưu trữ video tải về"
$dialog.ShowNewFolderButton = $true
$dialog.SelectedPath = "${defaultDir.replace(/\\/g, '\\\\')}"
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $dialog.SelectedPath
}
`;

  execFile('powershell', ['-NoProfile', '-Command', psScript], (err, stdout) => {
    const selected = stdout ? stdout.trim().split(/\r?\n/).filter(Boolean).pop() : '';
    if (selected && fs.existsSync(selected)) {
      return res.json({ success: true, path: selected });
    }
    return res.json({ success: false, path: null });
  });
});

// =============================================================================
// GET /api/cancel-download — Cancel an ongoing download process
// =============================================================================
app.get('/api/cancel-download', (req, res) => {
  const { downloadId } = req.query;
  if (!downloadId) {
    return res.status(400).json({ error: 'Missing downloadId' });
  }

  const child = activeDownloads.get(downloadId);
  if (child && !child.killed) {
    child.kill('SIGTERM');
    activeDownloads.delete(downloadId);
    console.log(`[/api/cancel-download] Killed download task ${downloadId}`);
    return res.json({ success: true, message: 'Đã dừng tiến trình tải xuống.' });
  }

  return res.json({ success: false, message: 'Không tìm thấy tiến trình tải đang chạy.' });
});

// =============================================================================
// GET /api/info — Fetch video or playlist metadata as JSON
// =============================================================================
app.get('/api/info', (req, res) => {
  const { url, browser, playlist } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing required query parameter: url' });
  }

  const args = ['-J'];
  
  if (playlist !== 'true') {
    args.push('--no-playlist');
  }

  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
  }

  if (LOCAL_FFMPEG) {
    args.push('--ffmpeg-location', LOCAL_FFMPEG);
  }

  // Use Node.js runtime as portable JS engine for yt-dlp
  args.push('--js-runtimes', 'node');

  args.push(url);

  execFile(YTDLP_PATH, args, { maxBuffer: 35 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      const message = stderr?.trim() || error.message;
      console.error('[/api/info] Error:', message);
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
app.get('/api/download', (req, res) => {
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

  sendEvent({ downloadId, started: true });

  const args = ['--newline'];

  // Format selection
  args.push('-f', format || 'bv*+ba/b');

  // Browser cookies
  if (browser && browser !== 'none') {
    args.push('--cookies-from-browser', browser);
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

  // Output destination
  if (output && output_template) {
    args.push('-o', path.join(output, output_template));
  } else if (output) {
    args.push('-o', path.join(output, '%(title)s.%(ext)s'));
  } else if (output_template) {
    args.push('-o', output_template);
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

  // Acceleration options
  if (concurrent_fragments) {
    args.push('--concurrent-fragments', concurrent_fragments);
  }
  if (http_chunk_size && http_chunk_size !== 'none' && http_chunk_size !== 'default') {
    args.push('--http-chunk-size', http_chunk_size);
  }

  // Intervals
  // Local FFmpeg location if present
  if (LOCAL_FFMPEG) {
    args.push('--ffmpeg-location', LOCAL_FFMPEG);
  }

  // Use Node.js runtime as portable JS engine for yt-dlp
  args.push('--js-runtimes', 'node');

  // Target URL
  args.push(url);

  console.log(`[/api/download] [${downloadId}] Spawning yt-dlp with args:`, args.join(' '));

  const child = spawn(YTDLP_PATH, args);
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
      const p = activeDownloads.get(downloadId);
      if (p && !p.killed) {
        p.kill('SIGTERM');
        console.log(`[/api/download] [${downloadId}] Client disconnected — killed process`);
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
