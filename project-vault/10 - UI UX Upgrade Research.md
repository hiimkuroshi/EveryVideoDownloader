---
title: UI UX Upgrade Research
aliases:
  - Nghiên cứu nâng cấp UI UX
tags:
  - project/everyvideo
  - research
  - ui-ux
type: research
status: active
created: 2026-09-29
updated: 2026-10-23
related:
  - "[[01 - Project Overview]]"
  - "[[05 - Decisions and Constraints]]"
  - "[[07 - Testing]]"
  - "[[08 - Work Log]]"
---

# EveryVideo — Nghiên cứu hướng nâng cấp UI/UX

## 2026-10-23 — Bảng định dạng là màn chính của app Windows

- Người dùng cung cấp hai ảnh: muốn danh sách nguồn media dài thành tab phụ và bảng exact format thành nội dung chính. Triển khai tab con **Bảng định dạng** / **Nguồn media (N)** ở cột kết quả Studio; bảng mặc định ngay khi phân tích xong, giữ lựa chọn preset dưới nút chuyển view thủ công.
- Giữ nguyên dữ liệu/tác vụ nguồn; đổi tab không fetch lại hoặc mất selection/search/filter. Có focus/ARIA/keyboard mũi tên và Home/End, dịch VI/EN/ZH/JA; URL chỉ có nguồn generic tự mở tab nguồn. Đã chỉnh note workflow theo bảng và cập nhật `DESIGN.md`.
- UI suite pass cho source và file đóng gói: native table mặc định, nguồn tab phụ, selection/search/filter giữ nguyên, đổi ngôn ngữ giữ tab, empty/error/download/cancel, copy URL, kiểm tra tràn ngang ở 1440/390/375/844 px trong sáng/tối. Full desktop smoke pass gồm bundled runtime, tải/ghép fixture có video+audio, cancel/persistence/process cleanup.
- Cập nhật app local qua ASAR, đối chiếu toàn bộ nội dung xác nhận đúng năm file UI thay đổi; không khôi phục thư viện dev/runtime trùng hoặc deploy website/release mới. Evidence: `output/reports/workspace-tabs-20261023/`.

## 2026-10-22 — Mở rộng đa ngôn ngữ: Thêm bản tiếng Nhật và hoàn thiện tiếng Anh

- Người dùng yêu cầu tạo thêm bản tiếng Nhật và tiếng Anh cho landing page.
- Bổ sung toàn diện bản tiếng Nhật (`ja`) chuẩn ngữ điệu sản phẩm EveryVideo (calm, respectful, cinema library):
  - `src/data.ts`: mở rộng `Locale = "vi" | "en" | "ja"`, dịch toàn bộ header, hero, 3 tính năng media, help dialog 3 bước, download dialog, selector.
  - `src/storyCopy.ts`: dịch toàn bộ workflow 3 bước, control showcase, 3 bộ sưu tập (học & khám phá, nghe & tập trung, lưu & sáng tạo), format explorer 4 loại media, 7 câu hỏi FAQ và footer.
  - `src/StudioPreview.tsx`: từ điển `wording.ja` cho Studio/Queue/Advanced/Settings, nhãn aria-label, alt text và option `<option value="ja">日本語</option>`.
  - `src/LandingStory.tsx` & `src/App.tsx`: cập nhật alt ảnh, filename minh họa trong Workflow theo từng ngôn ngữ, document title (`EveryVideo — 手元に残す、心動かす瞬間を`), `<html lang="...">`.
  - Persistence: hỗ trợ chuyển ngôn ngữ qua URL param (`?lang=ja|en|vi`) và `localStorage`, fallback giữ mặc định `vi`.
  - Typography: bổ sung font fallback tiếng Nhật chất lượng cao (Hiragino Sans, Yu Gothic, Meiryo).
- Build & Verification:
  - `npm run build` (tsc strict + vite) pass không lỗi.
  - Bộ Playwright tự động kiểm tra chuyển đổi ngôn ngữ, kiểm tra DOM, capture `japanese-hero.png`, Axe WCAG A/AA đạt 0 violation (`accessibility-japanese.json`).
- Triển khai Cloudflare Workers production:
  - Lệnh `npm run deploy` thành công, version ID `047e3920-464a-4af7-9d05-dded66e5ca7a`.
  - Custom domain https://evd.tyr.io.vn/ cập nhật hoàn tất, 100% traffic.
  - Chạy suite Playwright trực tiếp trên production URL (`https://evd.tyr.io.vn/`): pass cả 9 viewport (1920px xuống 320px), 7/7 bài audit Axe WCAG A/AA đạt 0 violation (dark, quality, download dialog, light, English, Japanese, mobile menu), không runtime error hay failed request. Báo cáo lưu tại `output/playwright/everyvideo-expanded-remote/report.json`.

