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
updated: 2026-10-23
---

# Memory Index

## Project

- [project] EveryVideo là Web UI cục bộ để phân tích, chọn format và tải media → [[01 - Project Overview]]
- [project] Landing page **Cinema Library** tại `sites/everyvideo-landing/` công khai: https://evd.tyr.io.vn/ ; mở rộng workflow/showcase/collections/format explorer/FAQ, đa ngôn ngữ VI/EN/JA (URL param/localStorage) và motion ngày 22/10; React/TypeScript/Tailwind + Motion, Studio minh họa, sáng/tối, CTA Windows v1.2.0; QA chín viewport + axe pass → [[10 - UI UX Upgrade Research]], [[02 - Architecture]]
- [project] Trọng tâm hiện tại là tải video Bilibili ổn định và đúng chất lượng → [[03 - Bilibili Download Flow]]
- [project] Frontend thuần → Express → Python `yt_dlp` vendored → downloader/FFmpeg → [[02 - Architecture]]
- [project] [Release Windows v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0) đã công khai/Latest, có Setup + portable EXE/ZIP x64 + SHA256SUMS, digest GitHub khớp local. Khuyên ZIP giải nén một lần (~0,5 giây trên host dev); smoke pass, chưa ký số/test cài-gỡ VM sạch → [[02 - Architecture]], [[07 - Testing]]
- [project] Landing page tĩnh đã chạy độc lập trên Cloudflare tại `evd.tyr.io.vn`; backend extraction online vẫn đang đánh giá VM Always Free ngoài Cloudflare, chưa chốt/deploy → [[02 - Architecture]]
- [project] Phân Tích có resolver đa website HTTP/JSON/iframe + yt-dlp + Chromium; liệt kê/copy/tải nhiều media qua descriptor, giữ luồng preset/queue cũ. Node 22+, browser runtime tùy chọn → [[12 - Universal Media Extraction Implementation]]
- [project] Nhánh baseline `nhanh-2`; lõi vendored báo phiên bản `2026.07.04` → [[01 - Project Overview]]
- [project] Kế hoạch tập trung trong `docs/plans/`, bản đồ thư mục ở `docs/README.md`; app mở nhanh duy nhất là `dist/win-unpacked/EveryVideo.exe`. Kế hoạch tốc độ Bilibili: `docs/plans/bilibili-speed-optimization-plan.md`; default Auto + aria2 x8 + Huawei Overseas `upos-sz-mirrorhwo1` sau benchmark file 656 MiB ngày 2026-09-20
- [project] Workspace dọn theo hướng chỉ sử dụng Windows ngày 23/10: bỏ dependency dev/root runtime trùng và artifact dư (~1.407,5 MiB), giữ source/config/media/toàn bộ `dist/win-unpacked/`; full desktop smoke pass. Source mode/build lại cần `npm ci` và khôi phục runtime theo `docs/WINDOWS_DESKTOP.md` → [[02 - Architecture]], [[07 - Testing]]

## Conventions

- [project] Giữ nguyên DOM ID, data attribute, API contract và i18n hook khi sửa UI → [[05 - Decisions and Constraints]]
- [project] Giao diện tuân theo Graphite Signal; không đổi framework chỉ để styling → [[05 - Decisions and Constraints]]
- [project] UI Studio Windows từ 23/10 áp dụng phong cách Velvet Silk (4 bảng màu, 4 bộ font trong Cài Đặt); bảng định dạng mặc định, nguồn media phụ; nguồn generic tự hiện nếu không có metadata native, preset vẫn mở thủ công. Source và app local đã cập nhật/kiểm thử; release public giữ nguyên → [[10 - UI UX Upgrade Research]], [[12 - Universal Media Extraction Implementation]]
- [project] Cài Đặt có kiểm tra cập nhật EveryVideo thủ công với latest stable GitHub release; so SemVer, cache 5 phút, link tải khi có bản mới. Source + Windows local pass UI/real GitHub/full desktop smoke ngày 23/10; public release chưa đổi → [[02 - Architecture]], [[07 - Testing]]
- [project] Video-only tự ghép audio khi chọn format/queue; nguồn media đề xuất audio cùng entry hoặc cho chọn thủ công, có opt-out tải nguyên luồng. Source + app Windows local đã cập nhật và FFprobe/desktop/UI pass ngày 23/10 → [[12 - Universal Media Extraction Implementation]], [[07 - Testing]]
- [project] `config.json`, `cookies.txt` và media tải về là dữ liệu runtime, không đưa vào bộ nhớ → [[05 - Decisions and Constraints]]

