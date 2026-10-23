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
updated: 2026-10-23
---

# Work Log

## 2026-10-23 — Gom toàn bộ thay đổi để đồng bộ GitHub

- Theo yêu cầu người dùng, gom UI Velvet Silk, tab nguồn phụ, tự ghép audio, kiểm tra cập nhật, test/tài liệu/vault và landing page vào nhánh `nhanh-2`. Landing page lưu bằng file thường trong repo chính, giữ Git riêng local; bổ sung ngoại lệ ignore cho PNG nguồn/UI cần thiết.
- Fetch xác nhận baseline đồng bộ remote; contracts 161 IDs/123 hooks/15 routes, acceleration/progress, update checker 6/6 và syntax 16 file JavaScript pass. Rà file ứng viên không thấy credential theo mẫu; tiếp tục loại runtime/config/cookie/media/build theo ignore. Xem [[07 - Testing]] và [[02 - Architecture]].

## 2026-10-22 — Mở rộng đa ngôn ngữ: Thêm tiếng Nhật và hoàn thiện tiếng Anh

- Bổ sung trọn vẹn bản tiếng Nhật (`ja`) và hoàn thiện tiếng Anh (`en`) cho landing page `sites/everyvideo-landing/`.
- Cập nhật `src/data.ts`, `src/storyCopy.ts`, `src/StudioPreview.tsx`, `src/LandingStory.tsx`, `src/App.tsx`, `src/styles.css`: dịch toàn bộ nội dung, aria-labels, alt images, tên file mẫu và tài liệu.
- Bổ sung cơ chế lưu trữ ngôn ngữ: nhận diện qua URL parameter (`?lang=ja|en|vi`) và `localStorage`, fallback mặc định tiếng Việt (`vi`).
- Bổ sung font fallback chuẩn Nhật (Hiragino Sans, Yu Gothic, Meiryo, Noto Sans JP).
- Build TypeScript/Vite và lint pass 100%. Suite Playwright chạy qua 9 viewport, audit Axe WCAG 2/2.1/2.2 A/AA đạt 0 violation cho cả tiếng Việt, tiếng Anh và tiếng Nhật.
- Triển khai Cloudflare Workers thành công (`version 047e3920-464a-4af7-9d05-dded66e5ca7a`), remote Playwright QA trên production https://evd.tyr.io.vn/ đạt 100% pass với 0 lỗi. Chi tiết tại [[10 - UI UX Upgrade Research]].

## 2026-10-21 — Tạo ba ảnh landing page EveryVideo

- Đọc nguồn và design contract rồi tạo ba concept bằng `image_gen`: Graphite Studio, Paper Editorial, Cinema Library. Skill được yêu cầu `imagegen-frontend-web` chưa có trong môi trường; đã thông báo dùng workflow `imagegen` có sẵn.
- Đã xem cả ba kết quả và lưu PNG cùng brief/prompt tại `output/design/landingpage-concepts-20261021/`. Chỉ tạo ảnh tham khảo, chưa sửa giao diện hoặc chọn thiết kế mới. Chi tiết tại [[10 - UI UX Upgrade Research]].

## 2026-10-21 — Phát hành GitHub Release v1.2.0

- Người dùng yêu cầu đăng release. Xác nhận quyền phát hành và tag hiện có `v1.1.0`; nâng package/lockfile lên `1.2.0` để giữ thứ tự phiên bản và build lại ba gói Windows với metadata đúng.
- Thêm release notes tiếng Việt và liên kết tải trong README/hướng dẫn. Build và cả hai smoke unpacked/portable thực tế pass; UI/API contracts pass, bundle version khớp và tạo SHA256SUMS. Chi tiết tại [[07 - Testing]].
- Tạo release draft từ commit `3885109` trên `nhanh-2`, upload Setup, portable ZIP khuyến nghị, portable EXE và SHA256SUMS. Xác nhận tên/kích thước/trạng thái và toàn bộ digest SHA-256 GitHub khớp local rồi công khai, đặt Latest và xác minh tag đúng commit.
- [Release v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0) có đủ bốn asset công khai; giữ các release/tag trước đó. Evidence được lưu ở `output/reports/release-v1.2.0/`, profile/fixture kiểm thử tạm đã dọn. Không ký số hoặc deploy cloud trong phiên này.

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

## 2026-10-21 — Triển khai landing page premium EveryVideo