## 2026-10-22 — Mở rộng Cinema Library và motion

- Tái triển khai theo yêu cầu “deploy đi”: `npm run deploy -- --strict` build pass, Cloudflare version `8f105fb0-1848-4949-a679-772f0da9644f`. Asset không đổi so với bản đã QA. Sau deploy, HTML và cả hai bundle JS/CSS production trả HTTP 200, byte-for-byte khớp build local.

- Người dùng yêu cầu landing page giàu nội dung, nhiều hiệu ứng/chuyển động hơn và chủ động dùng skill/plugin phù hợp. Giữ Cinema Library, Manrope, graphite/coral, VI/EN và sáng/tối; mở rộng riêng marketing app, không đổi downloader/API/config runtime.
- Bổ sung workflow ba bước với lựa chọn chất lượng mẫu, showcase hàng chờ/lưu local/nâng cao, ba tình huống học/nghe/sáng tạo, format explorer bốn loại media, bảy FAQ, CTA và footer đầy đủ. Nội dung đối chiếu README/source; nêu rõ preview dùng dữ liệu minh họa, format phụ thuộc nguồn, tải thật trong Windows và release chưa ký số.
- Motion: headline theo dòng, hero parallax giới hạn, reading progress, sticky header, section reveal, keyed panel transition, pointer spotlight tại queue, hover ảnh/queue và phản hồi nút. Dùng MotionValues cho scroll/pointer, chỉ cập nhật state khi vượt ngưỡng nút về đầu trang; có reduced-motion và reduced-transparency fallback.
- Source bổ sung `src/LandingStory.tsx`, `src/storyCopy.ts`, `src/story.css`; cập nhật App/main, DESIGN và README. Tái sử dụng WebP local, không thêm dependency. Workflow và format tabs hỗ trợ Arrow/Home/End, nút showcase chuyển focus tới đúng tab Studio, FAQ và dialog dùng được bằng bàn phím.
- Build/TypeScript strict/lint, npm audit (0 vulnerability) và Cloudflare dry-run pass. QA bản build chín viewport (320–1920px, portrait/landscape): không overflow; hero CTA trong viewport portrait. Axe WCAG A/AA tự động 0 violation ở dark, quality step, download dialog, light, English và mobile menu. Không runtime error, response lỗi hoặc ảnh lỗi; workflow, format, queue, FAQ, dialog/focus, locale/theme, anchor và reduced-motion pass. Đây là audit tự động, không phải chứng nhận WCAG đầy đủ.
- Evidence local/remote: `output/playwright/everyvideo-expanded/`, `output/playwright/everyvideo-expanded-remote/`, script `output/playwright/cinema-expansion-check.cjs`. Production khoảng 482 kB JS / 144 kB gzip và 63 kB CSS / 13 kB gzip. Đã triển khai Cloudflare `everyvideo-landing` tại https://evd.tyr.io.vn/ , version `9a6b98fd-94a9-405b-b29a-22ded134e3fe`, xác nhận 100% traffic. Bộ QA đầy đủ chạy lại trực tiếp trên production pass: chín viewport, sáu audit axe 0 violation, toàn bộ tương tác/focus, parallax thực sự thay đổi khi cuộn, nút về đầu trang hiện đúng ngưỡng và reduced-motion tắt parallax. Không lỗi runtime/request/ảnh; đã xem screenshot mobile production.

## 2026-10-21 — Tên miền production

- Cinema Library đã triển khai công khai trên Cloudflare Workers tại https://evd.tyr.io.vn/ theo lựa chọn người dùng. DNS/HTTPS được quản lý qua Worker Custom Domain; cấu hình vận hành ở `sites/everyvideo-landing/wrangler.jsonc` và README. Chi tiết topology ở [[02 - Architecture]].
- Cập nhật canonical/OG, robots và sitemap theo tên miền mới. Build/TypeScript/lint/dry-run và remote smoke desktop/mobile pass; đã xem screenshot production, nút tải hoạt động, không yêu cầu đăng nhập, không lỗi ảnh hoặc JavaScript. Evidence: `output/playwright/everyvideo-cloudflare/`. Bản Sites trước đó cũng đã chuyển public theo yêu cầu.

## 2026-10-21 — Dựng lại theo ảnh Cinema Library người dùng chọn

