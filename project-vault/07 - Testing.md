---
title: Testing
aliases:
  - Kiểm thử
  - Verification
tags:
  - project/everyvideo
  - testing
type: reference
status: active
created: 2026-09-09
updated: 2026-10-23
related:
  - "[[03 - Bilibili Download Flow]]"
  - "[[06 - Known Issues and Risks]]"
---

# Testing

## Verification ngày 2026-10-23 — Đồng bộ GitHub

- Fetch và đối chiếu baseline với `origin/nhanh-2`: không có commit lệch trước khi gom thay đổi. UI/server contracts pass: **161 IDs, 123 hooks, 15 GET routes**; acceleration/progress pass; update checker **6/6** pass. Syntax của 16 JavaScript source/test thay đổi hoặc mới pass; `git diff --check` pass.
- Rà 89 file ứng viên gồm landing page: không phát hiện private key, GitHub token, AWS key hoặc credential assignment theo mẫu kiểm tra. Landing page được đưa vào repo chính bằng file thường, giữ ảnh cần thiết và không đưa metadata Git/dependency/build/runtime/config/cookie/media tải về.
- Không chạy lại build/desktop/browser integration trong phiên chỉ đồng bộ; dependency phát triển đã được dọn theo yêu cầu trước đó. Bằng chứng smoke/UI/FFprobe trước đó được giữ ở các mục kiểm chứng tương ứng.

## Verification ngày 2026-10-23 — Kiểm tra cập nhật GitHub

- `tests/update_checker_test.js`: **6/6** pass, gồm SemVer nhiều chữ số/prerelease/build metadata, available/latest/ahead, loại draft/prerelease/tag sai, lỗi HTTP/network/JSON, timeout response body, gộp request đồng thời/cache hết hạn/retry lỗi. Syntax và contracts pass **159 HTML IDs, 121 JS hooks, 15 GET routes**; acceleration/progress regression pass.
- `tests/update_ui_test.js` pass trên source và UI khớp ASAR: không tự gọi khi mở settings, busy/disable, bốn ngôn ngữ giữ kết quả, link đúng release, latest/ahead/no-release và lỗi, chặn link không an toàn, label plain text, dark/light 390px không overflow và target 44px.
- App Windows thật với dữ liệu riêng gọi GitHub REST API HTTP 200: latest `v1.2.0`, UI báo đang mới nhất, lần gọi tiếp dùng cache; API không cookie trả 403 và renderer không lỗi. Chỉ kiểm tra release metadata, không tải/cài bản mới.
- Full desktop smoke pass sau cập nhật: isolation/runtime Node 24.22.0/Python/aria2/Chromium, extraction fixture, exact-ID/DASH audio merge có FFprobe, cancel, persistence và shutdown cây tiến trình. Không dùng config/download người dùng.
- Đối chiếu nội dung ASAR: **1.745 entry**, đúng bảy file thay đổi/thêm, không xóa entry và source khớp gói. Media UI regression tiếp tục pass sau tích hợp. Evidence/ảnh/manifest tại `output/reports/github-update-check-20261023/`; công cụ đóng gói/cache/profile/fixture tạm đã dọn, dependency/runtime phát triển gốc không được khôi phục.

## Verification ngày 2026-10-23 — Tự ghép video/audio

