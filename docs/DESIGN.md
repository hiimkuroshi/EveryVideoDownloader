---
name: EveryVideoDownloader Design System
version: 1.0.0
description: Complete UI/UX design specification, token definitions, and component architecture for EveryVideoDownloader Desktop Workstation.
colors:
  primary: "#6366F1"
  primary-hover: "#4F46E5"
  secondary: "#F43F5E"
  accent: "#10B981"
  accent-hover: "#059669"
  destructive: "#EF4444"
  warning: "#F59E0B"
  neutral-dark: "#090D16"
  surface-dark: "#111726"
  surface-elevated-dark: "#182238"
  surface-input-dark: "#0D1321"
  neutral-light: "#F1F5F9"
  surface-light: "#FFFFFF"
  surface-elevated-light: "#F8FAFC"
  surface-input-light: "#FFFFFF"
  border-dark: "rgba(255, 255, 255, 0.09)"
  border-light: "#CBD5E1"
  border-focus: "rgba(99, 102, 241, 0.55)"
  text-primary-dark: "#F8FAFC"
  text-secondary-dark: "#94A3B8"
  text-muted-dark: "#64748B"
  text-primary-light: "#090E1A"
  text-secondary-light: "#334155"
  text-muted-light: "#475569"
typography:
  fontFamily-sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  fontFamily-mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
  h1: { fontFamily: Inter, fontSize: 24px, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.03em }
  h2: { fontFamily: Inter, fontSize: 18px, fontWeight: 700, lineHeight: 1.3 }
  h3: { fontFamily: Inter, fontSize: 15px, fontWeight: 700, lineHeight: 1.4 }
  body-lg: { fontFamily: Inter, fontSize: 16px, fontWeight: 500, lineHeight: 1.55 }
  body-md: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  body-sm: { fontFamily: Inter, fontSize: 12px, fontWeight: 400, lineHeight: 1.4 }
  code-mono: { fontFamily: JetBrains Mono, fontSize: 13px, fontWeight: 600, lineHeight: 1.5 }
  badge-label: { fontFamily: JetBrains Mono, fontSize: 11px, fontWeight: 700, letterSpacing: 0.05em }
rounded:
  sm: 7px
  md: 11px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  topbar:
    backgroundColor: "{colors.surface-dark}"
    rounded: "0px"
    padding: "12px 22px"
  subnav:
    backgroundColor: "{colors.surface-dark}"
    padding: "8px 24px"
  card:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.border-dark}"
  button-primary:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 22px"
  button-download-hero:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.md}"
    padding: "13px 28px"
---

# 🎬 EveryVideoDownloader — UI / UX Design Specification

> **Ứng dụng:** EveryVideoDownloader (Desktop Web UI Workstation)  
> **Nền tảng kỹ thuật:** Vanilla HTML5, Modern CSS Design Tokens (Dark / Light Theme), Pure JavaScript (SSE), Node.js Core Backend, yt-dlp Engine  
> **Phiên bản thiết kế:** `v1.0.0` (Tương thích Release 0.2+)  

---

## 1. Overview (Tổng Quan Triết Lý Thiết Kế)

EveryVideoDownloader được thiết kế theo phong cách **Desktop Studio Workstation** hiện đại — kết hợp giữa sự tối giản, hiệu năng cao và tính chuyên nghiệp của các ứng dụng công cụ hàng đầu (tương tự như Linear, DaVinci Resolve, Raycast).

### Các nguyên tắc cốt lõi:
1. **Desktop-First & Tận Dụng Tối Đa Không Gian Rộng**: Bố cục Studio 2 cột đối xứng (`410px Sidebar` + `1fr Main Explorer`), loại bỏ khoảng trống lãng phí, giúp người dùng thao tác toàn bộ tác vụ tải mà không cần cuộn trang liên tục.
2. **Phân Tầng Điều Hướng Rõ Ràng**: 
   - **Header trên cùng**: Dành trọn không gian cho ô nhập link video Full-Width cực kỳ rộng rãi.
   - **Sub-Navbar phụ bên dưới**: Chứa 4 tab điều hướng chuyên biệt (`Studio`, `Hàng Chờ`, `Nâng Cao`, `Cài Đặt`).
3. **Phản Hồi Trực Quan & Tức Thì (Instant Feedback)**:
   - Nút mở thư mục phản hồi ngay lập tức (`<10ms`).
   - Cờ lệnh `-f` cập nhật thời gian thực khi click bất kỳ dòng format nào.
   - Thanh tiến trình lớn với % chuyển động mượt mà và metrics đo lường chi tiết (Tốc độ MiB/s, Thời gian còn lại ETA, Dung lượng MB).
