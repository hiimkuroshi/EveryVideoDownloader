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
updated: 2026-09-29
related:
  - "[[01 - Project Overview]]"
  - "[[05 - Decisions and Constraints]]"
  - "[[07 - Testing]]"
  - "[[08 - Work Log]]"
---

# EveryVideo — Nghiên cứu hướng nâng cấp UI/UX

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