- Syntax JavaScript/Python pass; UI/server contracts **155 IDs, 117 hooks, 14 GET routes**; acceleration/progress và Python **11/11** pass. Dùng runtime/dependency đóng gói qua công cụ tạm, không khôi phục root `node_modules/` hay `.runtime/`.
- Media parser/resolver integration pass: chỉ đề xuất audio cùng entry, bitrate/container preference, raw video byte equality, ghép tự động MP4 H.264+AAC, ghép thủ công MKV H.264+Opus, HLS + audio riêng; FFprobe xác nhận codec/90p và đủ hai stream. Header riêng từng nguồn được kiểm chứng (Origin video bắt buộc, audio từ chối nếu nhận Origin đó), cả source và helper đóng gói pass. Audio ID sai bị từ chối; audio 403 không tạo kết quả thành công im lặng. Regression direct/preview/refresh/session/collision/cancel/HLS/DASH tiếp tục pass.
- UI source và UI staging khớp ASAR pass: tự ghép/chọn ID/tắt ghép, combo/audio giữ nguyên, queue giữ lựa chọn audio, source selector gửi đúng descriptor, đổi ngôn ngữ giữ lựa chọn, bốn ngôn ngữ/keyboard/dark-light/mobile không overflow.
- Full Windows smoke pass trên gói đã cập nhật: tạo expression từ thao tác chọn exact video ID của metadata DASH, tải MP4 và FFprobe đủ video/audio; tiếp tục pass runtime, API isolation, DASH preset merge, cancel, persistence, shutdown cây tiến trình. Chỉ dùng fixture và dữ liệu test riêng, không thay config/download người dùng; không thử lại URL public trong lượt này.
- Hash toàn bộ **1.743 entry** ASAR xác nhận chỉ tám file public/lib thay đổi; helper `scripts/download-resolved-media.py` ngoài ASAR khớp source. Runtime và dependency trong app không đổi. Evidence gọn tại `output/reports/auto-audio-merge-20261023/`; công cụ và profile/fixture tạm đã dọn sau pass.

## Verification ngày 2026-10-23 — Tab nguồn phụ, bảng định dạng chính

- JavaScript syntax/UI/server contracts pass: **155 HTML IDs**, 116 JS hooks, 14 GET route; thêm bốn ID cho hai tab/panel, không xóa hook cũ. Không có lint/typecheck framework riêng ở frontend thuần này.
- `tests/media_ui_test.js` mở rộng để kiểm tra table-first/native, fallback sources-only, tab ARIA/keyboard, đổi ngôn ngữ vẫn giữ tab, giữ selection/search/filter và không fetch lại khi chuyển tab. Source UI và UI phục vụ trực tiếp từ ASAR đều pass; copy/download/cancel, safe labels, empty/error và dark/light responsive tại 1440/390/375/844 px pass.
- Full `tests/desktop_smoke_test.js` chạy bằng runtime đóng gói với dữ liệu riêng pass UI/API isolation, Node 24.22.0/Python/aria2/Chromium, phân tích fixture, DASH mux/FFprobe video+audio, cancel, persistence và shutdown cây tiến trình. Không đổi cấu hình/download của người dùng hoặc chạy lại URL public.
- `packaging.json` đối chiếu 1.743 entry của ASAR trước/sau, xác nhận chỉ `public/index.html`, `media-discovery.js`, `script.js`, `i18n.js`, `graphite-signal.css` đổi; không thêm package vào app. Evidence/ảnh tại `output/reports/workspace-tabs-20261023/`. Công cụ đóng gói và dữ liệu thử riêng được dọn sau pass.

## Verification ngày 2026-10-23 — Dọn workspace chỉ dùng Windows

- Tạm chuyển root `node_modules/`, `.runtime/` và các artifact/dependency dư ra khỏi vị trí cũ; chạy test driver với dependency tại staging, trong khi app/backend được loại `NODE_PATH`, dùng dữ liệu riêng và PATH hệ thống. Không dùng cấu hình hoặc thư mục tải của người dùng.
- Full `tests/desktop_smoke_test.js` trên `dist/win-unpacked/EveryVideo.exe` pass: UI/API isolation, Node 24.22.0/Python/aria2/Chromium đi kèm, phân tích fixture localhost, DASH tải/ghép với FFprobe xác nhận video+audio, cancel, persistence và dừng cây tiến trình khi thoát. Lượt đầu bị sandbox chặn khởi chạy Electron; lượt chạy ngoài sandbox đã pass, không đổi code app.
- So SHA-256 trước/sau: toàn bộ 1.469 file payload giữ nguyên; một `debug.log` Chromium được append trong lúc kiểm thử. Sau pass mới xóa hẳn 69 target/27.848 file/1.407,50 MiB. Giữ manifest/checklist/screenshot tại `output/reports/windows-only-cleanup-20261023/`; dọn staging và hai thư mục dữ liệu test vừa tạo.
- Giữ JSON/script QA và báo cáo cũ, nhưng xóa 58 PNG QA cũ trong `output/playwright/` để tiết kiệm dung lượng; các tham chiếu ảnh lịch sử trong vault có thể không còn file. Giữ ảnh thiết kế nguồn và screenshot Windows mới. Không chạy lại website public hoặc benchmark Bilibili qua Internet.

