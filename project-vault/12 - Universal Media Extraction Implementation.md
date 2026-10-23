---
title: Universal Media Extraction Implementation
aliases:
  - Triển khai trích xuất media đa website
tags:
  - project/everyvideo
  - implementation
  - extraction
type: project
status: active
created: 2026-10-07
updated: 2026-10-23
related:
  - "[[11 - Universal Media Extraction Research]]"
  - "[[02 - Architecture]]"
  - "[[07 - Testing]]"
---

# Universal Media Extraction Implementation

## Tự ghép audio — 2026-10-23

- Bảng định dạng đã nối helper `enableAudioMerge`/`selectedAudioTrack`: chọn video-only tạo `videoID+bestaudio` hoặc `videoID+audioID`, giữ nguyên ID/chất lượng video. Tắt checkbox để tải nguyên video; audio-only/combo không thêm track. Hàng chờ và tải nhiều format dùng cùng quy tắc.
- Resolver gắn `media_group`, `video_only`, `audio_only` và `audio_asset_id` được đề xuất cho formats thuộc cùng entry extractor. Ưu tiên language preference, container tương thích, bitrate; không tự ghép các nguồn generic không rõ quan hệ hoặc entry khác.
- Thẻ nguồn có lựa chọn audio và nút **Tải video có tiếng**; cặp đã xác định được chọn mặc định, nguồn generic cho chọn thủ công hoặc giữ tải nguyên nguồn. Lựa chọn được giữ khi đổi filter/ngôn ngữ. Nhãn mới có đủ VI/EN/ZH/JA.
- `/api/media-download` nhận thêm `audio_asset_id`; thiếu tham số dùng đề xuất của resolver, giá trị `none` tải nguyên nguồn. Audio phải là descriptor cùng resolution, đúng loại; cả hai nguồn được verify/refresh và kiểm tra manifest/fragment trước khi spawn. Không nhận URL audio tùy ý từ client.
- Helper Python nhận hai descriptor qua stdin, giữ header riêng mỗi nguồn, yêu cầu FFmpeg trước khi tải, chọn video/audio riêng và stream-copy thành một file. Ưu tiên MP4/WebM với tổ hợp container tương thích, fallback MKV; staging/lock/collision/cancel tiếp tục dùng nhánh engine cũ. Audio không truy cập được phải báo lỗi, không trả thành công với video im lặng.
- Source và app Windows local đã cập nhật: tám file trong ASAR, helper Python ngoài ASAR; không đổi runtime/dependency của app. Fixture thật/FFprobe, UI và desktop smoke pass; chi tiết tại [[07 - Testing]]. Chưa chạy lại URL Bilibili/public trong lượt này.

## Cập nhật bố cục Studio — 2026-10-23

- Theo yêu cầu người dùng, phần nguồn media chuyển thành tab phụ **Nguồn media (N)**; bảng định dạng trở thành tab chính mặc định sau phân tích native. Không bỏ tính năng copy/tải/filter nguồn, không đổi resolver/API. Nếu không có metadata native, tự mở tab nguồn để kết quả generic vẫn thấy ngay.
- Tab có semantics ARIA, hỗ trợ bàn phím, bốn ngôn ngữ và giữ lựa chọn/filter khi chuyển tab hoặc đổi ngôn ngữ. Selector filter bảng được scope riêng để không làm mất highlight filter nguồn. Mỗi lượt phân tích mới reset về table mode khi có metadata; preset vẫn chọn được bằng nút cards.
- Source và bản UI trong ASAR đã qua integration; full app Windows smoke pass. Artifact local `dist/win-unpacked/` đã cập nhật, bản release public không thay đổi. Chi tiết/evidence tại [[07 - Testing]], [[02 - Architecture]].

## Quyết định và phạm vi

Người dùng đã yêu cầu triển khai resolver chung cho URL từ nhiều website; NhacCuaTui là một case minh họa. Không thêm domain allowlist hoặc extractor đặc thù NCT. Giữ frontend thuần, DOM IDs/API cũ, engine vendored và custom patches Bilibili.

Phân Tích nhận trang HTML, trang tương tác, iframe và media trực tiếp. Danh sách có audio/video/ảnh/thumbnail/phụ đề/HLS/DASH, chất lượng nếu metadata cung cấp, URL đầy đủ, provenance và trạng thái. Có sao chép và tải từng asset. Trang nhiều media được giữ nhiều asset; ảnh gợi ý/trang trí không tự bị loại. Không cam kết 100% mọi URL.

## Module và contract

| Thành phần | Trách nhiệm |
| --- | --- |
| `lib/media-network.js` | HTTP(S), URL normalization, DNS/IP/redirect validation, DNS pinning, Range/stream/read có giới hạn |
| `lib/media-discovery.js` | HTML5/ảnh/srcset/poster/CSS/OG/tracks/links/scripts; JSON/JSON-LD/Nuxt graph; engine formats/thumbnail/subtitles |
| `lib/media-browser.js` | Chromium ẩn danh: DOM/currentSrc/lazy scroll, play media có giới hạn, network JSON/MIME, GET/POST, cookie phiên ở backend |
| `lib/media-resolver.js` | HTTP + yt-dlp song song, browser auto/always/off, dedup exact URL/query, probe, partial results, descriptor TTL |
| `lib/media-routes.js` | Resolve JSON, image preview, SSE download, reverify/refresh khi nguồn hết hạn, collision/cancel/staging cleanup |
| `scripts/download-resolved-media.py` | Descriptor qua stdin; core yt-dlp + FFmpeg tải/ghép manifest/fragment, không ghi URL/header vào file descriptor |
| `public/media-discovery.js` | Nguồn tải, filters/copy/download/cancel, i18n, nhãn textContent an toàn, responsive |

