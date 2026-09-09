---
title: Decisions and Constraints
aliases:
  - Quyết định kỹ thuật
  - Ràng buộc dự án
tags:
  - project/everyvideo
  - decisions
type: project
status: active
created: 2026-09-09
updated: 2026-09-09
related:
  - "[[01 - Project Overview]]"
  - "[[Templates/Decision]]"
---

# Decisions and Constraints

## Quyết định đang có hiệu lực

### D-001 — Chạy yt-dlp từ mã nguồn vendored

- **Trạng thái:** accepted
- **Lý do:** Cho phép sửa extractor trực tiếp, tránh phụ thuộc binary đóng gói và giữ runtime portable.
- **Hệ quả:** Cập nhật upstream phải bảo toàn custom patch Bilibili và được regression test.

### D-002 — Bilibili dùng extractor core, không dùng direct Node resolver

- **Trạng thái:** accepted
- **Lý do:** Tận dụng đầy đủ hệ sinh thái extractor, WBI, cookie, formats và post-processing của yt-dlp.
- **Hệ quả:** Cấu hình Bilibili phải đi xuyên suốt UI → API → extractor args.

### D-003 — Anti-P2P bật mặc định

- **Trạng thái:** accepted, cần benchmark liên tục
- **Lý do:** Tránh các node P2P/MCDN từng gây timeout hoặc băng thông kém.
- **Hệ quả:** Luôn giữ lối thoát để dùng URL gốc; không mặc định rằng một mirror tối ưu cho mọi mạng.

### D-004 — Exact format ID phải được tôn trọng

- **Trạng thái:** accepted trong lịch sử dự án
- **Lý do:** Người dùng cần tải đúng stream đã chọn.
- **Hệ quả:** Với DASH video-only, sản phẩm phải làm rõ hoặc hỗ trợ ghép audio có chủ đích; xem [[06 - Known Issues and Risks#BILI-002 — Exact format ID có thể tạo video không audio]].

### D-005 — Giữ frontend không framework

- **Trạng thái:** accepted
- **Lý do:** Ứng dụng nhẹ, local-first và không cần migration chỉ để đổi giao diện.
- **Hệ quả:** State/event wiring phải được test bằng DOM contract và kiểm thử hành vi bổ sung.

### D-006 — aria2 tùy chọn, manifest luôn native

- **Trạng thái:** accepted cho rollout đầu
- **Lý do:** Bilibili `.m4s` direct cần nhiều HTTP Range connection; DASH/HLS manifest phải giữ native để tránh lỗi fragment/external downloader.
- **Hệ quả:** Engine `Auto` dùng aria2 khi capability có mặt và fallback native một lần; engine `aria2c` explicit báo lỗi nếu binary thiếu. Profile đầu là 4/8/16 connection.

### D-007 — CDN `fastest` chỉ dùng exact candidate; default theo benchmark, không hard-code toàn cầu

- **Trạng thái:** accepted cho default local theo benchmark một video; cần benchmark đa video trước khi phát hành rộng
- **Lý do:** Host nhanh phụ thuộc ISP/thời điểm; rewrite mù có thể làm signed URL 403/404.
- **Hệ quả:** Probe tối đa bốn base/backup URL Bilibili trả về, chọn host nhanh nhất trong candidate list; lỗi probe quay về auto anti-P2P và không log query token. Benchmark BV1opg36pEPf chọn `upos-sz-mirrorcosov.bilivideo.com` làm default local vì median tốt nhất trong nhóm pass 3/3; selector và `auto` vẫn là đường rollback.

## Design contract

- Graphite Signal là ngôn ngữ thiết kế hiện hành.
- Giữ nguyên DOM IDs, data attributes, API contracts và i18n hooks trừ khi có mapping tương thích và regression test.
- Dark/light theme, keyboard navigation, focus-visible, reduced motion và mobile usability phải được bảo toàn.
- Tên hiển thị là **EveryVideo**; attribution engine nằm ở tài liệu/license, không ở app chrome.

## Ràng buộc dữ liệu và bảo mật

- Không commit `config.json`, `cookies.txt`, media tải về hoặc thông tin đăng nhập.
- Không đưa đường dẫn output cá nhân vào vault.
- Không log password/cookie hoặc URL media có token.
- Chỉ chạy integration test khi chấp nhận được việc dùng mạng, ghi file và thay đổi config runtime.

## Cách thêm quyết định

Dùng [[Templates/Decision]], đặt ID tăng dần, ghi bối cảnh và tiêu chí đảo ngược quyết định. Nếu quyết định ảnh hưởng nhiều phiên làm việc, thêm một pointer ngắn vào [[MEMORY]].