- Người dùng chỉ định rõ `output/design/landingpage-concepts-20261021/03-cinema-library.png` và yêu cầu đọc source rồi dựng UI cơ bản giống ảnh. Hướng này thay thế landing page ivory/serif trước đó.
- Đã đọc lại README, kiến trúc/ràng buộc, `public/index.html`, `public/script.js`, media routes và source React marketing. Chỉ cập nhật `sites/everyvideo-landing/`; không sửa downloader, API, config/cookie runtime hoặc DOM contract của app thật.
- Bố cục mới: hero ảnh núi hồ hoàng hôn phủ trang, tiêu đề Việt ba dòng “Giữ lại những điều đáng xem.”, navigation tích hợp trên ảnh, CTA coral, cửa sổ Studio chồng lên hero, ba cột Video/Âm thanh/Phụ đề, dải YouTube/Bilibili/TikTok/Facebook/Instagram/X, CTA ngắn và footer graphite.
- Manrope self-host có subset tiếng Việt/Latin, weight 400–800; mặc định tiếng Việt + dark, có chuyển VI/EN và sáng/tối. Primary coral dùng chữ graphite để đảm bảo contrast. Có responsive desktop/tablet/mobile và reduced-motion.
- Hero và ảnh tai nghe được tạo mới bằng image tool theo art direction ảnh tham chiếu, lưu nguồn tại `assets/` trong app marketing. Prompt ở `assets/prompts.json`, design system ở `DESIGN.md`, WebP responsive tạo bằng `scripts/optimize-cinema.mjs`. Hero mobile ~75 KiB, desktop ~251 KiB, ảnh audio ~45 KiB. Bilibili dùng asset Simple Icons, icon UI dùng Phosphor.
- `StudioPreview.tsx` là preview tương tác có nhãn minh họa: các tab Studio/Hàng chờ/Nâng cao/Cài đặt, loại media, radio/select chất lượng, thêm/xóa hàng chờ và tùy chọn local hoạt động. Không gửi link nhập cho backend hoặc giả tiến độ/tệp tải; CTA tải ứng dụng dùng asset Windows v1.2.0 thật. Hướng dẫn ba bước và download dialog có Escape, focus loop và đường dẫn release/checksum.
- Build + TypeScript strict + lint pass. Production JS ~417 kB / ~126 kB gzip, CSS ~37 kB / ~8.7 kB gzip. Các ảnh được lazy load ngoài hero; không autoplay audio/video.
- QA production ở 1440×1000, 1086×900 (cùng chiều rộng ảnh tham chiếu), 1024×768, 768×1024, 390×844, 360×800 và landscape 844×390: không overflow, hero CTA trong viewport portrait, ảnh đủ và 0 runtime error. Đã xem desktop/reference-width/mobile và light screenshot sau khi transition hoàn tất.
- Axe WCAG 2/2.1/2.2 A/AA: 0 violation ở dark, light và download dialog. Product/media tabs với phím mũi tên, quality sync, queue add/remove, controls nâng cao, settings, link feedback, help/download modal, Tab containment/Escape, VI/EN, menu mobile và reduced-motion đều pass. Evidence: `output/playwright/everyvideo-cinema/`, script `output/playwright/cinema-check.cjs`. Đây là audit tự động, không phải chứng nhận WCAG đầy đủ.
- Đã đồng bộ source và đóng gói `output/everyvideo-cinema-site.tar.gz` với Site identity hiện có, giữ owner-only audience.
- Deployment Cinema Library đã **succeeded** tại https://everyvideo-studio.tartmite13.chatgpt.site ; đã mở và xác nhận trang mới có tiêu đề/nội dung tiếng Việt, Studio và các section đúng bản dựng. Bản marketing vẫn là static site, không host backend extraction.

## 2026-10-21 — Landing page premium đã triển khai

