import axios from 'axios'

// Cấu hình API
const API_CONFIG = {
  // Luôn sử dụng URL production với tiền tố /api/v2
  API_BASE_URL: 'https://phongthuybotbackend.onrender.com/api/v2',
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
    REMAINING_QUESTIONS: '/agent/query',
    GET_INFO_BY_PHONE: '/users/by-phone'
  },
  ANALYSIS: {
    ANALYZE: '/bat-cuc-linh-so/analyze',
    HISTORY: '/agent/query',
    FEEDBACK: '/agent/query',
    RECENT: '/agent/query',
    QUESTION: '/agent/chat',
    STREAM: '/agent/stream',
    DELETE_HISTORY: '/agent/query'
  },
  PHONE: {
    ANALYZE: '/analyze/phone'
  },
  CCCD: {
    ANALYZE: '/analyze/cccd'
  },
  PASSWORD: {
    ANALYZE: '/analyze/password'
  },
  BANK_ACCOUNT: {
    ANALYZE: '/analyze/bank-account',
    SUGGEST: '/bat-cuc-linh-so/suggest-bank-account'
  },
  HEALTH: {
    CHECK: '/health'
  },
  AGENT: {
    ROOT: '/agent',
    CHAT: '/chat',
    STREAM: '/stream',
    QUERY: '/agent/query'
  },
  BAT_CUC_LINH_SO: {
    ROOT: '/bat-cuc-linh-so'
  },
  PAYMENT: {
    CREATE: '/payments/create',
    HISTORY: '/payments/payment/history',
    CALLBACK: '/payments/callback',
    STATUS: '/payments/status'
  },
  REQUEST_TIMEOUT: 15000,
  ADK_SERVICE_URL: 'https://phongthuybotadk.onrender.com'
}

// Tạo instance axios
const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Tạo instance axios cho ADK service
const adkClient = axios.create({
  baseURL: API_CONFIG.ADK_SERVICE_URL,
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

adkClient.interceptors.request.use(
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
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối đến máy chủ';
    
    // Thông tin bổ sung cho debug
    console.error(`API Error [${error.config?.method}] ${error.config?.url}:`, error.response || error.message);
    
    return Promise.reject(new Error(errorMessage))
  }
)

adkClient.interceptors.response.use(
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
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối đến máy chủ';
    
    // Thông tin bổ sung cho debug
    console.error(`ADK API Error [${error.config?.method}] ${error.config?.url}:`, error.response || error.message);
    
    return Promise.reject(new Error(errorMessage))
  }
)

export { apiClient, adkClient, API_CONFIG }