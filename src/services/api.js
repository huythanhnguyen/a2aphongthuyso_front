import axios from 'axios'

// Cấu hình API
const API_CONFIG = {
  API_BASE_URL: 'https://phongthuybotbackend.onrender.com/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    REMAINING_QUESTIONS: '/v2/agent/query'
  },
  ANALYSIS: {
    ANALYZE: '/v2/bat-cuc-linh-so/analyze',
    HISTORY: '/v2/agent/query',
    FEEDBACK: '/v2/agent/query',
    RECENT: '/v2/agent/query',
    QUESTION: '/v2/agent/chat',
    DELETE_HISTORY: '/v2/agent/query'
  },
  PHONE: {
    ANALYZE: '/v2/bat-cuc-linh-so/phone'
  },
  CCCD: {
    ANALYZE: '/v2/bat-cuc-linh-so/cccd'
  },
  PASSWORD: {
    ANALYZE: '/v2/bat-cuc-linh-so/password'
  },
  BANK_ACCOUNT: {
    ANALYZE: '/v2/bat-cuc-linh-so/bank-account',
    SUGGEST: '/v2/bat-cuc-linh-so/suggest-bank-account'
  },
  PAYMENT: {
    CREATE: '/payments/create',
    HISTORY: '/payments/payment/history',
    CALLBACK: '/payments/callback',
    STATUS: '/payments/status'
  },
  REQUEST_TIMEOUT: 15000,
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
    
    // Tạo thông báo lỗi
    const errorMessage = 
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối đến máy chủ'
    
    return Promise.reject(new Error(errorMessage))
  }
)

export { apiClient, API_CONFIG }