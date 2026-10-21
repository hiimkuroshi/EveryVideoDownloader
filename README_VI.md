# EveryVideo

EveryVideo là trạm tải media chạy cục bộ, hỗ trợ khám phá định dạng, phụ đề, hàng chờ, điều khiển mạng nâng cao và giao diện Graphite Signal responsive.

**Ngôn ngữ:** [English](README.md) | **Tiếng Việt**

## Khởi động nhanh

### Ứng dụng Windows x64

Bản desktop có cửa sổ riêng và kèm Node.js, Python, FFmpeg/FFprobe, aria2 cùng Chromium headless; người dùng không cần cài các công cụ này riêng.

Tải tại [GitHub Release v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0).

- `EveryVideo-1.2.0-Setup-x64.exe`: bộ cài cho tài khoản hiện tại, có shortcut và gỡ cài đặt.
- `EveryVideo-1.2.0-Portable-Folder-x64.zip`: **khuyến nghị nếu dùng portable**. Giải nén toàn bộ một lần vào thư mục riêng rồi mở `EveryVideo.exe`; giữ nguyên các file/thư mục đi kèm.
- `EveryVideo-1.2.0-Portable-x64.exe`: một file tự giải nén, không cần cài nhưng giải nén lại runtime vào thư mục tạm **mỗi lần mở**, nên chậm hơn bản thư mục hoặc bản đã cài.

Cấu hình và dữ liệu giao diện nằm trong `%APPDATA%/EveryVideo`; video mặc định ở thư mục Downloads/EveryVideo của Windows, có thể đổi trong ứng dụng. Bản portable cũng dùng thư mục dữ liệu này để giữ cấu hình qua các lần mở. Đóng ứng dụng sẽ dừng các tác vụ đang tải. Các bản build cục bộ hiện chưa ký số nhà phát hành.

Build từ mã nguồn trên Windows với runtime portable đã chuẩn bị trong `.runtime/`:

```powershell
npm ci
npm run desktop:check
npm run desktop:build
npm run test:desktop
```

`desktop:check` kiểm tra Python/core, FFmpeg, aria2, icon, giấy phép và chạy thử Chromium. `desktop:pack` chỉ tạo thư mục `dist/win-unpacked` để thử nhanh. `npm run desktop` mở cửa sổ desktop từ mã nguồn; `npm start` vẫn chạy Web UI như trước. Nếu trình quản lý npm chặn install script của Electron, tải runtime chính thức bằng `node node_modules/electron/install.js`. Xem [hướng dẫn build Windows](docs/WINDOWS_DESKTOP.md) để biết tài nguyên cần chuẩn bị và phạm vi kiểm thử.

### Khởi động một chạm trên Windows

Nhấp đúp `Chay_Studio.bat` hoặc `Run_Studio.bat`. Launcher sẽ kiểm tra công cụ cần thiết, chạy server và mở `http://localhost:3000`.

### Khởi động bằng dòng lệnh

```bash
npm install
npm run setup:browser
npm start
```

