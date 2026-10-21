# Tài liệu và bố cục EveryVideo

## Hướng dẫn

- [Chạy và build ứng dụng Windows](WINDOWS_DESKTOP.md)
- [Kiến trúc lõi yt-dlp](YTDLP_CORE_ARCHITECTURE.md) · [English](YTDLP_CORE_ARCHITECTURE_EN.md)
- [Design contract hiện tại](../DESIGN.md) · [bản đồ file giao diện](DESIGN.md)
- [Release notes](RELEASE_NOTES.md)
- [Project summary lịch sử](PROJECT_SUMMARY.md)

## Kế hoạch

- [Tối ưu tốc độ Bilibili](plans/bilibili-speed-optimization-plan.md)
- [Đại tu giao diện](plans/ui-overhaul-plan.md)
- [Đóng gói Windows](plans/windows-desktop-packaging.md)
- [Concept và prompt thiết kế](ui-concepts/prompts.md)

## Thư mục nguồn

| Thư mục | Nội dung |
| --- | --- |
| `core/` | Mã Python vendored và giấy phép; giữ đủ extractor |
| `lib/` | Module backend, runtime paths, media discovery và download |
| `public/` | Giao diện và bản dịch |
| `desktop/` | Electron shell, icon và thông báo giấy phép |
| `scripts/` | Setup, runtime validation, benchmark và build helpers |
| `tests/` | Các tầng kiểm thử |
| `bin/` | Folder picker Windows |
| `project-vault/` | Chỉ mục bộ nhớ, quyết định và nhật ký dự án |

Các entry point `server.js`, `setup.js`, launcher `.bat`, `package.json` và cấu hình build ở project root để giữ lệnh chạy hiện tại.

## Dữ liệu và kết quả sinh ra

| Đường dẫn | Cách dùng |
| --- | --- |
| `dist/win-unpacked/EveryVideo.exe` | Bản desktop đã giải nén, mở nhanh; giữ đủ thư mục đi kèm |
| `dist/*.exe`, `dist/*.zip` | Bộ cài và gói phân phối |
| `dist/SHA256SUMS.txt` | Mã kiểm tra gói phân phối |
| `output/reports/windows-desktop-20261021/` | Số đo khởi động, ảnh kiểm chứng và danh sách dọn dẹp |
| `output/playwright/` | Ảnh kiểm chứng media UI |
| `output/desktop-smoke-*/` | Dữ liệu tạm do các lượt kiểm thử desktop tạo; có thể dọn sau khi lưu báo cáo |
| `Download/` | Media của người dùng; `incomplete/` giữ file tải dở đã gom từ project root |
| `.runtime/`, `node_modules/` | Dependency đang dùng để chạy và build |
| `config.json` | Cấu hình web mode cục bộ; desktop dùng app-data riêng |

Trong đợt dọn ngày 2026-10-21, bản giải nén trùng `dist/EveryVideo-Portable-Folder/` được bỏ sau khi đối chiếu SHA-256 toàn bộ 1.469 file payload với `dist/win-unpacked/`. Log chạy khác nhau không được coi là khác mã ứng dụng. Các gói phân phối đã tạo vẫn được giữ. Metadata updater không dùng, browser profile kiểm thử, Python bytecode, debug log và `ffplay.exe` không được ứng dụng sử dụng đã được dọn. Runtime Python, FFmpeg/FFprobe, aria2 và Chromium cần thiết vẫn có mặt.
