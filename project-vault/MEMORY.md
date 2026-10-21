---
title: Memory Index
aliases:
  - Project Memory
tags:
  - project/everyvideo
  - memory/index
type: project
status: active
created: 2026-09-09
updated: 2026-10-21
---

# Memory Index

## Project

- [project] EveryVideo là Web UI cục bộ để phân tích, chọn format và tải media → [[01 - Project Overview]]
- [project] Trọng tâm hiện tại là tải video Bilibili ổn định và đúng chất lượng → [[03 - Bilibili Download Flow]]
- [project] Frontend thuần → Express → Python `yt_dlp` vendored → downloader/FFmpeg → [[02 - Architecture]]
- [project] [Release Windows v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0) đã công khai/Latest, có Setup + portable EXE/ZIP x64 + SHA256SUMS, digest GitHub khớp local. Khuyên ZIP giải nén một lần (~0,5 giây trên host dev); smoke pass, chưa ký số/test cài-gỡ VM sạch → [[02 - Architecture]], [[07 - Testing]]
- [project] Website phải miễn phí, có tên miền Cloudflare và chạy khi máy cá nhân tắt; đang đánh giá backend VM Always Free ngoài Cloudflare, chưa chốt/deploy → [[02 - Architecture]]
- [project] Phân Tích có resolver đa website HTTP/JSON/iframe + yt-dlp + Chromium; liệt kê/copy/tải nhiều media qua descriptor, giữ luồng preset/queue cũ. Node 22+, browser runtime tùy chọn → [[12 - Universal Media Extraction Implementation]]
- [project] Nhánh baseline `nhanh-2`; lõi vendored báo phiên bản `2026.07.04` → [[01 - Project Overview]]
- [project] Kế hoạch tập trung trong `docs/plans/`, bản đồ thư mục ở `docs/README.md`; app mở nhanh duy nhất là `dist/win-unpacked/EveryVideo.exe`. Kế hoạch tốc độ Bilibili: `docs/plans/bilibili-speed-optimization-plan.md`; default Auto + aria2 x8 + Huawei Overseas `upos-sz-mirrorhwo1` sau benchmark file 656 MiB ngày 2026-09-20

## Conventions

- [project] Giữ nguyên DOM ID, data attribute, API contract và i18n hook khi sửa UI → [[05 - Decisions and Constraints]]
- [project] Giao diện tuân theo Graphite Signal; không đổi framework chỉ để styling → [[05 - Decisions and Constraints]]
- [project] UI Graphite Signal 2 đã triển khai đợt đầu theo hướng preset-first: ưu tiên luồng Dán link → Chọn chất lượng → Tải, progressive disclosure cho option kỹ thuật → [[10 - UI UX Upgrade Research]]
- [project] `config.json`, `cookies.txt` và media tải về là dữ liệu runtime, không đưa vào bộ nhớ → [[05 - Decisions and Constraints]]

## Bilibili

- [reference] Anti-P2P và Geo Bypass mặc định bật; default UPOS hiện là `upos-sz-mirrorhwo1.bilivideo.com` vì `mirrorcosov` tái hiện throttle ~0.6 MiB/s sau ~200 MiB trên file 656 MiB, còn `mirrorhwo1` hoàn tất phần còn lại ở ~12–29 MiB/s → [[09 - Bilibili Download Speed Research]]
- [reference] Cookie lấy từ trình duyệt, fallback `cookies.txt`; `SESSDATA` quyết định trạng thái đăng nhập → [[03 - Bilibili Download Flow]]
- [reference] Bước phân tích và bước tải phải nhận cùng cấu hình Bilibili → [[03 - Bilibili Download Flow]]
- [research] `-N` chỉ tăng tốc fragment; Bilibili VOD `.m4s` direct cần multi-range như aria2 để có nhiều kết nối/file → [[09 - Bilibili Download Speed Research]]
- [research] Không hard-code một UPOS toàn cầu; benchmark base/backup URL bằng Range throughput và cache ngắn → [[09 - Bilibili Download Speed Research]]
- [research] Small Range probe có thể bỏ sót long-transfer throttling/token bucket; cần benchmark đủ dài khi chọn default CDN cho file lớn → [[09 - Bilibili Download Speed Research]]
- [project] Ưu tiên P0: telemetry đúng đơn vị + aria2 HTTP(S) tùy chọn + fallback native; runtime portable cục bộ đã được cài trong `.runtime/` và tự động được resolver nhận diện → [[09 - Bilibili Download Speed Research]]

## Verification

- [reference] Contract tests đang qua: 151 HTML ID, 116 JS hook, 14 GET route duy nhất tính cả media module và `/health` từ upstream; media fixture/UI, Node unit/progress và Python 11/11 pass → [[07 - Testing]]
- [reference] Python Bilibili selector/probe test pass 9/9; end-to-end BV1opg36pEPf phân tích/tải/FFprobe pass bằng aria2; ma trận 21 case và hai vòng lặp ứng viên đã lưu trong `Download/Bilibili-Benchmark-BV1opg36pEPf-20260909T042639Z/` → [[07 - Testing]]
- [reference] Integration suite có mạng thật, thay đổi config và tạo file; không chạy như kiểm tra mặc định; FFmpeg/FFprobe portable đã cài và smoke codec cơ bản pass; benchmark một video đã FFprobe pass, còn gate đa video đang mở → [[07 - Testing]]

## Open questions

- [project] Media discovery đã triển khai/kiểm chứng fixture và nhiều URL public; độ phủ player đặc thù, đăng nhập, DRM/anti-bot và audit engine/proxy đầy đủ vẫn là giới hạn → [[12 - Universal Media Extraction Implementation]]
- [project] Kiểm chứng `allow_p2p` có thực sự vô hiệu hóa rewrite khi checkbox anti-P2P vẫn bật → [[06 - Known Issues and Risks]]
- [project] Kiểm chứng chọn format video-only theo ID có ghép audio như người dùng mong đợi → [[06 - Known Issues and Risks]]
- [project] Bổ sung ma trận test Bilibili theo URL, login, codec, chất lượng và CDN → [[07 - Testing]]
