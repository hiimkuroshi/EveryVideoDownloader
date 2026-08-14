// =============================================================================
// EveryVideoDownloader — Auto-Diagnostic & Setup (Powered by yt-dlp)
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const YTDLP_EXE = path.join(ROOT_DIR, 'yt-dlp.exe');
const FFMPEG_EXE = path.join(ROOT_DIR, 'ffmpeg.exe');
const DOWNLOAD_DIR = path.join(ROOT_DIR, 'Download');

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
    if (fs.existsSync(FFMPEG_EXE)) return true;
    execSync('where ffmpeg', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
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

  // 2. Check yt-dlp.exe
  process.stdout.write(` [2/4] Kiểm tra yt-dlp Engine... `);
  if (fs.existsSync(YTDLP_EXE)) {
    console.log(`${C.green}[SẴN SÀNG]${C.reset}`);
  } else {
    console.log(`${C.yellow}[CHƯA CÓ - ĐANG TỰ ĐỘNG TẢI]${C.reset}`);
    const ok = await downloadFile(
      'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
      YTDLP_EXE,
      'yt-dlp.exe'
    );
    if (!ok) allReady = false;
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
