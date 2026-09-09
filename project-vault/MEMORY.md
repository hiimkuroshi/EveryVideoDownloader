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
updated: 2026-09-09
---

# Memory Index

## Project

- [project] EveryVideo là Web UI cục bộ để phân tích, chọn format và tải media → [[01 - Project Overview]]
- [project] Trọng tâm hiện tại là tải video Bilibili ổn định và đúng chất lượng → [[03 - Bilibili Download Flow]]
- [project] Frontend thuần → Express → Python `yt_dlp` vendored → downloader/FFmpeg → [[02 - Architecture]]
- [project] Nhánh baseline `nhanh-2`; lõi vendored báo phiên bản `2026.07.04` → [[01 - Project Overview]]
- [project] Kế hoạch tối ưu tốc độ Bilibili nằm tại project root: `bilibili-speed-optimization-plan.md`; default mới theo benchmark là Auto + aria2 x8 + Tencent Overseas `upos-sz-mirrorcosov`, còn `fastest` vẫn opt-in

## Conventions

- [project] Giữ nguyên DOM ID, data attribute, API contract và i18n hook khi sửa UI → [[05 - Decisions and Constraints]]
- [project] Giao diện tuân theo Graphite Signal; không đổi framework chỉ để styling → [[05 - Decisions and Constraints]]
- [project] `config.json`, `cookies.txt` và media tải về là dữ liệu runtime, không đưa vào bộ nhớ → [[05 - Decisions and Constraints]]

## Bilibili

- [reference] Anti-P2P và Geo Bypass mặc định bật; default UPOS hiện là `upos-sz-mirrorcosov.bilivideo.com` theo benchmark BV1opg36pEPf, có thể đổi về auto để thích nghi CDN → [[03 - Bilibili Download Flow]]
- [reference] Cookie lấy từ trình duyệt, fallback `cookies.txt`; `SESSDATA` quyết định trạng thái đăng nhập → [[03 - Bilibili Download Flow]]
- [reference] Bước phân tích và bước tải phải nhận cùng cấu hình Bilibili → [[03 - Bilibili Download Flow]]
- [research] `-N` chỉ tăng tốc fragment; Bilibili VOD `.m4s` direct cần multi-range như aria2 để có nhiều kết nối/file → [[09 - Bilibili Download Speed Research]]
- [research] Không hard-code một UPOS toàn cầu; benchmark base/backup URL bằng Range throughput và cache ngắn → [[09 - Bilibili Download Speed Research]]
- [project] Ưu tiên P0: telemetry đúng đơn vị + aria2 HTTP(S) tùy chọn + fallback native; runtime portable cục bộ đã được cài trong `.runtime/` và tự động được resolver nhận diện → [[09 - Bilibili Download Speed Research]]

## Verification

- [reference] Contract tests đang qua: 151 HTML ID, 115 JS hook, 11 GET route duy nhất; Node unit test option builder cũng pass → [[07 - Testing]]
- [reference] Python Bilibili selector/probe test pass 9/9; end-to-end BV1opg36pEPf phân tích/tải/FFprobe pass bằng aria2; ma trận 21 case và hai vòng lặp ứng viên đã lưu trong `Download/Bilibili-Benchmark-BV1opg36pEPf-20260909T042639Z/` → [[07 - Testing]]
- [reference] Integration suite có mạng thật, thay đổi config và tạo file; không chạy như kiểm tra mặc định; FFmpeg/FFprobe portable đã cài và smoke codec cơ bản pass; benchmark một video đã FFprobe pass, còn gate đa video đang mở → [[07 - Testing]]

## Open questions

- [project] Kiểm chứng `allow_p2p` có thực sự vô hiệu hóa rewrite khi checkbox anti-P2P vẫn bật → [[06 - Known Issues and Risks]]
- [project] Kiểm chứng chọn format video-only theo ID có ghép audio như người dùng mong đợi → [[06 - Known Issues and Risks]]
- [project] Bổ sung ma trận test Bilibili theo URL, login, codec, chất lượng và CDN → [[07 - Testing]]
