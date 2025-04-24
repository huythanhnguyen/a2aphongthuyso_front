# API Documentation - Phong Thuy So (MCP Version)

API này cung cấp các endpoint để phân tích phong thủy số, sử dụng kiến trúc MCP (Multi-Component Paradigm) với các agent chuyên biệt.

## Base URL

```
https://api.phongthuyso.com
```

Trong môi trường phát triển:

```
http://localhost:8000
```

## Kiến trúc MCP

Hệ thống Phong Thủy Số sử dụng kiến trúc MCP với 2 layers:

1. **Root Agent** - Điểm truy cập chính, điều phối yêu cầu đến các sub-agent
2. **Sub Agents** - Các agent chuyên biệt:
   - **batcuclinh_so_agent** - Phân tích các dãy số theo Bát Cục Linh Số
   - **payment_agent** - Xử lý thanh toán
   - **user_agent** - Quản lý thông tin người dùng

Mỗi agent sử dụng các tools chuyên biệt để thực hiện nhiệm vụ. Tất cả các tools được tập trung trong một thư mục chung.

## Authentication

API cung cấp hai phương thức xác thực:

1. **OAuth2 Bearer Token** - Dùng cho ứng dụng web và mobile
2. **API Key** - Dùng cho tích hợp với bên thứ ba

### OAuth2 Bearer Token

Để lấy token:

```
POST /api/user/token

body:
{
  "username": "user@example.com",
  "password": "password"
}
```

Sử dụng token trong header:

```
Authorization: Bearer {access_token}
```

### API Key

Sử dụng API key trong header:

```
api_key: pts_your_api_key
```

## API Endpoints

### General

#### Chat với Bot

```
POST /api/chat
```

**Request Body:**
```json
{
  "message": "Xin chào",
  "context": {}
}
```

**Response:**
```json
{
  "agent": "root_agent",
  "content": "Xin chào, tôi là Phong Thủy Bot. Bạn cần tôi hỗ trợ gì?",
  "metadata": {}
}
```

### Phân tích Bát Cục Linh Số

#### Phân tích số điện thoại

```
POST /api/analyze/phone
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "phone_number": "0912345678"
}
```

**Response:**
```json
{
  "agent": "batcuclinh_so_agent",
  "content": {
    "phone_number": "0912345678",
    "score": 85,
    "element": "Kim",
    "compatible_elements": ["Thổ"],
    "incompatible_elements": ["Hỏa"],
    "analysis": "Số điện thoại này có năng lượng tốt",
    "recommendations": "Số điện thoại này phù hợp với người mệnh Kim, Thổ"
  },
  "metadata": {}
}
```

#### Phân tích số tài khoản

```
POST /api/analyze/bank-account
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "account_number": "1234567890"
}
```

**Response:**
```json
{
  "agent": "batcuclinh_so_agent",
  "content": {
    "account_number": "1234567890",
    "score": 80,
    "element": "Thủy",
    "prosperity_level": "Cao",
    "recommendations": "Số tài khoản này mang lại tài lộc"
  },
  "metadata": {}
}
```

#### Phân tích mật khẩu

```
POST /api/analyze/password
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "password": "123456789"
}
```

**Response:**
```json
{
  "agent": "batcuclinh_so_agent",
  "content": {
    "password": "***********",  // Đã che giấu mật khẩu
    "score": 75,
    "element": "Hỏa",
    "energy_level": "Trung bình",
    "recommendations": "Nên bổ sung thêm ký tự đặc biệt để tăng mức độ an toàn và năng lượng"
  },
  "metadata": {}
}
```

#### Phân tích số CCCD

```
POST /api/analyze/cccd
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "cccd_number": "012345678901"
}
```

**Response:**
```json
{
  "agent": "batcuclinh_so_agent",
  "content": {
    "cccd_number": "012345678901",
    "score": 82,
    "element": "Kim",
    "energy_level": "Cao",
    "analysis": "Số CCCD này có sự cân bằng tốt giữa các con số",
    "recommendations": "Số CCCD này mang lại may mắn cho bạn"
  },
  "metadata": {}
}
```

### Quản lý người dùng

#### Đăng ký

```
POST /api/user/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullname": "User Name",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công",
  "user_id": "user123"
}
```

#### Lấy thông tin profile

```
GET /api/user/profile
```

**Yêu cầu xác thực:** Có

**Response:**
```json
{
  "agent": "user_agent",
  "content": {
    "user_id": "user123",
    "email": "user@example.com",
    "fullname": "User Name",
    "element": "Kim",
    "lucky_numbers": [1, 3, 7]
  },
  "metadata": {}
}
```

#### Cập nhật profile

```
PUT /api/user/profile
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "fullname": "New Name",
  "date_of_birth": "1990-01-01",
  "phone_number": "0987654321"
}
```

**Response:**
```json
{
  "agent": "user_agent",
  "content": {
    "user_id": "user123",
    "email": "user@example.com",
    "fullname": "New Name",
    "date_of_birth": "1990-01-01",
    "phone_number": "0987654321",
    "element": "Kim",
    "lucky_numbers": [1, 3, 7]
  },
  "metadata": {}
}
```

#### Tạo API Key

```
POST /api/user/apikey
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "name": "My API Key"
}
```

**Response:**
```json
{
  "api_key": "pts_api123456789",
  "name": "My API Key",
  "created_at": "2025-04-24T12:00:00Z"
}
```

### Thanh toán

#### Xử lý thanh toán

```
POST /api/payment/process
```

**Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "plan_id": "basic",
  "payment_method": "credit_card",
  "amount": 99000,
  "currency": "VND"
}
```

**Response:**
```json
{
  "agent": "payment_agent",
  "content": {
    "transaction_id": "tx_123456789",
    "status": "completed",
    "amount": 99000,
    "timestamp": "2025-04-24T10:00:00"
  },
  "metadata": {}
}
```

#### Kiểm tra trạng thái thanh toán

```
GET /api/payment/status/{transaction_id}
```

**Yêu cầu xác thực:** Có

**Response:**
```json
{
  "agent": "payment_agent",
  "content": {
    "transaction_id": "tx_123456789",
    "status": "completed",
    "amount": 99000,
    "timestamp": "2025-04-24T10:00:00",
    "payment_method": "credit_card"
  },
  "metadata": {}
}
```

## Mã lỗi

| Mã | Mô tả |
|----|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa xác thực |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy |
| 500 | Internal Server Error - Lỗi server |

## Giới hạn API

- Rate limit: 100 requests/phút cho mỗi user
- Payload size: Tối đa 1MB

## Liên hệ

Email: support@phongthuyso.com 