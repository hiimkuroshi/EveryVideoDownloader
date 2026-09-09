---
title: Known Issues and Risks
aliases:
  - Vấn đề đã biết
  - Rủi ro
tags:
  - project/everyvideo
  - risk
type: project
status: active
created: 2026-09-09
updated: 2026-09-09
related:
  - "[[03 - Bilibili Download Flow]]"
  - "[[07 - Testing]]"
---

# Known Issues and Risks

> [!info] Quy ước
> Các mục dưới đây là phát hiện từ đọc mã hoặc khoảng trống kiểm thử. Chúng chưa đồng nghĩa với bug đã tái hiện ngoài mạng.

## BILI-001 — `allow_p2p` có thể không tắt anti-P2P

- **Mức:** cao
- **Trạng thái:** cần tái hiện
- **Quan sát:** UI có lựa chọn UPOS `allow_p2p`, nhưng frontend vẫn gửi checkbox anti-P2P độc lập. Backend truyền `upos_host=allow_p2p`; extractor bỏ qua giá trị này như một custom host, trong khi `avoid_p2p` vẫn mặc định `true` nếu checkbox còn bật.
- **Rủi ro:** Nhãn “giữ CDN gốc/cho phép P2P” có thể không phản ánh hành vi thực.
- **Kiểm chứng:** Chọn `allow_p2p` khi checkbox bật, log host đầu vào/đầu ra đã che query token, rồi so sánh khi checkbox tắt.
- **Hướng xử lý dự kiến:** Đồng bộ hai control hoặc quy đổi `allow_p2p` thành `avoid_p2p=false` ở backend.

## BILI-002 — Exact format ID có thể tạo video không audio

- **Mức:** cao
- **Trạng thái:** cần tái hiện
- **Quan sát:** click một dòng gọi `setFinalFormat(item.id)`. Bilibili DASH thường tách video và audio. UI có `selectedAudioTrack`/audio merge helper nhưng chưa thấy event wiring làm format thành `videoID+audioID`.
- **Rủi ro:** Người dùng chọn chất lượng video cụ thể và nhận file im lặng.
- **Kiểm chứng:** Tải một exact DASH video ID, kiểm tra streams bằng FFprobe; so sánh với `bv*+ba/b`.
- **Hướng xử lý dự kiến:** Khi chọn video-only, hiện audio helper và tạo expression `${videoId}+${audioId}`; vẫn cho phép “video-only” rõ ràng.

## BILI-003 — Nhận diện P2P bằng substring `xy` quá rộng

- **Mức:** trung bình
- **Trạng thái:** đã xử lý trong implementation hiện tại; cần xác nhận bằng mẫu mạng thật
- **Quan sát:** `_is_p2p_host` hiện parse hostname/port và chỉ match marker hoặc label `xy` độc lập.
- **Rủi ro còn lại:** Các marker P2P có thể thay đổi theo upstream; bảng pattern cần cập nhật khi Bilibili đổi CDN.
- **Kiểm chứng:** Unit test boundary đã có; bổ sung hostname thực tế trong regression test khi thu thập được.

## BILI-004 — Rewrite hostname giả định mirror tương thích

- **Mức:** trung bình
- **Trạng thái:** cần benchmark
- **Quan sát:** `_replace_upos_host` giữ nguyên path/query và đổi scheme/host.
- **Rủi ro:** Một số URL ký theo host, vùng hoặc CDN có thể trả 403/404/timeout.
- **Kiểm chứng:** Ma trận base host × mirror × login state; ghi status, TTFB, throughput và checksum/duration.

## TEST-001 — Thiếu regression test Bilibili chuyên biệt

- **Mức:** cao
- **Trạng thái:** open
- **Quan sát:** contract tests chỉ kiểm tra cấu trúc UI/server; integration suite hiện dùng URL YouTube.
- **Rủi ro:** Thay đổi extractor args, CDN rewrite hoặc cookie flow có thể hỏng mà CI vẫn xanh.
- **Hướng xử lý dự kiến:** Thêm unit tests không mạng cho URL optimizer/arg builder và integration test Bilibili opt-in.

## SEC-001 — Các route fetch remote cần xem xét SSRF

- **Mức:** trung bình
- **Trạng thái:** chưa audit đầy đủ
- **Quan sát:** image/subtitle proxy nhận URL từ query và backend thực hiện fetch.
- **Rủi ro:** Nếu app được expose ra ngoài localhost, URL tùy ý có thể truy cập tài nguyên nội bộ.
- **Hướng xử lý dự kiến:** Chỉ bind localhost, validate protocol/host và chặn private/link-local ranges nếu route phải tồn tại.

## OPS-001 — Integration test thay đổi dữ liệu runtime

- **Mức:** trung bình
- **Trạng thái:** known behavior
- **Quan sát:** `npm test` khởi động server, POST config, tải artifact và dùng mạng thật.
- **Rủi ro:** Ghi đè cấu hình người dùng hoặc để lại file test.
- **Hướng xử lý dự kiến:** Dùng config/output tạm và restore trong `finally`.

## PERF-001 — “Concurrent fragments” không tăng tốc `.m4s` direct

- **Mức:** cao
- **Trạng thái:** đã thêm engine aria2 tùy chọn; cần benchmark mạng
- **Quan sát:** Backend truyền `-N`, nhưng Bilibili DASH VOD thường được extractor trả về như một URL HTTP(S) trực tiếp. `FragmentFD` không tham gia nên 8 worker không tạo 8 connection.
- **Rủi ro:** UI tạo kỳ vọng tăng tốc nhưng tốc độ không đổi.
- **Hướng xử lý:** Tách “fragment workers” khỏi “connections per file”; `Auto/aria2c` dùng aria2 multi-range cho HTTP(S) direct, manifest vẫn native và Auto fallback một lần.

## PERF-002 — Hard-pin UPOS có thể chọn route chậm

- **Mức:** cao
- **Trạng thái:** đã benchmark một video; default local tạm chọn `mirrorcosov`, cần benchmark đa video
- **Quan sát:** Khi có `upos_host`, extractor rewrite base URL và return ngay; không đo base/backup URL và không giữ mirror cho fallback.
- **Rủi ro:** Một host được gắn nhãn nhanh có thể chậm hoặc lỗi với ISP/vùng hiện tại.
- **Hướng xử lý:** Range probe tối đa bốn candidate exact, 2 MiB/4 giây, chọn host nhanh nhất trong danh sách Bilibili trả về và fallback auto khi probe lỗi. Với video đã test, `mirrorcosov` pass 3/3 và nhanh nhất theo median; không coi đó là tối ưu toàn cầu, cần ma trận đa video. Chi tiết tại [[09 - Bilibili Download Speed Research]].

## PERF-003 — Chưa đủ benchmark đa video để kết luận lợi ích toàn mạng

- **Mức:** cao
- **Trạng thái:** đã benchmark và FFprobe một video; gate đa video còn mở
- **Quan sát:** Python 3.14.7 portable và `aria2c` 1.37.0 đã được cài ở `.runtime/` (bị gitignore), resolver tự nhận diện; ma trận 21 case và 14 lượt lặp có 23 file pass hợp lệ.
- **Rủi ro:** Kết quả hiện tại chưa xác nhận profile 4/8/16, CDN `fastest` và mức tăng tốc 20% trên nhiều video/route; HTTP 412 có thể thay đổi theo rate-limit upstream.
- **Hướng xử lý:** Chạy ma trận tối thiểu ba video × ba lần ở nhiều thời điểm, ghi median MiB/s/TTFB/host không chứa token; chỉ sau gate này mới hard-code default phát hành rộng.
