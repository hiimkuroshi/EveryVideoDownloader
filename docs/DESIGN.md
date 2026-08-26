# Design documentation

Tài liệu [`../DESIGN.md`](../DESIGN.md) tại thư mục gốc là **single source of truth** cho giao diện EveryVideo.

## Hệ thiết kế hiện tại

- Chủ đề: **Graphite Signal**.
- Nhận diện hiển thị: **EveryVideo**.
- Nền graphite/charcoal, chữ off-white, signal coral cho selection và primary action.
- Màu success, warning và danger chỉ dùng theo ngữ nghĩa trạng thái.
- Typography dùng font hệ thống; số liệu bảng và progress dùng monospace/tabular numerals.
- Responsive ưu tiên desktop workstation, đồng thời bảo đảm tablet/mobile dùng được và không tràn ngang toàn trang.
- Accessibility gồm skip link, focus-visible, keyboard navigation, live region và reduced motion.

## Ánh xạ triển khai

| Thành phần | Tệp |
| --- | --- |
| Design tokens và component contract | [`../DESIGN.md`](../DESIGN.md) |
| Markup và accessibility structure | [`../public/index.html`](../public/index.html) |
| CSS nền tảng/legacy compatibility | [`../public/style.css`](../public/style.css) |
| Graphite Signal theme và responsive layer | [`../public/graphite-signal.css`](../public/graphite-signal.css) |
| Interaction, theme, tabs và toast | [`../public/script.js`](../public/script.js) |
| Bản dịch giao diện | [`../public/i18n.js`](../public/i18n.js) |

Tệp này thay thế design spec v1 cũ để tránh duy trì hai bộ token mâu thuẫn. Mọi thay đổi UI tiếp theo phải cập nhật `DESIGN.md` ở thư mục gốc trước hoặc cùng lúc với code.
