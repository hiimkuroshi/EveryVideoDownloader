# Unreleased — Graphite Signal

> Cập nhật: 26/08/2026
>
> Nhánh: `nhanh-2`

## Added

- Hệ thiết kế Graphite Signal với design contract tại `DESIGN.md` và lớp theme `public/graphite-signal.css`.
- UI contract test kiểm tra ID, DOM hooks và các ràng buộc accessibility tĩnh.
- Server contract test kiểm tra route trùng lặp và guard cho lỗi process/API.
- Skip link, `h1`, keyboard tabs, focus-visible, live region và reduced-motion.

## Changed

- Làm mới nhận diện hiển thị thành **EveryVideo**; bỏ attribution engine khỏi giao diện người dùng.
- Đại tu app shell, Studio, Queue, Advanced, Settings, progress, modal và toast theo cùng một hệ token.
- Chuẩn hóa dark/light theme và bốn ngôn ngữ; bỏ font tải từ Google để giao diện hoạt động offline ổn định hơn.
- Responsive desktop/tablet/mobile được viết lại, giữ nguyên các chức năng và DOM hook hiện có.
- Python runtime được dò qua `EVERYVIDEO_PYTHON`, virtual environment cục bộ và các launcher trong `PATH`.
- Route dịch tiêu đề hợp nhất thành một endpoint với provider fallback.

## Fixed

- `/api/info` không còn để lỗi spawn hoặc response HTML làm frontend thất bại khi parse JSON.
- Lỗi `ENOENT`, `EACCES` và `EPERM` của child process được trả về dưới dạng JSON có thông điệp rõ ràng.
- `/api/open-folder` chỉ báo thành công sau khi Explorer được khởi chạy; `/api/browse-folder` phân biệt cancel với launch failure.
- Sửa các lỗi cú pháp CSS legacy và logic theme toggle/toast/tab navigation.

## Verified

- URL YouTube gây lỗi trước đó trả HTTP 200, metadata đúng và 49 format.
- Dịch tiêu đề tiếng Việt và mở thư mục được kiểm thử thành công trên Windows.
- UI contract: 148 ID duy nhất và 111 DOM hook hợp lệ.
- Server contract: 11 route GET duy nhất và đầy đủ process/API guards.
- Chromium không ghi nhận console error trong luồng phân tích đã kiểm thử.

---

# 📦 EveryVideoDownloader — Release 0.3.1

> **Phiên bản:** `v0.3.1`  
> **Ngày phát hành:** 20/08/2026  
> **Nền tảng cốt lõi:** Lõi mã nguồn mở Python [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.3.1)

### 1. 🚀 Tối Ưu Hóa CDN Bilibili & Bypass Chống Nghẽn P2P (MCDN)
- **Tự động chuyển hướng CDN Quốc tế**: Tự động phát hiện và loại bỏ các node P2P/MCDN bóp băng thông (`mcdn.bilivideo.cn`, `szbdyd.com`, `v1direct`), chuyển hướng thông minh sang máy chủ CDN Alibaba Overseas (`upos-sz-mirroraliov.bilivideo.com`), Tencent Overseas (`upos-sz-mirrorcosov.bilivideo.com`) và Akamai Global (`upos-hz-mirrorakam.akamaized.net`).
- **Khắc phục triệt để lỗi Timeout 30s**: Giải quyết 100% tình trạng kết nối bị nghẽn `connect timeout=30.0s` khi tải từ mạng Việt Nam và quốc tế.
- **Menu Cài Đặt Nâng Cao Trực Quan**: Tích hợp danh sách lựa chọn cụm máy chủ UPOS CDN kèm mô tả trực quan và hỗ trợ đa ngôn ngữ (VI, EN, ZH, JA).

### 2. ✏️ Tùy Chỉnh Tên File Tải Về Trực Tiếp (`custom_filename`)
- **Trợ lý đặt tên thông minh**: Hỗ trợ 3 nút thao tác nhanh `🧹 Tên sạch (Clean)`, `🌐 Tiêu đề dịch (Translated)`, `🔄 Tên gốc (Original)`.
- **An toàn định dạng**: Tự động làm sạch ký tự cấm trên Windows/Linux/macOS và bảo toàn phần mở rộng khi ghép video/audio.

### 3. 🌐 Hỗ Trợ Trình Duyệt Cốc Cốc & Cookies Fallback
- Tự động phát hiện và trích xuất cookie từ trình duyệt **Cốc Cốc** (phổ biến tại Việt Nam).
- Hỗ trợ nạp file `cookies.txt` cục bộ làm fallback dự phòng.

### 4. 🛡️ Tăng Cường Khả Năng Phục Hồi Mạng (Network Resilience)
- Tự động thử lại thông minh với độ trễ tăng dần (`--retry-sleep exp=1:20`).
- Chống stall socket timeout, sửa cờ cấu hình `--buffer-size` chuẩn CLI.

### 5. 🧪 Bộ Test Suite Tự Động 16/16 Passed (100%)
- Mở rộng kiểm thử tự động toàn diện bao phủ toàn bộ API hệ thống và tính năng Studio.