## Verification ngày 2026-10-21 — Gói phát hành v1.2.0

- Repository có release `v1.1.0`; chọn phiên bản tiếp theo `v1.2.0`, cập nhật package/lockfile và build mới toàn bộ ba gói Windows. `npm run desktop:build` và runtime prerequisite check pass.
- `npm run test:desktop` và `npm run test:desktop-portable` pass trên gói 1.2.0; kiểm tra lại extraction, DASH mux/FFprobe, cancel, persistence và process cleanup. Bundle package version là `1.2.0`; Windows ProductVersion `1.2.0.0`, FileVersion `1.2.0`. Không có root config/cookie/profile/media cá nhân trong app archive.
- UI/server contracts pass 151 ID/116 hook/14 GET route; package và lockfile đồng nhất; `git diff --check` pass. Tạo SHA256SUMS cho Setup/portable EXE/ZIP và manifest local ở `output/reports/release-v1.2.0/local-assets.json` để đối chiếu upload.
- Hai smoke-test evidence được lưu gọn về `output/reports/release-v1.2.0/`. Các gói chưa ký số; chưa cài/gỡ trên VM Windows sạch, không bổ sung benchmark website thật trong phiên phát hành.
- Đã đối chiếu đủ bốn asset GitHub với local theo tên, kích thước, trạng thái uploaded và digest SHA-256 (gồm cả file checksum), tất cả khớp. Release được công khai, không phải prerelease, Latest là `v1.2.0`; tag resolve đúng commit nguồn `388510988db424ead996e7e22fbf72d43c4c3ade`. Báo cáo API/digest nằm trong `output/reports/release-v1.2.0/verified-github-assets.json` và `published-release.json`.

## Verification ngày 2026-10-21 — Tích hợp upstream trước push GitHub

- Rebase commit Windows desktop/media/UI/layout lên `origin/nhanh-2` thành công, giữ các commit Docker/Render, Pylint workflow và health endpoint từ upstream.
- `node --check server.js` và `npm run test:contracts` pass sau tích hợp: 151 HTML ID, 116 JS hook và 14 GET route (thêm `/health`). `git diff --check` pass.
- Rà soát nội dung commit: source/test/tài liệu/icon/giấy phép, không có runtime, bộ cài, output, config hoặc cookie; không có file lớn hơn 10 MiB. Bổ sung ignore Git và Docker cho dữ liệu cá nhân/runtime Windows. Không deploy hoặc chạy lại benchmark mạng thật trong phiên push.

## Verification ngày 2026-10-21 — Dọn và sắp xếp thư mục

- Đối chiếu SHA-256 1.469 file payload của hai bản app giải nén; chỉ log Chromium khác nhau. Giữ `dist/win-unpacked/`, bỏ bản trùng, các profile/fixture smoke, Python bytecode, log, metadata updater không dùng và `ffplay.exe` thừa; manifest ban đầu ghi 31 target/1.096,46 MiB. Không xóa source extractor, dependency đang dùng, config hoặc media của người dùng; file tải dở chuyển nguyên vẹn vào `Download/incomplete/`.
- Chuyển ba kế hoạch vào `docs/plans/`, cập nhật README/chỉ mục vault và kiểm tra 33 link tương đối. SHA-256 của cả ba gói phát hành không đổi. `git diff --check` pass.
- Sau cleanup, UI/server contracts 151 ID/116 hook/13 route pass; acceleration/progress pass; Python 11/11 pass; runtime check Python/core/FFmpeg/aria2/Chromium pass. Full smoke trực tiếp `dist/win-unpacked/EveryVideo.exe` pass extraction, DASH mux/FFprobe, cancel, persistence và thoát giữa lượt tải.
- Đã lưu số đo/ảnh và kết quả tại `output/reports/windows-desktop-20261021/` (`startup.json`, `desktop.png`, `portable.png`, `cleanup-manifest.json`, `verification.json`); dọn cả thư mục tạm của lần kiểm chứng cuối. Các đường dẫn `output/desktop-smoke-*` ở mục lịch sử bên dưới là evidence trước cleanup, nay đã được rút gọn về thư mục reports này.

