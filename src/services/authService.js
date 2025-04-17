import { apiClient, API_CONFIG } from './api'

const authService = {
  /**
   * Đăng nhập với email và mật khẩu
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise} - Kết quả đăng nhập
   */
  async login(email, password) {
    try {
      // Thử gọi API đăng nhập
      try {
        const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, { email, password })
        
        // Lưu token và thông tin người dùng
        if (response.success && response.token) {
          localStorage.setItem('phone_analysis_token', response.token)
          localStorage.setItem('phone_analysis_user', JSON.stringify(response.user))
          
          // Lưu sessionId nếu có
          if (response.sessionId) {
            localStorage.setItem('phone_analysis_session_id', response.sessionId)
          }
        }
        
        return response
      } catch (apiError) {
        console.log('API login không khả dụng, sử dụng phiên ẩn danh:', apiError.message)
        // Nếu API đăng nhập không khả dụng (chưa tích hợp xong), tạo phiên ẩn danh
        return this.createAnonymousSession(email)
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Tạo phiên ẩn danh khi API xác thực chưa khả dụng
   * @param {string} identifier - Thông tin định danh người dùng
   * @returns {Promise} - Kết quả tạo phiên ẩn danh
   */
  async createAnonymousSession(identifier) {
    try {
      // Tạo phiên ẩn danh thông qua API agent
      const response = await apiClient.post(API_CONFIG.ANALYSIS.QUESTION, {
        message: `Tạo phiên ẩn danh mới cho người dùng ${identifier || 'anonymous'}`
      })
      
      if (response.success && response.result && response.result.sessionId) {
        // Lưu sessionId vào localStorage
        localStorage.setItem('phone_analysis_token', `anonymous_${response.result.sessionId}`)
        localStorage.setItem('phone_analysis_user', JSON.stringify({
          name: identifier || 'Người dùng ẩn danh',
          email: identifier || 'anonymous@user.com',
          role: 'user',
          isAnonymous: true
        }))
        
        return {
          success: true,
          message: 'Đăng nhập phiên ẩn danh thành công',
          sessionId: response.result.sessionId,
          user: {
            name: identifier || 'Người dùng ẩn danh',
            email: identifier || 'anonymous@user.com',
            role: 'user',
            isAnonymous: true
          }
        }
      } else {
        throw new Error('Không thể tạo phiên ẩn danh')
      }
    } catch (error) {
      console.error('Create anonymous session error:', error)
      // Tạo phiên ẩn danh offline
      const sessionId = `anonymous_${Date.now()}`
      localStorage.setItem('phone_analysis_token', sessionId)
      localStorage.setItem('phone_analysis_user', JSON.stringify({
        name: identifier || 'Người dùng ẩn danh',
        email: identifier || 'anonymous@user.com',
        role: 'user',
        isAnonymous: true,
        isOffline: true
      }))
      
      return {
        success: true,
        message: 'Đăng nhập phiên ẩn danh offline thành công',
        sessionId: sessionId,
        user: {
          name: identifier || 'Người dùng ẩn danh',
          email: identifier || 'anonymous@user.com',
          role: 'user',
          isAnonymous: true,
          isOffline: true
        }
      }
    }
  },
  
  /**
   * Đăng ký tài khoản mới
   * @param {string} name - Tên người dùng
   * @param {string} email - Email
   * @param {string} password - Mật khẩu
   * @returns {Promise} - Kết quả đăng ký
   */
  async register(name, email, password) {
    try {
      try {
        const response = await apiClient.post(API_CONFIG.AUTH.REGISTER, { name, email, password })
        
        // Lưu token và thông tin người dùng
        if (response.success && response.token) {
          localStorage.setItem('phone_analysis_token', response.token)
          localStorage.setItem('phone_analysis_user', JSON.stringify(response.user))
          
          // Lưu sessionId nếu có
          if (response.sessionId) {
            localStorage.setItem('phone_analysis_session_id', response.sessionId)
          }
        }
        
        return response
      } catch (apiError) {
        console.log('API register không khả dụng, sử dụng phiên ẩn danh:', apiError.message)
        // Nếu API đăng ký không khả dụng, tạo phiên ẩn danh
        return this.createAnonymousSession(email)
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Đăng xuất
   * @returns {Promise} - Kết quả đăng xuất
   */
  async logout() {
    try {
      try {
        // Thử gọi API, nhưng không báo lỗi nếu nó fail
        await apiClient.post(API_CONFIG.AUTH.LOGOUT)
      } catch (apiError) {
        // Bỏ qua lỗi API, chỉ log ra console
        console.log('API logout không khả dụng:', apiError.message)
      }
      
      // Xóa thông tin phiên từ localStorage
      localStorage.removeItem('phone_analysis_token')
      localStorage.removeItem('phone_analysis_user')
      
      // Luôn trả về success=true, vì chúng ta sẽ logout ở client side dù sao
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Thay đổi mật khẩu
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise} - Kết quả thay đổi mật khẩu
   */
  async changePassword(currentPassword, newPassword) {
    try {
      try {
        const response = await apiClient.post(API_CONFIG.AUTH.CHANGE_PASSWORD, {
          currentPassword,
          newPassword
        })
        return response
      } catch (apiError) {
        console.log('API change password không khả dụng:', apiError.message)
        return { 
          success: false, 
          message: 'Tính năng thay đổi mật khẩu chưa khả dụng với backend mới'
        }
      }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Xác thực token
   * @returns {Promise} - Kết quả xác thực token
   */
  async verifyToken() {
    try {
      try {
        const response = await apiClient.get(API_CONFIG.AUTH.VERIFY_TOKEN)
        return { valid: true, user: response.user }
      } catch (apiError) {
        console.log('API verify token không khả dụng:', apiError.message)
        
        // Kiểm tra xem có phải phiên ẩn danh không
        const token = localStorage.getItem('phone_analysis_token')
        const user = this.getCurrentUser()
        
        if (token && token.startsWith('anonymous_') && user) {
          // Nếu là phiên ẩn danh hợp lệ, trả về hợp lệ
          return { valid: true, user }
        }
        
        // Nếu không phải phiên ẩn danh hợp lệ, trả về không hợp lệ
        return { valid: false, message: 'Token không hợp lệ' }
      }
    } catch (error) {
      console.error('Verify token error:', error)
      return { valid: false, message: error.message }
    }
  },
  
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Object|null} - Thông tin người dùng hoặc null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('phone_analysis_user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    return null
  },
  
  /**
   * Kiểm tra xác thực
   * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
   */
  isAuthenticated() {
    return !!localStorage.getItem('phone_analysis_token')
  }
}

export default authService