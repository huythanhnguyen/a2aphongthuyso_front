# Phong Thủy Số API Tester

Đây là một ứng dụng frontend đơn giản để test các API của Phong Thủy Số Bot.

## Cách sử dụng

1. Đảm bảo backend API đang chạy ở `http://localhost:8000`
2. Mở file `frontend_demo.html` trong trình duyệt web
3. Sử dụng các tab để test các chức năng khác nhau của API

## Các chức năng

### Trang chủ
- Kiểm tra trạng thái API (Health Check)
- Lấy danh sách các agent có sẵn

### Phân tích số
- Nhập số điện thoại và dữ liệu người dùng (tuỳ chọn) để phân tích

### Chat
- Gửi tin nhắn chat đến bot
- Nhận kết quả chat qua stream

### Đăng nhập/Đăng ký
- Đăng ký tài khoản mới
- Đăng nhập vào hệ thống

### Người dùng
- Xem thông tin người dùng hiện tại
- Cập nhật thông tin người dùng

### API Key
- Tạo API key mới
- Lấy danh sách API key
- Xóa API key

### Thanh toán
- Xem danh sách gói dịch vụ
- Xem chi tiết gói dịch vụ
- Tạo thanh toán mới
- Xem lịch sử thanh toán
- Xem thông tin đăng ký

### Upload
- Upload file (ảnh, PDF, audio, text) lên hệ thống

## Lưu ý

- Token đăng nhập được lưu trong localStorage của trình duyệt
- Khi đăng nhập thành công, API key và các API cần xác thực sẽ tự động sử dụng token này
- Kết quả của các API call được hiển thị ở phần "Kết quả" bên phải mỗi tab

## Yêu cầu

- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Backend API đang chạy ở `http://localhost:8000`
- Kết nối internet để tải Bootstrap và các tài nguyên khác

## Giải quyết vấn đề

Nếu gặp lỗi CORS, hãy đảm bảo rằng:
1. Backend API đã cấu hình CORS đúng cách
2. Backend API đang chạy ở địa chỉ đúng
3. Nếu cần, hãy sửa biến `API_URL` trong file `frontend_demo.js` để trỏ đến địa chỉ chính xác của API 