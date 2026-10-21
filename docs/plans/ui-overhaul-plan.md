# Kế hoạch đại tu UI EveryVideo

## Mục tiêu

Đại tu toàn bộ lớp trình bày của Web UI theo hướng media workstation chuyên nghiệp, giữ nguyên API contract, luồng tải, trạng thái, i18n và mọi chức năng hiện có. Cho phép làm mới nhận diện và loại bỏ các dòng giới thiệu engine khỏi giao diện người dùng. Backend chỉ được chỉnh ở lớp tìm runtime và xử lý lỗi để khôi phục đúng hành vi vốn có.

**Design read đã chốt:** workstation tải media cho người dùng phổ thông lẫn power user; chủ đề **Graphite Signal**, rõ ràng, gọn và có chiều sâu; `DESIGN_VARIANCE 5 / MOTION 3 / DENSITY 7`.

## Phạm vi bất biến

- Không đổi framework: tiếp tục dùng Vanilla HTML/CSS/JavaScript.
- Không đổi API contract, tham số engine, SSE, hàng chờ hay persistence; cho phép sửa `server.js` khi cần để khởi chạy runtime ổn định và trả lỗi có cấu trúc.
- Có thể thay đổi logo, wordmark và cách trình bày tên sản phẩm; không hiển thị “Powered by yt-dlp” hoặc các dòng quảng bá yt-dlp trong UI, nhưng không thay đổi engine bên dưới.
- Giữ nguyên các `id`, `data-target`, `data-filter`, `data-mode`, `data-i18n*` đang được `public/script.js` dùng; nếu buộc đổi phải có compatibility mapping và test hồi quy.
- Giữ đủ dark/light theme, 4 ngôn ngữ, table/card mode, subtitle, queue, advanced settings, progress/log và folder picker.
- Không dùng redesign để thêm tính năng mới hoặc đổi logic nghiệp vụ.

## Chẩn đoán hiện trạng

- Mobile đang vỡ layout: ở viewport 390 px, vùng nội dung thực 367 px nhưng `body.scrollWidth` đạt 514 px; topbar, tab và CTA tràn màn hình.
- Header gánh quá nhiều control; luồng chính “dán URL → phân tích → chọn format → tải” chưa có thứ bậc đủ mạnh.
- Mật độ card/border/effect cao: audit tĩnh ghi nhận 54 màu, 95 khai báo border, 11 gradient và 49 hiệu ứng; nhiều màu nhấn cạnh tranh với CTA.
- Design source bị phân mảnh giữa `docs/DESIGN.md`, token trong `public/style.css` và `public/assets/design-tokens.css`; giá trị không đồng nhất, thậm chí block light-theme trong CSS có token nằm ngoài selector.
- Accessibility còn thiếu skip-link, `h1`, reduced-motion; nhiều `outline: none`, `transition: all`, target dưới 44 px và form dài 44 trường.
- Icon inline SVG và emoji đang trộn nhiều phong cách; typography Inter + nhiều weight làm UI giống template dashboard phổ biến.

## Hướng thiết kế

- **Màu:** graphite lạnh cho nền/surface; một màu nhấn thương hiệu dạng coral hoặc signal red cho selection/primary action; xanh/vàng/đỏ chỉ dùng cho trạng thái thành công/cảnh báo/lỗi.
- **Chữ:** dùng Segoe UI Variable và Cascadia Mono có sẵn trên hệ thống để tránh request font ngoài; dùng tabular numerals cho bảng/progress.
- **Bề mặt:** giảm “card trong card”; phân nhóm bằng khoảng trắng, divider và tonal surface; một quy tắc radius thống nhất cho container, input và button.
- **Biểu tượng:** một họ icon duy nhất, ưu tiên Phosphor bản local/offline; bỏ emoji trang trí khỏi heading, filter và select khi không mang ý nghĩa dữ liệu.
- **Bố cục:** desktop giữ mô hình inspector + explorer; tablet/mobile chuyển thành luồng dọc có thứ tự, tuyệt đối không tạo horizontal page scroll. Mobile cần usable đầy đủ nhưng không phải nền tảng ưu tiên ngang desktop.
- **Motion:** 120–220 ms cho hover/focus/expand, chỉ animate `transform` và `opacity`, có `prefers-reduced-motion`.

## Công việc