- Tạo ứng dụng marketing React/TypeScript/Tailwind riêng ở `sites/everyvideo-landing/`, theo hướng editorial “Keep what moves you”, có design system, ảnh WebP responsive, motion nhẹ và screenshot giao diện app thật với dữ liệu mẫu.
- CTA nối tới installer/portable-folder ZIP v1.2.0 đã kiểm chứng qua GitHub; product tabs, collection filters, menu, FAQ, focus/keyboard/reduced-motion hoàn chỉnh. Không sửa downloader/API hoặc config runtime và không bịa testimonial.
- Build, TypeScript, lint, dependency audit pass; QA production sáu viewport không overflow/runtime error/ảnh lỗi; axe trang và dialog 0 violation. Evidence `output/playwright/everyvideo-landing/`; chi tiết tại [[10 - UI UX Upgrade Research]]. Source và gói static đã chuẩn bị cho private hosted preview.
- Private hosted preview đã deploy thành công tại https://everyvideo-studio.tartmite13.chatgpt.site ; chỉ landing page tĩnh, không host backend extraction hoặc đổi audience.

## 2026-10-21 — Dựng lại landing page theo Cinema Library

- Đọc source app/marketing và dựng lại `sites/everyvideo-landing/` theo ảnh `03-cinema-library.png`: hero núi hồ hoàng hôn, chữ Việt đậm, CTA coral, Studio nổi, ba loại media, dải nền tảng và footer graphite.
- Studio preview tương tác có nhãn minh họa, queue/format/settings hoạt động local; hướng dẫn và nút tải trỏ bản Windows thật. Có VI/EN, sáng/tối, keyboard và reduced-motion. Không đổi backend/config của app thật.
- Build/TypeScript/lint pass; QA production bảy viewport không overflow/ảnh lỗi/runtime error; axe dark/light/dialog 0 violation. Screenshot/report ở `output/playwright/everyvideo-cinema/`; source đã đồng bộ và đóng gói để cập nhật Site riêng tư. Chi tiết tại [[10 - UI UX Upgrade Research]].
- Bản Cinema Library đã deploy thành công tại https://everyvideo-studio.tartmite13.chatgpt.site , giữ riêng tư. Đã mở trang triển khai và xác nhận nội dung/Studio mới; bản source marketing sạch sau khi đồng bộ.

## 2026-10-21 — Công khai EveryVideo trên evd.tyr.io.vn

- Theo yêu cầu Cloudflare và xác nhận public, mở bản Sites công khai và triển khai landing page trực tiếp lên Cloudflare Workers Static Assets, Worker `everyvideo-landing`, custom domain https://evd.tyr.io.vn/ . Cloudflare tạo DNS/HTTPS thành công; trang không phụ thuộc máy cá nhân.
- Thêm Wrangler khóa phiên bản, cấu hình deploy/build, canonical/OG và sitemap/robots theo tên miền mới. Giữ backend/Windows app hiện tại. Mapping custom hostname Sites ban đầu còn pending, không dùng DNS production; auto-review từ chối cleanup mapping nên giữ nguyên, triển khai Worker hoàn tất an toàn.
- Build/TypeScript/lint/audit/dry-run pass. Xác nhận production 100% traffic, HTTPS/HTTP 200 và trình duyệt sạch không đăng nhập. Remote smoke desktop/mobile, download dialog/link, assets, sitemap/robots và 404 pass; screenshot/report ở `output/playwright/everyvideo-cloudflare/`. Cập nhật [[02 - Architecture]], [[10 - UI UX Upgrade Research]] và index.

## 2026-10-22 — Landing page giàu nội dung và motion

- Mở rộng Cinema Library: workflow tương tác, control showcase, tình huống sử dụng, format explorer, bảy FAQ và CTA/footer; thêm parallax, reading progress, sticky navigation, panel transition, spotlight và hover, có reduced-motion. Giữ VI/EN, dark/light và Studio minh họa; không đổi downloader.
- Build/TypeScript/lint/audit/dry-run pass. QA local và production chín viewport, tương tác/bàn phím và motion pass; axe sáu trạng thái 0 violation, không overflow/runtime error/request lỗi/ảnh lỗi. Đã xem screenshot mobile production và xác nhận version `9a6b98fd-94a9-405b-b29a-22ded134e3fe` nhận 100% traffic tại https://evd.tyr.io.vn/ . Chi tiết/evidence ở [[10 - UI UX Upgrade Research]].

## 2026-10-22 — Tái deploy theo yêu cầu

- Chạy lại build và deploy strict lên Cloudflare, version `8f105fb0-1848-4949-a679-772f0da9644f`, tại https://evd.tyr.io.vn/ . Asset giữ nguyên bản đã QA; HTML/JS/CSS online trả HTTP 200 và khớp từng byte với build local. Chi tiết tại [[10 - UI UX Upgrade Research]].

## 2026-10-22 — Đưa chọn ngôn ngữ và Dark/Light mode lên đầu trang