---

# 📦 EveryVideoDownloader — Release 0.3.0 (Beta)

> **Phiên bản:** `v0.3.0-beta`  
> **Ngày phát hành:** 18/08/2026  
> **Nền tảng cốt lõi:** Lõi mã nguồn mở Python [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.3.0)

### 1. 🧠 Chuyển Đổi Sang Lõi Mã Nguồn Mở Python `yt_dlp` Cốt Lõi
- **Loại bỏ hoàn toàn file nhị phân `yt-dlp.exe`**: Ứng dụng giờ đây chạy trực tiếp trên cây mã nguồn Python gốc (`core/yt_dlp/`) với hơn 1.800+ extractors chính thức từ GitHub.
- **Tốc độ phản hồi tức thì**: Loại bỏ 100% thời gian trễ giải nén file tạm `%TEMP%/_MEIxxxx` của PyInstaller.
- **Khả năng mở rộng và tùy biến**: Cho phép lập trình viên dễ dàng xem, sửa đổi và thêm mới các bộ trích xuất trực tiếp trong thư mục `core/yt_dlp/extractor/`.

### 2. 🗂️ Tinh Gọn & Chuẩn Hóa Cấu Trúc Thư Mục
- Di chuyển toàn bộ tài liệu kiến trúc, thiết kế và ghi chú phát hành vào thư mục chuyên biệt `docs/`.
- Tích hợp bộ kiểm thử tự động toàn diện 15 bài test vào thư mục `tests/`, hỗ trợ chạy qua lệnh chuẩn `npm test`.
- Làm sạch thư mục gốc, giữ lại các tệp cấu hình và khởi chạy tối giản, chuyên nghiệp.

### 3. 📖 Tài Liệu Song Ngữ Chuẩn Mực (English & Tiếng Việt)
- Phát hành `README.md` (Tiếng Anh) và `README_VI.md` (Tiếng Việt) với thanh chuyển ngữ 1-click.
- Bổ sung hướng dẫn chi tiết yêu cầu công cụ (Node.js, Python, FFmpeg) và bảng tra cứu toàn diện các API Backend.
- Loại bỏ các emoji thừa, giữ phong cách kỹ thuật hiện đại.

---

# 📦 EveryVideoDownloader — Release 0.2.2

> **Phiên bản:** `v0.2.2`  
> **Ngày phát hành:** 17/08/2026  
> **Nền tảng cốt lõi:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.2.2)

### 1. 💬 Trích Xuất & Tải Phụ Đề Riêng Biệt (Subtitles Explorer & 1-Click Downloader)
- **Tự động bóc tách đa nguồn**: Phân tích toàn bộ phụ đề thủ công do tác giả tải lên (*Manual Subtitles*) và phụ đề máy tạo tự động (*Auto-generated Captions*).
- **Bộ lọc & Sắp xếp thông minh**: Tự động ưu tiên Tiếng Việt `vi` (đính kèm huy hiệu `⭐`) và Tiếng Anh `en` lên hàng đầu danh sách.
- **Tải nhanh độc lập (<100ms)**: Cung cấp tùy chọn tải trực tiếp file phụ đề **`.SRT`** (tự động chuẩn hóa timestamps `00:00:00,000` và đánh số thứ tự) hoặc **`.VTT`** về máy mà không cần phải tải toàn bộ video nặng.
- **👁️ Xem Trước Phụ Đề (Live Preview Modal)**: Xem nhanh các câu thoại đầu tiên kèm mốc thời gian trước khi quyết định tải xuống.

### 2. 🎨 Trải Nghiệm Giao Diện Tinh Tế & Chuẩn UI/UX
- **Huy hiệu Hero Card**: Hiển thị tổng số phụ đề tìm thấy `💬 N Phụ đề (Có Tiếng Việt ⭐)`, bấm vào là tự động mở bảng phụ đề.
- **Tab Lọc Phụ Đề (`💬 Phụ Đề`)**: Tích hợp mượt mà vào thanh lọc của Bàn làm việc Studio.
- **Khung Điều Khiển Phụ Đề Nhanh ở Sidebar**: Cho phép chọn nhanh ngôn ngữ và bấm tải ngay tức thì.

---

# 📦 EveryVideoDownloader — Release 0.2.1

> **Phiên bản:** `v0.2.1`  
> **Ngày phát hành:** 17/08/2026  
> **Nền tảng cốt lõi:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.2.1)


### 1. 🛡️ Khắc Phục Lỗi Tải TikTok (Anti-Bot WAF Bypass)
- **Vượt lỗi `Unexpected response from webpage request`**: Tích hợp công cụ phân giải và tải luồng trực tiếp chuyên dụng cho TikTok (kể cả link rút gọn `vt.tiktok.com`).
- **Trích xuất đa định dạng**: Tự động bóc tách video MP4 không logo watermark chất lượng HD, video kèm watermark và file âm thanh gốc MP3 128kbps.
- **Tiến trình SSE thời gian thực**: Báo cáo đầy đủ thanh progress bar %, tốc độ `MiB/s`, thời gian còn lại `ETA` và dung lượng tải.