- Người dùng yêu cầu landing page luxury/premium bằng React + TypeScript + Tailwind, đủ hero, giá trị, tính năng, showcase, bằng chứng sản phẩm, CTA và footer; sau đó xác nhận thương hiệu là **EveryVideo**.
- Tạo ứng dụng marketing độc lập tại `sites/everyvideo-landing/`, có `DESIGN.md`, README, Vite, TypeScript strict, Tailwind v4, Motion LazyMotion và Phosphor. Không đổi frontend thuần, backend hoặc DOM/API/i18n contract của downloader.
- Hướng “Keep what moves you”: canvas ivory, graphite/coral gắn với thương hiệu hiện tại, Cormorant Garamond + Manrope tự host, hero ảnh panorama, grid editorial bất đối xứng, khoảng trắng lớn và motion transform/opacity có reduced-motion.
- Đã dùng UI/UX Pro Max, frontend-design, design-spec và imagegen. Không tìm thấy skill có tên High-End Visual Design hoặc Impeccable trong kho skill/plugin đã cài; đã thông báo dùng workflow visual hiện có. Concept travel ban đầu được thay hoàn toàn bằng nội dung thật của EveryVideo sau xác nhận thương hiệu.
- Hero được tạo bằng image tool; ảnh minh họa hỗ trợ lấy từ Unsplash, cache cục bộ và có nguồn ở README. WebP responsive dùng ảnh 768/1536px cho hero, 480/1100px cho collection, 900/1800px cho story. Hero mobile ~91 KiB. Prompt và hệ thống thiết kế lưu trong DESIGN.md.
- Showcase dùng ba ảnh chụp **giao diện thật** của app ở chế độ video/audio/subtitles, dựng với metadata mẫu không chứa dữ liệu cá nhân. Caption nêu rõ example media. Tab có ArrowLeft/Right, Home/End; collection filter và card liên kết đúng tab; FAQ và menu mobile hoạt động. Không giả testimonial, rating, số người dùng hoặc hỗ trợ mọi website.
- CTA mở dialog tải Windows với installer và portable-folder ZIP v1.2.0; release notes, checksum và mã nguồn GitHub là link thật. Đã đọc API GitHub để xác minh release public/non-prerelease và tên asset. Dialog nêu build chưa ký số và cách giữ file portable.
- `npm run build` (bao gồm TypeScript strict), `npm run lint` và dependency audit đều pass; audit không có vulnerability. Production JS ~360 kB / ~112 kB gzip, CSS ~37 kB / ~8.4 kB gzip.
- Browser QA production ở 1440×900, 1024×768, 768×1024, 390×844, 360×800 và landscape 844×390: không tràn ngang, CTA hero nằm trong viewport portrait, ảnh tải đủ và không có runtime error. Axe WCAG 2/2.1/2.2 A/AA: 0 violation cho trang và dialog. Đã sửa vòng Tab của dialog; containment, Escape, focus restoration, product tabs, filters, FAQ và menu đều pass. Đây là kiểm tra tự động, không phải chứng nhận accessibility đầy đủ.
- Evidence và screenshot nằm tại `output/playwright/everyvideo-landing/`; report `report.json`, `accessibility.json`, `modal-accessibility.json`. Script capture dùng fixture tại `output/playwright/capture-everyvideo.cjs`; không chạy extractor, tải video hoặc đổi config runtime thật.
- Landing page có repository độc lập do Sites quản lý trong thư mục ứng dụng; không thêm Git dependency/submodule vào downloader. Source đã được đồng bộ và gói static tại `output/everyvideo-landing-site.tar.gz` cho private hosted preview.
- Private deployment đã **succeeded**, URL: https://everyvideo-studio.tartmite13.chatgpt.site . Đây là landing page tĩnh và link tải app, không phải backend extraction được host online; audience vẫn owner-only.

## 2026-10-21 — Ảnh tham khảo landing page

- Theo yêu cầu đọc nguồn rồi tạo vài ảnh landing page, đã đối chiếu bộ nhớ, `DESIGN.md`, tài liệu sản phẩm, HTML/CSS/JS giao diện và các route backend liên quan.
- Tạo ba ảnh bằng công cụ `image_gen` theo workflow `imagegen`; không tìm thấy skill riêng `imagegen-frontend-web` trong các thư mục skill/plugin đã cài và đã thông báo cách thay thế.
- Kết quả tại `output/design/landingpage-concepts-20261021/`: `01-graphite-studio.png` (tối, product-led), `02-paper-editorial.png` (sáng, bố cục editorial), `03-cinema-library.png` (ảnh điện ảnh phủ hero). Có `README.md` và `prompts.json` lưu brief/prompt từng hướng.
- Đã xem trực tiếp cả ba ảnh, đối chiếu thương hiệu, chủ đề, bố cục và luồng chức năng. Đây là mockup tham khảo, nhãn nhỏ/trạng thái có thể cần chỉnh nếu triển khai. Chưa chọn hướng hoặc sửa giao diện sản phẩm; Graphite Signal vẫn là design contract hiện hành. Không chạy test ứng dụng vì không sửa mã chạy.

## Phạm vi và bằng chứng

- Nghiên cứu đã được dùng làm cơ sở cho đợt nâng cấp UI đầu tiên; phần cập nhật hiện tại giữ nguyên API và DOM contract.
- Đọc `DESIGN.md`, `ui-overhaul-plan.md`, `public/index.html`, `public/script.js`, `public/style.css` và `public/graphite-signal.css`.
- Quan sát UI đang chạy ở desktop 1440×900 và mobile 390×844.
- Kiểm tra Studio, Hàng Chờ, Nâng Cao, Cài Đặt, dark theme và light theme.
- Kiểm tra luồng phân tích bằng URL công khai mẫu. Runtime local bị Windows sandbox chặn kết nối mạng với `WinError 10013`, nên trạng thái sau khi nhận metadata chưa được xác minh trực tiếp trong phiên này; cấu trúc trạng thái được đối chiếu từ HTML/JS và các lần kiểm thử đã ghi trong [[07 - Testing]].

