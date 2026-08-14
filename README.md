# 🎬 EveryVideoDownloader

> **Trạm Tải Đa Phương Tiện & Trình Khám Phá Formats Độc Lập Cho yt-dlp**  
> *Giao diện Desktop Studio 2 cột hiện đại, hỗ trợ tăng tốc đa luồng, hàng chờ tải, dịch tự động tiêu đề sang Tiếng Việt.*

---

## ✨ Tính Năng Nổi Bật

- 🖥️ **Bố cục Desktop Studio 2 Cột**: Tận dụng tối đa không gian màn hình rộng, loại bỏ khoảng trắng thừa, hạn chế cuộn trang.
- 📋 **Trình Khám Phá 15+ Formats & Sắp Xếp (Sortable Table)**: Không ẩn/gộp bất kỳ codec nào (AV1, HEVC, AVC, VP9, Opus, AAC...).
- 📥 **Hàng Chờ Tải Xuống (Download Queue)**: Chọn nhiều định dạng và tải tuần tự tự động.
- ⚡ **Tăng Tốc Đa Luồng & Chống Bóp Băng Thông**: Tích hợp sẵn `-N 8/16` và `--http-chunk-size 10M`.
- 🌐 **Tự Động Dịch Tiêu Đề Sang Tiếng Việt**: Tích hợp Google Translate API miễn phí.
- 🏷️ **Nhận Diện Nền Tảng Tự Động**: Logo SVG cho YouTube, Bilibili, TikTok, Facebook, Twitter/X, Instagram.
- 🖼️ **Tải Ảnh Bìa HD**: Vượt qua lỗi 403 Forbidden của Bilibili/Douyin và chống tải lặp trên YouTube Radio/Mix.
- 📂 **Chọn Thư Mục Lưu Trực Quan**: Mở hộp thoại chọn folder của Windows thay vì phải nhập tay.
- ⏸️ **Tạm Dừng & Tiếp Tục Tải (Pause & Resume)**: Hủy an toàn và tiếp tục tải từ file `.part`.
- 🚀 **Khởi Động 1-Click (`Chay_Studio.bat`)**: Nhấp đúp là tự chạy server và mở trình duyệt web.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org) (v18 trở lên)
- [Deno](https://deno.land) (để hỗ trợ yt-dlp giải mã JS YouTube mới nhất không bị lỗi Bot/HTTP 429)

### 2. Cài Đặt Thư Viện
Mở terminal trong thư mục dự án và chạy:
```bash
npm install
```

### 3. Khởi Chạy Ứng Dụng

#### Cách 1: Chạy 1-Click (Windows)
- Nhấp đúp vào file **`Chay_Studio.bat`** (hoặc `Run_Studio.bat`).

#### Cách 2: Chạy Bằng Lệnh
```bash
node server.js
```
Sau đó mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 📂 Cấu Trúc Dự Án

```text
├── yt-dlp.exe                    # File thực thi yt-dlp
├── server.js                     # Express Backend Server
├── package.json                  # Cấu hình dự án
├── public/                       # Frontend Web UI
│   ├── index.html
│   ├── style.css
│   └── script.js
├── Download/                     # Thư mục chứa file tải về
├── Chay_Studio.bat               # File khởi động nhanh
└── PROJECT_SUMMARY.md            # Tài liệu tóm tắt dự án
```

---

## 📜 Giấy Phép
Dự án được phân phối dưới giấy phép MIT.
