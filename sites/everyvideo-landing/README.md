# EveryVideo / Cinema Library

Landing page React + TypeScript + Tailwind CSS v4 + Motion, dựng theo ảnh tham chiếu người dùng chọn: `03-cinema-library.png`. Hỗ trợ 3 ngôn ngữ: Tiếng Việt (mặc định), English và 日本語; tự động ghi nhớ lựa chọn qua URL parameter (`?lang=ja|en|vi`) và `localStorage`, cùng giao diện sáng/tối.

## Chạy và kiểm tra

```sh
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Preview tại `http://127.0.0.1:5174/`. Build gồm TypeScript strict, đầu ra tĩnh tại `dist/`. Design system và quyết định bố cục ở [DESIGN.md](DESIGN.md).

## Nội dung và hành vi

- Cinema Library mở rộng: hero núi hồ có parallax, navigation cố định và reading progress, Studio nổi, hướng dẫn ba bước tương tác, Video / Âm thanh / Phụ đề, dải nền tảng, showcase hàng chờ/local/advanced, bộ sưu tập theo tình huống dùng, bộ chọn bốn loại media, bảy FAQ và CTA tải đầy đủ.
- Studio là **bản xem trước tương tác, dùng dữ liệu minh họa**. Các tab Studio/Hàng chờ/Nâng cao/Cài đặt, loại media, lựa chọn chất lượng và thêm/xóa hàng chờ hoạt động cục bộ. Liên kết thật không được gửi đi hay giả vờ phân tích.
- Nút tải mở lựa chọn installer hoặc portable ZIP của [release v1.2.0](https://github.com/hiimkuroshi/EveryVideoDownloader/releases/tag/v1.2.0). Có thông tin bản chưa ký số, release notes và checksums.
- Hướng dẫn giải thích luồng thật trong ứng dụng: dán link → phân tích → chọn format/chất lượng → lưu về máy.
- Native dialog hỗ trợ Escape, đóng bằng backdrop, vòng Tab và trả focus. Các tab hỗ trợ phím mũi tên, Home/End; nút và field có tên truy cập. Motion tôn trọng reduced-motion.
- Workflow có ba trạng thái và radio chất lượng minh họa. Format explorer chuyển Video / Âm thanh / Phụ đề / Ảnh bìa với tên tệp mẫu, định dạng và mô tả đúng ngữ cảnh. Link hàng chờ/nâng cao mở tab tương ứng trong Studio và chuyển focus. FAQ mở/đóng được bằng bàn phím.
- Motion: tiêu đề hiện theo dòng, hero parallax giới hạn, reveal khi cuộn, transition panel, pointer spotlight, hover ảnh và phản hồi nút. Dùng MotionValues cho scroll/pointer, không có timer carousel hoặc scroll hijacking. Chế độ giảm chuyển động tắt parallax/hover transforms và hiện nội dung ngay.
- Landing page không cần backend extraction, không đổi ứng dụng downloader hiện có, không đọc config/cookie/tệp tải cá nhân, không giả testimonial hay bảo đảm tương thích mọi website.

Tính năng được đối chiếu từ README dự án, `public/index.html`, `public/script.js`, media routes và các ghi chú kiến trúc/ràng buộc. Các lựa chọn format trong preview là ví dụ; khả năng tải thực tế phụ thuộc nguồn.

## Cấu trúc

- `src/App.tsx`: trang, điều hướng, theme và ngôn ngữ.
- `src/StudioPreview.tsx`: state và tương tác preview độc lập.
- `src/components.tsx`: brand, CTA, reveal và dialog dùng chung.
- `src/data.ts`: nội dung VI/EN/JA và URL release.
- `src/storyCopy.ts`: nội dung VI/EN/JA cho các phần giới thiệu mở rộng.
- `src/LandingStory.tsx`: workflow, control showcase, collections, format explorer, FAQ và motion components.
- `src/styles.css`: design tokens, component styles và responsive layout.
- `src/story.css`: kiểu trình bày/motion và responsive của các phần mở rộng.
- `assets/cinema-hero.png`, `assets/cinema-audio.png`: ảnh nguồn do image tool tạo.
- `scripts/optimize-cinema.mjs`: tạo WebP 768/1536px từ ảnh nguồn; chạy bằng `node scripts/optimize-cinema.mjs`.

## Hình ảnh và font

Hero và ảnh tai nghe được tạo bằng công cụ image-generation tích hợp, theo art direction của ảnh tham chiếu. Prompt cuối lưu trong `assets/prompts.json`. Ảnh là minh họa, không đại diện cho video có thể tải từ landing page. Waveform là graphic bằng CSS, không giả phát âm thanh. Hero mobile ~75 KiB, hero desktop ~251 KiB, ảnh audio ~45 KiB.

Manrope được self-host qua Fontsource, gồm subset tiếng Việt và Latin. Icon UI từ Phosphor; Bilibili từ Simple Icons (`https://cdn.simpleicons.org/bilibili/00A1D6`). Các nền tảng được minh họa dựa trên extractor có trong source, không mang ý nghĩa liên kết hoặc bảo đảm mọi URL hoạt động.

Ảnh Japan và Namibia tái sử dụng từ bộ asset editorial sẵn có trong dự án (nguồn Unsplash), không đại diện cho nội dung cụ thể có thể tải. Các tình huống học/nghe/sáng tạo là gợi ý sử dụng, không phải testimonial.

## Xuất bản

Production: **https://evd.tyr.io.vn/**, công khai trên Cloudflare Workers Static Assets. Cấu hình ở `wrangler.jsonc`, Worker `everyvideo-landing`; custom domain để Cloudflare quản lý DNS và HTTPS tự động. Wrangler được khóa phiên bản trong devDependencies. Không cần Worker script hoặc máy cá nhân chạy nền.

```sh
npm ci
npx wrangler whoami
npm run deploy:check
npm run deploy
```

Đăng nhập Cloudflare bằng `npx wrangler login` nếu chưa có phiên hợp lệ. Tài khoản triển khai cần quyền Workers và quản lý route/domain của zone `tyr.io.vn`. Không đưa thông tin đăng nhập vào source hoặc biến môi trường công khai.

`npm run deploy` build trước khi xuất bản `dist/`. Canonical, Open Graph, robots và sitemap dùng tên miền production. Muốn kiểm tra phiên bản đang chạy: `npx wrangler deployments list`.

Site identity cũ trong `.openai/hosting.json` vẫn được giữ cho bản Sites đã công khai. Source của landing page có repository độc lập do Sites quản lý. Chỉ trang marketing được host; tải/phân tích thật chạy trong ứng dụng Windows.