## Verification ngày 2026-10-21 — Portable startup

- Tái hiện sau khi người dùng xác nhận bản portable EXE. Đọc template NSIS thực tế trong dependency: xóa/tháo gói mỗi lần mở và dọn khi thoát. Kích thước unpacked: 1.470 file/898,3 MiB.
- `node scripts/benchmark-desktop-startup.js` pass hai vòng cho mỗi dạng, dữ liệu riêng và PATH hệ thống. Thời gian tới UI có form và config API dùng được: folder 569/513 ms; self-extracting EXE 12.945/15.047 ms. Debug-ready tương ứng 127/122 ms và 12.499/14.684 ms. Evidence: `output/desktop-smoke-startup-trD8oh/startup.json`; đây là số đo host hiện tại, không phải cam kết trên mọi máy.
- `npm run desktop:zip` tạo ZIP folder; giải nén vào thư mục mới `dist/EveryVideo-Portable-Folder/`, xác nhận hash `EveryVideo.exe` và `resources/app.asar` giống bản unpacked. Smoke trực tiếp executable giải nén pass toàn bộ UI/API isolation, bundled runtime, metadata, DASH mux/FFprobe, cancel, persistence và thoát khi đang tải. Evidence: `output/desktop-smoke-mKknUr/`.
- SHA256SUMS đã bổ sung ZIP. Chỉ thay đổi dạng đóng gói/benchmark/tài liệu, không sửa UI hoặc engine. Sửa hướng dẫn trước đó ghi không chính xác rằng portable chỉ giải nén lần đầu.

## Verification ngày 2026-10-21 — Windows desktop packaging

