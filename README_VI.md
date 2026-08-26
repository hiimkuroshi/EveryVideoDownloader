# EveryVideo

EveryVideo là trạm tải media chạy cục bộ, hỗ trợ khám phá định dạng, phụ đề, hàng chờ, điều khiển mạng nâng cao và giao diện Graphite Signal responsive.

**Ngôn ngữ:** [English](README.md) | **Tiếng Việt**

## Khởi động nhanh

### Khởi động một chạm trên Windows

Nhấp đúp `Chay_Studio.bat` hoặc `Run_Studio.bat`. Launcher sẽ kiểm tra công cụ cần thiết, chạy server và mở `http://localhost:3000`.

### Khởi động bằng dòng lệnh

```bash
npm install
npm start
```

Sau đó mở [http://localhost:3000](http://localhost:3000).

## Yêu cầu hệ thống

| Công cụ | Khuyến nghị | Vai trò |
| --- | --- | --- |
| Node.js | 18+ | Chạy Express server và Web UI |
| Python | 3.9+ | Chạy gói mã nguồn `core/yt_dlp` đi kèm |
| FFmpeg | 5+ | Ghép, chuyển đổi, trích xuất audio và nhúng phụ đề |
| Trình duyệt | Edge, Chrome, Firefox hoặc Brave | Hiển thị ứng dụng và cung cấp cookie tùy chọn |

Server tìm Python theo thứ tự:

1. Biến môi trường `EVERYVIDEO_PYTHON`.
2. `.venv` hoặc `venv` nằm trong dự án.
3. `py.exe`, `python.exe` hoặc `python3.exe` trong `PATH`.

Chỉ định Python cụ thể trong PowerShell:

```powershell
$env:EVERYVIDEO_PYTHON = "C:\DuongDan\python.exe"
npm start
```

EveryVideo cần tạo tiến trình con để chạy Python, Windows Explorer và hộp thoại chọn thư mục. Nếu server chạy trong sandbox hạn chế quyền tạo process, API có thể trả lỗi `spawn EPERM`.

## Tính năng

- Giao diện Graphite Signal dark/light với một màu signal-coral duy nhất.
- Workstation desktop và bố cục mobile 390 px dùng được đầy đủ.
- Bảng format có filter, tìm kiếm, sort, chế độ table/card và multi-select.
- Hàng chờ tuần tự với tiến trình SSE, tốc độ, ETA, pause, resume và cancel.
- Phát hiện, xem trước, chuyển đổi `.srt` và tải `.vtt` phụ đề.
- Tải thumbnail HD kèm proxy fallback cho host ảnh bị giới hạn.
- Cắt khoảng thời gian, chọn container, tải đa phân mảnh và HTTP chunk.
- Folder picker native và phản hồi dựa trên kết quả Explorer spawn thực tế.
- Giao diện Tiếng Việt, English, 简体中文 và 日本語.
- Dịch tiêu đề qua nhiều provider có fallback.
- Resolver riêng cho Douyin và TikTok.

## Giao diện Graphite Signal

Tên hiển thị trong giao diện là **EveryVideo**. Attribution của engine không xuất hiện trong app chrome, nhưng engine trích xuất bên dưới không thay đổi.

Design contract chính thức nằm tại [DESIGN.md](DESIGN.md). Theme được tách thành `public/graphite-signal.css` để việc đại tu hình ảnh không làm thay đổi DOM hook, API contract hoặc logic tải.

Responsive và accessibility gồm:

- Skip link và quan hệ tab/tabpanel đúng ngữ nghĩa.
- Điều hướng tab bằng Arrow, Home và End.
- Focus rõ ràng và hỗ trợ reduced-motion.
- Không tràn ngang toàn trang ở viewport 390 px.
- Toast live region và xử lý an toàn phản hồi lỗi không phải JSON.

## Cấu trúc dự án

```text
EveryVideoDownloader/
├── bin/folder_picker.exe          # Folder picker native trên Windows
├── core/yt_dlp/                   # Lõi Python source đi kèm
├── docs/
│   ├── PROJECT_SUMMARY.md
│   ├── RELEASE_NOTES.md
│   ├── YTDLP_CORE_ARCHITECTURE.md
│   └── ui-concepts/               # Prompt concept và ghi chú thiết kế
├── public/
│   ├── graphite-signal.css        # Theme Graphite Signal hiện tại
│   ├── i18n.js
│   ├── index.html
│   ├── script.js
│   └── style.css                  # Nền component legacy
├── tests/
│   ├── server_contract_test.js
│   ├── test_suite.js
│   └── ui_contract_test.js
├── DESIGN.md                      # Design contract chính thức
├── server.js
└── ui-overhaul-plan.md
```

## Tổng quan API

| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/config` | Đọc cấu hình runtime và thư mục tải hiện tại |
| `POST` | `/api/config` | Lưu thư mục tải và tùy chọn nâng cao |
| `GET` | `/api/info` | Trích xuất metadata, format, playlist và phụ đề |
| `GET` | `/api/download` | Bắt đầu tải và stream tiến trình qua SSE |
| `GET` | `/api/cancel-download` | Dừng tiến trình tải đang chạy |
| `GET` | `/api/download-thumbnail` | Lưu thumbnail HD |
| `GET` | `/api/download-subtitle` | Lưu phụ đề `.srt` hoặc `.vtt` |
| `GET` | `/api/preview-subtitle` | Trả về các cue phụ đề mẫu |
| `GET` | `/api/browse-folder` | Mở folder picker native của Windows |
| `GET/POST` | `/api/open-folder` | Mở thư mục và trả kết quả spawn Explorer thực tế |
| `GET` | `/api/proxy-image` | Proxy ảnh remote bị giới hạn |
| `GET` | `/api/translate` | Dịch tiêu đề với cơ chế provider fallback |

Lỗi khởi chạy process luôn được trả về JSON. Lỗi `EPERM` hoặc thiếu Python không còn rơi xuống trang lỗi HTML mặc định của Express.

## Kiểm thử

Chạy bộ contract test nhanh và không thay đổi dữ liệu:

```bash
npm run test:contracts
```

Bộ test kiểm tra route API duy nhất, lỗi process được bảo vệ, DOM ID không trùng và toàn bộ DOM hook tĩnh của JavaScript còn tồn tại.

Bộ integration test đầy đủ có tải dữ liệu mạng thật và thay đổi cấu hình runtime:

```bash
npm test
```

Chỉ chạy bộ này trong môi trường test có thể hoàn nguyên.

## Tài liệu

- [Design contract Graphite Signal](DESIGN.md)
- [Kế hoạch đại tu UI và trạng thái triển khai](ui-overhaul-plan.md)
- [Tổng kết dự án](docs/PROJECT_SUMMARY.md)
- [Ghi chú phát hành](docs/RELEASE_NOTES.md)
- [Kiến trúc lõi — Tiếng Việt](docs/YTDLP_CORE_ARCHITECTURE.md)
- [Kiến trúc lõi — English](docs/YTDLP_CORE_ARCHITECTURE_EN.md)

## Giấy phép và ghi nhận

Lõi trích xuất và tải được cung cấp bởi dự án mã nguồn mở [yt-dlp](https://github.com/yt-dlp/yt-dlp) theo giấy phép tương ứng. EveryVideoDownloader được phân phối theo MIT License.
