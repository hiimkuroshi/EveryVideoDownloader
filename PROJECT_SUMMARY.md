# 📑 TỔNG QUAN & TÓM TẮT DỰ ÁN: YT-DLP STUDIO PRO

> **Quy ước quản lý phiên làm việc:**
> - Khi người dùng gửi **`kết thúc`**: Hệ thống sẽ tự động dừng phiên làm việc hiện tại, tổng kết nội dung và cập nhật/bổ sung vào tài liệu này.
> - Khi bắt đầu câu chat/phiên làm việc mới: Agent sẽ tự động đọc lại tệp này để nắm bắt toàn bộ ngữ cảnh dự án và tiếp tục chính xác từ bước hiện tại.

---

## 1. 🎯 Mục Tiêu Dự Án
Xây dựng ứng dụng Web UI chuyên nghiệp (**yt-dlp Studio Pro**) trọn gói trong **duy nhất 1 thư mục độc lập** (`D:\yt-dlp\`), mang lại trải nghiệm tương đương các phần mềm tải đa phương tiện cao cấp với bố cục dạng **Desktop Studio Workstation**, hỗ trợ khởi động 1-click, tối ưu không gian hiển thị và giảm thiểu tối đa việc cuộn trang.

---

## 2. 🏗️ Kiến Trúc & Công Nghệ (Tech Stack)

### A. Frontend (Giao Diện Người Dùng)
- **HTML5 & Vanilla CSS**: 
  - Thiết kế theo phong cách Desktop Studio 2 cột (Workstation Grid).
  - Hỗ trợ Dark/Light mode, hiệu ứng làm mờ kính (Glassmorphism), bảng màu tương phản cao, cỡ chữ to rõ ràng (`16.5px`).
- **Vanilla JavaScript (ES6+)**:
  - Giao tiếp thời gian thực với backend qua **Server-Sent Events (SSE)** để cập nhật % tiến trình tải và log terminal.
  - Phân tích và render danh sách 15+ formats từ yt-dlp mà không bị gộp/mất codec (AV1, HEVC, AVC, VP9...).
  - Tính năng **Sắp xếp (Sort)** cột linh hoạt (ID, Độ phân giải, Ext, FPS, Video Codec, Audio Codec, Bitrate, Dung lượng).
  - Tính năng **Hàng Chờ Tải Xuống (Download Queue)** & chọn nhiều mục cùng lúc.
  - Tự động nhận diện nền tảng tải video (Bilibili, YouTube, TikTok, Facebook, Twitter, Instagram).
  - Tự động gọi API dịch tiêu đề video sang Tiếng Việt.

### B. Backend (Máy Chủ Dịch Vụ)
- **Node.js & Express.js** (`D:\yt-dlp\server.js`):
  - Đường dẫn động độc lập (relative paths), không bị phụ thuộc cứng vào cấu trúc máy.
  - `GET /api/info`: Chạy `yt-dlp -J` để trích xuất toàn bộ metadata JSON.
  - `GET /api/download`: Sử dụng `spawn` chạy `yt-dlp` và stream stdout/stderr trực tiếp về client qua SSE, hỗ trợ dừng/tạm dừng.
  - `GET /api/cancel-download`: Hủy/tạm dừng tiến trình tải đang diễn ra.
  - `GET /api/browse-folder`: Mở hộp thoại chọn thư mục Windows FolderBrowserDialog trực quan.
  - `GET /api/translate`: Proxy dịch tiêu đề video tự động sang Tiếng Việt qua Google Translate miễn phí.
  - `GET /api/proxy-image`: Proxy ảnh thumbnail kèm `Referer` và `User-Agent` chuẩn để vượt qua cơ chế chống hotlink (HTTP 403 Forbidden) của Bilibili/Douyin.
  - `GET /api/download-thumbnail`: Tải ảnh bìa HD đơn lẻ (luôn kèm `--no-playlist`) trực tiếp vào thư mục `D:\yt-dlp\Download`.

### C. Core Engine
- **`yt-dlp.exe`** (Python compiled): Nằm trực tiếp tại gốc `D:\yt-dlp\yt-dlp.exe`.
- **Deno Runtime** (`~/.deno/bin/deno.exe`): Hỗ trợ yt-dlp giải mã các thuật toán JS trích xuất mới nhất của YouTube (chống lỗi Bot / HTTP 429).
- **FFmpeg**: Ghép nối luồng video độ nét cao và âm thanh chất lượng tốt nhất, nhúng phụ đề và ảnh bìa.

---

## 3. 📂 Cấu Trúc Thư Mục Trọn Gói (Unified 1-Folder Structure)

Toàn bộ ứng dụng đã được đóng gói tập trung vào **duy nhất 1 thư mục `D:\yt-dlp\`**:

```text
D:\yt-dlp\
├── yt-dlp.exe                    # File thực thi yt-dlp chính
├── server.js                     # Express Backend Server (Port 3000, relative paths)
├── package.json                  # Cấu hình dự án Node.js
├── node_modules\                 # Thư viện phụ thuộc Node.js
├── public\                       # Toàn bộ giao diện Web UI
│   ├── index.html                # Bố cục Studio 2 cột, Sortable Table, Queue Tab
│   ├── style.css                 # Hệ thống giao diện Dark/Light theme & CSS Grid
│   └── script.js                 # Logic tương tác client & SSE stream
├── Download\                     # Thư mục lưu trữ video / audio / thumbnail tải về
├── PROJECT_SUMMARY.md            # Tài liệu tổng quan & tóm tắt dự án (file này)
└── Chay_Studio.bat               # 🚀 Script 1-click khởi động server & tự mở trình duyệt
```

---

## 4. ✨ Các Tính Năng Đã Hoàn Thiện

1. **Đóng Gói 1 Thư Mục Độc Lập**: Toàn bộ source code, web UI, backend, binary `yt-dlp.exe` và thư mục tải về đều nằm chung trong `D:\yt-dlp\`.
2. **Khởi Động 1-Click (`Chay_Studio.bat`)**: Chỉ cần nhấp đúp vào file `.bat`, hệ thống tự chạy server và mở trình duyệt web `http://localhost:3000`.
3. **Bảng Format Explorer Đầy Đủ & Hỗ Trợ Sắp Xếp (Sortable Table)**:
   - Hiển thị đầy đủ tất cả các định dạng video/audio (AV1, HEVC, AVC, audio tracks...).
   - Bấm vào tiêu đề cột để sắp xếp Tăng/Giảm dần.
4. **Hàng Chờ Tải Xuống (Download Queue) & Chọn Nhiều Định Dạng**:
   - Checkbox từng dòng + Chọn tất cả.
   - Thêm các định dạng vào Hàng Chờ và tải tuần tự tự động.
5. **Thanh Tiến Trình Lớn Kèm % & Thông Số Chi Tiết (Loading Metrics)**:
   - Hiển thị % số lớn, tốc độ `MiB/s`, thời gian còn lại `ETA`, dung lượng `MB/Total MB`.
6. **Nút Tạm Dừng / Tiếp Tục Tải (Pause & Resume)**:
   - Dừng ngay tiến trình đang tải và bấm tiếp tục tải từ điểm gián đoạn (`.part` file).
7. **Nút Duyệt Thư Mục Tự Động (Native Windows Folder Picker)**:
   - Mở hộp thoại chọn folder của Windows trực quan.
8. **Nhận Diện Nền Tảng Tự Động & Logo SVG Chuẩn Xác**:
   - Bilibili (Logo linh vật TV 2 râu đặc trưng), YouTube, TikTok, Facebook, Twitter, Instagram.
9. **Dịch Tiêu Đề Tự Động Sang Tiếng Việt**:
   - Tích hợp Google Translate API miễn phí.
10. **Tải Thumbnail HD Đơn Lẻ**:
    - Vượt lỗi 403 Forbidden và khắc phục lỗi lặp tải của YouTube Radio/Playlist link.

---

## 5. 🚀 Hướng Dẫn Vận Hành Hệ Thống

1. **Cách 1: Khởi động 1-Click (Khuyên dùng)**:
   - Mở thư mục `D:\yt-dlp\`
   - Nhấp đúp vào file **`Chay_Studio.bat`** (hoặc `Run_Studio.bat`).
   - Trình duyệt sẽ tự động mở lên tại **`http://localhost:3000`**.

2. **Cách 2: Khởi động qua Terminal**:
   ```bash
   cd D:\yt-dlp
   cmd /c "set PATH=%USERPROFILE%\.deno\bin;%PATH% && node server.js"
   ```