## Tóm tắt hiện trạng

EveryVideo đã có nền tảng tốt cho một media workstation: URL và Phân Tích nằm ở command bar, Studio dùng mô hình inspector + format explorer, tab chính rõ ràng, signal-coral nhất quán, có dark/light, focus-visible, skip link và layout mobile không tràn ngang ở 390 px trong lần kiểm tra này.

Điểm làm UI nặng là lượng thông tin kỹ thuật xuất hiện quá sớm và quá dày. Quick settings, bảng format, các nhãn CLI, emoji trong select, badge đa màu và nhiều đường viền khiến mắt phải xử lý nhiều tín hiệu trước khi người dùng chọn được chất lượng và bắt đầu tải.

## Điểm đang làm tốt

1. **Primary action dễ tìm:** ô URL và Phân Tích nằm ở vị trí cố định, có một màu signal rõ.
2. **Mô hình desktop hợp lý:** sidebar dành cho ngữ cảnh và tùy chọn, explorer dành cho dữ liệu format.
3. **Trạng thái rỗng có hướng dẫn:** màn hình ban đầu nói rõ hành động đầu tiên và hỗ trợ nhiều nền tảng.
4. **Tách nhóm chức năng:** Studio, Hàng Chờ, Nâng Cao và Cài Đặt đã có ranh giới rõ.
5. **Nền tảng accessibility đã có:** skip link, heading ẩn, tab semantics, focus-visible và reduced-motion đã được đặt trong design contract.

## Vấn đề ưu tiên

| Vấn đề | Heuristic liên quan | Mức độ | Hướng xử lý nghiên cứu |
|---|---|---:|---|
| Luồng chính bị chia giữa command bar, card rỗng, quick settings và bảng format | Recognition over recall, aesthetic/minimal design | Major | Làm rõ 3 bước: Dán link → Chọn chất lượng → Tải; giữ tùy chọn phụ sau một lớp mở rộng |
| Quick settings hiển thị nhiều cờ CLI và mô tả dài ngay trên Studio | Match with real world, minimal design | Major | Dùng nhãn theo kết quả người dùng; đưa cờ kỹ thuật vào tooltip/details/Advanced |
| Bảng format có nhiều cột nhỏ và yêu cầu quét ngang | Flexibility, error prevention | Major | Hiển thị preset chất lượng trước; bảng chi tiết là chế độ power user, có cột ưu tiên theo viewport |
| Badge nền tảng dùng nhiều màu trong empty state | Consistency, visual hierarchy | Minor | Giữ một accent coral; nền tảng chỉ là metadata trung tính hoặc dùng màu ở mức rất nhẹ |
| Advanced là một form dài, nhiều nhóm và song ngữ trong cùng nhãn | Recognition over recall, user control | Major | Chia theo nhóm có thể thu gọn, có summary “Đang dùng”, reset nhóm và tìm kiếm tùy chọn |
| Queue rỗng tạo vùng trống lớn, CTA xóa đứng gần CTA bắt đầu | Visibility of status, error prevention | Minor | Empty state ngắn hơn; chỉ nhấn mạnh thêm từ Studio và hạ cấp Xóa Hàng Chờ |
| Light theme trông phẳng và nhạt hơn dark theme | Visibility, visual design | Minor | Audit contrast riêng cho text muted, placeholder, border và disabled; tăng phân cấp surface thay vì tăng shadow |
| Emoji và nhãn trạng thái kỹ thuật trộn với icon SVG | Consistency | Minor | Chuẩn hóa một họ icon; emoji chỉ dùng khi là dữ liệu người dùng hoặc tên nền tảng |

## Hướng thiết kế đề xuất

### North star

**“Chọn đúng chất lượng trong vài giây; mở sâu khi cần kiểm soát.”**

Giữ Graphite Signal nhưng làm UI giống một công cụ chuyên nghiệp có nhịp thở hơn:

