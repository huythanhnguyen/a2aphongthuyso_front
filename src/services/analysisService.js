import { apiClient, API_CONFIG } from './api'

const analysisService = {
  /**
   * Phân tích số điện thoại
   * @param {string} phoneNumber - Số điện thoại cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzePhoneNumber(phoneNumber) {
    try {
      console.log('Sending phone analysis request with:', phoneNumber);
      
      // Sử dụng endpoint mới cho phân tích số điện thoại
      const response = await apiClient.get(API_CONFIG.ANALYSIS.ANALYZE_NUMBER, {
        params: { number: phoneNumber }
      });
      console.log('Phone analysis response:', response);

      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể phân tích số điện thoại');
      }
      
      return {
        success: true,
        content: response.content || 'Đã phân tích số điện thoại.',
        analysisData: response
      };
    } catch (error) {
      console.error('Error analyzing phone number:', error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Phân tích CCCD/CMND, mật khẩu, tài khoản ngân hàng bằng chat API
   * @param {string} type - Loại phân tích (cccd, password, bank)
   * @param {string} value - Giá trị cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzeViaChat(type, value) {
    try {
      // Tạo nội dung tin nhắn dựa vào loại phân tích
      let message = '';
      switch (type) {
        case 'cccd':
          message = `Phân tích số CCCD/CMND: ${value}`;
          break;
        case 'password':
          message = `Phân tích mật khẩu: ${value}`;
          break;
        case 'bank':
          message = `Phân tích số tài khoản ngân hàng: ${value}`;
          break;
        default:
          throw new Error('Loại phân tích không hợp lệ');
      }
      
      // Sử dụng API chat cho phân tích
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message,
        context: { analysis_type: type, value }
      });
      
      console.log(`${type} analysis response:`, response);

      if (!response || response.status === 'error') {
        throw new Error(response?.detail || `Không thể phân tích ${type}`);
      }
      
      return {
        success: true,
        content: response.content || `Đã phân tích ${type}.`,
        analysisData: response
      };
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Phân tích CCCD/CMND
   * @param {string} cccdNumber - Số CCCD/CMND cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzeCCCD(cccdNumber) {
    return this.analyzeViaChat('cccd', cccdNumber);
  },
  
  /**
   * Phân tích mật khẩu
   * @param {string} password - Mật khẩu cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzePassword(password) {
    return this.analyzeViaChat('password', password);
  },
  
  /**
   * Phân tích số tài khoản ngân hàng
   * @param {string} accountNumber - Số tài khoản cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzeBankAccount(accountNumber) {
    return this.analyzeViaChat('bank', accountNumber);
  },
  
  /**
   * Gợi ý số tài khoản ngân hàng
   * @param {string} purpose - Mục đích sử dụng tài khoản
   * @param {Array<string>} preferredDigits - Các chữ số ưa thích
   * @returns {Promise} - Các gợi ý số tài khoản
   */
  async suggestBankAccount(purpose, preferredDigits = []) {
    try {
      // Sử dụng API chat để gợi ý số tài khoản
      const message = `Gợi ý số tài khoản ngân hàng cho mục đích: ${purpose}` +
        (preferredDigits.length > 0 ? ` với các chữ số ưa thích: ${preferredDigits.join(', ')}` : '');
      
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message,
        context: { 
          request_type: 'bank_suggestion', 
          purpose,
          preferred_digits: preferredDigits 
        }
      });

      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể gợi ý số tài khoản');
      }
      
      return {
        success: true,
        content: response.content || 'Đã gợi ý số tài khoản ngân hàng.',
        suggestions: response.metadata?.suggestions || [],
        analysisData: response
      };
    } catch (error) {
      console.error('Error suggesting bank account:', error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Lấy lịch sử phân tích
   * @param {number} limit - Giới hạn số kết quả
   * @param {number} page - Trang hiện tại
   * @returns {Promise} - Lịch sử phân tích
   */
  async getAnalysisHistory(limit = 20, page = 1) {
    try {
      // Sử dụng API chat để lấy lịch sử phân tích
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: 'Lấy lịch sử phân tích của tôi',
        context: { 
          request_type: 'history',
          limit,
          page
        }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể lấy lịch sử phân tích');
      }
      
      return {
        success: true,
        history: response.metadata?.history || [],
        pagination: response.metadata?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return {
        success: false,
        message: error.message,
        history: []
      };
    }
  },
  
  /**
   * Xóa lịch sử phân tích
   * @returns {Promise} - Kết quả xóa lịch sử
   */
  async deleteAnalysisHistory() {
    try {
      // Sử dụng API chat để xóa lịch sử phân tích
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: 'Xóa lịch sử phân tích của tôi',
        context: { request_type: 'delete_history' }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể xóa lịch sử phân tích');
      }
      
      return {
        success: true,
        message: 'Đã xóa lịch sử phân tích thành công'
      };
    } catch (error) {
      console.error('Error deleting analysis history:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  /**
   * Đặt câu hỏi phân tích
   * @param {Object} payload - Nội dung câu hỏi
   * @returns {Promise} - Kết quả trả lời
   */
  async askQuestion(payload) {
    try {
      // Sử dụng API chat để đặt câu hỏi
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: payload.message,
        context: payload.context || {}
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể xử lý câu hỏi');
      }
      
      return {
        success: true,
        content: response.content,
        agent: response.agent,
        metadata: response.metadata || {}
      };
    } catch (error) {
      console.error('Error asking question:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  /**
   * Gửi phản hồi về kết quả phân tích
   * @param {string} analysisId - ID của kết quả phân tích
   * @param {string} feedbackType - Loại phản hồi (positive/negative)
   * @param {string} comment - Nội dung phản hồi
   * @returns {Promise} - Kết quả gửi phản hồi
   */
  async sendFeedback(analysisId, feedbackType, comment = '') {
    try {
      // Sử dụng API chat để gửi phản hồi
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: `Phản hồi về kết quả phân tích: ${comment}`,
        context: {
          request_type: 'feedback',
          analysis_id: analysisId,
          feedback_type: feedbackType,
          comment
        }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể gửi phản hồi');
      }
      
      return {
        success: true,
        message: 'Đã gửi phản hồi thành công'
      };
    } catch (error) {
      console.error('Error sending feedback:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  /**
   * Lấy các phân tích gần đây
   * @param {number} limit - Giới hạn số kết quả
   * @returns {Promise} - Các phân tích gần đây
   */
  async getRecentAnalyses(limit = 5) {
    try {
      // Sử dụng API chat để lấy phân tích gần đây
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: 'Lấy các phân tích gần đây của tôi',
        context: {
          request_type: 'recent',
          limit
        }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể lấy phân tích gần đây');
      }
      
      let recentAnalyses = [];
      
      if (response.metadata && response.metadata.recent_analyses) {
        recentAnalyses = response.metadata.recent_analyses;
      } else if (response.content) {
        // Nếu không có metadata, thử phân tích nội dung
        recentAnalyses = [{
          id: 'recent',
          type: 'unknown',
          timestamp: new Date().toISOString(),
          content: response.content
        }];
      }
      
      return {
        success: true,
        recent: recentAnalyses
      };
    } catch (error) {
      console.error('Error getting recent analyses:', error);
      return {
        success: false,
        message: error.message,
        recent: []
      };
    }
  },
  
  /**
   * Tạo phiên mới
   * @returns {Promise} - Thông tin phiên mới
   */
  async createNewSession() {
    try {
      // Tạo phiên mới qua API chat
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: 'Tạo phiên mới',
        context: { request_type: 'new_session' }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể tạo phiên mới');
      }
      
      let sessionId = null;
      
      // Thử lấy sessionId từ metadata
      if (response.metadata && response.metadata.session_id) {
        sessionId = response.metadata.session_id;
      } else if (response.metadata && response.metadata.sessionId) {
        sessionId = response.metadata.sessionId;
      } else {
        // Nếu không có sessionId, tạo một cái ngẫu nhiên
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      }
      
      return {
        success: true,
        sessionId,
        message: 'Đã tạo phiên mới thành công'
      };
    } catch (error) {
      console.error('Error creating new session:', error);
      // Tạo một sessionId ngẫu nhiên nếu API fail
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      return {
        success: true,
        sessionId,
        message: 'Đã tạo phiên mới thành công (offline mode)',
        isOffline: true
      };
    }
  },
  
  /**
   * Lấy thông tin người dùng từ số điện thoại
   * @param {string} phoneNumber - Số điện thoại
   * @returns {Promise} - Thông tin người dùng
   */
  async getUserInfoFromPhoneNumber(phoneNumber) {
    try {
      // Sử dụng API chat để lấy thông tin người dùng từ số điện thoại
      const response = await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
        message: `Lấy thông tin người dùng từ số điện thoại: ${phoneNumber}`,
        context: {
          request_type: 'user_info_by_phone',
          phone_number: phoneNumber
        }
      });
      
      if (!response || response.status === 'error') {
        throw new Error(response?.detail || 'Không thể lấy thông tin người dùng');
      }
      
      let userInfo = null;
      
      if (response.metadata && response.metadata.user_info) {
        userInfo = response.metadata.user_info;
      } else {
        userInfo = {
          phone: phoneNumber,
          message: 'Không tìm thấy thông tin chi tiết'
        };
      }
      
      return {
        success: true,
        userInfo
      };
    } catch (error) {
      console.error('Error getting user info from phone number:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  /**
   * Nhận phản hồi stream từ API
   * @param {string} message - Nội dung tin nhắn
   * @param {string} sessionId - ID phiên
   * @param {Object} metadata - Metadata bổ sung
   * @param {Function} onChunk - Callback khi nhận được một phần dữ liệu
   * @param {Function} onComplete - Callback khi hoàn thành
   * @param {Function} onError - Callback khi có lỗi
   * @returns {Promise} - Promise chờ hoàn thành stream
   */
  async streamChat(message, sessionId, metadata, onChunk, onComplete, onError) {
    try {
      // Tạo URL cho stream API
      const url = `${API_CONFIG.API_BASE_URL}${API_CONFIG.ANALYSIS.STREAM}?session_id=${sessionId}`;
      
      // Bắt đầu kết nối SSE
      const eventSource = new EventSource(url);
      
      // Biến lưu nội dung tích lũy
      let accumulatedText = '';
      
      // Xử lý sự kiện message
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Xử lý từng chunk dữ liệu
          if (data && data.content) {
            accumulatedText += data.content;
            
            // Gọi callback onChunk
            if (onChunk && typeof onChunk === 'function') {
              onChunk(data);
            }
            
            // Nếu là chunk cuối cùng
            if (data.is_final) {
              // Đóng kết nối
              eventSource.close();
              
              // Gọi callback onComplete
              if (onComplete && typeof onComplete === 'function') {
                onComplete({
                  success: true,
                  content: accumulatedText,
                  metadata: data.metadata || {}
                });
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError, event.data);
          if (onError && typeof onError === 'function') {
            onError(new Error('Lỗi xử lý dữ liệu từ server'));
          }
        }
      };
      
      // Xử lý sự kiện error
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        
        if (onError && typeof onError === 'function') {
          onError(new Error('Lỗi kết nối đến server'));
        }
      };
      
      // Gửi message nếu có
      if (message) {
        // Gửi message qua POST API
        await apiClient.post(API_CONFIG.ANALYSIS.CHAT, {
          message,
          context: {
            session_id: sessionId,
            ...metadata
          }
        });
      }
      
      // Trả về promise để có thể chờ hoàn thành nếu cần
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          eventSource.close();
          reject(new Error('Timeout waiting for stream response'));
        }, API_CONFIG.REQUEST_TIMEOUT);
        
        // Override onComplete để resolve promise
        const originalOnComplete = onComplete;
        onComplete = (data) => {
          clearTimeout(timeoutId);
          if (originalOnComplete) originalOnComplete(data);
          resolve(data);
        };
        
        // Override onError để reject promise
        const originalOnError = onError;
        onError = (error) => {
          clearTimeout(timeoutId);
          if (originalOnError) originalOnError(error);
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error in streamChat:', error);
      if (onError && typeof onError === 'function') {
        onError(error);
      }
      throw error;
    }
  },
  
  /**
   * Kiểm tra trạng thái hoạt động của API
   * @returns {Promise} - Trạng thái hoạt động
   */
  async checkHealth() {
    try {
      const response = await apiClient.get(API_CONFIG.HEALTH.CHECK);
      
      return {
        success: true,
        status: response.status || 'healthy',
        version: response.version || 'unknown',
        message: 'API server đang hoạt động bình thường'
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        status: 'unhealthy',
        message: 'API server không phản hồi hoặc đang gặp vấn đề'
      };
    }
  },
  
  /**
   * Lấy thông tin về API
   * @returns {Promise} - Thông tin API
   */
  async getAPIInfo() {
    try {
      // Sử dụng health check để lấy thông tin API
      const healthCheck = await this.checkHealth();
      
      return {
        success: true,
        apiInfo: {
          version: healthCheck.version,
          status: healthCheck.status,
          baseUrl: API_CONFIG.API_BASE_URL
        }
      };
    } catch (error) {
      console.error('Get API info error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },
  
  /**
   * Lấy thông tin về Root Agent
   * @returns {Promise} - Thông tin Root Agent
   */
  async getRootAgentInfo() {
    try {
      // Sử dụng API agents để lấy thông tin
      const response = await apiClient.get(API_CONFIG.AGENTS.LIST);
      
      return {
        success: true,
        agentInfo: response.agents || []
      };
    } catch (error) {
      console.error('Get Root Agent info error:', error);
      return {
        success: false,
        message: error.message,
        agentInfo: []
      };
    }
  },
  
  /**
   * Lấy thông tin về BatCucLinhSo Agent
   * @returns {Promise} - Thông tin BatCucLinhSo Agent
   */
  async getBatCucLinhSoInfo() {
    try {
      // Sử dụng API agents để lấy thông tin
      const response = await apiClient.get(API_CONFIG.AGENTS.LIST);
      
      // Tìm thông tin về BatCucLinhSo Agent
      const allAgents = response.agents || [];
      const batCucLinhSoAgent = allAgents.find(agent => 
        agent.type === 'batcuclinh_so' || 
        (agent.sub_agents && agent.sub_agents.some(sub => sub.type === 'batcuclinh_so'))
      );
      
      return {
        success: true,
        agentInfo: batCucLinhSoAgent || null
      };
    } catch (error) {
      console.error('Get BatCucLinhSo Agent info error:', error);
      return {
        success: false,
        message: error.message,
        agentInfo: null
      };
    }
  },
  
  /**
   * Lấy số lượt phân tích còn lại
   * @returns {Promise} - Số lượt phân tích còn lại
   */
  async getRemainingQuestions() {
    try {
      // Sử dụng API user/me để lấy thông tin
      const response = await apiClient.get(API_CONFIG.USER.PROFILE);
      
      return {
        success: true,
        remaining: response.quota_remaining || 0,
        isPremium: response.is_premium || false
      };
    } catch (error) {
      console.error('Get remaining questions error:', error);
      return {
        success: false,
        message: error.message,
        remaining: 0
      };
    }
  }
}

export default analysisService