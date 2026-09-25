---
title: Work Log
aliases:
  - Nhật ký công việc
tags:
  - project/everyvideo
  - log
type: reference
status: active
created: 2026-09-09
updated: 2026-09-25
---

# Work Log

## 2026-09-25 — Sửa thanh loading khi tải bằng aria2

- Tái hiện lỗi: aria2 phát progress dạng `[#... 25% ...]` qua `stdout` với `\r`, còn frontend chỉ parse dòng yt-dlp `[download] ...%`, nên thanh loading đứng yên trong lúc file vẫn tải.
- Thêm `lib/download-progress.js` để buffer dữ liệu theo chunk, chuẩn hóa CR/LF và parse aria2 progress; backend gửi SSE `progress`, frontend cập nhật phần trăm, tốc độ, ETA và dung lượng.
- Thêm `tests/download_progress_test.js` và script `npm run test:progress`.
- Verification pass: syntax checks, progress test, UI/server contracts và download acceleration unit test.

## 2026-09-20 — Tái hiện throttle ~200 MiB và đổi default sang Huawei Overseas

- Tái hiện đúng triệu chứng trên `BV1D2hPzxEWe`, format `30080`, tổng khoảng 656 MiB: `mirrorcosov + aria2 x8` chạy ~59–77 MiB/s lúc đầu, còn ~72 MiB/s ở 203 MiB rồi rơi dần xuống ~600 KiB/s tại 209 MiB; `CN:8` vẫn giữ, nên không phải aria2 mất connection hay bottleneck disk/CPU.
- `--lowest-speed-limit=256K` không sửa được: aria2 đóng dần connection `CN:8 → 1` rồi lỗi code 5. Restart cùng CDN chỉ tạo burst ngắn rồi lại về ~0.6–0.9 MiB/s. Đổi sang Akamai cũng không phục hồi bền vững.
- Resume cùng file bằng `upos-sz-mirrorhwo1.bilivideo.com` phục hồi rõ: từ phần file >347 MiB tăng lên 8.5–29 MiB/s và hoàn tất stream 656 MiB. Đây là bằng chứng local cho throttling/token bucket theo CDN/edge và là lý do đổi default local sang `mirrorhwo1`.
- Runtime/UI/server fallback được đổi thành `Auto + aria2 x8 + mirrorhwo1`, Anti-P2P bật; `fastest`, `mirrorcosov`, `mirroraliov`, Akamai và các lựa chọn khác vẫn giữ để rollback/A-B.
- Phát hiện `/api/cancel-download` trên Windows có thể kill Python nhưng để aria2 child chạy ngầm; sửa route dùng `taskkill /t /f` theo PID để dừng toàn process tree. Ba aria2 orphan từ probe đã được dừng trước khi benchmark tiếp.
- Smoke sau restart: `mirrorhwo1 + aria2 x8` từ đầu stream vẫn đạt ~23 MiB/s ở 247 MiB; gọi `/api/cancel-download` kết thúc SSE và không còn process `aria2c`, xác nhận cả default CDN mới lẫn process-tree cancel hoạt động.

## 2026-09-20 — Chẩn đoán Bilibili chậm và sửa URL CDN thủ công

- Xác nhận runtime khi báo chậm: `fastest + aria2c x8`, aria2 1.37.0 sẵn sàng. Live benchmark `aria2 x8 + auto CDN` ~0.653 MiB/s rồi code 29; x4 ~0.658 MiB/s và cùng lỗi.
- Cùng video/format, `fastest + aria2 x8` pass FFprobe ở 36.16 MiB/s video / 12.12 MiB/s audio và chọn `mirrorcosov`; manual `mirrorcosov` trước sửa chỉ 4.43 MiB/s video.
- Tìm thấy manual UPOS đang rewrite hostname của base URL. Sửa extractor để ưu tiên exact base/backup candidate cùng host, chỉ rewrite khi Bilibili không trả candidate đó; thêm 2 unit test regression.
- Benchmark hậu sửa: `mirrorcosov + aria2 x8` trên cùng video/format đạt `31.77 MiB/s` và pass, tăng mạnh so với `4.43 MiB/s` trước sửa.
- Nới regex diagnostic CDN để nhận log có prefix và vẫn chỉ phát host, không phát signed URL.
- Đổi persistent engine từ explicit `aria2c` sang `auto` để có fallback native khi aria2 lỗi; giữ CDN `fastest` theo benchmark live hiện tại.
- Verification: Python Bilibili tests 11/11 pass; UI/server contracts pass; `node --check server.js` và `git diff --check` pass. Resolver manual `mirrorcosov` sau sửa trả `os=cosovbv` cho video/audio.