- [x] **1. Khóa hợp đồng UI và baseline:** đã inventory DOM hooks, API calls, i18n keys và kiểm tra các trạng thái chính. → **Kết quả:** contract test xác nhận 148 ID duy nhất và 111 script hook hợp lệ.
- [x] **2. Hợp nhất design system:** đã tạo `DESIGN.md` ở project root và đưa Graphite Signal vào một lớp theme có token rõ ràng. → **Kết quả:** `docs/DESIGN.md` cũ được thay bằng con trỏ tới nguồn chuẩn để không còn hai spec mâu thuẫn.
- [x] **3. Đại tu app shell:** đã rút gọn brand bar, ưu tiên URL + Analyze và làm navigation responsive với active/focus/keyboard state. → **Kết quả:** không tràn ngang tại viewport mobile 390 px.
- [x] **4. Thiết kế lại Studio:** đã làm rõ chuỗi Source → Video summary → Download options → Format explorer → Primary action, đồng thời giữ table/card, filter, sort và selection. → **Kết quả:** URL kiểm thử hiển thị đúng 49 format.
- [x] **5. Đồng bộ Queue, Advanced, Settings và Progress:** đã áp dụng cùng hierarchy, surface, field, button, empty state, modal và toast. → **Kết quả:** toàn bộ control và persistence hook hiện hữu vẫn được giữ.
- [x] **6. Responsive + accessibility pass:** đã thêm breakpoint theo hành vi, skip-link, heading hierarchy, ARIA, focus-visible, target mobile và reduced motion. → **Kết quả:** desktop 1280 px và mobile 390 px dùng được, không có page-level horizontal overflow.
- [x] **7. Visual polish có kiểm soát:** đã chuyển sang font hệ thống/offline, chuẩn hóa accent, state, toast/modal và giảm hiệu ứng cạnh tranh. → **Kết quả:** không còn request Google Fonts và UI có một accent thương hiệu chính.
- [x] **8. Verification cuối:** đã chạy UI/server contract, syntax checks và browser smoke test cho URL thực, theme, language, tabs, translation và folder action. → **Kết quả:** không lỗi console trong luồng đã kiểm thử; API chính và tính năng cũ được giữ nguyên.

## Tiêu chí hoàn thành

- Luồng chính dễ nhận biết trong 5 giây và primary CTA không cạnh tranh với các action phụ.
- 100% chức năng hiện hữu giữ nguyên; server/API không đổi ngoài test fixture nếu cần.
- Desktop 1440/1024, tablet 768 và mobile 390 px đều dùng được; không có page-level horizontal scroll.
- Dark/light và vi/en/zh/ja không vỡ layout; chuỗi dài có wrap/truncate hợp lý.
- Design tokens, component states và tài liệu `DESIGN.md` khớp với code thực tế.

## Skill và plugin hỗ trợ

- **Dùng trực tiếp:** `frontend-design`, `design-spec`, `web-design-guidelines`, `brainstorming`, `plan-writing`.
- **Dùng khi triển khai/QA:** `i18n-localization`, `webapp-testing`, `lint-and-validate`, `verify-changes`.
- **Đã tìm thấy nhưng không cần cài thêm:** `web-design-guidelines` đã có sẵn và là lựa chọn uy tín/phù hợp nhất; `frontend-design-system` trên skills.sh có nội dung gần giống bộ skill hiện tại nên bị trùng phạm vi.
- **Plugin tùy chọn:** Figma hữu ích nếu muốn duyệt wireframe, component inventory và handoff trước khi code. Canva không cần thiết cho UI workstation; chỉ cân nhắc khi làm asset marketing.

## Quyết định đã chốt

- Cho phép thay đổi mạnh nhận diện; loại bỏ các dòng hiển thị liên quan đến yt-dlp.
- Desktop là nền tảng ưu tiên; mobile cần usable đầy đủ, không cần parity về mật độ/bố cục.
- Chọn **Graphite Signal** làm chủ đề chính; mockup A là visual baseline.
- Giữ nền graphite/charcoal, typography off-white và signal-coral cho active state/primary action; màu semantic không được dùng như accent trang trí.

## Trạng thái triển khai — 26/08/2026

- Đã tạo design contract gốc tại `DESIGN.md` và lớp theme độc lập `public/graphite-signal.css`.
- Đã đổi nhận diện hiển thị thành **EveryVideo**, bỏ attribution engine và loại bỏ font tải từ Google.
- Đã giữ nguyên toàn bộ hook chức năng; contract test xác nhận 148 ID duy nhất và 111 tham chiếu DOM tĩnh đều hợp lệ.
- Đã hoàn thiện dark/light, bốn ngôn ngữ, tab keyboard, focus-visible, skip-link, reduced-motion và toast có live region.
- Đã kiểm tra thật trên Chromium: desktop 1280 px và mobile 390 px không tràn ngang; đổi theme, ngôn ngữ và tab đều hoạt động.
- API contract, SSE và logic tải được giữ nguyên; lớp tìm Python runtime, xử lý lỗi process/JSON và xác nhận mở thư mục đã được sửa để khôi phục hành vi đúng.
- URL YouTube do người dùng cung cấp đã được kiểm thử thật: HTTP 200, metadata hợp lệ và 49 format; dịch tiêu đề và mở thư mục cũng hoạt động.

## Mockup chủ đề

Sáu concept đã được khảo sát trong phiên thiết kế: Graphite Signal, Arctic Cobalt, Studio Noir, Carbon Mint, Spatial Glass và Neo Editorial. **Graphite Signal** là phương án được chọn và đã triển khai; prompt tái tạo/cải tiến concept được lưu tại `docs/ui-concepts/prompts.md`.