4. **An Toàn Khi Thao Tác (Defensive Interaction)**: Nút tải xuống tự động vô hiệu hóa (`disabled`) khi chưa có format nào được chọn nhằm chống bấm nhầm, và tự động bật sáng (`enabled`) ngay khi người dùng chọn ít nhất 1 tùy chọn.

---

## 2. Colors (Bảng Màu & Design Tokens)

Hệ thống hỗ trợ 2 chế độ màu **Dark Theme (Mặc định)** và **Light Theme** chuyển đổi mượt mà qua nút Theme Toggle.

### 2.1 Bảng Màu Nhận Diện Thương Hiệu & Trạng Thái
| Tên Token | Hex (Dark) | Hex (Light) | Ý Nghĩa / Mục Đích Sử Dụng |
| :--- | :---: | :---: | :--- |
| `primary` | `#6366F1` | `#4F46E5` | **Màu chủ đạo (Indigo)**: Nút phân tích, badge tab đang chọn, đường viền focus input. |
| `secondary` | `#F43F5E` | `#E11D48` | **Màu điểm nhấn (Rose)**: Logo thương hiệu, nút tải thumbnail HD, tag YouTube/Bilibili. |
| `accent` | `#10B981` | `#059669` | **Màu hành động chính (Emerald)**: Nút "Bắt Đầu Tải Xuống", nút "Mở Folder", text dung lượng file. |
| `warning` | `#F59E0B` | `#D97706` | **Màu cảnh báo (Amber)**: Icon Cookie, nút "Tạm Dừng" tải, tag định dạng WEBM. |
| `destructive`| `#EF4444` | `#DC2626` | **Màu hủy bỏ / Lỗi (Red)**: Nút "Hủy Tải", thông báo lỗi, log lỗi terminal. |

### 2.2 Màu Nền & Bề Mặt (Surfaces & Backgrounds)
| Tên Token | Dark Theme | Light Theme | Ứng Dụng Trong Giao Diện |
| :--- | :---: | :---: | :--- |
| `bg` | `#090D16` | `#F1F5F9` | Nền tổng thể toàn ứng dụng. |
| `bg-topbar` | `rgba(17, 23, 38, 0.94)` | `rgba(255, 255, 255, 0.98)` | Nền thanh Topbar và Sub-navbar (kèm blur 18px). |
| `bg-card` | `#111726` | `#FFFFFF` | Nền các khối Card chính (Hero, Cài đặt, Explorer). |
| `bg-elevated`| `#182238` | `#F8FAFC` | Nền khối nâng cao, thanh toolbar bảng, thanh tab. |
| `bg-input` | `#0D1321` | `#FFFFFF` | Nền ô nhập URL, select dropdown, ô tìm kiếm. |
| `bg-muted` | `#1E293B` | `#E2E8F0` | Nền trạng thái hover, badge xám, nút bị disable. |
| `bg-log` | `#060911` | `#0F172A` | Nền màn hình đen của console log terminal. |

### 2.3 Màu Văn Bản & Đường Viền (Typography & Borders)
- **Văn bản chính (`fg`)**: `#F8FAFC` (Dark) / `#090E1A` (Light) — Độ tương phản cao chuẩn WCAG AAA.
- **Văn bản phụ (`fg-secondary`)**: `#94A3B8` (Dark) / `#334155` (Light) — Dùng cho nhãn, thông số kỹ thuật.
- **Văn bản mờ (`fg-muted`)**: `#64748B` (Dark) / `#475569` (Light) — Dùng cho ghi chú, placeholder.
- **Đường viền (`border`)**: `rgba(255, 255, 255, 0.09)` (Dark) / `#CBD5E1` (Light) — Mảnh mai, sắc nét 1px.

---

## 3. Typography (Hệ Thống Phông Chữ)