## 2026-09-09 — Benchmark ma trận và cập nhật default

- Chạy `npm run benchmark:bilibili` trên `BV1opg36pEPf`, format cố định `30080+30280`, 21 case: engine/connection, native fragment/chunk, toàn bộ CDN candidate và anti-P2P/geo toggle. Mỗi case có file riêng và FFprobe.
- Vòng đầu có 11/21 pass; lặp 7 ứng viên đầu bảng thêm 2 vòng. `mirrorcosov` pass 3/3, median video 28.35 MiB/s; Akamai pass 3/3, median 26.65; aria2 x8 + auto pass 3/3, median 25.19; aria2 x16 + auto pass 3/3, median 24.86. `fastest` pass 2/3, median các lượt pass 20.48; native tối đa 0.316 MiB/s ở chunk 100M.
- Nhiều case fail HTTP 412 sau chuỗi request dài; đây là rate-limit/anti-bot upstream, không phải FFprobe hoặc downloader corruption. Không dùng case lỗi để xếp hạng tốc độ.
- Default source/UI/runtime được đổi thành Auto + aria2 x8 + `upos-sz-mirrorcosov.bilivideo.com`, Anti-P2P và Geo Bypass bật; vẫn giữ `fastest`, `auto`, Native và 4/16 để rollback/A-B.
- Folder kết quả: `Download/Bilibili-Benchmark-BV1opg36pEPf-20260909T042639Z/`, gồm `benchmark-report.json`, media từng case và `repeats/`.

## 2026-09-09 — Rà soát default và kiểm tra cuối

- Đồng bộ UI với quyết định benchmark: selector CDN chọn `mirrorcosov`, engine Auto, 8 connections; Anti-P2P và Geo Bypass bật sẵn. Các lựa chọn `auto`, `fastest`, Native, 4 và 16 vẫn giữ nguyên để A/B hoặc rollback.
- Kiểm tra cuối pass: Node unit, UI/server contract, Python 9/9, toàn bộ `node --check` và `git diff --check`. Báo cáo gồm 35 lượt (23 pass); mọi lượt pass có media và FFprobe hợp lệ.
- Server benchmark đã dừng; không xóa media hoặc report trong thư mục benchmark.

## 2026-09-09 — End-to-end test `BV1opg36pEPf`

- API ban đầu nhận HTTP 412 từ Bilibili; chạy extractor công khai với browser `Referer` và User-Agent chuẩn thành công. Đã sửa server để chỉ với URL Bilibili thêm `Referer: https://www.bilibili.com/` và User-Agent trình duyệt cho `/api/info`/`/api/download`.
- Analyze thành công: title `悬疑惊悚怪物剧：《蟲垩纪》 第一集【AI全民制作人】`, duration `240.746` giây, 15 formats; các video AVC/HEVC/AV1 và audio AAC được liệt kê.
- `fastest + aria2 x8`, format `30080+30280`: host được chọn `upos-sz-mirrorcosov.bilivideo.com`, video 27.82 MiB ở 12.15 MiB/s, audio 5.11 MiB ở 3.84 MiB/s; file ghép 34,605,672 bytes.
- `auto + aria2 x8` cùng format: video hiển thị 24.29 MiB/s, audio 8.02 MiB/s; FFprobe pass với duration `240.746667`, H.264 1920×822 và AAC stereo.
- Native + mirroraliov đối chứng bị HTTP 412 sau nhiều request liên tiếp; không ghi tốc độ lỗi thành baseline. Không lưu signed URL/cookie vào vault.

## 2026-09-09 — Cài runtime portable và xác minh tải Bilibili thật

- Chocolatey không thể cài system-wide vì phiên terminal không có quyền Administrator; chuyển sang runtime portable trong `.runtime/` để không cần sửa PATH hay cài đặt toàn máy.
- Tải và kiểm tra hash theo nguồn chính thức: Python embeddable 3.14.7 x64 và aria2 1.37.0 x64; cả hai thư mục bị gitignore, không đưa binary vào repository.
- `setup.js`, `server.js` và resolver aria2 tự nhận diện runtime cục bộ. `/api/config` trả `hasAria2c=true`.
- `npm run test:python` pass 9/9; Node unit/contract và syntax checks vẫn pass.
- Smoke download Bilibili công khai bằng format `100109`, explicit aria2c 4 connections: file 15.74 MiB hoàn tất, tốc độ hiển thị 12.11 MiB/s. Chỉ ghi metadata rút gọn; không ghi signed URL, cookie, IP hay đường dẫn cá nhân.
- Cài thêm FFmpeg Essentials 9.0.1 portable từ nguồn build Windows được FFmpeg liên kết; hash SHA-256 đã kiểm tra trước khi giải nén vào `.runtime/ffmpeg/`.
- `/api/config` sau khi khởi động lại trả `hasLocalFfmpeg=true`; synthetic MP4 smoke qua FFprobe pass với H.264 video/AAC audio và duration 1 giây. Chưa đạt benchmark gate 3 video × 3 lần.