- Chuyển cụm điều khiển ngôn ngữ (VI/EN/JA) và nút chuyển đổi giao diện sáng/tối (Sun/Moon icon button) từ footer lên thanh header cố định (`site-header`) ở đầu trang.
- Thiết kế `.header-controls` đồng bộ thẩm mỹ với header: hiệu ứng kính mờ (glassmorphism), viền tinh tế, hover mượt mà và vòng focus accessibility (`focus-visible`) chuẩn WCAG AA. Tự động chuyển đổi màu tương phản thích ứng khi cuộn header qua hero ở cả 2 theme sáng và tối.
- Xử lý responsive hoàn hảo từ 320px đến 1920px: desktop đặt cạnh navigation và download button; mobile tự động căn phải cạnh hamburger menu, ẩn nút download phụ trong header trên màn hình nhỏ (<= 580px) để chống tràn ngang (0 overflow).
- Dọn dẹp footer để tránh trùng lặp điều khiển và giữ layout tinh gọn.
- Build, lint và suite Playwright tự động (9 viewports, 7 lượt kiểm tra Axe WCAG AA) pass 100%. Đã deploy lên Cloudflare Workers (Version `f7dbe47a-902e-4135-9477-5d091c38a3fb`), remote QA trực tiếp trên https://evd.tyr.io.vn/ pass 100%. Chi tiết tại [[10 - UI UX Upgrade Research]].

## 2026-10-23 — Kiểm tra phương án chỉ giữ app Windows

- Xác nhận Electron dùng chung frontend `public/` qua Express; gói `dist/win-unpacked/` chứa tài nguyên riêng và không cần source bên ngoài để chạy. Ghi rõ ranh giới xóa source so với bỏ frontend bên trong gói tại [[02 - Architecture]].
- Đo dung lượng các nhóm file: frontend chỉ 0,35 MiB; bản Windows khoảng 898 MiB; dependencies/runtime/source landing page bên ngoài chiếm dung lượng đáng kể hơn. Chỉ đọc mã và thống kê file, chưa xóa dữ liệu, sửa app hay gỡ website.

## 2026-10-23 — Dọn dung lượng ngoài app Windows

- Theo yêu cầu người dùng, xóa 69 target/27.848 file/1.407,50 MiB gồm dependency phát triển, native runtime trùng, build/cache website, archive và ảnh QA cũ, metadata builder dư. Giữ toàn bộ gói Windows, mã nguồn, Git, config, media và báo cáo gọn; không thay đổi website đã deploy.
- Full desktop smoke pass khi các đường dẫn development đã được tách khỏi vị trí cũ: UI, runtime tích hợp, phân tích/tải/ghép fixture có hình+tiếng, cancel, persistence và process cleanup. 1.469 payload hash không đổi, chỉ log Chromium append. Dọn dữ liệu test/staging và lưu evidence tại `output/reports/windows-only-cleanup-20261023/`.
- Cập nhật [[02 - Architecture]], [[07 - Testing]], index và `docs/WINDOWS_DESKTOP.md` để lần phát triển/build sau khôi phục dependency/native runtime cần thiết; app đã build chạy trực tiếp như cũ.

## 2026-10-23 — Đưa nguồn media vào tab phụ, ưu tiên bảng định dạng

- Theo hai ảnh người dùng cung cấp, thêm hai tab con Studio: bảng định dạng mặc định, nguồn media phụ có số lượng; giữ filter/copy/download và mở nguồn khi không có metadata native. Bảng mặc định thay preset, giữ preset qua view switch; hỗ trợ keyboard/ARIA/bốn ngôn ngữ và giữ trạng thái giữa tab.
- Cập nhật source và trực tiếp gói Windows local; so toàn bộ nội dung ASAR chỉ đúng năm file UI đổi. Không thay runtime, website hoặc release công khai. Cập nhật design contract/tài liệu/vault và UI contract thành 155 ID/116 hook.
- Syntax/contracts, UI suite source + ASAR và full Windows smoke đều pass. Ảnh/report tại `output/reports/workspace-tabs-20261023/`; dọn công cụ đóng gói và dữ liệu test sau kiểm chứng.

## 2026-10-23 — Tự tải/ghép video có audio

- Nối helper ghép audio vào chọn exact video ID và queue; nguồn media tự đề xuất audio cùng entry, có chọn thủ công/tải riêng. Backend verify hai descriptor và FFmpeg stream-copy ra MP4/WebM/MKV, không báo thành công khi audio bị từ chối.
- Cập nhật source và app Windows local (tám file ASAR + một helper ngoài ASAR), không đổi runtime hoặc release công khai. Media fixture/FFprobe, UI source + ASAR, full desktop exact-ID merge/cancel/persistence/shutdown, contracts/unit/progress và Python 11/11 pass.
- Cập nhật quyết định, issue BILI-002, kiến trúc/implementation/testing và index. Evidence tại `output/reports/auto-audio-merge-20261023/`; dọn công cụ và dữ liệu test riêng sau kiểm chứng.