- Một command bar gọn: URL là trọng tâm, cookie là tùy chọn phụ, Phân Tích là CTA duy nhất.
- Sau khi phân tích, đưa video summary lên đầu sidebar và đưa lựa chọn tải lên vị trí dễ thấy.
- Ưu tiên các preset dễ hiểu như Best available, 1080p, 720p, Audio only; bảng format chi tiết vẫn giữ cho người cần exact ID.
- Tách “kết quả tải” khỏi “cách downloader hoạt động”. Người dùng phổ thông chọn kết quả; power user mở Advanced để chọn engine, CDN, connections và flags.
- Download dock sticky ở desktop và bottom action bar ở mobile, luôn cho biết format, container, ước tính dung lượng và trạng thái nút.

### Cấu trúc Studio đề xuất

```text
Command bar
  URL + Phân Tích

Studio
  Video summary
    thumbnail, title, duration, source, subtitle count
  Download setup
    preset chất lượng
    container / audio / subtitle ở nhóm phụ
  Format explorer
    preset view mặc định
    detailed table cho exact format
  Download dock
    format summary + estimated size + Download
```

### Các trạng thái cần thiết kế lại

1. **Empty:** một minh họa nhỏ, một câu hướng dẫn, ví dụ URL; giảm tag nền tảng.
2. **Analyzing:** skeleton cho video summary và format explorer; thông báo tiến trình ngắn, không che toàn bộ màn hình nếu không cần.
3. **Ready:** preset chất lượng được chọn sẵn theo logic hiện tại; format table có selected row rõ.
4. **No result:** giải thích nguyên nhân và hành động sửa URL/cookie/đăng nhập.
5. **Downloading:** dock hiển thị phần trăm, tốc độ, ETA, pause/cancel; log terminal nằm sau disclosure.
6. **Success:** tên file, thư mục lưu, nút Mở thư mục và tùy chọn tải tiếp.
7. **Error:** lỗi theo ngữ cảnh, có hành động thử lại và giữ lại lựa chọn người dùng.

## Hướng visual

### Giữ lại

- Graphite lạnh và signal-coral.
- Segoe UI Variable cho nội dung, Cascadia Mono cho format ID, codec, tốc độ, ETA và command preview.
- Border 1 px, surface shift nhẹ, radius 6/9/12 px.
- 8-point spacing và target tương tác tối thiểu 44 px.

### Điều chỉnh

- Giảm số lượng card lồng nhau; dùng divider và khoảng trắng để phân nhóm.
- Chỉ dùng coral cho active/selected/primary/focus. Màu semantic chỉ dùng cho trạng thái.
- Giảm chữ in hoa ở table header và section heading; dùng sentence case để đọc nhanh hơn.
- Bỏ emoji khỏi select option và heading; thay bằng icon hoặc mô tả ngắn.
- Giảm mô tả inline dài; đặt giải thích kỹ thuật vào tooltip, details hoặc Advanced.
- Bổ sung một cấp surface trung gian cho selected row, hover và disabled để light theme không bị phẳng.

## Hướng cho từng bề mặt

### Studio

- Desktop: giữ inspector + explorer, nhưng sidebar ưu tiên video summary và preset; quick settings thu về “Tùy chọn tải nhanh”.
- Mobile: thứ tự là URL → video summary → preset → Download dock → format details. Tránh đưa toàn bộ advanced fields vào trước bảng format.
- Bảng format: giữ table/card và exact ID; mặc định chỉ hiện các cột quyết định lựa chọn, các cột codec/bitrate/notes mở qua detail row hoặc card.

### Hàng Chờ

- Header nên cho biết số lượng và trạng thái tổng thể.
- Empty state hướng người dùng quay về Studio bằng một CTA rõ.
- Mỗi item nên có thumbnail nhỏ, title, format, thư mục, progress và hành động item-level.
- Xóa hàng chờ là action phụ; khi có item nên có confirm theo phạm vi thao tác, không đặt cạnh primary như một nút ngang cấp.

### Nâng Cao

- Nhóm đề xuất: Tải & Kết nối, Bilibili/CDN, Hậu kỳ, Cắt thời gian, Hành vi & Bảo mật.
- Mỗi nhóm có một dòng summary khi thu gọn, ví dụ “Auto · 8 connections · Anti-P2P bật”.
- Thêm “Khôi phục mặc định” theo nhóm và một vùng “Thay đổi đang áp dụng”.
- Dùng nhãn người dùng trước, tên cờ CLI sau trong helper text.

### Cài Đặt

- Dùng layout settings hai cột ở desktop: navigation nhóm nhỏ bên trái, form bên phải; một cột ở mobile.
- Thư mục lưu là setting quan trọng nhất, nên hiển thị trạng thái đã lưu và quyền mở folder.
- Proxy/cookie nên có trạng thái rõ nhưng không làm lộ thông tin nhạy cảm trong preview.

## Accessibility và content

