# EveryVideoDownloader

> **Trạm Tải Đa Phương Tiện & Khám Phá Định Dạng Chuyên Nghiệp**  
> Chạy trực tiếp trên mã nguồn mở **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** (Python Source Engine)  
> Giao diện Desktop Studio 2 cột, quản lý hàng chờ tải, tăng tốc đa luồng, trích xuất phụ đề và tự động dịch tiêu đề.

---

**Ngôn ngữ:** [English](README.md) | **Tiếng Việt**

---

## 1. Giới Thiệu

**EveryVideoDownloader** là ứng dụng trạm làm việc đồ họa (Desktop Web UI Workstation) độc lập, được thiết kế để khai thác toàn bộ sức mạnh của bộ công cụ trích xuất đa phương tiện **yt-dlp** với hơn 1.800+ website được hỗ trợ (YouTube, Bilibili, TikTok, Douyin, Facebook, X/Twitter, Instagram,...).

Khác với các ứng dụng đóng gói nhị phân thông thường, EveryVideoDownloader chạy trực tiếp trên **cây mã nguồn Python gốc (`core/yt_dlp/`)**, cho phép xem, tùy biến, mở rộng logic trích xuất mà không phụ thuộc vào file thực thi nhị phân đóng kín.

---

## 2. Công Cụ & Yêu Cầu Hệ Thống (Prerequisites)

Để ứng dụng hoạt động ổn định và đầy đủ mọi tính năng ghép nối video, bạn cần cài đặt các công cụ sau:

### Danh Sách Công Cụ Cần Thiết

| Công Cụ | Phiên Bản Khuyên Dùng | Mục Đích Sử Dụng | Bắt Buộc / Tùy Chọn |
| :--- | :--- | :--- | :---: |
| **Node.js** | v18.0.0 trở lên | Chạy Backend Express Server (Port 3000) và phục vụ giao diện Web UI | **Bắt buộc** |
| **Python** | v3.9 trở lên | Trình thông dịch thực thi trực tiếp lõi mã nguồn `core/yt_dlp/` | **Bắt buộc** |
| **FFmpeg** | v5.0 trở lên | Ghép luồng Video + Audio độ phân giải cao (1080p, 2K, 4K), chuyển đổi container `.mkv`/`.mp4`, nhúng phụ đề và trích xuất file nhạc MP3 | **Khuyên dùng** (Rất quan trọng) |
| **Trình duyệt Web** | Chrome / Firefox / Edge / Brave | Truy cập giao diện Studio và trích xuất cookie xác thực khi tải nội dung giới hạn độ tuổi | Tùy chọn |

---

### Hướng Dẫn Cài Đặt Công Cụ