- `npm run desktop:check`, `desktop:pack`, `desktop:build` pass; xuất NSIS và portable x64 tại `dist/`. Phiên bản Electron `44.9.3`, embedded Node `24.22.0`; Python/core, FFmpeg, aria2 và Playwright browser đều được kèm.
- `npm run test:desktop` pass với dữ liệu riêng và PATH chỉ gồm Windows system folders: đọc archive xác nhận không kèm config/cookie/vault/media cá nhân; renderer không có Node, bật sandbox/context isolation; API không cookie hoặc Origin khác nhận 403.
- Chạy thực Node/Python/aria2/Chromium từ gói; metadata từ HTTP fixture; tải DASH với video/audio tách rời và ghép MKV, FFprobe xác nhận cả hai stream. Hủy lượt tải giới hạn tốc độ, lưu/đọc config sau restart và đóng app trong lượt tải thứ hai đều pass; kiểm tra các PID descendant không còn tồn tại sau thoát. Evidence: `output/desktop-smoke-77oTF8/`.
- `npm run test:desktop-portable` pass trên file portable thật: tự giải nén/mở UI, phát hiện FFmpeg/aria2, dùng Python kèm để phân tích fixture, dữ liệu riêng và PATH hệ thống, đóng cửa sổ làm wrapper/backend thoát. Evidence: `output/desktop-smoke-portable-rFp9J8/`.
- Hồi quy UI/server contracts pass (151 ID, 116 hook, 13 GET route), acceleration/progress pass, Python `11/11`, media integration và media UI pass. Syntax checks và `git diff --check` pass. `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities.
- Một lượt chạy ban đầu bị sandbox chặn loopback, đã chạy lại các test có localhost với quyền phù hợp và pass. FFmpeg ban đầu ghi bốn fragment fixture ở project root; test đã sửa để chỉ tạo trong thư mục riêng, đối chiếu SHA-256 khớp fixture tái tạo trước khi dọn.
- SHA-256 được lưu ở `dist/SHA256SUMS.txt`; Authenticode của hai artifact là `NotSigned`. Chưa cài/gỡ cài trên VM Windows sạch, chưa test OS khác hoặc ký số; không coi PATH hệ thống trên host dev là tương đương VM sạch. Không chạy thêm benchmark Bilibili ngoài mạng trong phiên này.

## Verification ngày 2026-10-07 — Universal media discovery

- `npm run test:media` pass: HTTP fixture/media do FFmpeg tạo trong thư mục tạm, không sửa config người dùng; HTML5, ảnh/srcset, iframe khác host, JSON/Nuxt, MIME không extension, query ký số, DNS/private IPv4/IPv6, partial/empty/error và mã phiên hết hạn.
- Chromium fixture pass cho JavaScript/fetch POST, DOM và cookie phiên chỉ ở backend, gồm cookie từ redirect. Nguồn từng 403 được xác minh lại khi browser có phiên mới. Tải file trực tiếp đối chiếu byte đầy đủ; thumbnail jpg trả WebP được lưu đúng đuôi. Tải đồng thời không trùng tên; hủy stream/direct và Python HLS dừng tiến trình, dọn staging/lock.
- HLS và DASH tải thực qua helper Python/FFmpeg; FFprobe xác nhận H.264 và duration tối thiểu 0,9 giây. Probe manifest không thay cho kiểm chứng file hoàn chỉnh.
- `npm run test:media-ui` pass: analyze, URL clipboard giữ nguyên query, filter, download/cancel SSE, nhãn remote không chạy HTML, partial/empty/error, bốn ngôn ngữ, dark/light desktop/mobile 390 px không tràn ngang; media lên trước settings trên mobile. Metadata native vẫn hiện hero và format explorer.
- Regression: 151 HTML IDs, 116 JS hooks; GET route check tính cả module media là 13 route duy nhất. Downloader option/progress tests pass; Python selector/probe 11/11 pass; JavaScript syntax và `git diff --check` pass.
- API live: MDN CC0 flower MP4 → video; Mux x36xhzz → HLS; W3Schools HTML Images → 34 ảnh xác minh + một ảnh unavailable; W3Schools HTML Audio → ảnh, không có audio trực tiếp trong DOM; SoundHelix audio-examples trả HTTP 500 → empty/partial warning, không tính là thành công.
- Nuxt case NhacCuaTui → MP3 public 128/320 kbps và ảnh WebP xác minh qua Range; cả audio và ảnh có lượt probe khi danh sách dài. Trang chứa nhiều bài gợi ý nên resolver liệt kê cả tài sản của chúng, không gọi toàn bộ asset là bài chính. Không tải toàn bài public, không lưu URL ký số/cookie/HTML gốc.
- Chromium portable đã cài trong `.runtime/playwright`; test mạng/localhost/child process cần quyền ngoài sandbox trên môi trường kiểm chứng. `npm test` gốc có thay đổi config không được chạy. Chi tiết: [[12 - Universal Media Extraction Implementation]].

## Verification ngày 2026-09-29 — Graphite Signal 2 UI

- `node --check` cho `public/script.js` và `public/i18n.js` pass; `npm run test:contracts` pass với 151 HTML IDs, 116 JS hooks và 11 GET routes.
- `npm run test:unit` và `npm run test:progress` pass.
- Browser smoke test pass cho desktop/mobile, dark/light, English i18n, nhãn accessibility đa ngôn ngữ, Advanced disclosure và CTA Queue → Studio.
- Ở viewport 390×844, document không tràn ngang; workflow rail cuộn nội bộ khi cần. Browser không ghi console error trong các smoke test.
- Phân tích URL công khai chưa chạy lại trong phiên này vì Windows sandbox chặn kết nối mạng với `WinError 10013`.

## Verification ngày 2026-09-29 — Tải video X/Twitter

- Dùng URL X công khai có trong bộ test của extractor: `https://x.com/historyinmemes/status/1790637656616943991`.
- Chạy trực tiếp lõi vendored: `TwitterIE` phân tích thành công, trả 9 format gồm video HTTP/HLS và audio HLS.
- Chạy qua ứng dụng: `/api/info` trả metadata; `/api/download` với `bv*+ba/b` và MP4 hoàn tất, không cần thay đổi mã.
- FFprobe xác nhận file đầu ra có video H.264 `728x720`, audio AAC stereo và duration `15.557370` giây.
- Kiểm tra lại payload `/api/info`: các format X có `resolution` trực tiếp (`272x270`, `364x360`, `728x720`); UI cũng có fallback `width × height` trong `processAndRenderFormats`. Nếu bảng UI trống, cần điều tra request/render state riêng, không phải thiếu dữ liệu resolution từ extractor.
- Regression sau kiểm chứng: `npm run test:contracts` pass; `npm run test:unit` pass; `npm run test:progress` pass; `npm run test:python` pass `11/11`.

