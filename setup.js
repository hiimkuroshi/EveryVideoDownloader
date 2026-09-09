// =============================================================================
// EveryVideoDownloader — Auto-Diagnostic & Setup (Powered by yt-dlp)
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const { resolveAria2Command } = require('./lib/download-acceleration');

const ROOT_DIR = __dirname;
const CORE_DIR = path.join(ROOT_DIR, 'core');
const YTDLP_MODULE = path.join(CORE_DIR, 'yt_dlp');
const FFMPEG_DIR_CANDIDATES = [
  ROOT_DIR,
  path.join(ROOT_DIR, 'bin'),
  path.join(ROOT_DIR, '.runtime', 'ffmpeg'),
];
const DOWNLOAD_DIR = path.join(ROOT_DIR, 'Download');

// Check Python executable
function checkPythonSystem() {
  const localPython = path.join(ROOT_DIR, '.runtime', 'python', 'python.exe');
  if (fs.existsSync(localPython)) {
    try {
      const out = execFileSync(localPython, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return out.trim();
    } catch (e) {
      return null;
    }
  }
  try {
    const out = execSync('python --version', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return out.trim();
  } catch (e) {
    try {
      const out2 = execSync('py --version', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return out2.trim();
    } catch (e2) {
      return null;
    }
  }
}

// ANSI Color Codes for terminal
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

async function downloadFile(url, destPath, label) {
  process.stdout.write(`   ${C.cyan}⬇️  Đang tải ${label}...${C.reset} `);
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const totalBytes = parseInt(res.headers.get('content-length') || '0', 10);
    const fileStream = fs.createWriteStream(destPath);
    
    const reader = res.body.getReader();
    let receivedBytes = 0;
    let lastPercent = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      fileStream.write(Buffer.from(value));
      receivedBytes += value.length;
      
      if (totalBytes > 0) {
        const pct = Math.round((receivedBytes / totalBytes) * 100);
        if (pct !== lastPercent && pct % 10 === 0) {
          process.stdout.write(`${C.dim}${pct}% ${C.reset}`);
          lastPercent = pct;
        }
      }
    }
    
    fileStream.end();
    console.log(`\n   ${C.green}✅ Đã tải xong ${label}!${C.reset}`);
    return true;
  } catch (err) {
    console.log(`\n   ${C.red}❌ Lỗi tải ${label}: ${err.message}${C.reset}`);
    return false;
  }
}

function checkFfmpegSystem() {
  try {
    if (FFMPEG_DIR_CANDIDATES.some((dir) => fs.existsSync(path.join(dir, 'ffmpeg.exe')))) return true;
    execSync('where ffmpeg', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkAria2System() {
  const executable = resolveAria2Command({ rootDir: ROOT_DIR });
  if (!executable) return null;
  try {
    const version = execFileSync(executable, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return { executable, version: version.split(/\r?\n/)[0].trim() };
  } catch {
    return { executable, version: 'aria2c detected (version unavailable)' };
  }
}

async function runSetup() {
  console.log(`\n${C.bright}${C.magenta}======================================================================${C.reset}`);
  console.log(`${C.bright}${C.cyan}  🎬 EVERYVIDEODOWNLOADER — KIỂM TRA HỆ THỐNG & TỰ ĐỘNG CÀI ĐẶT${C.reset}`);
  console.log(`${C.dim}                    (Powered by yt-dlp Core Engine)${C.reset}`);
  console.log(`${C.bright}${C.magenta}======================================================================${C.reset}\n`);

  let allReady = true;

  // 1. Check Download Folder
  process.stdout.write(` [1/4] Thư mục lưu trữ (Download)... `);
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    console.log(`${C.green}[ĐÃ TẠO MỚI]${C.reset}`);
  } else {
    console.log(`${C.green}[SẴN SÀNG]${C.reset}`);
  }

  // 2. Check Python Runtime & yt-dlp Source Core
  process.stdout.write(` [2/4] Kiểm tra Python & yt-dlp Source Engine... `);
  const pyVer = checkPythonSystem();
  if (!pyVer) {
    console.log(`${C.red}[CHƯA CÓ PYTHON]${C.reset}`);
    console.log(`   ${C.yellow}⚠️ Hãy cài đặt Python 3.9+ từ https://python.org để chạy engine.${C.reset}`);
    allReady = false;
  } else if (!fs.existsSync(YTDLP_MODULE)) {
    console.log(`${C.yellow}[CHƯA CÓ MÃ NGUỒN CORE - ĐANG CLONE]${C.reset}`);
    try {
      if (!fs.existsSync(CORE_DIR)) fs.mkdirSync(CORE_DIR, { recursive: true });
      execSync('git clone --depth 1 https://github.com/yt-dlp/yt-dlp.git temp_repo', { cwd: ROOT_DIR, stdio: 'inherit' });
      fs.renameSync(path.join(ROOT_DIR, 'temp_repo', 'yt_dlp'), YTDLP_MODULE);
      try { fs.rmSync(path.join(ROOT_DIR, 'temp_repo'), { recursive: true, force: true }); } catch (e) {}
      console.log(`   ${C.green}✅ Đã tải mã nguồn yt-dlp thành công! (${pyVer})${C.reset}`);
    } catch (err) {
      console.log(`   ${C.red}❌ Lỗi tải mã nguồn yt-dlp: ${err.message}${C.reset}`);
      allReady = false;
    }
  } else {
    console.log(`${C.green}[SẴN SÀNG - ${pyVer}]${C.reset}`);
  }

  // 3. Check FFmpeg
  process.stdout.write(` [3/4] Kiểm tra FFmpeg (Ghép Audio/Video & Codec)... `);
  if (checkFfmpegSystem()) {
    console.log(`${C.green}[SẴN SÀNG]${C.reset}`);
  } else {
    console.log(`${C.yellow}[CHƯA CÓ TRÊN MÁY]${C.reset}`);
    console.log(`   ${C.dim}ℹ️  Đang cài đặt FFmpeg tự động qua Windows WinGet hoặc tải bản portable...${C.reset}`);
    try {
      execSync('winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
      console.log(`   ${C.green}✅ Đã cài đặt FFmpeg thành công!${C.reset}`);
    } catch (e) {
      console.log(`   ${C.yellow}⚠️ Không thể chạy winget. Hệ thống vẫn có thể tải video đơn luồng bình thường.${C.reset}`);
    }
  }

  // 4. Check Node Dependencies
  process.stdout.write(` [4/4] Kiểm tra thư viện Web UI (Express/Cors)... `);
  try {
    require('express');
    require('cors');
    console.log(`${C.green}[SẴN SÀNG]${C.reset}`);
  } catch (e) {
    console.log(`${C.yellow}[CHƯA ĐẦY ĐỦ - ĐANG CHẠY NPM INSTALL]${C.reset}`);
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log(`   ${C.green}✅ Đã cài đặt thư viện thành công!${C.reset}`);
    } catch (err) {
      console.log(`   ${C.red}❌ Lỗi cài đặt npm: ${err.message}${C.reset}`);
      allReady = false;
    }
  }

  const aria2 = checkAria2System();
  if (aria2) {
    console.log(`   ${C.green}✅ aria2: ${aria2.version}${C.reset}`);
  } else {
    console.log(`   ${C.dim}ℹ️ aria2 chưa có. Engine Auto sẽ dùng native; đặt aria2c.exe trong bin/ để bật multi-range.${C.reset}`);
  }

  console.log(`\n${C.bright}${C.magenta}======================================================================${C.reset}`);
  if (allReady) {
    console.log(`${C.bright}${C.green} 🎉 TẤT CẢ CÔNG CỤ ĐÃ SẴN SÀNG! ĐANG KHỞI CHẠY WEB STUDIO PRO...${C.reset}`);
  } else {
    console.log(`${C.bright}${C.yellow} ⚠️ Có một số cảnh báo nhưng hệ thống vẫn đang thử khởi động...${C.reset}`);
  }
  console.log(`${C.bright}${C.magenta}======================================================================${C.reset}\n`);
}

runSetup().catch(err => {
  console.error('Setup error:', err);
});
