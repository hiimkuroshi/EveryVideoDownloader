# 📦 EveryVideoDownloader — Release 0.2

> **Phiên bản:** `v0.2.0`  
> **Ngày phát hành:** 14/08/2026  
> **Nền tảng cốt lõi:** [yt-dlp](https://github.com/yt-dlp/yt-dlp)  

---

## 🌟 Những Điểm Mới & Cải Tiến Nổi Bật (What's New in v0.2)

### 1. 🎨 Tái Cấu Trúc Giao Diện — Ô Nhập Link Rộng Rãi (Full-Width Topbar)
- **Mở rộng ô nhập URL**: Toàn bộ thanh Header phía trên giờ đây dành trọn vẹn không gian cho trường nhập link video, hiển thị rõ ràng cả những đường link rất dài.
- **Thanh Sub-Navbar chuyên nghiệp**: Đưa cụm điều hướng (`Studio`, `Hàng Chờ`, `Nâng Cao`, `Cài Đặt`) xuống ngay bên dưới Header, tạo bố cục phân tầng trực quan và gọn gàng.

### 2. 📂 Mở Nhanh Thư Mục Lưu Trữ Siêu Tốc (<10ms)
- Tích hợp nút **`📂 Mở Folder`** trực tiếp tại thanh Sidebar và góc trên bên phải.
- Backend xử lý mở Windows Explorer bằng tiến trình không đồng bộ tách rời (`spawn unref`), phản hồi ngay lập tức `<10ms` mà không làm đơ hay chờ đợi giao diện.

### 3. 🎯 Lấy Chính Xác ID Định Dạng Đã Chọn (Exact Format ID Download)
- Khi click chọn bất kỳ dòng định dạng nào trong bảng hoặc tích checkbox (ví dụ ID `30080` trên Bilibili hoặc `137` trên YouTube), hệ thống sẽ gán chính xác ID đó vào cờ `-f`:
  ```powershell
  .\yt-dlp.exe --cookies-from-browser firefox -N 8 --http-chunk-size 10M -f "30080" --merge-output-format mkv "URL"
  ```
- Loại bỏ hoàn toàn tình trạng tự ý chèn chuỗi `+bestaudio/best` gây sai lệch định dạng người dùng mong muốn.

### 4. 🔒 Quản Lý Trạng Thái Nút Tải Xuống Thông Minh
- **Tự động Disable**: Khi vừa phân tích video xong và chưa có format nào được chọn, nút **"Bắt Đầu Tải Xuống"** sẽ ở trạng thái vô hiệu hóa kèm thông báo nhắc nhở chọn dòng format.
- **Tự động Enable**: Ngay khi click chọn 1 dòng hoặc tích chọn ít nhất 1 checkbox, nút sẽ lập tức sáng lên sẵn sàng tải.
- **Bỏ chọn toàn bộ**: Tự động vô hiệu hóa lại để chống bấm nhầm.

### 5. 🛠️ Tối Ưu Hóa Trải Nghiệm & Độ Ổn Định
- **Gỡ bỏ nút thừa**: Xóa nút "Thêm Vào Hàng Chờ" tại khu vực nút tải, biến nút **"Bắt Đầu Tải Xuống"** thành nút Full-Width nổi bật với màu Gradient xanh lá cây hiện đại.
- **Chống tràn Sidebar**: Tái cấu trúc mục "Tối Ưu Tốc Độ & Thư Mục Lưu" thành 2 tầng, loại bỏ hoàn toàn lỗi tràn khung ngang trên mọi độ phân giải.
- **Chống crash Server**: Bổ sung cơ chế `uncaughtException` và `unhandledRejection` giúp server Node.js chạy liên tục bền bỉ.

---

## 🚀 Hướng Dẫn Nâng Cấp & Sử Dụng
1. Tải bản cập nhật mới nhất từ GitHub.
2. Nhấp đúp vào file **`Chay_Studio.bat`** để khởi động ứng dụng ngay lập tức tại `http://localhost:3000`.
