---
title: Runbook
aliases:
  - Vận hành
  - Troubleshooting
tags:
  - project/everyvideo
  - operations
type: reference
status: active
created: 2026-09-09
updated: 2026-09-09
related:
  - "[[03 - Bilibili Download Flow]]"
  - "[[07 - Testing]]"
---

# Runbook

## Khởi động

### Cách dùng thông thường trên Windows

Chạy `Chay_Studio.bat` hoặc `Run_Studio.bat`. Launcher kiểm tra Node/Python, chạy setup, mở trình duyệt tại `http://localhost:3000`, rồi giữ server hoạt động.

Trong workspace hiện tại, setup tự nhận diện các runtime portable bị gitignore: `.runtime/python/python.exe`,
`.runtime/aria2/aria2c.exe` và `.runtime/ffmpeg/ffmpeg.exe`. Không cần sửa `PATH`; nếu các file này chưa có,
đặt runtime tương ứng trong `bin/`, dùng biến môi trường được tài liệu hóa hoặc cài system-wide.

### Cách dành cho phát triển

```powershell
npm install
npm start
```

Nếu cần ép Python cụ thể:

```powershell
$env:EVERYVIDEO_PYTHON = "C:\Path\To\python.exe"
npm start
```

## Kiểm tra nhanh an toàn

```powershell
npm run test:contracts
```

Xem phạm vi và giới hạn tại [[07 - Testing]].

## Checklist tải Bilibili thủ công

- [ ] Dùng một URL video công khai ngắn, không premium.
- [ ] Analyze không cookie; ghi số format, codec, độ phân giải và thời gian phản hồi.
- [ ] Analyze với cookie trình duyệt; so sánh format bị thiếu.
- [ ] Tải preset Best Video + Best Audio; xác nhận file có cả hình và tiếng.
- [ ] Tải một exact video format ID; xác nhận hành vi audio mong muốn.
- [ ] Thử anti-P2P bật + auto.
- [ ] Thử một UPOS host cụ thể.
- [ ] So sánh `Native` với `Auto`/`aria2c` trên cùng format direct `.m4s` nếu máy có aria2.
- [ ] Nếu dùng CDN `fastest`, ghi tổng thời gian gồm cả probe và host đã che query token.
- [ ] Nếu có lý do, thử anti-P2P tắt/giữ CDN gốc.
- [ ] Xác nhận cancel kết thúc tiến trình và không để file/process treo.
- [ ] Ghi kết quả vào [[08 - Work Log]] và cập nhật [[07 - Testing]].

## Chẩn đoán theo triệu chứng

### Không tìm thấy Python hoặc spawn bị chặn

- Kiểm tra Python 3.9+.
- Đặt `EVERYVIDEO_PYTHON` tới executable hợp lệ.
- `EPERM` nghĩa là môi trường chạy server chặn tạo process con; chạy ngoài sandbox hạn chế.

### Bilibili thiếu chất lượng hoặc phụ đề

- Thử cookie từ browser đang đăng nhập Bilibili.
- Kiểm tra quyền premium/supporter/geo của chính tài khoản.
- Đọc warning từ extractor thay vì chỉ nhìn danh sách format.
- Không lưu cookie hoặc URL stream có token trong ghi chú.

### Timeout hoặc tốc độ thấp

- Bắt đầu với Anti-P2P và Geo Bypass bật, cùng UPOS `upos-sz-mirrorcosov.bilivideo.com` (default theo benchmark hiện tại); đổi sang `auto` nếu video/route khác chậm.
- Nếu Bilibili trả HTTP 412, kiểm tra server đang chạy bản có Bilibili-only `Referer`/User-Agent; không coi 412 là bằng chứng downloader chậm.
- Phân biệt `--concurrent-fragments` (fragment DASH/HLS), `--http-chunk-size` (Range tuần tự) và `aria2c` connections (Range song song cho direct `.m4s`).
- Kiểm tra `/api/config` hoặc setup output để biết `hasAria2c` và `hasLocalFfmpeg`; thiếu aria2 ở `Auto` là hành vi fallback bình thường.
- Với aria2, thử profile 4 rồi 8 rồi 16; giữ profile có median tốt hơn mà không tăng 403/416/429 hoặc fallback.
- Nếu explicit `aria2c` báo thiếu executable, đặt binary trong `.runtime/aria2/`, `bin/` hoặc `EVERYVIDEO_ARIA2C`; không đưa raw downloader args qua query.
- `fastest` chỉ là opt-in và có thể chậm hơn nếu probe timeout; quay về `auto` nếu tổng thời gian không cải thiện.
- Ghi hostname thực tế của base/backup URL theo cách đã che token.
- So sánh auto với một UPOS overseas cụ thể.
- Giảm concurrent fragments nếu mạng/CDN không ổn định.
- Không khẳng định một CDN luôn nhanh nhất nếu chưa benchmark tại mạng hiện tại.

### Video tải xong nhưng không có tiếng

- Kiểm tra format expression trong UI/log.
- Exact ID có thể là video-only; thử preset `bv*+ba/b`.
- Xác nhận FFmpeg sẵn sàng và được engine tìm thấy.
- Theo dõi [[06 - Known Issues and Risks#BILI-002 — Exact format ID có thể tạo video không audio]].

### UI báo lỗi parse JSON

- Kiểm tra status và `Content-Type` của response.
- Backend dự kiến trả JSON có cấu trúc cho lỗi `/api/info`.
- Nếu nhận HTML, kiểm tra proxy, server khác chiếm port hoặc middleware ngoài ứng dụng.

## Khi cập nhật vendored yt-dlp

1. Ghi phiên bản trước/sau và upstream commit.
2. Rebase hoặc tái áp dụng tùy biến Bilibili có chủ đích; không ghi đè mù `bilibili.py`.
3. Diff các điểm `_optimize_stream_url`, `extract_formats` và extractor args.
4. Chạy contract tests.
5. Chạy ma trận Bilibili thủ công/integration có kiểm soát.
6. Cập nhật [[01 - Project Overview]], [[03 - Bilibili Download Flow]] và [[08 - Work Log]].
