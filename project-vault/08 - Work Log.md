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
updated: 2026-10-21
---

# Work Log

## 2026-10-21 — Chuẩn bị GitHub Release v1.2.0

- Người dùng yêu cầu đăng release. Xác nhận quyền phát hành và tag hiện có `v1.1.0`; nâng package/lockfile lên `1.2.0` để giữ thứ tự phiên bản và build lại ba gói Windows với metadata đúng.
- Thêm release notes tiếng Việt và liên kết tải trong README/hướng dẫn. Build và cả hai smoke unpacked/portable thực tế pass; UI/API contracts pass, bundle version khớp và tạo SHA256SUMS. Chi tiết tại [[07 - Testing]].
- Chuẩn bị release draft từ commit phiên bản mới trên `nhanh-2`, đính kèm Setup, portable ZIP khuyến nghị, portable EXE và checksum; sẽ kiểm tra digest/size trên GitHub trước khi công khai.

## 2026-10-21 — Đồng bộ GitHub

- Người dùng yêu cầu cập nhật repository; xác nhận remote có quyền push và nhánh hiện tại `nhanh-2` đang chậm hơn upstream 9 commit. Đã tạo commit local rồi rebase thành công lên upstream, giữ Docker/Render, Python workflow và `/health`, không có xung đột và không force-push.
- Rà soát file thay đổi, chỉ đưa source/test/tài liệu/asset cần thiết vào Git; bổ sung ignore cookie và file môi trường. Các gói Windows, runtime và dữ liệu cá nhân giữ ngoài commit.
- Bổ sung `.dockerignore` để build context không mang runtime/build Windows, output và dữ liệu cá nhân; chưa deploy hoặc kiểm chứng cloud.
- Node syntax và UI/server contracts pass sau rebase (151 ID, 116 hook, 14 GET route gồm `/health`); commit không chứa runtime/build/config/cookie hoặc file lớn. Chi tiết tại [[07 - Testing]].
- Đã push commit tính năng `334755f` lên `origin/nhanh-2`; đối chiếu SHA local với remote trùng khớp và working tree sạch. Chưa tạo Release hoặc đưa các gói Windows vào repository.

## 2026-10-21 — Dọn và tổ chức lại thư mục dự án

- Theo yêu cầu người dùng, gom ba kế hoạch vào `docs/plans/`, thêm `docs/README.md`, cập nhật cây thư mục và các liên kết. Giữ các entry point, code, runtime, cấu hình, bộ cài/ZIP và dữ liệu tải; chuyển file tải dở từ root vào `Download/incomplete/`.
- Xóa bản app giải nén trùng sau đối chiếu payload SHA-256, browser profile/fixture kiểm thử, bytecode/log, scratch rỗng, metadata build không dùng và `ffplay.exe` thừa. Dọn ban đầu 31 target, khoảng 1.096,46 MiB; chỉ giữ app nhanh tại `dist/win-unpacked/EveryVideo.exe`.
- Gom ảnh/báo cáo vào `output/reports/windows-desktop-20261021/`; bỏ dữ liệu tạm kiểm thử mới sau khi lưu kết quả. Contract/unit/progress/Python/runtime và full packaged smoke pass, 33 link tương đối hợp lệ, checksum ba gói phát hành không đổi. Chi tiết tại [[07 - Testing]].

## 2026-10-21 — Khắc phục thời gian mở portable

- Người dùng xác nhận portable EXE mở chậm. Tái hiện và đối chiếu NSIS: giải nén lại gần 900 MiB mỗi lượt; đo hai vòng 12,9–15,0 giây, trong khi bản thư mục 0,51–0,57 giây trên host hiện tại.
- Bổ sung portable folder ZIP và lệnh `desktop:zip`/`desktop:benchmark`; sửa hướng dẫn giải nén mỗi lần. ZIP đã giải nén sẵn trong `dist/EveryVideo-Portable-Folder/`, full desktop smoke pass trên bản giải nén và cập nhật SHA256SUMS. Chi tiết tại [[02 - Architecture]] và [[07 - Testing]].
- Giữ nguyên các EXE cũ và engine/UI; khuyến nghị giải nén ZIP toàn bộ một lần rồi chạy app trực tiếp để tránh chi phí giải nén lặp lại.

## 2026-10-21 — Đóng gói Windows x64 và kiểm chứng artifact

- Sau khi người dùng duyệt, thêm Electron shell, backend loopback có cookie/Origin guard, cổng ngẫu nhiên, dữ liệu riêng và cleanup process tree; frontend và luồng web cũ được giữ nguyên.
- Thêm build allowlist cùng runtime Python/core/FFmpeg/aria2/Chromium, icon, notices và hướng dẫn. Xuất NSIS `EveryVideo-0.3.0-Setup-x64.exe` cùng `EveryVideo-0.3.0-Portable-x64.exe`, khoảng 269 MB mỗi bản; SHA-256 ở `dist/SHA256SUMS.txt`.
- Desktop smoke pass extraction, DASH mux/FFprobe, cancel, persistence và đóng app giữa lượt tải; portable thật pass startup/extraction/exit khi PATH chỉ có Windows system folders. Hồi quy contracts/unit/progress/Python/media/UI và audit production pass. Chi tiết tại [[07 - Testing]].
- Hai artifact chưa ký số; chưa kiểm thử cài/gỡ trên VM sạch. Không mang dữ liệu cá nhân vào artifact và không publish. Cập nhật kiến trúc tại [[02 - Architecture]].

