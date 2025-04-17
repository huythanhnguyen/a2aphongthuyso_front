# A2A Phong Thủy Số - Frontend

Frontend cho ứng dụng Phong Thủy Số sử dụng công nghệ Agent-to-Agent (A2A).

## Tổng quan

Ứng dụng frontend này được xây dựng bằng Vue.js và kết nối với backend API v2.0 tại `https://phongthuybotbackend.onrender.com`.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường development với hot-reload
npm run dev

# Build cho production
npm run build

# Serve files đã build
npm run preview
```

## Tính năng chính

- Phân tích số điện thoại theo Bát Cục Linh Số
- Phân tích CCCD/CMND theo Bát Cục Linh Số
- Phân tích mật khẩu theo Bát Cục Linh Số
- Phân tích số tài khoản ngân hàng theo Bát Cục Linh Số
- Gợi ý số tài khoản ngân hàng phù hợp
- Hỗ trợ đăng nhập/đăng ký tài khoản
- Chat với agent thông minh

## API Integration

Ứng dụng kết nối với API Phong Thủy Số v2.0. Các endpoint chính:

- **Base URL:** `https://phongthuybotbackend.onrender.com/api`
- **Chat API:** `/v2/agent/chat` - Gửi câu hỏi đến agent
- **Stream API:** `/v2/agent/stream` - Nhận phản hồi dạng stream từ agent
- **Direct Query API:** `/v2/agent/query` - Truy vấn trực tiếp một agent cụ thể
- **Analysis APIs:**
  - `/v2/bat-cuc-linh-so/phone` - Phân tích số điện thoại
  - `/v2/bat-cuc-linh-so/cccd` - Phân tích CCCD/CMND
  - `/v2/bat-cuc-linh-so/password` - Phân tích mật khẩu
  - `/v2/bat-cuc-linh-so/bank-account` - Phân tích số tài khoản
  - `/v2/bat-cuc-linh-so/suggest-bank-account` - Gợi ý số tài khoản

## Phiên bản

- **Frontend:** 1.0.0
- **API Backend:** 2.0.0

## Cấu trúc Project

```
src/
├── assets/         # Tài nguyên tĩnh: hình ảnh, fonts
├── components/     # Vue components
├── router/         # Định tuyến
├── services/       # API services
│   ├── api.js           # Cấu hình API
│   ├── analysisService.js  # Service phân tích
│   └── authService.js   # Service xác thực
├── stores/         # Vuex stores
├── utils/          # Utilities và helpers
├── views/          # Vue view components
├── App.vue         # Main app component
└── main.js         # Entry point
```

## Streaming API

Frontend hỗ trợ SSE (Server-Sent Events) cho phản hồi dạng stream từ agent. Ví dụ:

```javascript
const streamController = analysisService.streamQuestion({
  question: "Phân tích số điện thoại 0987654321"
}, 
(chunk, fullText) => {
  // Xử lý từng chunk dữ liệu
  console.log("Nhận chunk:", chunk);
  // Cập nhật UI với fullText
},
(finalText) => {
  // Stream hoàn tất
  console.log("Phản hồi hoàn chỉnh:", finalText);
},
(error) => {
  // Xử lý lỗi
  console.error("Lỗi stream:", error);
});

// Để hủy stream
// streamController.abort();
```

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
