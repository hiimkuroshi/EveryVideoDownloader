# 📑 TỔNG QUAN & BẢN TÓM TẮT DỰ ÁN: EVERYVIDEODOWNLOADER

> **Quy ước quản lý phiên làm việc:**
> - Khi người dùng gửi **`kết thúc`**: Hệ thống sẽ dừng phiên làm việc hiện tại, tổng kết toàn bộ nội dung đã thực hiện và cập nhật/bổ sung vào tài liệu này.
> - Khi bắt đầu câu chat/phiên làm việc mới sau `kết thúc`: Agent sẽ tự động đọc lại tệp này trước tiên để nắm bắt toàn cảnh kiến trúc dự án và tiếp tục chính xác từ bước hiện tại.

---

## 1. 🎯 Mục Tiêu Dự Án
Xây dựng ứng dụng Web UI chuyên nghiệp mang tên **EveryVideoDownloader** (hoạt động trên nền tảng cốt lõi của **yt-dlp**) trọn gói trong **duy nhất 1 thư mục độc lập** (`D:\yt-dlp\`), mang lại trải nghiệm tương đương các phần mềm Desktop Studio cao cấp với khả năng:
- **Khởi động 1-Click** thông qua file batch thông minh [`Chay_Studio.bat`](file:///D:/yt-dlp/Chay_Studio.bat).
- **Tự động quét chẩn đoán & tải về công cụ còn thiếu (Auto-Diagnostic & Setup)** khi chạy lần đầu trên bất kỳ máy tính nào.
- **Tối ưu không gian hiển thị 2 cột (Workstation Grid)**, loại bỏ khoảng trắng thừa, hạn chế tối đa việc cuộn trang.
- **Khai thác toàn bộ sức mạnh của `yt-dlp`**: Liệt kê 15+ formats không bị gộp/mất codec, hỗ trợ hàng chờ tải, tăng tốc đa luồng, dịch tiêu đề tự động sang Tiếng Việt.

---

## 2. 🏗️ Kiến Trúc Kỹ Thuật (Tech Stack)

### A. Frontend (Giao Diện Người Dùng)
- **HTML5 & Vanilla CSS**:
  - Bố cục **Desktop Studio Workstation** 2 cột (Cột trái: Hero Card / Settings / Queue; Cột phải: Format Explorer / Log Console / Download Action).
  - Thương hiệu nhận diện: **EveryVideoDownloader (POWERED BY YT-DLP)**.
  - Hỗ trợ giao diện **Sáng / Tối (Dark / Light Mode)**, bảng màu tương phản cao, cỡ chữ to rõ ràng (`16.5px`).
- **Vanilla JavaScript (ES6+)**:
  - Giao tiếp thời gian thực với backend qua **Server-Sent Events (SSE)** để stream log terminal và cập nhật % tiến trình tải.
  - **Trình khám phá formats thông minh**: Tự phân loại Video Only, Audio Only, Combo và hỗ trợ ghép Video + Audio tùy chọn.
  - **Sắp xếp bảng (Sortable Table)**: Sắp xếp theo ID, Độ phân giải, Ext, FPS, Video Codec, Audio Codec, Bitrate, Dung lượng.
  - **Hàng chờ tải xuống (Download Queue)**: Cho phép chọn nhiều định dạng và xử lý tải tuần tự tự động.
  - **Đo lường thời gian thực**: Hiển thị % số lớn, tốc độ tải (`MiB/s`), thời gian còn lại (`ETA`), dung lượng đã tải / tổng dung lượng.
  - **Nhận diện nền tảng & Logo SVG**: Bilibili (Logo TV 2 râu đặc trưng), YouTube, TikTok, Facebook, Twitter/X, Instagram.
  - **Tự động dịch tiêu đề**: Tích hợp Google Translate API miễn phí dịch sang Tiếng Việt.

### B. Backend & Auto-Diagnostic (Máy Chủ Dịch Vụ)
- **Node.js & Express.js** ([`server.js`](file:///D:/yt-dlp/server.js)):
  - Cấu hình đường dẫn tương đối động (`path.join(__dirname, ...)`), hoàn toàn **Portable** chạy được trên mọi ổ đĩa hoặc USB.
  - `GET /api/config`: Cung cấp đường dẫn thư mục tải về thực tế của máy cho client.
  - `GET /api/info`: Chạy `yt-dlp -J` trích xuất toàn bộ metadata video.
  - `GET /api/download`: Khởi chạy tiến trình tải `yt-dlp` và stream dữ liệu thời gian thực về client qua SSE.
  - `GET /api/cancel-download`: Dừng ngay tiến trình tải đang chạy để hỗ trợ tính năng Tạm dừng / Tiếp tục (Pause & Resume qua file `.part`).
  - `GET /api/browse-folder`: Gọi PowerShell mở hộp thoại chọn thư mục chuẩn của Windows (`FolderBrowserDialog`).
  - `GET /api/translate`: Proxy dịch tiêu đề video sang Tiếng Việt.
  - `GET /api/proxy-image`: Proxy ảnh thumbnail kèm header `Referer` và `User-Agent` hợp lệ để vượt lỗi chặn hotlink (HTTP 403 Forbidden).
  - `GET /api/download-thumbnail`: Tải ảnh bìa HD đơn lẻ (luôn cố định cờ `--no-playlist`).
- **Trình Quét & Cài Đặt Tự Động** ([`setup.js`](file:///D:/yt-dlp/setup.js)):
  - Tự động kiểm tra: `Node.js`, `node_modules`, `yt-dlp.exe`, `ffmpeg.exe`, thư mục `Download/`.
  - Tự động tải `yt-dlp.exe` mới nhất từ GitHub và cài đặt thư viện nếu máy tính chưa có.

### C. Core Engine & Tối Ưu Hệ Thống
- **`yt-dlp.exe`**: Đặt tại thư mục gốc của dự án.
- **Node.js JS Runtime (`--js-runtimes node`)**: Tận dụng chính Node.js của server làm JavaScript engine giải mã YouTube, giúp không bắt buộc phải cài Deno trên máy mới.
- **FFmpeg**: Ghép Video + Audio độ nét cao (1080p, 4K), trích xuất MP3, nhúng phụ đề và ảnh bìa.

---

## 3. 📂 Cấu Trúc Thư Mục Đóng Gói (Unified 1-Folder Structure)

Toàn bộ ứng dụng đã được gom gọn gàng vào **duy nhất 1 thư mục `D:\yt-dlp\`**:

```text
EveryVideoDownloader/
├── yt-dlp.exe                    # File thực thi yt-dlp chính
├── setup.js                      # 🔍 Trình quét chẩn đoán & tự động tải công cụ còn thiếu
├── server.js                     # 🌐 Express Backend Server (Port 3000, relative paths)
├── package.json                  # Cấu hình dự án Node.js
├── node_modules\                 # Thư viện phụ thuộc Node.js (express, cors)
├── public\                       # Toàn bộ giao diện Web UI (Frontend)
│   ├── index.html                # Bố cục Studio 2 cột, Sortable Table, Queue Tab
│   ├── style.css                 # Hệ thống màu sắc Dark/Light Theme & Glassmorphism
│   └── script.js                 # Xử lý sự kiện, Sort, Hàng chờ & SSE stream
├── Download\                     # 📁 Thư mục lưu trữ video, audio, thumbnail tải về
├── .gitignore                    # Loại trừ node_modules và file video tải về
├── README.md                     # Tài liệu giới thiệu GitHub & ghi nhận nền tảng yt-dlp
├── PROJECT_SUMMARY.md            # Tài liệu tổng quan & tóm tắt dự án (file này)
├── Chay_Studio.bat               # 🚀 File khởi động 1-click tiếng Việt
└── Run_Studio.bat                # 🚀 File khởi động 1-click alias
```

---

## 4. ✨ Danh Sách Tính Năng Đã Hoàn Thành

| STT | Tính Năng | Mô Tả Chi Tiết | Trạng Thái |
| :---: | :--- | :--- | :---: |
| 1 | **Thương Hiệu EveryVideoDownloader** | Đổi tên dự án toàn diện, ghi nhận bản quyền và nền tảng cốt lõi yt-dlp | ✅ Hoàn thành |
| 2 | **Đóng Gói 1 Thư Mục Độc Lập** | Toàn bộ source code, web UI, backend, binary yt-dlp và thư mục tải về nằm chung trong 1 folder | ✅ Hoàn thành |
| 3 | **Khởi Động 1-Click (`Chay_Studio.bat`)** | Nhấp đúp là tự chạy `cd /d %~dp0`, chẩn đoán, bật server và tự mở trình duyệt web | ✅ Hoàn thành |
| 4 | **Auto-Diagnostic & Auto-Setup (`setup.js`)** | Quét 4 bước, tự động tải `yt-dlp.exe`, cài `npm install`, kiểm tra FFmpeg | ✅ Hoàn thành |
| 5 | **Bảng Formats Đầy Đủ & Sắp Xếp (Sort)** | Hiển thị 15+ formats (AV1, HEVC, AVC...), click tiêu đề cột để Sort Tăng/Giảm | ✅ Hoàn thành |
| 6 | **Hàng Chờ Tải Xuống (Download Queue)** | Checkbox từng dòng + Chọn tất cả, tab quản lý Hàng Chờ và tải tuần tự tự động | ✅ Hoàn thành |
| 7 | **Thanh Tiến Trình Lớn & Metrics Chi Tiết** | % số lớn, tốc độ `MiB/s`, thời gian còn lại `ETA`, dung lượng `MB / Total MB` | ✅ Hoàn thành |
| 8 | **Tạm Dừng & Tiếp Tục Tải (Pause & Resume)** | Nút tạm dừng an toàn và tiếp tục tải từ file `.part` dở dang | ✅ Hoàn thành |
| 9 | **Duyệt Thư Mục Tự Động (Folder Picker)** | Nút bấm mở hộp thoại chọn thư mục của Windows trực quan | ✅ Hoàn thành |
| 10 | **Tải Thumbnail HD Đơn Lẻ** | Vượt lỗi 403 Forbidden và khắc phục lỗi lặp tải của YouTube Radio/Playlist link | ✅ Hoàn thành |
| 11 | **Nhận Diện Nền Tảng & Logo SVG** | Bilibili (Logo TV 2 râu đặc trưng), YouTube, TikTok, Facebook, Twitter, Instagram | ✅ Hoàn thành |
| 12 | **Dịch Tiêu Đề Tự Động** | Tích hợp Google Translate API miễn phí sang Tiếng Việt | ✅ Hoàn thành |
| 13 | **Tùy Chọn Mở Rộng Chunk Size** | `1M`, `2M`, `5M`, `10M` (Default), `20M`, `50M`, `100M`, `none` | ✅ Hoàn thành |
| 14 | **Đồng Bộ & Đẩy Code Lên GitHub** | Đã cấu hình `.gitignore`, `README.md` và push 100% lên GitHub repository | ✅ Hoàn thành |

---

## 5. 🌐 Kho Lưu Trữ GitHub
- **Repository URL**: **`https://github.com/hiimkuroshi/EveryVideoDownloader.git`**
- **Nhánh chính**: `main`
- **Trạng thái**: `Everything up-to-date` (Đã đồng bộ toàn bộ commit mới nhất).

---

## 6. 🚀 Hướng Dẫn Vận Hành Nhanh

1. **Khởi động**: Vào thư mục `D:\yt-dlp\` ➔ Nhấp đúp chuột vào file **[`Chay_Studio.bat`](file:///D:/yt-dlp/Chay_Studio.bat)**.
2. **Sử dụng**: Trình duyệt sẽ tự động mở lên tại **`http://localhost:3000`**.
3. **Tắt ứng dụng**: Đóng cửa sổ Command Prompt lại là xong.