Sử dụng 2 font chữ chuẩn quốc tế từ Google Fonts:
- **Font giao diện (`font-sans`)**: `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, sans-serif.
- **Font mã lệnh & số liệu (`font-mono`)**: `'JetBrains Mono'`, `'Fira Code'`, monospace.

### 3.1 Thang Đo Phông Chữ (Typographic Scale)
| Cấp Bậc (Role) | Font Family | Size | Weight | Line-Height | Ứng Dụng |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Brand Title` | Inter | 19px | 800 (Bold) | 1.2 | Logo "EveryVideoDownloader" trên Header |
| `Section Title` | Inter | 18px | 700 (Bold) | 1.3 | Tiêu đề các khối cài đặt nâng cao, tiêu đề hàng chờ |
| `Hero Video Title` | Inter | 15px | 700 (Bold) | 1.4 | Tiêu đề video gốc trích xuất từ yt-dlp |
| `Translated Title` | Inter | 14px | 600 (SemiBold)| 1.45 | Bản dịch tiếng Việt tự động từ Google Translate |
| `Body Text` | Inter | 14px | 400/500 | 1.5 | Nội dung mô tả, hướng dẫn, nhãn switch |
| `Table Header` | Inter | 12px | 700 (Bold) | 1.3 | Tiêu đề các cột bảng format (UPPERCASE, letter-spacing: 0.05em) |
| `Mono Flag / Command`| JetBrains Mono | 13px | 600 (SemiBold)| 1.5 | Khung xem trước cờ lệnh `-f "30080"` |
| `Metrics Counter` | JetBrains Mono | 22px | 800 (Bold) | 1.1 | % Tiến trình tải số lớn (`98.5%`) |
| `Badges & Tags` | JetBrains Mono | 11.5px| 700 (Bold) | 1.2 | Format ID (`30080`), Extension (`MP4`, `MKV`), FPS |

---

## 4. Layout & Grid Model (Bố Cục Không Gian)

### 4.1 Kiến Trúc Bố Cục Tổng Thể
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [Logo + Platform] ── [ Ô Nhập Link Video Full-Width + Cookie + Phân Tích ] ── [Theme] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SUB-NAVBAR: [ 🖥️ Studio (Active) ]  [ 📋 Hàng Chờ (0) ]  [ ⚡ Nâng Cao ]  [ 📁 Cài Đặt ] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  LEFT COLUMN (410px Fixed Sidebar)          RIGHT COLUMN (1fr Flexible Main Explorer)   │
│  ┌───────────────────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ 1. Video Hero Meta Card               │  │ 1. Toolbar (Filter Pills + Search Bar) │ │
│  │    - 16:9 Thumbnail + HD DL Button    │  ├────────────────────────────────────────┤ │
│  │    - Platform Tag + Views + Duration  │  │ 2. Multi-select Queue Action Bar       │ │
│  │    - Original Title + Tiếng Việt      │  ├────────────────────────────────────────┤ │
│  ├───────────────────────────────────────┤  │ 3. Formats Table (10 Sortable Columns) │ │
│  │ 2. Tối Ưu Tốc Độ & Thư Mục Lưu        │  │    - ID | Resolution | Ext | Codec...  │ │
│  │    - [Tầng 1] Label + Mở Folder + Đổi │  ├────────────────────────────────────────┤ │
│  │    - [Tầng 2] Input Path Full-Width   │  │ 4. Audio Merge Helper (Smart Audio)    │ │
│  │    - Container: MKV / MP4 / WEBM      │  ├────────────────────────────────────────┤ │
│  │    - Đa Luồng (-N): 8 / 16 Luồng      │  │ 5. Action Download Card                │ │
│  │    - Chunk Size: 10M (Anti-Throttle)  │  │    - Live Flag Preview: -f "30080"     │ │
│  │    - Switches: Phụ đề, Bìa, Metadata  │  │    - [ Bắt Đầu Tải Xuống (Hero Full) ] │ │
│  └───────────────────────────────────────┘  ├────────────────────────────────────────┤ │
│                                             │ 6. Realtime Progress Card              │ │
│                                             │    - Big % Counter + Status Badge      │ │
│                                             │    - Speed MiB/s | ETA | Total Size    │ │
│                                             │    - Nút Mở Thư Mục Chứa File (Xanh)   │ │
│                                             │    - Nút Tạm Dừng / Hủy / Log Console  │ │
│                                             └────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Spacing & Padding Scale
- **Khung chứa ứng dụng (`studio-app`)**: Tối đa `1720px`, căn giữa màn hình.
- **Khoảng cách Grid (`gap`)**: `18px` giữa 2 cột, `14px` giữa các card bên sidebar.
- **Padding trong Card**: `16px 20px` tạo độ thoáng đãng và dễ thở cho các khối tử.

---

## 5. Elevation, Depth & Shapes (Độ Nổi & Hình Khối)

### 5.1 Bán Kính Góc Bo (Border Radius)
- `radius-sm (7px)`: Nút nhỏ, input nhỏ, badge tag, ô filter pill.
- `radius-md (11px)`: Nút thao tác chính (Phân tích, Tải xuống), thumbnail wrapper, tab button.
- `radius-lg (16px)`: Khung viền Card chính, form nhập link topbar.
- `radius-full (9999px)`: Pill badges nền tảng, nút đổi theme tròn, thanh tiến trình bo tròn.

