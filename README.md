# NgheTinNhanh

## Giới thiệu
NgheTinNhanh là một WebApp hỗ trợ người mù và khiếm thị nghe báo bằng giọng nói. Giờ đây, họ có thể tiếp cận với các nguồn thông tin chính thống uy tín nhanh và dễ dàng nhất.

## Tính Năng

- **Điều Khiển Bằng Giọng Nói**: Điều khiển toàn bộ ứng dụng bằng lệnh thoại
- **Chuyển Văn Bản Thành Giọng Nói**: Nghe các bài báo và phản hồi từ ứng dụng
- **Tùy Chọn Trợ Năng**:
    - Điều chỉnh cỡ chữ
    - Chế độ tương phản cao
    - Chuyển đổi chế độ tối/sáng
- **Điều Hướng Tin Tức**:
    - Duyệt theo chuyên mục
    - Tìm kiếm theo từ khóa
    - Di chuyển giữa các bài viết
- **Hiển Thị Nội Dung**:
    - Đọc nội dung bài viết
    - Đọc tiêu đề
    - Chọn bài viết ngẫu nhiên
- **Thông Tin Bổ Sung**:
    - Thông tin thời tiết
    - Cập nhật giá vàng

## Lệnh Giọng Nói

| Lệnh | Chức Năng |
|---------|----------|
| "đọc" | Đọc bài viết hiện tại |
| "tiếp theo" | Bài viết tiếp theo |
| "trước đó" | Bài viết trước đó |
| "dừng lại" | Dừng đọc |
| "đọc tiêu đề" | Đọc tất cả tiêu đề bài viết |
| "chuyên mục [tên]" | Lọc theo chuyên mục |
| "đọc bài [số thứ tự]" | Đọc bài viết theo số thứ tự |
| "đọc bài ngẫu nhiên" | Đọc bài viết ngẫu nhiên |
| "tìm kiếm [từ khóa]" | Tìm kiếm từ khóa |
| "thời tiết" | Xem thông tin thời tiết |
| "giá vàng" | Xem thông tin giá vàng |
| "hướng dẫn" | Nghe hướng dẫn sử dụng |
| "tăng cỡ chữ" | Tăng kích thước chữ |
| "giảm cỡ chữ" | Giảm kích thước chữ |
| "chế độ tương phản" | Bật/tắt chế độ tương phản cao |
| "chế độ tối/sáng" | Bật/tắt chế độ tối/sáng |

## Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js
- NPM hoặc Yarn

### Cài Đặt

1. Clone repository
```bash
git clone https://github.com/yourusername/nghe-tin-nhanh.git
cd nghe-tin-nhanh
cd frontend + cd backend
```

2. Cài đặt các gói phụ thuộc ở cả 2 thư mục frontend và backend
```bash
npm install
```

3. Khởi động ứng dụng
```bash
frontend: npm run dev
backend: npm start
```

## Cách Sử Dụng

- Nhấn và giữ phím cách để kích hoạt lệnh giọng nói
- Nói một trong các lệnh được hỗ trợ

## Công Nghệ Sử Dụng

- React
- Vite
- NestJS
- Web Speech API (cho nhận dạng giọng nói và tổng hợp)
- CSS cho giao diện và tính năng trợ năng