### 2. 🎬 Mở Khóa Đầy Đủ 4K / 2K / 1080p Cho Douyin (`aid=6383` & `ttwid`)
- **Tự động cấp phát token `ttwid`**: Tự động đăng ký và cache cookie xác thực từ Bytedance mỗi giờ.
- **Mở khóa 30 formats cao cấp**: Sử dụng endpoint PC Client của Douyin để lấy toàn bộ các profile 4K UHD (`5048x2160`), 2K QHD (`3366x1440`), 1080p Full HD (`2524x1080` H.264 & H.265 60fps) cho các video tỷ lệ màn ảnh rộng (Cinematic 21:9), giải quyết triệt để vấn đề chỉ nhận tối đa 720p khi dùng web scraper thông thường.

### 3. 🚀 Cập Nhật Core Engine `yt-dlp`
- Nâng cấp `yt-dlp.exe` lên phiên bản `nightly@2026.08.17` tối ưu cho hơn 1700+ website khác (YouTube, Bilibili, Facebook, Twitter/X,...).

---

# 📦 EveryVideoDownloader — Release 0.2.0

> **Phiên bản:** `v0.2.0`  
> **Ngày phát hành:** 14/08/2026  
> **Nền tảng cốt lõi:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.2)

### 1. 🎨 Tái Cấu Trúc Giao Diện — Ô Nhập Link Rộng Rãi (Full-Width Topbar)
- **Mở rộng ô nhập URL**: Toàn bộ thanh Header phía trên giờ đây dành trọn vẹn không gian cho trường nhập link video, hiển thị rõ ràng cả những đường link rất dài.
- **Thanh Sub-Navbar chuyên nghiệp**: Đưa cụm điều hướng (`Studio`, `Hàng Chờ`, `Nâng Cao`, `Cài Đặt`) xuống ngay bên dưới Header, tạo bố cục phân tầng trực quan và gọn gàng.

### 2. 📂 Mở Nhanh Thư Mục Lưu Trữ Siêu Tốc (<10ms)
- Tích hợp nút **`📂 Mở Folder`** trực tiếp tại thanh Sidebar và góc trên bên phải.
- Backend xử lý mở Windows Explorer bằng tiến trình không đồng bộ tách rời (`spawn unref`), phản hồi ngay lập tức `<10ms` mà không làm đơ hay chờ đợi giao diện.

### 3. 🎯 Lấy Chính Xác ID Định Dạng Đã Chọn (Exact Format ID Download)
- Khi click chọn bất kỳ dòng định dạng nào trong bảng hoặc tích checkbox (ví dụ ID `30080` trên Bilibili hoặc `137` trên YouTube), hệ thống sẽ gán chính xác ID đó vào cờ `-f`:
  ```powershell
  .\yt-dlp.exe --cookies-from-browser firefox -N 8 --http-chunk-size 10M -f "30080" --merge-output-format mkv "URL"
  ```
- Loại bỏ hoàn toàn tình trạng tự ý chèn chuỗi `+bestaudio/best` gây sai lệch định dạng người dùng mong muốn.

### 4. 🔒 Quản Lý Trạng Thái Nút Tải Xuống Thông Minh
- **Tự động Disable**: Khi vừa phân tích video xong và chưa có format nào được chọn, nút **"Bắt Đầu Tải Xuống"** sẽ ở trạng thái vô hiệu hóa kèm thông báo nhắc nhở chọn dòng format.
- **Tự động Enable**: Ngay khi click chọn 1 dòng hoặc tích chọn ít nhất 1 checkbox, nút sẽ lập tức sáng lên sẵn sàng tải.
- **Bỏ chọn toàn bộ**: Tự động vô hiệu hóa lại để chống bấm nhầm.

### 5. 🛠️ Tối Ưu Hóa Trải Nghiệm & Độ Ổn Định
- **Gỡ bỏ nút thừa**: Xóa nút "Thêm Vào Hàng Chờ" tại khu vực nút tải, biến nút **"Bắt Đầu Tải Xuống"** thành nút Full-Width nổi bật với màu Gradient xanh lá cây hiện đại.
- **Chống tràn Sidebar**: Tái cấu trúc mục "Tối Ưu Tốc Độ & Thư Mục Lưu" thành 2 tầng, loại bỏ hoàn toàn lỗi tràn khung ngang trên mọi độ phân giải.
- **Chống crash Server**: Bổ sung cơ chế `uncaughtException` và `unhandledRejection` giúp server Node.js chạy liên tục bền bỉ.

---

## 🚀 Hướng Dẫn Nâng Cấp & Sử Dụng
1. Tải bản cập nhật mới nhất từ GitHub.
2. Nhấp đúp vào file **`Chay_Studio.bat`** để khởi động ứng dụng ngay lập tức tại `http://localhost:3000`.