## 2026-09-09 — Lập kế hoạch phát triển tối ưu tốc độ Bilibili

- Tạo `bilibili-speed-optimization-plan.md` ở project root với contract config/query, kiến trúc đích, chín task và tiêu chí hoàn thành.
- Chọn mặc định đề xuất: aria2 portable/env/PATH, engine Auto có native fallback, 8 connections và CDN fastest opt-in.
- Kế hoạch giữ yt-dlp làm extractor/mux, aria2 chỉ cho HTTP(S) direct và manifest tiếp tục dùng native.
- Fastest CDN chỉ probe exact base/backup URL do Bilibili trả về; không rewrite mù sang host ngoài candidate list.
- Đặt performance gate định lượng trước khi thay đổi default release.

## 2026-09-09 — Nghiên cứu tối ưu tốc độ tải Bilibili

- Xác nhận `-N 8` chỉ điều khiển fragment worker; Bilibili VOD `.m4s` direct thường vẫn dùng một HTTP connection.
- Xác nhận `--http-chunk-size 100M` tạo Range request tuần tự, không phải đa luồng hay giới hạn tốc độ 100 MB/s.
- Xác nhận custom UPOS hiện chọn/rewrite một URL mà không benchmark throughput và không giữ backup mirror cho downloader.
- Lõi yt-dlp đã có wrapper aria2 HTTP(S), nhưng backend chưa chọn external downloader và môi trường hiện tại chưa có `aria2c`.
- Đề xuất P0: telemetry đúng đơn vị, aria2 multi-range tùy chọn và fallback native; P1: Range probe base/backup CDN; P2: custom Range engine chỉ khi cần.
- Ghi báo cáo, ma trận benchmark và đánh giá downloader thay thế tại [[09 - Bilibili Download Speed Research]].

## 2026-09-09 — Triển khai aria2 tùy chọn và CDN fastest

- Thêm `lib/download-acceleration.js`: validate engine/connections, resolve aria2 từ `EVERYVIDEO_ARIA2C`, `bin/` hoặc PATH, profile x4/x8/x16 và giữ manifest native.
- Nối `/api/config` và `/api/download` với engine Auto/Native/aria2c, diagnostic SSE, bỏ HTTP chunk khi aria2 active và fallback native một lần trong Auto.
- Thêm control UI/i18n cho engine, connections, capability status và CDN `fastest`; queue truyền cùng cấu hình qua analyze/download.
- Refactor Bilibili extractor: candidate exact base/backup, P2P hostname boundary, probe tối đa 4 URL × 2 MiB/4 giây; probe lỗi fallback auto.
- Thêm Node unit/contract test và Python test không mạng. Contract + Node unit + Node syntax checks pass; Python test bị block vì máy chưa có Python runtime, aria2 chưa có nên chưa benchmark tải thật.
- Smoke cuối: `/api/config` báo `hasAria2c=false`; explicit aria2 thiếu executable trả SSE `error` + `done code -2`; không còn server test chạy nền sau kiểm chứng.

## 2026-09-09 — Khởi tạo bộ nhớ dự án

- Đọc cấu trúc repository, README, tài liệu kiến trúc/release, backend, frontend, tests và extractor Bilibili.
- Xác nhận kiến trúc local-first: frontend thuần → Express → Python `yt_dlp` vendored → downloader/FFmpeg, với SSE cho tiến độ.
- Xác nhận trọng tâm Bilibili đang dùng custom anti-P2P/UPOS trong core, không có direct Node resolver.
- Chạy `npm run test:contracts`: UI và server contracts đều pass.
- Không chạy integration test và không tải Bilibili ngoài mạng trong phiên này.
- Ghi nhận các câu hỏi mở BILI-001 đến BILI-004, TEST-001, SEC-001 và OPS-001 trong [[06 - Known Issues and Risks]].
- Tạo Obsidian vault `project-vault/` và chỉ dẫn `AGENTS.md` để các phiên sau đọc/cập nhật bộ nhớ.

## Quy ước cập nhật

Thêm mục mới ở trên cùng theo mẫu [[Templates/Work Log Entry]]. Chỉ ghi kết quả có giá trị lâu dài; debug tạm thời không cần đưa vào đây.