## 2026-10-21 — Khảo sát đóng gói EveryVideo thành ứng dụng Windows

- Đọc kiến trúc, package, resolver runtime, browser discovery và đường dẫn config/output; xác nhận chưa có desktop shell/build config.
- Đề xuất Electron + electron-builder, xuất NSIS/portable và kèm runtime; ghi yêu cầu tách dữ liệu ghi, tài nguyên ngoài ASAR, loopback/vòng đời tiến trình và gate Windows sạch tại [[02 - Architecture]].
- Đối chiếu tài liệu chính thức Electron/electron-builder. Chỉ khảo sát và cập nhật bộ nhớ; chưa chọn phương án thay người dùng, sửa logic ứng dụng, cài dependency hoặc tạo bộ cài.

## 2026-10-08 — Làm rõ phương án miễn phí khi máy cá nhân tắt

- Người dùng xác nhận đã có tên miền trên Cloudflare, cần miễn phí và backend độc lập máy cá nhân. Loại local-origin Tunnel khỏi đề xuất chính; chưa chọn nhà cung cấp.
- Đối chiếu OCI Always Free hiện ghi ARM 2 OCPU/12 GB (khác 4 OCPU/24 GB thường thấy trong tài liệu cũ), storage/traffic miễn phí, xác minh thẻ, capacity và idle reclaim. Đề xuất VM chạy toàn bộ app, Cloudflare quản lý DNS; ghi giới hạn tại [[02 - Architecture]].
- Đối chiếu Render Free Docker: 0,1 CPU/512 MB, sleep/disk tạm/quota và suspend khi service-initiated traffic cao; chỉ phù hợp demo tải nhỏ. Không tạo resource, sửa app hoặc kiểm chứng cloud runtime.

## 2026-10-08 — Đối chiếu phương án Cloudflare

- Xác nhận Workers `node:child_process` chỉ là stub; backend native hiện cần Containers hoặc origin riêng qua Tunnel.
- Đề xuất full Cloudflare gồm Workers Static Assets + Worker/Durable Object + Container Linux + R2; ghi yêu cầu persistence/job routing, disk tạm, quyền tải file và giá theo usage trong [[02 - Architecture]]. Chưa chốt triển khai hay tạo resource.
- Xác nhận Quick Tunnel không hỗ trợ SSE; phương án cá nhân cần tunnel quản lý/hostname ổn định và Access, origin tiếp tục online. Chỉ khảo sát tài liệu và cập nhật bộ nhớ, chưa chạy smoke cloud hoặc sửa ứng dụng.

## 2026-10-08 — Khảo sát yêu cầu đưa EveryVideo lên website

- Đọc kiến trúc, runtime, API tải/config, cookie và hành vi SSE; xác nhận cần backend chạy Node/Python/FFmpeg, không chỉ static hosting.
- Ghi khoảng trống trả file về thiết bị người dùng, thao tác Windows, cookie trên máy backend, path confinement, đăng nhập/quyền sở hữu job và quota trong [[02 - Architecture]] và SEC-002 tại [[06 - Known Issues and Risks]].
- Đối chiếu tài liệu chính thức Docker, Playwright và Nginx; đề xuất VPS Linux + Docker Compose + HTTPS + storage persistent. Phạm vi người dùng/hosting chưa được chốt.
- Chỉ khảo sát và cập nhật bộ nhớ; không sửa logic ứng dụng, chạy integration test, tạo hosting hoặc deploy.

## 2026-10-07 — Triển khai universal media discovery

- Triển khai resolver chung HTTP/HTML/JSON/Nuxt/iframe + yt-dlp + Chromium DOM/network có điều kiện, nhiều asset/partial results, copy URL và tải direct/HLS/DASH qua descriptor. Giữ custom Bilibili, preset/queue/API/151 DOM IDs hiện có.
- Cài dependencies/runtime Chromium; Node baseline 22+. Xác minh MIME và đuôi WebP, chia ngân sách giữa audio/ảnh, giữ cookie phiên ở backend, TTL 15 phút, hủy/tên trùng/staging cleanup.
- Kiểm chứng thêm cookie từ redirect và probe lại nguồn từng 403 khi browser có phiên mới; DNS pinning hỗ trợ các địa chỉ IPv4/IPv6 đã xác minh.
- Media fixture + UI tests pass; HLS/DASH FFprobe, tải đồng thời và hủy Python pass; regression contracts/unit/progress và Python 11/11 pass. Live kiểm chứng MDN/Mux/W3Schools/Nuxt NCT; một nguồn SoundHelix HTTP 500 được ghi nhận đúng là lỗi nguồn.
- Cập nhật README song ngữ, kiến trúc, kiểm thử và giới hạn SSRF/coverage tại [[12 - Universal Media Extraction Implementation]]. Không chạy integration suite gốc sửa config; không lưu URL ký số/cookie/HTML vào vault.

