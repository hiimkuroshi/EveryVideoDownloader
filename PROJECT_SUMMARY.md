# 📑 TỔNG QUAN & TÓM TẮT DỰ ÁN: EVERYVIDEODOWNLOADER (POWERED BY YT-DLP)

> **Quy ước quản lý phiên làm việc:**
> - Khi người dùng gửi **`kết thúc`**: Hệ thống sẽ tự động dừng phiên làm việc hiện tại, tổng kết nội dung và cập nhật/bổ sung vào tài liệu này.
> - Khi bắt đầu câu chat/phiên làm việc mới: Agent sẽ tự động đọc lại tệp này để nắm bắt toàn bộ ngữ cảnh dự án và tiếp tục chính xác từ bước hiện tại.

---

## 1. 🎯 Mục Tiêu Dự Án
Xây dựng ứng dụng Web UI chuyên nghiệp (**EveryVideoDownloader**) hoạt động trên nền tảng của **yt-dlp** trọn gói trong **duy nhất 1 thư mục độc lập** (`D:\yt-dlp\`), hỗ trợ khởi động 1-click, **tự động kiểm tra và tải về tất cả các công cụ còn thiếu (Auto-Diagnostic & Setup)**, tối ưu không gian hiển thị và giảm thiểu tối đa việc cuộn trang.

---

## 2. 🏗️ Kiến Trúc & Công Nghệ (Tech Stack)

### A. Frontend (Giao Diện Người Dùng)
- **HTML5 & Vanilla CSS**: 
  - Thiết kế theo phong cách Desktop Studio 2 cột (Workstation Grid).
  - Thương hiệu nhận diện: **EveryVideoDownloader (POWERED BY YT-DLP)**.
  - Hỗ trợ Dark/Light mode, hiệu ứng làm mờ kính (Glassmorphism), bảng màu tương phản cao, cỡ chữ to rõ ràng (`16.5px`).
- **Vanilla JavaScript (ES6+)**:
  - Giao tiếp thời gian thực với backend qua **Server-Sent Events (SSE)** để cập nhật % tiến trình tải và log terminal.
  - Phân tích và render danh sách 15+ formats từ yt-dlp mà không bị gộp/mất codec (AV1, HEVC, AVC, VP9...).
  - Tính năng **Sắp xếp (Sort)** cột linh hoạt (ID, Độ phân giải, Ext, FPS, Video Codec, Audio Codec, Bitrate, Dung lượng).
  - Tính năng **Hàng Chờ Tải Xuống (Download Queue)** & chọn nhiều mục cùng lúc.
  - Tự động nhận diện nền tảng tải video (Bilibili, YouTube, TikTok, Facebook, Twitter, Instagram).
  - Tự động gọi API dịch tiêu đề video sang Tiếng Việt.

### B. Backend & Auto-Diagnostic (Máy Chủ Dịch Vụ)
- **Node.js & Express.js** (`D:\yt-dlp\server.js`):
  - Đường dẫn động độc lập (relative paths), không bị phụ thuộc cứng vào cấu trúc máy.
  - `GET /api/config`: Trả về cấu hình đường dẫn động cho client.
  - `GET /api/info`: Chạy `yt-dlp -J` để trích xuất toàn bộ metadata JSON.
  - `GET /api/download`: Sử dụng `spawn` chạy `yt-dlp` và stream stdout/stderr trực tiếp về client qua SSE, hỗ trợ dừng/tạm dừng.
  - `GET /api/cancel-download`: Hủy/tạm dừng tiến trình tải đang diễn ra.
  - `GET /api/browse-folder`: Mở hộp thoại chọn thư mục Windows FolderBrowserDialog trực quan.
  - `GET /api/translate`: Proxy dịch tiêu đề video tự động sang Tiếng Việt qua Google Translate miễn phí.
  - `GET /api/proxy-image`: Proxy ảnh thumbnail kèm `Referer` và `User-Agent` chuẩn để vượt qua cơ chế chống hotlink (HTTP 403 Forbidden) của Bilibili/Douyin.
  - `GET /api/download-thumbnail`: Tải ảnh bìa HD đơn lẻ (luôn kèm `--no-playlist`) trực tiếp vào thư mục `Download`.
- **Trình Tự Động Kiểm Tra & Cài Đặt** (`D:\yt-dlp\setup.js`):
  - Tự động quét và phát hiện: `yt-dlp.exe`, `ffmpeg.exe`, thư viện `node_modules`, thư mục `Download/`.
  - Tự động tải về từ GitHub nếu thiếu bất kỳ công cụ nào trước khi mở giao diện chính.

---

## 3. 📂 Cấu Trúc Thư Mục Trọn Gói (Unified 1-Folder Structure)

```text
EveryVideoDownloader/
├── yt-dlp.exe                    # File thực thi yt-dlp chính
├── setup.js                      # 🔍 Trình quét chẩn đoán & tự động tải công cụ còn thiếu
├── server.js                     # Express Backend Server (Port 3000, relative paths)
├── package.json                  # Cấu hình dự án Node.js
├── node_modules\                 # Thư viện phụ thuộc Node.js
├── public\                       # Toàn bộ giao diện Web UI
│   ├── index.html                # Bố cục Studio 2 cột, Sortable Table, Queue Tab
│   ├── style.css                 # Hệ thống giao diện Dark/Light theme & CSS Grid
│   └── script.js                 # Logic tương tác client & SSE stream
├── Download\                     # Thư mục lưu trữ video / audio / thumbnail tải về
├── README.md                     # Tài liệu GitHub & ghi nhận chạy trên nền tảng yt-dlp
├── PROJECT_SUMMARY.md            # Tài liệu tổng quan & tóm tắt dự án (file này)
└── Chay_Studio.bat               # 🚀 Script 1-click khởi động chẩn đoán & mở web
```

---

## 4. ✨ Các Tính Năng Đã Hoàn Thiện

1. **Đổi Tên Thương Hiệu Thành EveryVideoDownloader**: Toàn bộ UI, Backend, Batch script, Package.json và README đã được đồng bộ với tên mới và nêu rõ chạy trên nền tảng yt-dlp.
2. **Màn Hình Tự Động Quét & Tải Tool (`setup.js` + `Chay_Studio.bat`)**: Tự động kiểm tra `Node.js`, `npm install`, tự tải `yt-dlp.exe` mới nhất, kiểm tra/cài `FFmpeg`, tạo thư mục `Download` rồi mới tự động vào UI.
3. **Khởi Động 1-Click (`Chay_Studio.bat`)**: Nhấp đúp là tự chẩn đoán, chạy server và mở trình duyệt web `http://localhost:3000`.
4. **Bảng Format Explorer Đầy Đủ & Hỗ Trợ Sắp Xếp (Sortable Table)**: Liệt kê toàn bộ định dạng video/audio (AV1, HEVC, AVC, audio tracks...), click để sắp xếp Tăng/Giảm.
5. **Hàng Chờ Tải Xuống (Download Queue) & Chọn Nhiều Định Dạng**: Checkbox từng dòng + Chọn tất cả, thêm vào Hàng Chờ và tải tuần tự tự động.
6. **Thanh Tiến Trình Lớn Kèm % & Thông Số Chi Tiết (Loading Metrics)**: Hiển thị % số lớn, tốc độ `MiB/s`, thời gian còn lại `ETA`, dung lượng `MB/Total MB`.
7. **Nút Tạm Dừng / Tiếp Tục Tải (Pause & Resume)**: Dừng an toàn và tiếp tục tải từ điểm gián đoạn (`.part` file).
8. **Nút Duyệt Thư Mục Tự Động (Native Windows Folder Picker)**: Mở hộp thoại chọn folder của Windows trực quan.
9. **Nhận Diện Nền Tảng Tự Động & Logo SVG Chuẩn Xác**: Bilibili, YouTube, TikTok, Facebook, Twitter, Instagram.
10. **Dịch Tiêu Đề Tự Động Sang Tiếng Việt**: Tích hợp Google Translate API miễn phí.
11. **Tải Thumbnail HD Đơn Lẻ**: Vượt lỗi 403 Forbidden và khắc phục lỗi lặp tải của YouTube Radio/Playlist link.
