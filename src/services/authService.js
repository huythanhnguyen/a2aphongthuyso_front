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
        // Sử dụng OAuth2 form data format theo FastAPI OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (response && response.access_token && response.user) {
          // Lưu token vào localStorage
          localStorage.setItem('phone_analysis_token', response.access_token);
          localStorage.setItem('phone_analysis_user', JSON.stringify(response.user));
          
          return {
            success: true,
            message: 'Đăng nhập thành công',
            user: response.user
          };
        } else {
          throw new Error('Không nhận được dữ liệu đăng nhập hợp lệ');
        }
      } catch (apiError) {
        console.log('API login không khả dụng, sử dụng phiên ẩn danh:', apiError.message);
        // Nếu API đăng nhập không khả dụng (chưa tích hợp xong), tạo phiên ẩn danh
        return this.createAnonymousSession(email);
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Tạo phiên ẩn danh khi API xác thực chưa khả dụng
   * @param {string} identifier - Thông tin định danh người dùng
   * @returns {Promise} - Kết quả tạo phiên ẩn danh
   */
  async createAnonymousSession(identifier) {
    try {
      // Tạo sessionId ngẫu nhiên
      const sessionId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Lưu thông tin vào localStorage
      localStorage.setItem('phone_analysis_token', sessionId);
      localStorage.setItem('phone_analysis_user', JSON.stringify({
        name: identifier || 'Người dùng ẩn danh',
        email: identifier || 'anonymous@user.com',
        role: 'user',
        isAnonymous: true,
        isOffline: false
      }));
      
      return {
        success: true,
        message: 'Đăng nhập phiên ẩn danh thành công',
        sessionId: sessionId,
        user: {
          name: identifier || 'Người dùng ẩn danh',
          email: identifier || 'anonymous@user.com',
          role: 'user',
          isAnonymous: true
        }
      };
    } catch (error) {
      console.error('Create anonymous session error:', error);
      
      // Tạo phiên ẩn danh offline nếu có lỗi
      const sessionId = `anonymous_${Date.now()}`;
      localStorage.setItem('phone_analysis_token', sessionId);
      localStorage.setItem('phone_analysis_user', JSON.stringify({
        name: identifier || 'Người dùng ẩn danh',
        email: identifier || 'anonymous@user.com',
        role: 'user',
        isAnonymous: true,
        isOffline: true
      }));
      
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
      };
    }
  },
  
  /**
   * Đăng ký tài khoản mới
   * @param {string} fullname - Tên người dùng
   * @param {string} email - Email
   * @param {string} password - Mật khẩu
   * @returns {Promise} - Kết quả đăng ký
   */
  async register(fullname, email, password) {
    try {
      try {
        const response = await apiClient.post(API_CONFIG.AUTH.REGISTER, {
          fullname,
          email,
          password
        });
        
        if (response && response.id) {
          // Đăng ký thành công, tiến hành đăng nhập
          return this.login(email, password);
        } else {
          throw new Error('Không nhận được dữ liệu đăng ký hợp lệ');
        }
      } catch (apiError) {
        console.log('API register không khả dụng, sử dụng phiên ẩn danh:', apiError.message);
        // Nếu API đăng ký không khả dụng, tạo phiên ẩn danh
        return this.createAnonymousSession(email);
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Đăng xuất
   * @returns {Promise} - Kết quả đăng xuất
   */
  async logout() {
    try {
      // Xóa thông tin phiên từ localStorage
      localStorage.removeItem('phone_analysis_token');
      localStorage.removeItem('phone_analysis_user');
      
      // Luôn trả về success=true, vì chúng ta sẽ logout ở client side dù sao
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message };
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
        // Sử dụng endpoint user/me với phương thức PUT
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }
        
        const response = await apiClient.put(API_CONFIG.AUTH.CHANGE_PASSWORD, {
          fullname: currentUser.fullname,
          email: currentUser.email,
          password: newPassword
        });
        
        if (response) {
          return {
            success: true,
            message: 'Đã thay đổi mật khẩu thành công'
          };
        } else {
          throw new Error('Không thể thay đổi mật khẩu');
        }
      } catch (apiError) {
        console.log('API change password không khả dụng:', apiError.message);
        return { 
          success: false, 
          message: 'Tính năng thay đổi mật khẩu chưa khả dụng với backend mới'
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * Xác thực token
   * @returns {Promise} - Kết quả xác thực token
   */
  async verifyToken() {
    try {
      try {
        const response = await apiClient.get(API_CONFIG.AUTH.VERIFY_TOKEN);
        
        // Cập nhật thông tin người dùng trong localStorage nếu cần
        if (response) {
          localStorage.setItem('phone_analysis_user', JSON.stringify(response));
          return { valid: true, user: response };
        } else {
          throw new Error('Không nhận được dữ liệu người dùng');
        }
      } catch (apiError) {
        console.log('API verify token không khả dụng:', apiError.message);
        
        // Kiểm tra xem có phải phiên ẩn danh không
        const token = localStorage.getItem('phone_analysis_token');
        const user = this.getCurrentUser();
        
        if (token && token.startsWith('anonymous_') && user) {
          // Nếu là phiên ẩn danh hợp lệ, trả về hợp lệ
          return { valid: true, user };
        }
        
        // Nếu không phải phiên ẩn danh hợp lệ, trả về không hợp lệ
        return { valid: false, message: 'Token không hợp lệ' };
      }
    } catch (error) {
      console.error('Verify token error:', error);
      return { valid: false, message: error.message };
    }
  },
  
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Object|null} - Thông tin người dùng hoặc null
   */
  getCurrentUser() {
    try {
      const userJSON = localStorage.getItem('phone_analysis_user');
      if (userJSON) {
        return JSON.parse(userJSON);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa
   * @returns {boolean} - Trạng thái đăng nhập
   */
  isAuthenticated() {
    const token = localStorage.getItem('phone_analysis_token');
    return !!token;
  }
};

export default authService