Sau đó mở [http://localhost:3000](http://localhost:3000).

## Yêu cầu hệ thống

| Công cụ | Khuyến nghị | Vai trò |
| --- | --- | --- |
| Node.js | 22+ | Chạy Express server và khám phá media |
| Python | 3.9+ | Chạy gói mã nguồn `core/yt_dlp` đi kèm |
| FFmpeg | 5+ | Ghép, chuyển đổi, trích xuất audio và nhúng phụ đề |
| aria2c | Tùy chọn | Tăng tốc multi-range HTTP(S) cho file Bilibili `.m4s` direct |
| Trình duyệt | Edge, Chrome, Firefox hoặc Brave | Hiển thị ứng dụng và cung cấp cookie tùy chọn |
| Chromium headless | Tùy chọn, cài bằng `npm run setup:browser` | Đọc DOM/network của trang tương tác |

Server tìm Python theo thứ tự:

1. Biến môi trường `EVERYVIDEO_PYTHON`.
2. `.runtime/python/python.exe` (runtime portable) hoặc `.venv`/`venv` nằm trong dự án.
3. `py.exe`, `python.exe` hoặc `python3.exe` trong `PATH`.

Chỉ định Python cụ thể trong PowerShell:

```powershell
$env:EVERYVIDEO_PYTHON = "C:\DuongDan\python.exe"
npm start
```

EveryVideo cần tạo tiến trình con để chạy Python, Windows Explorer và hộp thoại chọn thư mục. Nếu server chạy trong sandbox hạn chế quyền tạo process, API có thể trả lỗi `spawn EPERM`.

## Tính năng

- Dán URL từ nhiều website để tìm audio, video, ảnh bìa, gallery, phụ đề và nguồn HLS/DASH.
- Sao chép URL gốc hoặc tải từng tài sản, kể cả từ website engine chưa nhận diện.
- Kết hợp quét HTML/JSON/iframe, engine trích xuất hiện có và trình duyệt khi cần.
- Giao diện Graphite Signal dark/light với một màu signal-coral duy nhất.
- Workstation desktop và bố cục mobile 390 px dùng được đầy đủ.
- Bảng format có filter, tìm kiếm, sort, chế độ table/card và multi-select.
- Hàng chờ tuần tự với tiến trình SSE, tốc độ, ETA, pause, resume và cancel.
- Phát hiện, xem trước, chuyển đổi `.srt` và tải `.vtt` phụ đề.
- Tải thumbnail HD kèm proxy fallback cho host ảnh bị giới hạn.
- Cắt khoảng thời gian, chọn container, tải đa phân mảnh và HTTP chunk.
- Tăng tốc stream direct Bilibili với engine `Auto`, `Native` và `aria2c` tùy chọn (4/8/16 connection).
- Workspace hiện dùng candidate Tencent Overseas `upos-sz-mirrorcosov` làm mặc định theo benchmark; `auto` và `fastest` vẫn có để A/B và rollback.
- Folder picker native và phản hồi dựa trên kết quả Explorer spawn thực tế.
- Giao diện Tiếng Việt, English, 简体中文 và 日本語.
- Dịch tiêu đề qua nhiều provider có fallback.
- Resolver riêng cho Douyin và TikTok.

## Trích xuất media từ URL

Dán link trang web hoặc media trực tiếp rồi bấm **Phân Tích**. Khung **Media trong trang** liệt kê loại, chất lượng nếu có, trạng thái kiểm tra và nút **Sao chép URL** / **Tải file**. Có thể lọc audio, video, ảnh, luồng phát và phụ đề. File được lưu vào thư mục đã chọn; tên trùng sẽ được thêm số thứ tự.

Quét HTML chạy cùng engine trích xuất. Khi trang động chưa có nguồn phát khả dụng, ứng dụng tự thử trình duyệt; bật **Quét thêm nội dung tương tác** để yêu cầu bước này cho trang khác. Cài Chromium cục bộ một lần bằng `npm run setup:browser`. Trình duyệt quét dùng phiên ẩn danh riêng; lựa chọn cookie vẫn áp dụng cho engine trích xuất hiện có.

Website đã được hỗ trợ vẫn có preset chất lượng, tùy chọn ghép và hàng chờ. Các nguồn được phát hiện có nút tải riêng; chuyển đổi định dạng, cắt thời gian và hàng chờ áp dụng cho luồng chọn format hiện có. URL HLS/DASH sao chép được là playlist; tải qua app sẽ dùng Python/FFmpeg để ghép media. Một số URL cần Referer hoặc phiên truy cập; app giữ cookie phiên quét ở backend khi cần.

Phạm vi quét là trang được dán, một số iframe và tối đa 120 tài sản. Trang có thể chứa cả nội dung gợi ý hoặc ảnh trang trí ngoài media chính. Trang lớn có thể còn nguồn chưa kiểm tra; bấm **Tải file** sẽ xác minh nguồn đó trước khi lưu. Danh sách có hiệu lực 15 phút; phân tích lại để làm mới. Query ký số được giữ nguyên và lỗi từng bước không làm mất kết quả đã lấy được.

Không thể bảo đảm mọi URL đều trích xuất được. DRM, nội dung riêng tư/không còn tồn tại, anti-bot hoặc player cần thao tác bổ sung có thể ngăn việc lấy nguồn. App không vượt các giới hạn này.

## Giao diện Graphite Signal

Tên hiển thị trong giao diện là **EveryVideo**. Attribution của engine không xuất hiện trong app chrome, nhưng engine trích xuất bên dưới không thay đổi.

Design contract chính thức nằm tại [DESIGN.md](DESIGN.md). Theme được tách thành `public/graphite-signal.css` để việc đại tu hình ảnh không làm thay đổi DOM hook, API contract hoặc logic tải.

Responsive và accessibility gồm:

- Skip link và quan hệ tab/tabpanel đúng ngữ nghĩa.
- Điều hướng tab bằng Arrow, Home và End.
- Focus rõ ràng và hỗ trợ reduced-motion.
- Không tràn ngang toàn trang ở viewport 390 px.
- Toast live region và xử lý an toàn phản hồi lỗi không phải JSON.

## Cấu trúc dự án

```text
EveryVideoDownloader/
├── bin/                          # Folder picker native Windows
├── core/yt_dlp/                  # Lõi Python vendored
├── desktop/                      # Electron shell, icon và giấy phép
├── docs/                         # Hướng dẫn, kiến trúc và docs/plans/
├── lib/                          # Runtime, download và media resolver
├── project-vault/                # Bộ nhớ dự án
├── public/                       # Giao diện HTML/CSS/JavaScript
├── scripts/                      # Setup, build và benchmark
├── tests/                        # Contract, unit và integration tests
├── dist/                         # Bộ cài/ZIP; win-unpacked/ là app mở nhanh
├── Download/                     # Media; incomplete/ giữ file tải dở
├── output/                       # Báo cáo, ảnh và dữ liệu kiểm thử
├── .runtime/                     # Python, FFmpeg, aria2 và Chromium
├── DESIGN.md                     # Design contract chính thức
├── electron-builder.cjs          # Cấu hình đóng gói Windows
├── package.json
├── server.js                     # Express backend
└── setup.js
```

Xem [bản đồ thư mục và tài liệu](docs/README.md). Các thư mục runtime/build/output được Git ignore.

## Tổng quan API

| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/config` | Đọc cấu hình runtime và thư mục tải hiện tại |
| `POST` | `/api/config` | Lưu thư mục tải và tùy chọn nâng cao |
| `GET` | `/api/info` | Trích xuất metadata, format, playlist và phụ đề |
| `POST` | `/api/resolve` | Khám phá nhiều tài sản và trả metadata cùng mã phiên tạm |
| `GET` | `/api/media-preview` | Xem trước ảnh qua mã phiên và mã tài sản |
| `GET` | `/api/media-download` | Tải nguồn trực tiếp hoặc manifest qua SSE |
| `GET` | `/api/download` | Bắt đầu tải và stream tiến trình qua SSE |
| `GET` | `/api/cancel-download` | Dừng tiến trình tải đang chạy |
| `GET` | `/api/download-thumbnail` | Lưu thumbnail HD |
| `GET` | `/api/download-subtitle` | Lưu phụ đề `.srt` hoặc `.vtt` |
| `GET` | `/api/preview-subtitle` | Trả về các cue phụ đề mẫu |
| `GET` | `/api/browse-folder` | Mở folder picker native của Windows |
| `GET/POST` | `/api/open-folder` | Mở thư mục và trả kết quả spawn Explorer thực tế |
| `GET` | `/api/proxy-image` | Proxy ảnh remote bị giới hạn |
| `GET` | `/api/translate` | Dịch tiêu đề với cơ chế provider fallback |

Lỗi khởi chạy process luôn được trả về JSON. Lỗi `EPERM` hoặc thiếu Python không còn rơi xuống trang lỗi HTML mặc định của Express.

### Điều khiển tốc độ Bilibili

Ba cơ chế dưới đây áp dụng cho các đường tải khác nhau:

- `--concurrent-fragments` điều khiển fragment DASH/HLS song song; không tạo tám connection cho một URL `.m4s` direct.
- `--http-chunk-size` tạo các Range request tuần tự bằng downloader native.
- `aria2c` tạo nhiều Range connection cho media HTTP(S) direct. Ở chế độ `Auto`, EveryVideo dùng aria2 khi có và fallback native một lần nếu external downloader lỗi. Manifest DASH/HLS vẫn dùng downloader native.

EveryVideo cũng tự nhận diện binary portable tại `.runtime/aria2/aria2c.exe` và `.runtime/ffmpeg/ffmpeg.exe`. Nếu không có, hãy đặt `aria2c.exe` trong `bin/`, đặt `EVERYVIDEO_ARIA2C` tới executable hoặc cài trong `PATH`. Thiếu aria2 vẫn an toàn: `Auto` tiếp tục bằng native, còn chọn `aria2c` trực tiếp sẽ báo lỗi SSE rõ ràng. UI có profile 4/8/16 connection và tự tắt HTTP chunk khi aria2 active.

Tùy chọn CDN `fastest` probe tối đa bốn URL base/backup exact do Bilibili trả về, mỗi probe 2 MiB với timeout 4 giây. Nếu probe lỗi, extractor quay về chọn anti-P2P hiện tại; diagnostic không ghi signed URL hay query token.

## Kiểm thử

Chạy bộ contract test nhanh và không thay đổi dữ liệu:

```bash
npm run test:contracts
```

Bộ test kiểm tra route API duy nhất, lỗi process được bảo vệ, DOM ID không trùng và toàn bộ DOM hook tĩnh của JavaScript còn tồn tại.

Chạy thêm unit test option builder không dùng mạng:

```bash
npm run test:unit
```

Python test selector/probe Bilibili tự dùng runtime portable trong dự án nếu có, hoặc Python đã cài trên máy:

```bash
npm run test:python
```

Bộ kiểm thử media dùng HTTP fixture và media tạo trong thư mục tạm, không sửa cấu hình người dùng. Cần Chromium và Python, FFmpeg/FFprobe portable trong dự án:

```bash
npm run test:media
npm run test:media-ui
```

Kiểm tra domain chưa biết, HTML/JSON/Nuxt, iframe khác host, JavaScript/POST/phiên truy cập, xem trước/tải/hủy, HLS/DASH bằng FFprobe, clipboard, ngôn ngữ và mobile. Ảnh kiểm chứng UI nằm trong `output/playwright/`.

Bộ integration test gốc có tải dữ liệu mạng thật và thay đổi cấu hình runtime:

```bash
npm test
```

Chỉ chạy bộ này trong môi trường test có thể hoàn nguyên.

## Tài liệu

- [Design contract Graphite Signal](DESIGN.md)
- [Kế hoạch đại tu UI và trạng thái triển khai](docs/plans/ui-overhaul-plan.md)
- [Tổng kết dự án](docs/PROJECT_SUMMARY.md)
- [Ghi chú phát hành](docs/RELEASE_NOTES.md)
- [Kiến trúc lõi — Tiếng Việt](docs/YTDLP_CORE_ARCHITECTURE.md)
- [Kiến trúc lõi — English](docs/YTDLP_CORE_ARCHITECTURE_EN.md)

## Giấy phép và ghi nhận

Lõi trích xuất và tải được cung cấp bởi dự án mã nguồn mở [yt-dlp](https://github.com/yt-dlp/yt-dlp) theo giấy phép tương ứng. EveryVideoDownloader được phân phối theo MIT License.