## 2026-10-23 — Kiểm tra cập nhật EveryVideo từ GitHub

- Thêm mục Cài Đặt hiển thị phiên bản đang chạy, kiểm tra latest stable release trên GitHub và link tải khi có bản mới. So SemVer, timeout/cache/gộp request và thông báo lỗi rõ; hỗ trợ bốn ngôn ngữ, keyboard, dark/light và màn hình hẹp.
- Cập nhật source và bảy file ASAR của app Windows local, không đổi runtime hoặc bộ cài/release công khai. Unit 6/6, syntax/contracts 159 ID/121 hook/15 GET route, UI source + packaged, real GitHub v1.2.0/cache/session isolation và full desktop download/FFprobe smoke pass.
- Cập nhật [[02 - Architecture]], [[07 - Testing]], index/design contract và hướng dẫn Windows. Media UI regression pass; dọn công cụ/cache/profile/fixture riêng sau kiểm chứng. Evidence tại `output/reports/github-update-check-20261023/`.

## 2026-10-23 — Thiết kế Phong cách Tối giản Có chiều sâu "VELVET SILK" & Prototype

- Theo phản hồi cần tối giản và giảm rối mắt, thiết kế lại hệ ngôn ngữ **"VELVET SILK" (Atmospheric Minimalism)** cho ứng dụng Windows (`public/index.html`, `public/style.css`, `public/graphite-signal.css`, `public/script.js`).
- Tự pha chế 4 bảng màu khoáng tự nhiên dịu mắt: **Celadon Matcha** (Đen Rêu Nhung `#0B0F0E` + Xanh Ngọc Bích Dịu `#52DBA3` + Cam Đất Ấm `#F2A365`), **Dusk Peach** (Tím Hoàng Hôn + Hồng Đào `#FA897B`), **Nordic Fjord** (Xanh Bắc Âu + Sương Băng `#63CBE8`), và **Ceramic Light** (Gốm Trắng Ấm `#F3F0EA` + Xanh Xô Thơm `#1D7D59`).
- Lược bỏ 70% đường viền và chi tiết rườm rà: gộp Header + Capsule Omnibar + Navigation lên 1 hàng thoáng, thay bảng kẻ ô bằng danh sách dải thẻ mềm 5 thông tin và thanh Floating Bottom Bar gọn nhẹ.
- Bổ sung hệ thống **Typography Độc bản** (hỗ trợ 100% Tiếng Việt, không dùng font đại trà): kết hợp `Fraunces` (Variable Soft-Serif tạo điểm nhấn nghiêng nghệ thuật), `Bricolage Grotesque` (Grotesque có ink-traps cá tính), `Newsreader`, `Unbounded` và `Spline Sans Mono` / `Chivo Mono`. Bảo toàn 100% hợp đồng giao diện (`159 HTML IDs` và `121 JS hooks`). Chi tiết tại [[10 - UI UX Upgrade Research]].

## 2026-10-23 — Triển khai Toàn diện "VELVET SILK" & Đa Bảng Màu / Đa Font vào Cài Đặt

- Triển khai toàn bộ thiết kế **Velvet Silk (Atmospheric Minimalism)** vào codebase ứng dụng Windows:
  - Thêm 4 tùy chọn Bảng màu (`settingsPaletteSelect`) và 4 tùy chọn Font (`settingsFontSelect`) vào tab Cài đặt trong `public/index.html`.
  - Nâng cấp `public/script.js` để tự động khởi tạo, lưu `localStorage` và chuyển đổi trực tiếp giao diện thời gian thực.
  - Cập nhật từ điển `public/i18n.js` cho 4 ngôn ngữ (VI, EN, ZH, JA).
  - Tích hợp toàn bộ hệ biến CSS, hiệu ứng nền mờ lụa, hạt phim 2.5% và kỹ thuật Mixed-Voice Editorial vào `public/graphite-signal.css`.
  - Đồng bộ trực tiếp 4 file giao diện vào `dist/win-unpacked/resources/app.asar`.
  - Bộ kiểm thử hợp đồng giao diện `tests/ui_contract_test.js` (161 IDs, 123 hooks) và kiểm thử server `tests/server_contract_test.js` pass 100%. Chi tiết tại [[10 - UI UX Upgrade Research]].