## 2026-10-07 — Điều chỉnh phạm vi nghiên cứu theo yêu cầu đa website

- Người dùng làm rõ NhacCuaTui chỉ là ví dụ; mục tiêu là dán URL bất kỳ để khám phá media của trang. Bỏ đề xuất lấy extractor NhacCuaTui làm MVP, giữ kết quả đó ở phần minh họa.
- Rà soát GenericIE: có direct MIME, manifests, embeds/player/JSON-LD nhưng chưa phải asset enumerator tổng quát; tham số browser hiện lấy cookie, chưa có DOM/network discovery worker.
- Cập nhật [[11 - Universal Media Extraction Research]] thành resolver chung HTTP discovery + yt-dlp + browser có điều kiện, schema nhiều asset/partial results, download descriptor và gate theo cơ chế web/nhiều domain. Browser APIs đã đối chiếu tài liệu; chưa chạy browser prototype hoặc ma trận đa website.

## 2026-10-07 — Nghiên cứu trích xuất media đa website và NhacCuaTui

- Core hiện tại chỉ chọn GenericIE cho URL bài mẫu NhacCuaTui và báo Unsupported URL; HTML public có dữ liệu Nuxt của đúng bài Lưu Niên, Jack - J97, duration 194 giây.
- Giải mã đúng song ID; stream/download MP3 128/320 kbps đều HTTP 206, kiểm tra khung MPEG xác nhận bitrate và 44.100 Hz; thumbnail HTTP 200 trả WebP dù URL đuôi jpg. Chỉ đọc Range nhỏ, không tải toàn bài hoặc request lossless VIP.
- Helper `_search_nuxt_json` sẵn có và `process_ie_result(download=False)` pass, format tốt nhất là 320; extractor riêng trong core sẽ dùng chung cho analyze/download. Chưa thêm tính năng ứng dụng hoặc chạy end-to-end API/UI.
- Đề xuất mở rộng yt-dlp + site extractors + generic rồi browser fallback khi cần; không bảo đảm mọi URL. Báo cáo, trade-off và gate triển khai tại [[11 - Universal Media Extraction Research]]; không lưu URL ký số/cookie/HTML gốc vào vault.

## 2026-09-29 — Triển khai nâng cấp UI Graphite Signal 2

- Triển khai hướng preset-first: thêm workflow rail, preset cards sau khi phân tích, trạng thái preset mặc định và lớp chi tiết format cho power user.
- Thu gọn Quick Settings và Advanced bằng disclosure, làm lại empty state/Queue CTA, chuẩn hóa accent và bổ sung bản dịch vi/en/zh/ja.
- Giữ nguyên 151 HTML IDs, 116 JS hooks, API contract, dark/light, responsive, keyboard focus và reduced-motion behavior.
- Verification pass: syntax checks, UI/server contracts, download acceleration unit, download progress và browser smoke test desktop/mobile/theme/i18n/Queue.

## 2026-09-29 — Nghiên cứu hướng nâng cấp UI/UX

- Chỉ audit, chưa chỉnh sửa mã nguồn hoặc UI.
- Quan sát EveryVideo ở desktop 1440×900, mobile 390×844, dark/light và các tab Studio, Hàng Chờ, Nâng Cao, Cài Đặt.
- Xác nhận Graphite Signal và bố cục inspector + explorer là nền tảng tốt; điểm cần giải quyết là mật độ option kỹ thuật, bảng format nhiều cột, Advanced dài và thứ bậc CTA.
- Đề xuất hướng **Graphite Signal 2: Preset-first Media Workstation**; chi tiết tại [[10 - UI UX Upgrade Research]].
- Luồng phân tích URL công khai chưa hiển thị metadata trong phiên này vì runtime local bị sandbox chặn kết nối mạng `WinError 10013`; không thay đổi kết luận về hướng UI.

## 2026-09-29 — Kiểm chứng tải video X/Twitter

- Kiểm tra URL X công khai `historyinmemes/status/1790637656616943991` bằng lõi vendored `TwitterIE` và adapter Express của EveryVideo.
- `/api/info` nhận diện thành công và trả 9 format; `/api/download` với `bv*+ba/b` tạo MP4 hoàn chỉnh.
- FFprobe pass: H.264 `728x720`, AAC stereo, duration `15.557370` giây.
- Rà soát UI cho thấy payload X vẫn có resolution (`272x270`, `364x360`, `728x720`) và frontend đã có fallback từ `width`/`height`; hiện chưa có bằng chứng extractor làm mất resolution.
- Không cần sửa mã. Contract, unit, progress và Python tests đều pass sau kiểm chứng.

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
