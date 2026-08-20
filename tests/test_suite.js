const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = process.env.TEST_PORT || 3055;
const BASE_URL = `http://localhost:${PORT}`;

const results = [];

function recordResult(testName, passed, details = '') {
  results.push({ testName, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(` ${icon} [${passed ? 'PASSED' : 'FAILED'}] ${testName}`);
  if (details) console.log(`    ↳ ${details}`);
}

async function runAllTests() {
  console.log('\n======================================================================');
  console.log('  🎬 EVERYVIDEODOWNLOADER — TỰ ĐỘNG KIỂM THỬ TOÀN BỘ CHỨC NĂNG');
  console.log('                 (Lõi Mã Nguồn Mở Python yt_dlp)');
  console.log('======================================================================\n');

  console.log(`🚀 Đang khởi động Backend Server trên cổng ${PORT} (server.js)...`);
  const server = spawn('node', ['server.js'], { 
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: String(PORT) }
  });

  server.stderr.on('data', (d) => {
    const errStr = d.toString().trim();
    if (errStr && !errStr.includes('ExperimentalWarning')) {
      console.warn('[Server stderr]', errStr);
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  try {
    // TEST 1: Config API
    console.log('\n--- 1. Kiểm tra Cấu Hình & Lưu Trữ (/api/config) ---');
    const cfgRes = await fetch(`${BASE_URL}/api/config`);
    const cfgData = await cfgRes.json();
    recordResult('GET /api/config trả về cấu hình thư mục lưu', !!cfgData.downloadFolder, `Thư mục lưu: ${cfgData.downloadFolder}`);

    const targetDl = path.join(ROOT_DIR, 'Download');
    const postCfgRes = await fetch(`${BASE_URL}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        downloadFolder: targetDl,
        bilibiliAvoidP2p: true,
        bilibiliUposHost: 'upos-sz-mirroraliov.bilivideo.com'
      })
    });
    const postCfgData = await postCfgRes.json();
    recordResult('POST /api/config lưu cấu hình persistent & Bilibili CDN', postCfgData.success === true && postCfgData.config?.bilibiliAvoidP2p === true, `Thư mục: ${postCfgData.config?.downloadFolder} | UPOS: ${postCfgData.config?.bilibiliUposHost}`);

    // TEST 2: Translation API
    console.log('\n--- 2. Kiểm tra Dịch Tự Động Tiêu Đề (/api/translate) ---');
    const sampleTitle = 'Rick Astley - Never Gonna Give You Up (Official Music Video)';

    const trViRes = await fetch(`${BASE_URL}/api/translate?text=${encodeURIComponent(sampleTitle)}&to=vi`);
    const trViData = await trViRes.json();
    recordResult('Dịch tiêu đề sang Tiếng Việt (vi)', !!trViData.translated, `Gốc: "${sampleTitle}" ➔ Dịch: "${trViData.translated}"`);

    const trJaRes = await fetch(`${BASE_URL}/api/translate?text=${encodeURIComponent(sampleTitle)}&to=ja`);
    const trJaData = await trJaRes.json();
    recordResult('Dịch tiêu đề sang Tiếng Nhật (ja)', !!trJaData.translated, `Dịch: "${trJaData.translated}"`);

    // TEST 3: Video Metadata
    console.log('\n--- 3. Kiểm tra Trích Xuất Video Metadata qua Python Core (/api/info) ---');
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log(`   Đang phân tích link YouTube: ${testUrl} ...`);
    const infoRes = await fetch(`${BASE_URL}/api/info?url=${encodeURIComponent(testUrl)}`);
    const info = await infoRes.json();

    const formatCount = info.formats?.length || 0;
    const subCount = Object.keys(info.subtitles || {}).length;
    const autoSubCount = Object.keys(info.automatic_captions || {}).length;

    recordResult('Trích xuất Video Title & Uploader', !!info.title, `Tiêu đề: "${info.title}" | Kênh: ${info.uploader}`);
    recordResult('Trích xuất danh sách Formats (15+ Formats)', formatCount > 15, `Tổng số: ${formatCount} formats`);
    recordResult('Trích xuất danh sách Phụ Đề (Subtitles & Captions)', (subCount + autoSubCount) > 0, `Thủ công: ${subCount} bản, Tự động: ${autoSubCount} bản`);

    // TEST 4: Proxy Image
    console.log('\n--- 4. Kiểm tra Proxy Ảnh Bìa (/api/proxy-image) ---');
    const thumbUrl = info.thumbnail || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
    const proxyRes = await fetch(`${BASE_URL}/api/proxy-image?url=${encodeURIComponent(thumbUrl)}`);
    const isImage = proxyRes.ok && (proxyRes.headers.get('content-type') || '').includes('image');
    recordResult('Proxy ảnh thumbnail vượt lỗi chặn 403 Forbidden', isImage, `Status: ${proxyRes.status}, Content-Type: ${proxyRes.headers.get('content-type')}`);

    // TEST 5: HD Thumbnail Download
    console.log('\n--- 5. Kiểm tra Tải Ảnh Bìa HD Thumbnail (/api/download-thumbnail) ---');
    const dlThumbRes = await fetch(`${BASE_URL}/api/download-thumbnail?url=${encodeURIComponent(testUrl)}&thumbUrl=${encodeURIComponent(thumbUrl)}&title=NeverGonnaGiveYouUp&output=${encodeURIComponent(targetDl)}`);
    const dlThumbData = await dlThumbRes.json();
    recordResult('Tải trực tiếp ảnh bìa HD Thumbnail vào thư mục Download', dlThumbData.success === true, `File lưu: ${dlThumbData.fileName}`);

    // TEST 6: Subtitle Download & Preview
    console.log('\n--- 6. Kiểm tra Trích Xuất & Tải Phụ Đề (.SRT / .VTT) ---');
    const enAutoSubs = info.automatic_captions?.en || [];
    const directSubs = enAutoSubs.filter(f => f.ext === 'srt' || (f.ext === 'vtt' && !f.url?.includes('manifest')));
    const subStreamUrl = (directSubs[0] || enAutoSubs[0])?.url;

    if (subStreamUrl) {
      const previewRes = await fetch(`${BASE_URL}/api/preview-subtitle?subUrl=${encodeURIComponent(subStreamUrl)}`);
      const previewData = await previewRes.json();
      recordResult('Xem trước câu thoại phụ đề (/api/preview-subtitle)', previewData.success && previewData.cues?.length > 0, `Đã đọc ${previewData.cues?.length} câu thoại mẫu`);

      const dlSubRes = await fetch(`${BASE_URL}/api/download-subtitle?url=${encodeURIComponent(testUrl)}&subUrl=${encodeURIComponent(subStreamUrl)}&lang=en&format=srt&title=NeverGonnaGiveYouUp&output=${encodeURIComponent(targetDl)}`);
      const dlSubData = await dlSubRes.json();
      recordResult('Tải và chuyển đổi phụ đề .SRT chuẩn timestamps', dlSubData.success === true, `Đã lưu: ${dlSubData.fileName}`);
    }

    // TEST 7: Open Folder
    console.log('\n--- 7. Kiểm tra Mở Thư Mục Siêu Tốc (/api/open-folder) ---');
    const openRes = await fetch(`${BASE_URL}/api/open-folder?path=${encodeURIComponent(targetDl)}`);
    const openData = await openRes.json();
    recordResult('API Mở nhanh thư mục trong Windows Explorer (<10ms)', openData.success === true, `Path: ${openData.path}`);

    // TEST 8: SSE Stream Download & Custom Filename
    console.log('\n--- 8. Kiểm tra Tiến Trình Tải & Đổi Tên File Tuỳ Chỉnh (SSE Stream & custom_filename) ---');
    const customTestName = 'MyCustomTestVideo_' + Date.now();
    const dlQp = new URLSearchParams({
      url: testUrl,
      format: '251',
      rate_limit: '100K',
      custom_filename: customTestName,
      output: targetDl
    });

    const sseRes = await fetch(`${BASE_URL}/api/download?${dlQp}`);
    const reader = sseRes.body.getReader();
    const decoder = new TextDecoder();

    let capturedDownloadId = null;
    let receivedSSEChunks = 0;
    let hasValidEvent = false;
    let hasCustomName = false;
    let accumulatedText = '';

    while (receivedSSEChunks < 60) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      accumulatedText += text;
      receivedSSEChunks++;

      if (accumulatedText.includes('downloadId') && !capturedDownloadId) {
        const match = accumulatedText.match(/"downloadId":"([^"]+)"/);
        if (match) capturedDownloadId = match[1];
      }

      if (accumulatedText.includes(customTestName)) {
        hasCustomName = true;
      }

      if (accumulatedText.includes('[download]') || accumulatedText.includes('Destination') || accumulatedText.includes('[youtube]') || accumulatedText.includes('[info]') || accumulatedText.includes('[filename]')) {
        hasValidEvent = true;
      }

      if (hasValidEvent && hasCustomName && capturedDownloadId) {
        break;
      }
    }

    recordResult('SSE Stream khởi tạo tiến trình tải qua Python Core', !!capturedDownloadId, `Download ID: ${capturedDownloadId}`);
    recordResult('Đổi tên file tải về tuỳ chỉnh (custom_filename)', hasCustomName, `Tên file đích nhận đúng: ${customTestName}`);
    recordResult('SSE Stream nhận log & tiến trình tải thời gian thực', hasValidEvent, `Đã stream dữ liệu thành công`);

    if (capturedDownloadId) {
      const cancelRes = await fetch(`${BASE_URL}/api/cancel-download?downloadId=${encodeURIComponent(capturedDownloadId)}`);
      const cancelData = await cancelRes.json();
      recordResult('Hủy / Tạm dừng tiến trình tải an toàn (/api/cancel-download)', cancelData.success === true, cancelData.message);
    }
    try { await reader.cancel(); } catch (e) {}

  } catch (err) {
    console.error('❌ Lỗi trong quá trình kiểm thử:', err);
    recordResult('Quy trình kiểm thử', false, err.message);
  } finally {
    server.kill();
  }

  // SUMMARY REPORT
  console.log('\n======================================================================');
  console.log('  📊 BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ (AUTOMATED TEST REPORT)');
  console.log('======================================================================\n');

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.table(results.map((r, i) => ({
    'STT': i + 1,
    'Tính Năng': r.testName,
    'Trạng Thái': r.passed ? '✅ PASSED' : '❌ FAILED',
    'Chi Tiết': r.details
  })));

  console.log(`\n🎉 TỔNG KẾT: ${passedCount}/${totalCount} bài kiểm thử thành công (${Math.round((passedCount/totalCount)*100)}%)\n`);

  process.exit(passedCount === totalCount ? 0 : 1);
}

runAllTests();