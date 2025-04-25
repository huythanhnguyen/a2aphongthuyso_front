import axios from 'axios'

// Cấu hình API
const API_CONFIG = {
  // Sử dụng biến môi trường cho base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  AUTH: {
    LOGIN: '/api/user/token',
    REGISTER: '/api/user/register',
    VERIFY_TOKEN: '/api/user/me',
    CHANGE_PASSWORD: '/api/user/me'
  },
  USER: {
    PROFILE: '/api/user/me',
    UPDATE_PROFILE: '/api/user/me'
  },
  ANALYSIS: {
    ANALYZE_NUMBER: '/analyze_number',
    CHAT: '/api/chat',
    STREAM: '/api/chat'
  },
  UPLOAD: {
    FILE: '/api/upload'
  },
  API_KEYS: {
    CREATE: '/api/apikeys',
    LIST: '/api/apikeys',
    DELETE: '/api/apikeys'
  },
  PAYMENT: {
    PLANS: '/api/payment/plans',
    PLAN_DETAIL: '/api/payment/plans',
    CREATE: '/api/payment',
    HISTORY: '/api/payment/history',
    SUBSCRIPTION: '/api/payment/subscription'
  },
  HEALTH: {
    CHECK: '/health'
  },
  AGENTS: {
    LIST: '/agents'
  },
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000')
}

// Tạo instance axios
const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptors để thêm token vào mỗi request
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('phone_analysis_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptors để xử lý response và lỗi
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // Kiểm tra lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Xóa thông tin đăng nhập
      localStorage.removeItem('phone_analysis_token')
      localStorage.removeItem('phone_analysis_user')
      
      // Chuyển hướng đến trang đăng nhập
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Tạo thông báo lỗi chi tiết hơn
    const errorMessage = 
      (error.response && error.response.data && error.response.data.detail) ||
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối đến máy chủ';
    
    // Thông tin bổ sung cho debug
    console.error(`API Error [${error.config?.method}] ${error.config?.url}:`, error.response || error.message);
    
    return Promise.reject(new Error(errorMessage))
  }
)

export { apiClient, API_CONFIG }