#### 1. Cài đặt Node.js
* Tải bản **LTS** từ trang chủ: [https://nodejs.org](https://nodejs.org)
* Kiểm tra sau khi cài đặt:
  ```bash
  node -v
  npm -v
  ```

#### 2. Cài đặt Python
* Tải bản mới nhất từ trang chủ: [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **Lưu ý quan trọng trên Windows**: Khi chạy bộ cài đặt, hãy tích chọn vào ô **"Add python.exe to PATH"**.
* Kiểm tra sau khi cài đặt:
  ```bash
  python --version
  ```

#### 3. Cài đặt FFmpeg (Tự động hoặc Thủ công)
* **Cách 1 (Tự động qua Windows Package Manager)**:
  ```powershell
  winget install Gyan.FFmpeg
  ```
* **Cách 2 (Thủ công)**:
  1. Tải bản build zip từ [Gyan.dev FFmpeg Builds](https://www.gyan.dev/ffmpeg/builds/).
  2. Giải nén và đặt file `ffmpeg.exe` trực tiếp vào thư mục gốc của dự án hoặc vào `bin/` (hệ thống sẽ tự động nhận diện).
* Kiểm tra sau khi cài đặt:
  ```bash
  ffmpeg -version
  ```

---

## 3. Hướng Dẫn Khởi Động

### Cách 1: Khởi động 1-Click trên Windows (Khuyên dùng)
* Nhấp đúp chuột vào file **`Chay_Studio.bat`** (hoặc `Run_Studio.bat`).
* Hệ thống sẽ tự động quét chẩn đoán các công cụ cần thiết, khởi chạy server và tự động mở trình duyệt tại: **`http://localhost:3000`**.

### Cách 2: Khởi động qua Terminal
```bash
# 1. Cài đặt thư viện phụ thuộc (chỉ cần chạy lần đầu)
npm install

# 2. Khởi chạy máy chủ
npm start

# 3. (Tùy chọn) Chạy kiểm thử tự động toàn diện 15 bài test
npm test
```
Mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 4. Tính Năng Nổi Bật

* **Bố Cục Desktop Studio 2 Cột**: Tận dụng tối đa không gian màn hình ngang, hạn chế cuộn trang.
* **Bảng Khám Phá Định Dạng & Sắp Xếp 3 Chiều**: Liệt kê đầy đủ mọi format (AV1, HEVC, AVC, VP9, Opus, AAC...) kèm bộ sắp xếp (Mặc định ➔ Giảm dần ➔ Tăng dần) theo ID, độ phân giải, bitrate, dung lượng.
* **Hàng Chờ Tải Xuống (Download Queue)**: Chọn nhiều định dạng trên bảng và đưa vào hàng chờ xử lý tuần tự tự động.
* **Tiến Trình Thời Gian Thực qua SSE**: Stream trực tiếp dữ liệu từ terminal với % số lớn, tốc độ tải (`MiB/s`), thời gian còn lại (`ETA`) và dung lượng đã tải.
* **Trích Xuất & Tải Phụ Đề Riêng Biệt**: Phân tích phụ đề thủ công và tự động, ưu tiên Tiếng Việt, tải nhanh file `.srt` (tự động chuẩn hóa timestamps) hoặc `.vtt` kèm popup xem trước nội dung thoại.
* **Tải Ảnh Bìa HD Thumbnail**: Tích hợp proxy vượt lỗi 403 Forbidden của Bilibili/Douyin và chống tải lặp trên YouTube Mix/Radio.
* **Tăng Tốc Đa Luồng & Chống Bóp Băng Thông**: Tích hợp sẵn cờ `-N 8/16` (concurrent fragments) và `--http-chunk-size 10M`.
* **Tạm Dừng & Tiếp Tục Tải (Pause / Resume / Cancel)**: Dừng an toàn và tiếp tục tải từ file `.part` dở dang.
* **Mở Nhanh Thư Mục Lưu Trữ**: Nút mở trực tiếp Windows Explorer phản hồi tức thì (<10ms).
* **Đa Ngôn Ngữ (i18n) & Dịch Tiêu Đề Tự Động**: Hỗ trợ giao diện 4 ngôn ngữ (Tiếng Việt, English, 简体中文, 日本語) và proxy Google Translate API miễn phí.
* **Bộ Giải Mã Chuyên Biệt**:
  * **Douyin**: Tự cấp phát cookie `ttwid` và endpoint `aid=6383` mở khóa toàn bộ profile 4K UHD, 2K QHD, 1080p 60fps.
  * **TikTok**: Bóc tách trực tiếp video không watermark HD và audio MP3, vượt rào cản Anti-Bot WAF.

---

## 5. Cấu Trúc Thư Mục Dự Án

```text
EveryVideoDownloader/
├── bin/                          # Tiện ích bổ trợ (Windows Folder Picker dialog)
│   └── folder_picker.exe
├── core/                         # Lõi mã nguồn mở Python yt-dlp (1.800+ extractors)
│   ├── LICENSE                   # Giấy phép MIT của yt-dlp
│   └── yt_dlp/                   # Gói Python yt_dlp chính thức
├── docs/                         # Tài liệu thiết kế, kiến trúc & ghi chú phiên bản
│   ├── DESIGN.md                 # Tài liệu thiết kế giao diện
│   ├── RELEASE_NOTES.md          # Lịch sử phát hành các phiên bản
│   ├── YTDLP_CORE_ARCHITECTURE.md # Phân tích chuyên sâu kiến trúc lõi yt-dlp
│   └── YTDLP_CORE_ARCHITECTURE_EN.md
├── Download/                     # Thư mục lưu trữ video, audio, thumbnail tải về
│   └── .gitkeep
├── public/                       # Toàn bộ giao diện Web UI Frontend
│   ├── assets/
│   │   └── design-tokens.css     # Hệ thống biến thiết kế
│   ├── help.json
│   ├── i18n.js                   # Hệ thống từ điển đa ngôn ngữ (vi, en, zh, ja)
│   ├── index.html                # Bố cục Studio 2 cột, bảng formats & hàng chờ
│   ├── script.js                 # Xử lý sự kiện, SSE stream, sắp xếp & queue
│   └── style.css                 # Hệ thống màu sắc Dark/Light & Glassmorphism
├── tests/                        # Bộ kiểm thử tự động toàn diện (Automated Test Suite)
│   └── test_suite.js             # Kiểm tra tự động 15/15 tính năng cốt lõi
├── .gitignore                    # Cấu hình bỏ qua file tạm, cache, media tải về
├── Chay_Studio.bat               # File khởi động 1-click Windows (Tiếng Việt)
├── Run_Studio.bat                # File khởi động 1-click alias
├── config.json                   # Cấu hình lưu trữ người dùng
├── package.json                  # Cấu hình dự án Node.js
├── package-lock.json             # Khóa phiên bản thư viện npm
├── README.md                     # Tài liệu chính thức (English)
├── README_VI.md                  # Tài liệu tiếng Việt (File này)
├── server.js                     # Express Backend Server (Port 3000)
└── setup.js                      # Trình tự động quét & chẩn đoán hệ thống
```

---

## 6. Danh Mục API Backend

| Phương Thức | Endpoint | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| `GET` | `/api/config` | Lấy cấu hình thư mục lưu trữ hiện tại |
| `POST` | `/api/config` | Cập nhật cấu hình thư mục lưu trữ vĩnh viễn |
| `GET` | `/api/info` | Trích xuất toàn bộ metadata video, formats, subtitles dạng JSON qua lõi Python |
| `GET` | `/api/download` | Khởi chạy tiến trình tải xuống và stream dữ liệu thời gian thực qua Server-Sent Events (SSE) |
| `GET` | `/api/cancel-download` | Dừng an toàn tiến trình tải đang chạy |
| `GET` | `/api/download-thumbnail` | Tải ảnh bìa HD trực tiếp hoặc trích xuất qua yt-dlp |
| `GET` | `/api/download-subtitle` | Tải trực tiếp file phụ đề `.srt` (tự động chuyển đổi) hoặc `.vtt` |
| `GET` | `/api/preview-subtitle` | Trích xuất các câu thoại mẫu đầu tiên của phụ đề |
| `GET` | `/api/browse-folder` | Mở hộp thoại chọn thư mục chuẩn của Windows |
| `GET` | `/api/open-folder` | Mở ngay thư mục lưu trữ trong Windows Explorer (<10ms) |
| `GET` | `/api/proxy-image` | Proxy trung gian tải ảnh vượt lỗi chặn 403 Forbidden |
| `GET` | `/api/translate` | Dịch tự động tiêu đề video qua Google Translate API |

---

## 7. Giấy Phép & Ghi Nhận (License & Credits)

* Engine trích xuất và tải xuống được cung cấp bởi dự án mã nguồn mở **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** (Giấy phép MIT).
* Dự án EveryVideoDownloader được phát triển và phân phối dưới giấy phép **MIT License**.