- Kiểm tra contrast cho text muted, placeholder, disabled, border và focus ở cả hai theme theo WCAG AA.
- Giữ `id`, `data-*`, i18n hooks và keyboard behavior hiện tại.
- Không dùng màu đơn lẻ để phân biệt video/audio/combo; thêm label hoặc icon có text.
- Tránh viết “Video Only”, “Combo” xen với tiếng Việt trong cùng bề mặt nếu không cần; chọn một hệ nhãn theo locale.
- Long title, tên file và path cần wrap/truncate có tooltip hoặc copy action.
- Thông báo phân tích/tải cần nằm trong live region, có trạng thái loading rõ và không phụ thuộc vào toast biến mất nhanh.

## Kế hoạch nghiên cứu trước khi triển khai

1. Chốt 3 persona tối thiểu: người dùng phổ thông, người cần exact format, người tải hàng loạt.
2. Vẽ wireframe cho 5 trạng thái: empty, ready, format detail, downloading, queue.
3. Test nhanh 5 nhiệm vụ: phân tích URL, chọn 1080p, chọn exact ID, đổi thư mục, thêm 2 item vào queue.
4. So sánh 2 phương án: preset-first và table-first; đo thời gian tới lựa chọn đầu tiên, lỗi chọn nhầm và mức hiểu của label.
5. Audit contrast và keyboard ở 390, 768, 1024 và 1440 px trước khi chạm vào code.
6. Sau khi chọn hướng, lập mapping DOM hook và kiểm tra regression trước khi triển khai.

## Kết luận nghiên cứu

Hướng phù hợp nhất là **Graphite Signal 2: Preset-first Media Workstation**. Đây là nâng cấp về thứ bậc, mật độ thông tin và trạng thái, vẫn giữ nhận diện graphite/coral và mô hình inspector + explorer đã có. Chưa có lý do để đổi framework, đổi API contract hoặc thêm tính năng mới chỉ vì mục tiêu làm đẹp UI.

## Trạng thái triển khai đợt đầu

Đã triển khai hướng preset-first trong `public/index.html`, `public/script.js`, `public/graphite-signal.css` và `public/i18n.js`:

- Thêm rail ba bước Dán link → Chọn chất lượng → Tải xuống.
- Sau khi phân tích thành công, chọn sẵn preset chất lượng tốt nhất và ưu tiên preset cards; bảng format vẫn giữ cho exact ID, filter và multi-select.
- Thu gọn Quick Settings và từng nhóm Advanced bằng native disclosure, giữ nguyên các control và hook hiện tại.
- Làm gọn empty state, chuẩn hóa platform metadata về một accent, bổ sung CTA từ Queue về Studio.
- Cập nhật đủ bốn locale và giữ dark/light, keyboard focus, reduced motion, responsive layout.

Đã kiểm tra bằng contract tests, unit tests, progress tests, kiểm tra cú pháp, `git diff --check` và smoke test trên trình duyệt ở desktop/mobile. Runtime phân tích URL công khai vẫn chưa được kiểm chứng trong phiên này vì Windows sandbox chặn kết nối mạng với `WinError 10013`.

## Nâng cấp Header Landing Page: Bộ chọn ngôn ngữ & Dark/Light Mode lên đầu trang (2026-10-22)

- **Vị trí & tương tác:** Đưa `theme-toggle` (Sáng/Tối) và `language-control` (VI/EN/JA) lên thanh navigation cố định (`site-header`) ở đầu trang.
- **Visual & Contrast:** Style kính mờ (`rgba(16, 25, 35, 0.45)` + border mảnh) khi nổi trên dark hero; khi cuộn (`header-scrolled`) trong light mode tự động đổi sang background `var(--raised)` và chữ/icon `var(--ink)`. Vòng focus `focus-visible` chuẩn WCAG AA.
- **Responsive:**
  - Desktop (> 768px): gom cụm cùng `desktop-nav` và nút tải Windows.
  - Mobile (<= 767px): căn phải cạnh `mobile-toggle`. Trên màn hình siêu nhỏ (<= 580px xuống tới 320px), ẩn nút download phụ trong header để ưu tiên brand, bộ chọn ngôn ngữ, nút theme và hamburger menu, triệt tiêu 100% tình trạng tràn ngang (`page <= viewport`).
