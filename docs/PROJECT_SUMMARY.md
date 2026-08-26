# Tổng kết dự án EveryVideo

> Cập nhật: 26/08/2026
>
> Nhánh phát triển: `nhanh-2`

## Mục tiêu

EveryVideo là Web UI cục bộ để phân tích metadata, chọn định dạng và tải media. Bản Graphite Signal làm mới toàn bộ lớp giao diện nhưng giữ nguyên các luồng nghiệp vụ: phân tích URL, chọn format, hàng chờ, tải qua SSE, phụ đề, thumbnail, dịch tiêu đề và quản lý thư mục đầu ra.

Tên engine không còn xuất hiện như một phần nhận diện trong UI. Thông tin nguồn mở vẫn được ghi nhận trong tài liệu kỹ thuật và giấy phép liên quan.

## Kiến trúc hiện tại

- Frontend: HTML, CSS và JavaScript thuần trong `public/`.
- Backend: Node.js + Express trong `server.js`.
- Extraction engine: mã nguồn Python tại `core/`.
- Download progress: Server-Sent Events (SSE).
- Cấu hình cục bộ: `config.json` và các endpoint `/api/config`.
- Design contract: `DESIGN.md` tại thư mục gốc.

Python được tìm theo thứ tự:

1. Biến môi trường `EVERYVIDEO_PYTHON`.
2. `.venv` hoặc `venv` trong dự án.
3. `py.exe`, `python.exe`, rồi `python3.exe` trong `PATH`.

## Graphite Signal

- Nhận diện hiển thị được rút gọn thành **EveryVideo**.
- Nền graphite/charcoal, chữ off-white và signal coral cho hành động chính.
- Dark/light theme, bốn ngôn ngữ và toàn bộ DOM hook cũ được giữ lại.
- App shell, Studio, Queue, Advanced, Settings, progress, modal và toast dùng chung một hệ thống token.
- Có skip link, heading hierarchy, focus-visible, keyboard tabs, live region và reduced motion.
- Desktop là bố cục ưu tiên; tablet/mobile chuyển sang luồng dọc và không tạo page-level horizontal scroll.

## Độ bền runtime và API

- `/api/info` luôn trả lỗi JSON có cấu trúc khi không thể khởi chạy Python hoặc engine.
- Frontend kiểm tra `Content-Type` trước khi parse response, nên lỗi HTML/proxy không còn bị báo chung là lỗi JSON.
- `/api/open-folder` chỉ báo thành công sau khi tiến trình mở Explorer thực sự được spawn.
- `/api/browse-folder` phân biệt người dùng hủy hộp thoại với lỗi không thể khởi chạy folder picker.
- `/api/translate` chỉ còn một route, hỗ trợ fallback nhiều nhà cung cấp.
- Lỗi `ENOENT`, `EACCES` và `EPERM` của child process được chuyển thành thông báo rõ ràng cho UI.

## Endpoint chính

| Endpoint | Vai trò |
| --- | --- |
| `GET /api/config` | Đọc cấu hình và thư mục tải hiện tại |
| `GET /api/info` | Trích xuất metadata và danh sách format |
| `GET /api/download` | Tải media và stream tiến trình qua SSE |
| `GET /api/cancel-download` | Dừng tiến trình tải đang hoạt động |
| `GET /api/browse-folder` | Chọn thư mục đầu ra trên Windows |
| `GET /api/open-folder` | Mở thư mục đầu ra bằng Explorer |
| `GET /api/translate` | Dịch tiêu đề với provider fallback |
| `GET /api/proxy-image` | Proxy thumbnail |
| `GET /api/download-thumbnail` | Tải thumbnail riêng |

## Kiểm chứng ngày 26/08/2026

- URL YouTube được báo lỗi trước đó trả HTTP 200 và 49 format.
- Metadata, thumbnail và tiêu đề dịch hiển thị đúng trên Chromium.
- `/api/translate` trả HTTP 200 với bản dịch tiếng Việt.
- `/api/open-folder` trả HTTP 200 và mở đúng thư mục đã cấu hình.
- UI contract: 148 ID duy nhất, 111 DOM hook hợp lệ.
- Server contract: 11 route GET duy nhất, có guard cho process/API errors.
- Không có lỗi console trong luồng phân tích đã kiểm thử.

Chạy bộ kiểm tra an toàn bằng:

```powershell
npm run test:contracts
```

`npm test` là integration suite có thể thay đổi cấu hình và tạo dữ liệu tải; chỉ chạy trong môi trường test phù hợp.

## Cấu trúc liên quan

```text
EveryVideo/
├── DESIGN.md
├── README.md
├── README_VI.md
├── server.js
├── public/
│   ├── index.html
│   ├── style.css
│   ├── graphite-signal.css
│   ├── script.js
│   └── i18n.js
├── tests/
│   ├── ui_contract_test.js
│   └── server_contract_test.js
└── docs/
    ├── DESIGN.md
    ├── PROJECT_SUMMARY.md
    ├── RELEASE_NOTES.md
    └── ui-concepts/
```

## Vận hành nhanh

1. Chạy `npm install` nếu chưa có dependencies.
2. Bảo đảm Python có thể chạy engine, hoặc đặt `EVERYVIDEO_PYTHON` thành đường dẫn tuyệt đối tới Python phù hợp.
3. Chạy `npm start`.
4. Mở `http://localhost:3000`.

Nếu hệ điều hành hoặc sandbox chặn child process bằng `spawn EPERM`, cần chạy ứng dụng trong môi trường có quyền khởi chạy Python và Windows Explorer.
