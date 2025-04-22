# A2A Phong Thủy Số Front-end

Ứng dụng web phân tích số điện thoại, CCCD, mật khẩu và số tài khoản theo Bát Cục Linh Số.

## Cập nhật mới

Dự án đã được cập nhật để sử dụng backend API mới tại `https://phongthuybotbackend.onrender.com` với các endpoint mới:

- **Agent API**: `/api/v2/agent` - Xử lý các yêu cầu chung thông qua hệ thống agent
- **Bát Cục Linh Số API**: `/api/v2/bat-cuc-linh-so` - Phân tích theo phương pháp Bát Cục Linh Số

### Các tính năng mới

- Phân tích CCCD/CMND
- Phân tích mật khẩu 
- Phân tích và gợi ý số tài khoản ngân hàng
- Giao diện chat với AI thông qua Agent API

## Cài đặt

```bash
npm install
npm run dev
```

## Triển khai

```bash
npm run build
```

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