- **Footer:** Gỡ bỏ các control trùng lặp ở footer để footer tinh giản, cân đối và tránh strict mode selector ambiguity trong automated tests.
- **QA & Production:** Build TypeScript pass, ESLint 0 warning/error. Bộ test Playwright kiểm tra 9 viewports và 7 lượt Axe WCAG AA 0 violation. Đã deploy lên Cloudflare Workers (custom domain https://evd.tyr.io.vn/ , version `403a17c3-293f-4aca-9f92-846b5f33d5c3`).

## 2026-10-23 — Tinh giản Thiết kế sang Phong cách "VELVET SILK" (Tối Giản Có Chiều Sâu)

- **Lý do điều chỉnh:** Phong cách cơ khí nhiều chi tiết (`PRISM APERTURE`) gây rối mắt. Chuyển sang ngôn ngữ **"VELVET SILK" (Atmospheric Minimalism)** — loại bỏ 70% đường viền và ký hiệu kỹ thuật thừa, ưu tiên khoảng thở rộng, bề mặt bo góc mềm (`18px`), ánh sáng khuếch tán nhẹ (`Ambient Silk Aura`) và lớp hạt lụa `2.5%`.
- **4 Bảng Màu Khoáng Tự Nhiên Dịu Mắt (`data-silk-theme`):**
  1. **Celadon Matcha (Mặc định):** Đen Rêu Nhung (`#0B0F0E`) + Xanh Ngọc Bích Dịu (`#52DBA3`) + Cam Đất Ấm (`#F2A365`) + Tím Tử Đằng (`#A799F5`).
  2. **Dusk Peach:** Tím Than Hoàng Hôn (`#0F0C12`) + Hồng Đào (`#FA897B`) + Vàng Mật Ong (`#F5C469`).
  3. **Nordic Fjord:** Xanh Đêm Bắc Âu (`#090D12`) + Xanh Sương Băng (`#63CBE8`) + Cát Hổ Phách (`#E8BE6B`).
  4. **Ceramic Light (Chế độ Sáng):** Gốm Trắng Ấm (`#F3F0EA`) + Xanh Xô Thơm (`#1D7D59`) + Đất Nung (`#C96A36`).
- **Tối giản hóa Bố cục:**
  - Gộp Logo, thanh **Capsule Omnibar** và cụm nút chuyển Tab lên cùng 1 hàng Header thoáng đãng.
  - Thay bảng kẻ ô truyền thống bằng danh sách dải thẻ mềm không đường kẻ dọc (chỉ hiển thị 5 thông tin cốt lõi) và một thanh **Floating Bottom Bar** gọn gàng ở đáy. Giữ nguyên 100% DOM contract (`159 IDs` & `121 JS hooks`).
- **Hệ thống Typography Độc bản (Không dùng font đại trà — Hỗ trợ 100% Tiếng Việt):**
  - Loại bỏ các bộ font đại trà (`Inter`, `Roboto`, `Segoe UI`, `JetBrains Mono`).
  - Áp dụng kỹ thuật **Mixed-Voice Editorial Contrast** với 4 bộ phối font có cá tính rõ nét (`data-font-pair`):
    1. **Editorial Velvet (Mặc định):** `Fraunces` (Variable Soft-Serif `opsz 72, SOFT 80` với điểm nhấn chữ nghiêng `.editorial-italic`) + `Bricolage Grotesque` (UI/Body có ink-traps tinh tế) + `Spline Sans Mono` (số liệu bo tròn mềm mại).
    2. **Ink-Trap Grotesque:** `Bricolage Grotesque` (`opsz 96`) + `Schibsted Grotesk` + `Chivo Mono`.
    3. **Cinema Chronicle:** `Newsreader` (High-Contrast Editorial Serif) + `Bricolage Grotesque` + `Spline Sans Mono`.
    4. **Nordic Sculptural:** `Unbounded` (Wide Architectural Display) + `Bricolage Grotesque` + `Chivo Mono`.
- **Trạng thái Triển khai (Codebase & ASAR sync):**
  - Đã tích hợp cả 4 tùy chọn Bảng màu (`settingsPaletteSelect`) và 4 tùy chọn Font (`settingsFontSelect`) vào tab Cài đặt (`tab-settings`) trong `public/index.html`.
  - Đồng bộ `public/script.js` lưu trữ và chuyển đổi thời gian thực qua `localStorage` (`silk-theme`, `font-pair`), hỗ trợ phím tắt chuyển đổi giao diện nhanh `themeToggle`.
  - Bổ sung bản dịch đầy đủ trong `public/i18n.js` cho 4 ngôn ngữ (VI, EN, ZH, JA).
  - Nâng cấp `public/graphite-signal.css` với toàn bộ hệ thống biến Velvet Silk & Typography.
  - Đồng bộ trực tiếp 4 file giao diện vào gói ứng dụng Windows `dist/win-unpacked/resources/app.asar`.
  - Bộ kiểm thử hợp đồng `tests/ui_contract_test.js` (161 IDs, 123 hooks) và `tests/server_contract_test.js` pass 100%.