## Bilibili

- [reference] Anti-P2P và Geo Bypass mặc định bật; default UPOS hiện là `upos-sz-mirrorhwo1.bilivideo.com` vì `mirrorcosov` tái hiện throttle ~0.6 MiB/s sau ~200 MiB trên file 656 MiB, còn `mirrorhwo1` hoàn tất phần còn lại ở ~12–29 MiB/s → [[09 - Bilibili Download Speed Research]]
- [reference] Cookie lấy từ trình duyệt, fallback `cookies.txt`; `SESSDATA` quyết định trạng thái đăng nhập → [[03 - Bilibili Download Flow]]
- [reference] Bước phân tích và bước tải phải nhận cùng cấu hình Bilibili → [[03 - Bilibili Download Flow]]
- [research] `-N` chỉ tăng tốc fragment; Bilibili VOD `.m4s` direct cần multi-range như aria2 để có nhiều kết nối/file → [[09 - Bilibili Download Speed Research]]
- [research] Không hard-code một UPOS toàn cầu; benchmark base/backup URL bằng Range throughput và cache ngắn → [[09 - Bilibili Download Speed Research]]
- [research] Small Range probe có thể bỏ sót long-transfer throttling/token bucket; cần benchmark đủ dài khi chọn default CDN cho file lớn → [[09 - Bilibili Download Speed Research]]
- [project] Telemetry + aria2 HTTP(S) tùy chọn + fallback native đã triển khai; app Windows có runtime riêng. Root `.runtime/` phục vụ development đã dọn ngày 23/10, cần khôi phục trước source mode/build → [[09 - Bilibili Download Speed Research]], [[02 - Architecture]]

## Verification

- [reference] Contract tests đang qua: 161 HTML ID, 123 JS hook, 15 GET route duy nhất tính cả media module, `/health` và check-update; cập nhật GitHub có unit 6/6, real API/UI source + ASAR và full desktop smoke pass ngày 23/10. Tự ghép audio có FFprobe, media fixture, Node unit/progress và Python 11/11 pass → [[07 - Testing]]
- [reference] Python Bilibili selector/probe test pass 9/9; end-to-end BV1opg36pEPf phân tích/tải/FFprobe pass bằng aria2; ma trận 21 case và hai vòng lặp ứng viên đã lưu trong `Download/Bilibili-Benchmark-BV1opg36pEPf-20260909T042639Z/` → [[07 - Testing]]
- [reference] Integration suite có mạng thật, thay đổi config và tạo file; không chạy như kiểm tra mặc định; FFmpeg/FFprobe portable đã cài và smoke codec cơ bản pass; benchmark một video đã FFprobe pass, còn gate đa video đang mở → [[07 - Testing]]

## Open questions

- [project] Media discovery đã triển khai/kiểm chứng fixture và nhiều URL public; độ phủ player đặc thù, đăng nhập, DRM/anti-bot và audit engine/proxy đầy đủ vẫn là giới hạn → [[12 - Universal Media Extraction Implementation]]
- [project] Kiểm chứng `allow_p2p` có thực sự vô hiệu hóa rewrite khi checkbox anti-P2P vẫn bật → [[06 - Known Issues and Risks]]
- [project] Bổ sung ma trận test Bilibili theo URL, login, codec, chất lượng và CDN → [[07 - Testing]]