- `POST /api/resolve`: body có URL, `browserMode` auto/always/off và options metadata cũ. Trả `resolution_id`, source URL, title, `assets`, info dictionary nếu có, browser_used, warnings, expires_at, truncated.
- `GET /api/media-preview`: resolution_id + asset_id, chỉ ảnh đăng ký; trả MIME thật, no-store/no-sniff/CSP.
- `GET /api/media-download`: resolution_id + asset_id + output tùy chọn, SSE started/progress/output/done/error. Không nhận URL tải tùy ý.
- `/api/info` và `/api/download` gốc vẫn tồn tại; fetch metadata được tái sử dụng để giữ Douyin/TikTok/Bilibili options và cookie source.

## Xác minh và tải

Formats từ extractor được đánh dấu available, tránh probe hàng loạt CDN trước khi tải. Nguồn generic dùng Range 4 KiB để kiểm tra MIME/signature; verified/access_required/unavailable/unverified được thể hiện riêng. False media và địa chỉ nội bộ bị loại. MIME quyết định đuôi khi cần: URL jpg trả WebP được lưu webp.

Giới hạn 120 asset được phân bổ giữa loại media, tối đa 40 lượt probe mỗi đợt × concurrency 5, tránh một danh sách audio lấn hết ảnh. URL có query khác vẫn là nguồn riêng, kể cả cùng tên/chất lượng. Nguồn chưa probe vẫn sao chép/tải được; bước tải luôn xác minh lại và có thể từ chối nếu không hợp lệ.

Session RAM tối đa 30, TTL 15 phút; asset ID không dùng ngoài phiên. 403/404/410 thử resolve lại trang và đối chiếu origin+pathname để lấy URL mới; không thể bảo đảm refresh nếu session nguồn không tái tạo được. Cookie/header riêng bị loại khỏi assets trả client; các header công khai như Referer có thể được giữ.

Chromium tự xử lý redirect/Set-Cookie; từng request mới vẫn qua DNS/IP validation của Node. Sau browser discovery, nguồn từng bị từ chối hoặc có cookie mới được probe lại, tránh giữ nhầm trạng thái 403 từ lượt quét ẩn danh ban đầu. Fixture redirect session đã kiểm chứng.

Direct download stream qua Node tới `.part`, rồi rename sau hoàn tất. Engine download dùng thư mục staging riêng dưới output, chuyển file sau exit 0 rồi dọn đúng staging đã tạo. File lock đặt trước tác vụ async tránh collision đồng thời; tên Windows được sanitize, không đè file cũ. Hủy SSE abort stream hoặc taskkill cây Python trên Windows, dọn staging/lock/partial.

Nguồn riêng có nút tải và chọn audio để ghép như mục cập nhật 2026-10-23; tùy chọn cắt/chuyển đổi và queue vẫn áp dụng luồng formats, chưa nối vào mọi asset generic. Không suy đoán audio cùng nội dung chỉ vì hai nguồn nằm trên cùng trang.

## Vận hành và giới hạn

- Node.js 22+, dependencies Cheerio 1.2.0, Playwright 1.63.0, ipaddr.js 2.5.0; package lock đã cập nhật. Chromium headless cài một lần bằng `npm run setup:browser`, lưu `.runtime/playwright` bị Git ignore. Thiếu Chromium không chặn HTML/engine.
- Resolve deadline 45 giây, metadata child 23 giây, socket 12 giây; HTML đọc tối đa 2 MiB, tối đa 5 page/frame với depth 2. Browser nominal 100 requests/16 MiB, mỗi response 2 MiB, thu DOM/network khoảng 6,5 giây sau navigation.
- Browser chỉ giữ phiên ẩn danh tự tạo. Cookie dropdown lấy cookie cho engine cũ; chưa nhập phiên đăng nhập cá nhân vào worker Chromium. Service worker/WebSocket bị chặn; có thể bỏ sót trang phụ thuộc chúng. Player cần click đặc thù, DRM/anti-bot/đăng nhập vẫn có giới hạn.
- Generic detection có thể bỏ sót URL giấu trong obfuscated JavaScript, API custom hoặc media không được player request. URL blob không phải nguồn file để sao chép; network bên dưới được thu khi có.
- Nguồn lớn/trang nhiều recommendations có thể hết ngân sách hoặc còn unchecked; UI hỗ trợ filter và xác minh lúc tải. Không crawl toàn site, không phân loại chắc chắn nội dung chính/quảng cáo.
- Chặn private IPv4/IPv6/credentials/redirect và pin DNS áp dụng Node/Chromium route. Manifest/fragment được kiểm tra trước Python; chưa audit đầy đủ redirect/DNS nội bộ engine và APIs proxy cũ, xem [[06 - Known Issues and Risks#SEC-001 — Các route fetch remote cần xem xét SSRF]].

## Bằng chứng kiểm chứng

`npm run test:media`, `npm run test:media-ui`, contract/unit/progress và Python 11/11 pass. Ma trận fixture gồm MIME không extension, HTML/JSON/Nuxt, iframe khác host, image-only, JS POST/session, direct byte equality, WebP preview/save, HLS/DASH qua FFprobe, collision đồng thời, cancel direct/engine và session expired. UI có clipboard giữ query, safe labels, four languages và mobile 390 px/dark/light không tràn ngang; native formats vẫn hoạt động trong smoke fixture.

API public đã thử trên MDN direct video, Mux HLS, W3Schools ảnh và Nuxt NCT. SoundHelix trả HTTP 500 được ghi nhận là thất bại nguồn; W3Schools Audio docs không có nguồn audio trực tiếp trong DOM. Không coi các thử nghiệm này là chứng minh hỗ trợ mọi website. Kết quả chi tiết tại [[07 - Testing]].
