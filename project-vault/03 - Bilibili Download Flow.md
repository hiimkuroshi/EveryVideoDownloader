---
title: Bilibili Download Flow
aliases:
  - Luồng tải Bilibili
  - Bilibili
tags:
  - project/everyvideo
  - platform/bilibili
  - architecture
type: project
status: active
created: 2026-09-09
updated: 2026-09-09
related:
  - "[[02 - Architecture]]"
  - "[[06 - Known Issues and Risks]]"
  - "[[07 - Testing]]"
---

# Bilibili Download Flow

## Tóm tắt

Bilibili **không có resolver Node.js riêng**. Cả phân tích lẫn tải đều đi qua `core/yt_dlp/extractor/bilibili.py`, với các extractor arg tùy biến:

- `avoid_p2p`: mặc định được lõi hiểu là `true`.
- `upos_host`: ép hostname CDN khi người dùng chọn thủ công.
- `cdn_strategy=fastest`: opt-in probe các URL exact trong base/backup list.

```mermaid
flowchart TD
    A[URL Bilibili] --> B[/api/info]
    B --> C[yt_dlp -J]
    C --> D[Bilibili extractor]
    D --> E[Web page + WBI APIs]
    E --> F[play_info: DASH hoặc legacy durl]
    F --> G[_optimize_stream_url]
    G --> H[Danh sách formats cho UI]
    H --> I[Người dùng chọn format/preset]
    I --> J[/api/download SSE]
    J --> K[yt_dlp downloader]
    K --> L[FFmpeg mux/post-process]
    L --> M[File đầu ra]
```

## Chuỗi cấu hình xuyên lớp

| Ý nghĩa | UI/config | Query API | Extractor arg |
| --- | --- | --- | --- |
| Tránh P2P/MCDN | `bilibiliAvoidP2p` | `bilibili_avoid_p2p` | `bilibili:avoid_p2p=...` |
| Chọn CDN | `bilibiliUposHost` | `bilibili_upos_host` | `bilibili:upos_host=...` |
| Downloader Bilibili direct | `bilibiliDownloadEngine` | `bilibili_download_engine` | backend yt-dlp args |
| Số Range connection | `bilibiliAria2Connections` | `bilibili_aria2_connections` | aria2 `-x/-s/-k` profile |

Frontend gửi các tùy chọn Bilibili ở cả `/api/info` và `/api/download`. Backend chỉ truyền `avoid_p2p=false` khi người dùng tắt; khi bật, backend dựa vào default `true` trong extractor. `bilibiliUposHost=fastest` được đổi thành `cdn_strategy=fastest`, không bị coi là hostname.

## Thuật toán chọn URL media hiện tại

`BilibiliBaseIE._optimize_stream_url()` được áp dụng cho DASH audio, DASH video và legacy fragments:

1. Đọc, chuẩn hóa và deduplicate base URL cùng backup URL.
2. Nếu có UPOS host cụ thể, rewrite base URL sang HTTPS và hostname đó.
3. Nếu `cdn_strategy=fastest`, probe tối đa bốn candidate bằng Range 2 MiB/timeout 4 giây một lần cho `play_info`, sau đó chọn exact URL có host nhanh nhất còn hợp lệ.
4. Nếu anti-P2P bật và base host bị coi là P2P:
   - Chọn backup URL đầu tiên không bị coi là P2P; hoặc
   - Nếu không có, rewrite sang `upos-sz-mirroraliov.bilivideo.com`.
5. Nếu URL sạch còn dùng HTTP, nâng lên HTTPS.

Nhận diện P2P parse hostname/port, dùng marker `mcdn`, `szbdyd`, `pcdn`, `v1direct`, label `xy` độc lập và port `8082/8000`; không còn match substring `xy` trên toàn URL.

> [!info] Trạng thái triển khai
> Unit test không mạng đã bao phủ boundary của P2P host, candidate deduplicate, response `206` và fallback khi probe lỗi. Benchmark thực tế vẫn cần Python, aria2 và URL Bilibili hợp lệ.

## Metadata, WBI và định dạng

- Extractor đọc `window.__INITIAL_STATE__` và `window.__playinfo__` khi có.
- Khi cần, nó gọi các API WBI như `/x/web-interface/wbi/view/detail` và `/x/player/wbi/playurl`.
- WBI key được cache ngắn trong session.
- DASH thường trả video-only và audio-only riêng; FFmpeg cần ghép khi format expression chọn cả hai.
- Legacy `durl` nhiều fragment được biểu diễn bằng `http_dash_segments`; trường hợp FLV có workaround `multi_video`.
- Anthology nhiều phần được xử lý như playlist nếu URL không chỉ định `p` và chế độ playlist được cho phép.

## Cookie và quyền truy cập

Thứ tự cookie ở backend:

1. `--cookies-from-browser <browser>` nếu người dùng chọn browser.
2. `cookies.txt` nếu tồn tại và không chọn browser.
3. Không có cookie.

Trong extractor, cookie `SESSDATA` thể hiện trạng thái đăng nhập. Một số phụ đề, chất lượng cao, bangumi/premium, danh sách riêng tư hoặc nội dung supporter-only có thể yêu cầu login/quyền tài khoản.

> [!danger] Dữ liệu nhạy cảm
> Không ghi nội dung cookie, user/password hoặc URL media có token vào vault, log commit hay issue công khai.

## Format selection

- Preset mặc định `bv*+ba/b` có thể chọn video và audio rồi ghép.
- Chọn một dòng bảng hiện đặt chính xác format ID đó vào `-f`.
- Với Bilibili DASH, một video format ID thường không chứa audio. Cần xác nhận UX có chủ đích là tải stream riêng hay phải tự ghép audio. Theo dõi tại [[06 - Known Issues and Risks#BILI-002 — Exact format ID có thể tạo video không audio]].

## Tốc độ tải

- `--concurrent-fragments` chỉ tăng số fragment DASH/HLS-native tải đồng thời; VOD `.m4s` direct thường đi qua HTTP downloader một kết nối.
- `--http-chunk-size` tạo các Range request tuần tự, không phải nhiều kết nối song song.
- `aria2c` được dùng cho HTTP(S) direct của Bilibili với profile 4/8/16; manifest `dash,m3u8` giữ native. `Auto` fallback native một lần nếu external downloader không chạy hoặc thất bại.
- Khi aria2 active, `--http-chunk-size` bị bỏ qua; diagnostic SSE báo engine thực tế và số connection.
- CDN `fastest` đánh giá candidate exact bằng probe ngắn; lỗi probe không làm extraction fail và quay về auto anti-P2P.
- Phân tích, các hướng aria2/multi-range, CDN scoring và ma trận benchmark nằm tại [[09 - Bilibili Download Speed Research]].

## Tệp cần đọc khi sửa Bilibili

1. `core/yt_dlp/extractor/bilibili.py`
2. `server.js` tại route `/api/info` và `/api/download`
3. `public/script.js` tại config load, analyze request và `startDirectDownload`
4. `public/index.html` tại nhóm cài đặt CDN Bilibili
5. `public/i18n.js`
6. `tests/` và [[07 - Testing]]