## Verification ngày 2026-09-25 — Thanh loading aria2

- Tái hiện bằng `aria2c 1.37.0`: tiến độ phát qua `stdout` với ký tự `\r` và mẫu `[#... 25% ...]`, nên parser cũ chờ `[download] ...%` không cập nhật thanh loading.
- Thêm parser stream có buffer cho dữ liệu bị chia giữa các chunk, chuẩn hóa CR/LF, nhận diện tiến độ aria2 và gửi sự kiện SSE `progress` cho frontend.
- `npm run test:progress`: **pass** — kiểm tra chunked CR/LF và aria2 percent/speed/ETA/size.
- `node --check server.js`, `node --check lib/download-progress.js`, `node --check public/script.js`: **pass**.
- `npm run test:contracts`: **pass** — UI 151 ID/115 hook; server 11 route.
- `npm run test:unit`: **pass** — download acceleration.

## Baseline và verification ngày 2026-09-09

Lệnh:

```powershell
npm run test:contracts
```

Kết quả:

- UI contract: **pass** — 151 HTML ID duy nhất, 115 JavaScript hook hợp lệ.
- Server contract: **pass** — 11 GET route duy nhất, có guard cho process/API errors.
- `npm run test:unit`: **pass** — option builder kiểm tra Auto/Native/aria2, whitelist connections, URL ngoài Bilibili và missing executable.
- `node --check` cho `server.js`, `setup.js`, `public/script.js`, `public/i18n.js`: **pass**.
- `npm run test:python`: **pass 9/9** — wrapper tự chọn Python portable tại `.runtime/python/python.exe` và đặt `PYTHONPATH=core`.
- Smoke local `/api/config`: **pass** — capability trả `hasAria2c=true`, `hasLocalFfmpeg=true`, engine mặc định `auto`, connections mặc định `8`; từ 2026-09-20 UPOS default local là `mirrorhwo1`; UI mặc định bật Anti-P2P và Geo Bypass.
- Smoke tải Bilibili thật trước đó: **pass** — format `100109`, engine explicit `aria2c`, 4 connections, file mẫu 15.74 MiB hoàn tất trong khoảng 1 giây, tốc độ hiển thị 12.11 MiB/s; không ghi signed URL vào log/vault.
- End-to-end URL `BV1opg36pEPf`: **pass** — sau khi thêm Bilibili-only `Referer`/User-Agent, analyze trả 15 formats; `auto + aria2 x8` tải `30080+30280`, video hiển thị 24.29 MiB/s, audio 8.02 MiB/s; FFprobe xác nhận 240.746667 giây, H.264 1920×822 và AAC stereo. Lượt `fastest` cùng format đạt 12.15 MiB/s và chọn host `upos-sz-mirrorcosov.bilivideo.com`.
- Native mirroraliov đối chứng không kết luận được vì upstream trả HTTP 412 sau nhiều lượt liên tiếp; không dùng lượt lỗi này làm baseline.
- Benchmark ma trận tự động: **21 option case**, 11 pass ở vòng đầu; lặp 7 ứng viên đầu bảng thêm 2 vòng. Nhóm ổn định 3/3: `mirrorcosov` median 28.35 MiB/s (nhanh nhất), Akamai median 26.65 MiB/s, aria2 x8 + auto median 25.19 MiB/s, aria2 x16 + auto median 24.86 MiB/s. Native đạt tối đa 0.316 MiB/s với chunk 100M nhưng chỉ có một lượt pass; các case HTTP 412 được ghi là upstream rate-limit.
- `ffmpeg`/`ffprobe`: **pass** — runtime portable 9.0.1 được nhận diện qua `/api/config`; synthetic MP4 smoke xác nhận duration 1 giây, H.264 video 320×180 và AAC audio. Chưa dùng kết quả này thay cho FFprobe trên file Bilibili benchmark.
- Chưa chạy ma trận benchmark 3 video × 3 lần; benchmark hiện tại chỉ trên một video nên default `mirrorcosov` là quyết định cục bộ/tạm thời, chưa phải kết luận tối ưu toàn mạng.
- Long-file probe 2026-09-20 trên `BV1D2hPzxEWe`/`30080` (~656 MiB): `mirrorcosov` rơi từ ~72 MiB/s ở 203 MiB xuống ~600 KiB/s ở 209 MiB với `CN:8`; `mirrorhwo1` resume phần >347 MiB và hoàn tất ở khoảng 8.5–29 MiB/s. Kết quả này thay default local nhưng chưa thay gate đa video/đa thời điểm.
- Smoke server sau restart: `mirrorhwo1 + aria2 x8` đạt ~23 MiB/s tại 247 MiB tính từ đầu stream; cancel tree test kết thúc download và `Get-Process aria2c` không còn process, xác nhận `/api/cancel-download` dừng cả external downloader child.

