---
title: Project Overview
aliases:
  - Tổng quan dự án
tags:
  - project/everyvideo
  - memory/project
type: project
status: active
created: 2026-09-09
updated: 2026-10-21
related:
  - "[[02 - Architecture]]"
  - "[[03 - Bilibili Download Flow]]"
---

# Project Overview

## Bố cục sau đợt dọn 2026-10-21

- Bản đồ thư mục và chỉ mục tài liệu: `docs/README.md`. Ba kế hoạch UI, tốc độ Bilibili và Windows packaging đã chuyển từ root vào `docs/plans/`.
- Bản app mở nhanh duy nhất được giữ là `dist/win-unpacked/EveryVideo.exe`; các bộ cài/portable EXE/ZIP và SHA256SUMS giữ trong `dist/`. Bản giải nén trùng `dist/EveryVideo-Portable-Folder/` đã bỏ sau đối chiếu 1.469 file payload.
- Báo cáo, số đo khởi động và ảnh desktop được giữ tại `output/reports/windows-desktop-20261021/`; ảnh media UI vẫn ở `output/playwright/`. Browser profile/fixture tạm của các lượt smoke đã dọn.
- File media tải dở cũ ở root được chuyển nguyên vẹn sang `Download/incomplete/`; giữ config, dữ liệu tải, code vendored và các dependency đang dùng. Dọn cache/log, metadata build không dùng và `ffplay.exe` thừa giải phóng tổng khoảng 1.096,46 MiB cùng bản app trùng.

## Mục tiêu sản phẩm

EveryVideo là trạm tải media chạy cục bộ trên Windows. Người dùng dán URL, phân tích metadata, chọn chính xác format hoặc preset, rồi tải video/audio/phụ đề/thumbnail về thư mục đã chọn.

Trọng tâm hiện tại của dự án là **Bilibili**, đặc biệt là độ ổn định khi CDN trả node P2P/MCDN chậm, quyền truy cập format khi chưa đăng nhập, và việc chọn đúng chất lượng.

## Baseline hiện tại

| Hạng mục | Trạng thái quan sát ngày 2026-09-09 |
| --- | --- |
| Git | Nhánh `nhanh-2`, không có thay đổi tracked trước khi tạo vault |
| Ứng dụng | Package `every-video-downloader`, phiên bản `0.3.0` |
| Lõi tải | Mã nguồn `yt_dlp` được vendored trong `core/` |
| Phiên bản lõi | `2026.07.04`, stable |
| Frontend | HTML, CSS, JavaScript thuần trong `public/` |
| Backend | Node.js + Express trong `server.js` |
| Tiến độ tải | Server-Sent Events (SSE) |
| Hậu kỳ | FFmpeg để ghép, chuyển đổi, cắt và nhúng metadata/phụ đề |
| Kiểm thử nhanh | Contract tests đang qua; xem [[07 - Testing]] |
| Tăng tốc Bilibili | Default Auto + aria2 x8 + `upos-sz-mirrorhwo1`; Native/aria2c và `fastest` vẫn có để A/B; benchmark file dài 656 MiB ngày 2026-09-20 cho thấy `mirrorcosov` throttle sau ~200 MiB |

> [!warning] Phạm vi kiểm chứng
> Việc đọc mã và chạy contract tests không chứng minh tải Bilibili ngoài mạng đang hoạt động. Các tuyên bố về tốc độ CDN trong tài liệu release cũ cần được xem là lịch sử cho tới khi có benchmark tái lập.

## Các bề mặt chức năng chính

- Phân tích URL và trả metadata/formats qua `/api/info`.
- Tải và stream log/progress qua `/api/download`.
- Hủy tiến trình qua `/api/cancel-download`.
- Tải hoặc xem trước thumbnail và phụ đề.
- Hàng chờ tải tuần tự ở frontend.
- Cấu hình cookie trình duyệt, proxy, retry, fragment concurrency, chunk size, container, filename và đoạn thời gian.
- Tách fragment workers, native HTTP chunk và aria2 connections cho direct Bilibili `.m4s`.
- Resolver trực tiếp riêng cho Douyin/TikTok; Bilibili đi qua lõi `yt_dlp` đã tùy biến.

## Bản đồ nguồn sự thật

| Cần tìm | File nguồn ưu tiên |
| --- | --- |
| Route, tạo tham số CLI, SSE, config | `server.js` |
| Resolve engine/capability aria2 | `lib/download-acceleration.js` |
| Trạng thái UI, format selection, queue | `public/script.js` |
| Control và DOM contract | `public/index.html` |
| Chuỗi đa ngôn ngữ | `public/i18n.js` |
| Theme và component style | `DESIGN.md`, `public/graphite-signal.css` |
| Logic Bilibili | `core/yt_dlp/extractor/bilibili.py` |
| Điều phối lõi | `core/yt_dlp/YoutubeDL.py` |
| Downloaders | `core/yt_dlp/downloader/` |
| FFmpeg post-processing | `core/yt_dlp/postprocessor/ffmpeg.py` |
| Contract tests | `tests/ui_contract_test.js`, `tests/server_contract_test.js` |
| Integration test | `tests/test_suite.js` |

## Tài liệu liên quan

- `README_VI.md`: vận hành và tính năng công khai.
- `docs/PROJECT_SUMMARY.md`: snapshot ngày 2026-08-26.
- `docs/YTDLP_CORE_ARCHITECTURE.md`: giải thích lõi tổng quát.
- `docs/RELEASE_NOTES.md`: lịch sử thay đổi, có thể chứa tuyên bố chưa được tái kiểm chứng.
- [[08 - Work Log]]: thay đổi và phát hiện từ thời điểm vault ra đời.
