# 🎬 EveryVideoDownloader

> **Trạm Tải Đa Phương Tiện & Trình Khám Phá Formats Độc Lập**  
> ⚡ **Chạy trên nền tảng của [yt-dlp](https://github.com/yt-dlp/yt-dlp)** (Powered by yt-dlp Core Engine)  
> *Giao diện Desktop Studio 2 cột hiện đại, hỗ trợ tự động chẩn đoán công cụ, tăng tốc đa luồng, hàng chờ tải, dịch tự động tiêu đề sang Tiếng Việt.*

---

## 📌 Giới Thiệu (About)

**EveryVideoDownloader** là ứng dụng giao diện đồ họa (Desktop Web UI Workstation) chuyên nghiệp được xây dựng dựa trên nền tảng của **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — công cụ dòng lệnh tải video/audio mã nguồn mở mạnh mẽ và phổ biến nhất hiện nay.

Dự án giúp bạn khai thác toàn bộ sức mạnh và cờ lệnh nâng cao của `yt-dlp` một cách trực quan, nhanh chóng mà không cần phải ghi nhớ các câu lệnh phức tạp trong Terminal.

---

## ✨ Tính Năng Nổi Bật

- 🖥️ **Bố Cục Desktop Studio 2 Cột**: Tận dụng tối đa không gian màn hình rộng, loại bỏ khoảng trắng thừa, hạn chế cuộn trang.
- 📋 **Trình Khám Phá 15+ Formats & Sắp Xếp (Sortable Table)**: Liệt kê đầy đủ mọi tùy chọn định dạng không bị gộp/mất codec (AV1, HEVC, AVC, VP9, Opus, AAC...).
- 📥 **Hàng Chờ Tải Xuống (Download Queue)**: Chọn nhiều định dạng trên bảng và đưa vào hàng chờ tải tuần tự tự động.
- 🔍 **Tự Động Kiểm Tra & Tải Công Cụ (Auto-Diagnostic)**: Khi khởi chạy lần đầu, hệ thống tự phát hiện và tải về `yt-dlp.exe`, cài đặt thư viện cần thiết trước khi vào ứng dụng.
- ⚡ **Tăng Tốc Đa Luồng & Chống Bóp Băng Thông**: Tích hợp sẵn `-N 8/16` và `--http-chunk-size 10M`.
- 🌐 **Tự Động Dịch Tiêu Đề Sang Tiếng Việt**: Tích hợp Google Translate API miễn phí.
- 🏷️ **Nhận Diện Nền Tảng Tự Động**: Logo SVG cho YouTube, Bilibili, TikTok, Facebook, Twitter/X, Instagram.
- 🖼️ **Tải Ảnh Bìa HD**: Vượt qua lỗi 403 Forbidden của Bilibili/Douyin và chống tải lặp trên YouTube Radio/Mix.
- 📂 **Chọn Thư Mục Lưu Trực Quan**: Mở hộp thoại chọn folder của Windows thay vì phải gõ tay.
- ⏸️ **Tạm Dừng & Tiếp Tục Tải (Pause & Resume)**: Hủy an toàn và tiếp tục tải từ file `.part`.
- 🚀 **Khởi Động 1-Click (`Chay_Studio.bat`)**: Nhấp đúp là tự chạy server và mở trình duyệt web.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org) (v18 trở lên)

### 2. Khởi Động Ứng Dụng

#### Cách 1: Chạy 1-Click (Khuyên Dùng Trên Windows)
- Nhấp đúp chuột vào file **`Chay_Studio.bat`** (hoặc `Run_Studio.bat`).
- Hệ thống sẽ tự động quét chẩn đoán các công cụ cần thiết, khởi chạy server và mở ngay trình duyệt tại: **`http://localhost:3000`**.

#### Cách 2: Chạy Bằng Terminal
```bash
# Cài đặt thư viện nếu chạy lần đầu
npm install

# Khởi chạy server
npm start
```
Truy cập: **`http://localhost:3000`**

---

## 📂 Cấu Trúc Dự Án

```text
EveryVideoDownloader/
├── yt-dlp.exe                    # Engine yt-dlp cốt lõi
├── setup.js                      # Trình quét & tự động tải công cụ còn thiếu
├── server.js                     # Express Backend Server (Port 3000)
├── package.json                  # Cấu hình dự án Node.js
├── public/                       # Frontend Web UI Studio
│   ├── index.html                # Bố cục Studio 2 cột & Hàng chờ
│   ├── style.css                 # Hệ thống màu sắc Dark/Light Theme
│   └── script.js                 # Xử lý sự kiện & SSE stream tiến trình
├── Download/                     # Thư mục chứa video & thumbnail tải về
├── RELEASE_NOTES.md              # Ghi chú phát hành các phiên bản
├── Chay_Studio.bat               # File khởi động 1-click Windows
└── README.md                     # Tài liệu giới thiệu dự án
```

---

## 📜 Ghi Nhận & Bản Quyền (Credits & License)

- Engine tải xuống được cung cấp bởi **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**.
- Dự án được phát triển và phân phối dưới giấy phép **MIT License**.