## Các tầng kiểm thử

| Tầng | Mục đích | Lệnh/trạng thái |
| --- | --- | --- |
| Static/contract | DOM hook, route trùng, error guard | `npm run test:contracts` |
| Unit | Hàm thuần như URL optimizer, arg builder, parser | `npm run test:unit`; `npm run test:python` (9/9) |
| Integration local | Server + Python core + FFmpeg + filesystem | `npm test`, có side effects |
| Network Bilibili | WBI, cookie, formats, CDN, download | Smoke và benchmark chuyên biệt một video đã chạy; gate đa video còn mở |
| End-to-end UI | Analyze → select → download → verify file | Chủ yếu thủ công |

## Ma trận Bilibili đề xuất

### URL type

- Video BV công khai, một phần.
- Anthology nhiều phần.
- Bangumi công khai và premium.
- Video cần đăng nhập/phụ đề cần đăng nhập.
- Live, audio hoặc playlist chỉ khi nằm trong scope phát hành.

### Auth

- Không cookie.
- Cookie browser hợp lệ.
- Cookie hết hạn/không đọc được.

### Format

- Preset `bv*+ba/b`.
- Exact video-only ID.
- Exact audio-only ID.
- Expression `videoID+audioID`.
- AVC, HEVC, AV1; 720p/1080p/4K nếu tài khoản cho phép.

### CDN

- Auto + anti-P2P bật.
- Alibaba overseas.
- Tencent overseas.
- Akamai.
- CDN gốc + anti-P2P tắt.

### Performance downloader

- Native HTTP: chunk off, 1M, 10M, 100M.
- aria2 direct HTTP(S): x4/s4/k4M, x8/s8/k2M, x16/s16/k1M.
- Đo cùng format, cùng mạng, ít nhất ba lần; signed URL phải được lấy mới cho từng lượt.
- Ghi rõ MiB/s, TTFB, HTTP status, Content-Range và host đã che query token.
- Chi tiết tiêu chí chọn mặc định tại [[09 - Bilibili Download Speed Research#5. Ma trận benchmark bắt buộc trước khi chọn mặc định]].

### Assertions

- Metadata và format count hợp lý.
- Host được chọn đúng theo cấu hình.
- HTTP status/TTFB/throughput nằm trong ngưỡng đã định.
- File hoàn tất, không còn `.part` ngoài ý muốn.
- FFprobe xác nhận duration, video stream, audio stream và codec.
- Cancel dừng process và không rò task.

## Ưu tiên bổ sung test

1. Mở rộng Python unit test `_is_p2p_host`, candidate/probe và thêm assertion chọn host nhanh nhất.
2. Mock lifecycle `/api/download` để chứng minh ENOENT/external downloader failure/cancel chỉ tạo tối đa hai attempt.
3. UI behavior test cho quan hệ giữa `allow_p2p` và checkbox anti-P2P.
4. UI behavior test cho video-only selection + audio merge.
5. Integration Bilibili opt-in bằng biến môi trường; không chạy mặc định trong CI.
6. Sửa integration harness để backup/restore config, dùng thư mục tạm và tự tìm FFprobe portable/PATH.

## Cách ghi bằng chứng

Mỗi lần test Bilibili, ghi vào [[08 - Work Log]]:

- Ngày/giờ và loại mạng, không ghi IP cá nhân.
- Loại URL và auth state, không lưu cookie.
- Format expression, codec/resolution.
- Chế độ anti-P2P và UPOS.
- Kết quả analyze/download, tốc độ mẫu, lỗi đã rút gọn.
- File verification bằng FFprobe.
