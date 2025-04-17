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
      const response = await apiClient.post(API_CONFIG.PHONE.ANALYZE, { phoneNumber });
      console.log('Phone analysis response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Không thể phân tích số điện thoại');
      }
      
      // Đảm bảo có trường content để hiển thị
      if (!response.content && response.result) {
        if (response.result.analysis) {
          response.content = response.result.analysis;
          response.analysisData = response.result;
        } else {
          response.content = 'Đã phân tích số điện thoại.';
        }
      }
      
      return response;
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
   * Phân tích CCCD/CMND
   * @param {string} cccdNumber - Số CCCD/CMND cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzeCCCD(cccdNumber) {
    try {
      console.log('Sending CCCD analysis request with:', cccdNumber);
      // Sử dụng endpoint mới cho phân tích CCCD
      const response = await apiClient.post(API_CONFIG.CCCD.ANALYZE, { cccdNumber });
      console.log('CCCD analysis response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Không thể phân tích số CCCD/CMND');
      }
      
      // Đảm bảo có trường content để hiển thị
      if (!response.content && response.result) {
        if (response.result.content) {
          response.content = response.result.content;
          response.analysisData = response.result;
        } else {
          response.content = 'Đã phân tích số CCCD/CMND.';
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error analyzing CCCD:', error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Phân tích mật khẩu
   * @param {string} password - Mật khẩu cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzePassword(password) {
    try {
      // Sử dụng endpoint mới cho phân tích mật khẩu
      const response = await apiClient.post(API_CONFIG.PASSWORD.ANALYZE, { password });

      if (!response.success) {
        throw new Error(response.message || 'Không thể phân tích mật khẩu');
      }
      
      // Đảm bảo có trường content để hiển thị
      if (!response.content && response.result) {
        if (response.result.analysis) {
          response.content = response.result.analysis.recommendation;
          response.analysisData = response.result;
        } else {
          response.content = 'Đã phân tích mật khẩu.';
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error analyzing password:', error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Phân tích số tài khoản ngân hàng
   * @param {string} accountNumber - Số tài khoản cần phân tích
   * @returns {Promise} - Kết quả phân tích
   */
  async analyzeBankAccount(accountNumber) {
    try {
      // Sử dụng endpoint mới cho phân tích số tài khoản
      const response = await apiClient.post(API_CONFIG.BANK_ACCOUNT.ANALYZE, { accountNumber });

      if (!response.success) {
        throw new Error(response.message || 'Không thể phân tích số tài khoản');
      }
      
      // Đảm bảo có trường content để hiển thị
      if (!response.content && response.result) {
        if (response.result.analysis) {
          response.content = response.result.analysis.recommendation;
          response.analysisData = response.result;
        } else {
          response.content = 'Đã phân tích số tài khoản.';
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error analyzing bank account:', error)
      return { 
        success: false, 
        message: error.message,
        error: error.message
      }
    }
  },
  
  /**
   * Gợi ý số tài khoản ngân hàng
   * @param {string} purpose - Mục đích sử dụng tài khoản
   * @param {Array<string>} preferredDigits - Các chữ số ưa thích
   * @returns {Promise} - Các gợi ý số tài khoản
   */
  async suggestBankAccount(purpose, preferredDigits = []) {
    try {
      // Sử dụng endpoint mới cho gợi ý số tài khoản
      const response = await apiClient.post(API_CONFIG.BANK_ACCOUNT.SUGGEST, { 
        purpose, 
        preferredDigits 
      });

      if (!response.success) {
        throw new Error(response.message || 'Không thể gợi ý số tài khoản');
      }
      
      return response;
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
   * @param {number} limit - Số lượng tối đa bản ghi
   * @param {number} page - Số trang
   * @returns {Promise} - Lịch sử phân tích
   */
  async getAnalysisHistory(limit = 20, page = 1) {
    try {
      // Sử dụng endpoint mới cho lấy lịch sử qua agent API
      const response = await this.queryAgent("batcuclinh_so", 
        `Lấy lịch sử phân tích, giới hạn ${limit} kết quả, trang ${page}`, 
        { limit, page }
      );
      
      // Chuẩn hóa dữ liệu phản hồi
      if (response.result && response.result.history) {
        response.data = response.result.history;
      } else {
        response.data = [];
      }
      
      return response;
    } catch (error) {
      console.error('Error getting analysis history:', error)
      return { success: false, message: error.message, data: [] }
    }
  },
  
  /**
   * Xóa lịch sử phân tích
   * @returns {Promise} - Kết quả xóa lịch sử
   */
  async deleteAnalysisHistory() {
    try {
      // Sử dụng endpoint mới cho xóa lịch sử qua agent API
      const response = await this.queryAgent("batcuclinh_so", 
        "Xóa toàn bộ lịch sử phân tích của tôi"
      );
      return response;
    } catch (error) {
      console.error('Error deleting analysis history:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Đặt câu hỏi về phân tích số điện thoại
   * @param {Object} payload - Dữ liệu câu hỏi
   * @returns {Promise} - Kết quả câu hỏi
   */
  async askQuestion(payload) {
    try {
      // Sử dụng endpoint chat mới
      const response = await apiClient.post(API_CONFIG.ANALYSIS.QUESTION, {
        message: payload.question,
        sessionId: payload.sessionId || undefined,
        metadata: payload.metadata || undefined
      });
      return response;
    } catch (error) {
      console.error('Error asking question:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Gửi phản hồi về phân tích
   * @param {string} analysisId - ID phân tích
   * @param {string} feedbackType - Loại phản hồi (positive/negative)
   * @param {string} comment - Bình luận phản hồi
   * @returns {Promise} - Kết quả gửi phản hồi
   */
  async sendFeedback(analysisId, feedbackType, comment = '') {
    try {
      // Sử dụng endpoint mới cho gửi phản hồi qua agent API
      const response = await apiClient.post(API_CONFIG.ANALYSIS.FEEDBACK, {
        agentType: "batcuclinh_so",
        query: `Gửi phản hồi cho phân tích ${analysisId}: ${feedbackType}, comment: ${comment}`
      });
      return response;
    } catch (error) {
      console.error('Error sending feedback:', error)
      return { success: false, message: error.message }
    }
  },
  
  /**
   * Lấy các phân tích gần đây
   * @param {number} limit - Số lượng tối đa bản ghi
   * @returns {Promise} - Các phân tích gần đây
   */
  async getRecentAnalyses(limit = 5) {
    try {
      // Sử dụng endpoint mới cho lấy phân tích gần đây qua agent API
      const response = await apiClient.post(API_CONFIG.ANALYSIS.RECENT, {
        agentType: "batcuclinh_so",
        query: `Lấy ${limit} phân tích gần đây nhất`
      });
      
      if (!response.success && response.result) {
        response.success = response.result.success;
      }
      
      // Chuẩn hóa dữ liệu phản hồi
      if (response.result && response.result.recentAnalyses) {
        response.data = response.result.recentAnalyses;
      } else {
        response.data = [];
      }
      
      return response;
    } catch (error) {
      console.error('Error getting recent analyses:', error)
      return { success: false, message: error.message, data: [] }
    }
  },

  /**
   * Lấy số câu hỏi còn lại của người dùng trong ngày
   * @returns {Promise} - Số câu hỏi còn lại
   */
  async getRemainingQuestions() {
    try {
      // Sử dụng endpoint mới cho lấy số câu hỏi còn lại qua agent API
      const response = await apiClient.post(API_CONFIG.USER.REMAINING_QUESTIONS, {
        agentType: "batcuclinh_so",
        query: "Lấy số câu hỏi còn lại của tôi"
      });
      
      if (response.success && response.result) {
        // Nếu có trường remainingQuestions trong kết quả, sử dụng nó
        if (response.result.remainingQuestions !== undefined) {
          response.remainingQuestions = response.result.remainingQuestions;
        } else {
          // Giá trị mặc định
          response.remainingQuestions = 10;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error getting remaining questions:', error)
      return { 
        success: false, 
        message: 'Không thể lấy thông tin số câu hỏi còn lại',
        error: error.message,
        remainingQuestions: 10 // Giá trị mặc định
      }
    }
  },

  /**
   * Tạo phiên hội thoại mới
   * @returns {Promise} - Thông tin phiên mới
   */
  async createNewSession() {
    try {
      // Sử dụng endpoint mới để tạo phiên mới qua agent API
      const response = await apiClient.post(API_CONFIG.ANALYSIS.QUESTION, {
        message: "Bắt đầu phiên phân tích mới",
      });
      
      return {
        success: true,
        sessionId: response.result.sessionId
      };
    } catch (error) {
      console.error('Error creating new session:', error)
      return {
        success: false,
        message: 'Không thể tạo phiên mới',
        error: error.message
      }
    }
  },

  /**
   * Lấy thông tin người dùng từ số điện thoại
   * @param {string} phoneNumber - Số điện thoại
   * @returns {Promise} - Thông tin người dùng
   */
  async getUserInfoFromPhoneNumber(phoneNumber) {
    try {
      const response = await apiClient.get(API_CONFIG.USER.GET_INFO_BY_PHONE, {
        params: {
          phoneNumber
        }
      })
      
      if (!response.success) {
        throw new Error(response.message || 'Không tìm thấy thông tin người dùng')
      }
      
      return response
    } catch (error) {
      console.error('Error getting user info from phone number:', error)
      return {
        success: false,
        message: 'Không thể lấy thông tin người dùng từ số điện thoại',
        error: error.message
      }
    }
  },

  /**
   * Gửi câu hỏi và nhận phản hồi dạng stream
   * @param {Object} payload - Dữ liệu câu hỏi
   * @param {Function} onChunk - Callback khi nhận được chunk dữ liệu
   * @param {Function} onComplete - Callback khi stream hoàn tất
   * @param {Function} onError - Callback khi có lỗi
   * @returns {Object} - Đối tượng điều khiển stream
   */
  streamQuestion(payload, onChunk, onComplete, onError) {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      
      // Xây dựng URL với query parameters
      const url = new URL(`${API_CONFIG.API_BASE_URL}${API_CONFIG.ANALYSIS.STREAM}`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Thêm token nếu có
      const token = localStorage.getItem('phone_analysis_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Gửi request
      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: payload.question,
          sessionId: payload.sessionId || undefined,
          metadata: payload.metadata || undefined
        }),
        signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Xử lý stream với EventSource
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        function readStream() {
          reader.read().then(({ done, value }) => {
            if (done) {
              onComplete && onComplete(fullText);
              return;
            }
            
            // Decode và xử lý từng chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  
                  if (data.type === 'chunk') {
                    fullText += data.content;
                    onChunk && onChunk(data.content, fullText);
                  } else if (data.type === 'complete') {
                    onComplete && onComplete(fullText);
                  } else if (data.type === 'error') {
                    onError && onError(data.error);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                  onError && onError(e.message);
                }
              }
            }
            
            // Tiếp tục đọc stream
            readStream();
          }).catch(error => {
            console.error('Error reading stream:', error);
            onError && onError(error.message);
          });
        }
        
        // Bắt đầu đọc stream
        readStream();
      })
      .catch(error => {
        console.error('Stream request error:', error);
        onError && onError(error.message);
      });
      
      // Trả về controller để có thể hủy stream khi cần
      return {
        abort: () => controller.abort()
      };
    } catch (error) {
      console.error('Stream setup error:', error);
      onError && onError(error.message);
      return {
        abort: () => {}
      };
    }
  },

  /**
   * Truy vấn trực tiếp một agent cụ thể
   * @param {string} agentType - Loại agent cần truy vấn
   * @param {string} query - Nội dung truy vấn
   * @param {Object} metadata - Metadata bổ sung (tùy chọn)
   * @returns {Promise} - Kết quả truy vấn
   */
  async queryAgent(agentType, query, metadata = {}) {
    try {
      const sessionId = localStorage.getItem('phone_analysis_session_id');
      
      const payload = {
        agentType,
        query,
        sessionId: sessionId || undefined,
        metadata
      };
      
      console.log('Sending agent query with payload:', payload);
      const response = await apiClient.post('/v2/agent/query', payload);
      console.log('Agent query response:', response);
      
      if (!response.success) {
        throw new Error(response.message || `Không thể truy vấn agent ${agentType}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Error querying agent ${agentType}:`, error);
      return { 
        success: false, 
        message: error.message,
        error: error.message
      };
    }
  }
}

export default analysisService