### 5.2 Hiệu Ứng Chiều Sâu & Bóng Đổ (Shadows & Glow)
- **Card Shadow (`--shadow-sm`)**: `0 2px 5px rgba(0, 0, 0, 0.35)` — Tạo đường phân tách nhẹ nhàng với nền.
- **Active Focus Glow (`--shadow-glow`)**: `0 0 22px rgba(99, 102, 241, 0.2)` — Phát sáng nhẹ màu tím khi focus ô link.
- **Button Hero Glow**: `0 4px 18px rgba(16, 185, 129, 0.45)` — Hiệu ứng nổi bật màu xanh ngọc cho nút tải xuống chính.

---

## 6. Components Catalog (Thư Viện Thành Phần UI)

### 6.1 Topbar URL Search Bar
- **Bao bọc**: Viền 2px `border`, hiệu ứng bo góc `radius-lg (16px)`, bóng đổ mềm.
- **Tích hợp**:
  1. Icon mắt xích `url-icon` (Màu tím).
  2. Input URL tự động co giãn 100%.
  3. Dropdown chọn Cookie trình duyệt liền mạch không viền thô.
  4. Nút bấm **`Phân Tích (-F)`** hiệu ứng Gradient tím hồng (`#F43F5E` $\rightarrow$ `#6366F1`).

### 6.2 Bảng Formats Chi Tiết (Formats Table Explorer)
- **10 Cột thông tin**: Checkbox $\rightarrow$ ID $\rightarrow$ Độ phân giải $\rightarrow$ Ext $\rightarrow$ FPS $\rightarrow$ Video Codec $\rightarrow$ Audio Codec $\rightarrow$ Bitrate $\rightarrow$ Dung lượng $\rightarrow$ Ghi chú.
- **3-State Column Sorting**: Click 1 lần (Giảm dần $\blacktriangledown$) $\rightarrow$ Click 2 lần (Tăng dần $\blacktriangle$) $\rightarrow$ Click 3 lần (Về mặc định $\updownarrow$).
- **Row Selection Highlight**: Dòng được chọn có nền tím `rgba(99, 102, 241, 0.14)` và vạch màu tím bên trái `4px`.

### 6.3 Hero Download Action Card
- **Khung Preview**: Hiển thị chính xác chuỗi tham số sẽ thực thi (ví dụ: `-f "30080"`).
- **Nút "Bắt Đầu Tải Xuống"**:
  - Gradient xanh lá mạ (`#10B981` $\rightarrow$ `#059669`).
  - Full-Width 100% bề ngang, icon mũi tên tải xuống đậm nét `2.5px`.
  - Hiệu ứng hover nổi lên `-2px` kèm shadow phát sáng.
  - Vô hiệu hóa mờ `grayscale(0.7)` khi chưa chọn format.

### 6.4 Real-time Progress Card
- **% Số Lớn**: Font JetBrains Mono `22px` góc phải đếm từ `0.0%` đến `100.0%`.
- **Thanh Progress Bar**: Gradient chuyển màu xanh ngọc kèm hiệu ứng chạy mượt qua CSS transitions.
- **Bộ 3 Metrics**: Tốc độ (`MiB/s`), Thời gian còn lại (`ETA`), Dung lượng tải (`MB / Total MB`).
- **Nút "📂 Mở Thư Mục Chứa File"**: Tự động xuất hiện nổi bật màu xanh lá cây ngay khi tải xong thành công.

---

## 7. Do's and Don'ts (Quy Tắc Chuẩn Mực Thiết Kế)

### ✅ NÊN LÀM (Do's)
- Luôn giữ bố cục Topbar full-width để đảm bảo link URL dài không bị che khuất.
- Luôn gán chính xác format ID của dòng người dùng click chọn vào cờ `-f`.
- Sử dụng các hiệu ứng micro-interaction (hover, focus, transition 150ms) để giao diện sống động và phản hồi nhanh.
- Giữ sự nhất quán giữa 2 theme: Dark Theme sâu thẳm công nghệ cao và Light Theme sạch sẽ hiện đại.
- Đảm bảo các tiến trình chạy ngầm như mở thư mục Windows luôn phản hồi ngay lập tức (`<10ms`) không gây block UI.

### ❌ KHÔNG ĐƯỢC LÀM (Don'ts)
- Không đặt các nút hành động chiếm quá nhiều không gian cạnh thanh nhập URL.
- Không tự ý nối chuỗi `+bestaudio/best` khi người dùng đã chỉ định rõ ràng 1 format ID cụ thể.
- Không để các trường chọn (`select`) hoặc input thư mục bị tràn viền ngang khỏi cột sidebar.
- Không cho phép người dùng bấm tải xuống khi chưa có URL hoặc chưa chọn bất kỳ tùy chọn định dạng nào.
- Không sử dụng các bảng màu bão hòa quá gắt gây mỏi mắt người dùng trong các phiên làm việc dài.
