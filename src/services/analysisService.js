import { apiClient, API_CONFIG } from './api'
import { defineStore } from 'pinia'

// Import biến isDevelopment từ Vite
const isDevelopment = import.meta.env.DEV;

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
      const response = await apiClient.post(API_CONFIG.ANALYSIS.HISTORY, {
        agentType: "batcuclinh_so",
        query: `Lấy lịch sử phân tích, giới hạn ${limit} kết quả, trang ${page}`
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Không thể lấy lịch sử phân tích');
      }
      
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
      const response = await apiClient.post(API_CONFIG.ANALYSIS.DELETE_HISTORY, {
        agentType: "batcuclinh_so",
        query: "Xóa toàn bộ lịch sử phân tích của tôi"
      });
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
      const response = await apiClient.post(API_CONFIG.AGENT.CHAT, {
        message: payload.question,
        sessionId: payload.sessionId || undefined,
        userId: payload.userId || undefined,
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
   * Tạo phiên hội thoại mới
   * @returns {Promise} - Thông tin phiên mới
   */
  async createNewSession() {
    try {
      console.log('Creating new session with URL:', API_CONFIG.AGENT.CHAT);
      // Do cấu hình apiClient đã có baseURL là API_BASE_URL
      // và trong development, vite proxy sẽ xử lý '/api' -> 'https://phongthuybotbackend.onrender.com/api'
      // nên chúng ta không cần sửa URL ở đây
      const response = await apiClient.post(API_CONFIG.AGENT.CHAT, {
        message: "Bắt đầu phiên phân tích mới",
      });
      
      console.log('Create session response:', response);
      
      return {
        success: true,
        sessionId: response.result?.sessionId || response.sessionId || null
      };
    } catch (error) {
      console.error('Error creating new session:', error)
      
      // Tạo fake sessionId trong trường hợp lỗi để không làm gián đoạn UX
      const fallbackSessionId = "session-" + Math.random().toString(36).substring(2, 10);
      console.log('Using fallback session ID:', fallbackSessionId);
      
      return {
        success: true,
        sessionId: fallbackSessionId,
        isErrorFallback: true
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
   * Gửi tin nhắn đến Agent và nhận phản hồi dạng stream (Server-Sent Events)
   * @param {string} message - Nội dung tin nhắn
   * @param {string} sessionId - ID phiên (optional)
   * @param {Object} metadata - Metadata (optional)
   * @param {Function} onChunk - Callback xử lý mỗi chunk dữ liệu
   * @param {Function} onComplete - Callback khi stream hoàn tất
   * @param {Function} onError - Callback khi có lỗi
   * @returns {Promise} - Đối tượng AbortController để hủy stream
   */
  async streamChat(message, sessionId, metadata, onChunk, onComplete, onError) {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Log để debug
      console.log('Stream chat request:', {
        message,
        sessionId,
        metadata,
        url: isDevelopment ? `/api${API_CONFIG.AGENT.STREAM.replace('/api', '')}` : `${API_CONFIG.API_BASE_URL}${API_CONFIG.AGENT.STREAM}`,
        fullUrl: `${API_CONFIG.API_BASE_URL}${API_CONFIG.AGENT.STREAM}`
      });
      
      // Fallback cho trường hợp API lỗi
      setTimeout(() => {
        if (!streamingContentStarted) {
          console.warn('Streaming API timeout, using fallback response');
          const fallbackChunks = [
            "Đang xử lý câu hỏi của bạn...\n",
            "Phân tích dữ liệu...\n",
            `Rất tiếc, hiện tại hệ thống API không phản hồi. Tôi sẽ cố gắng hỗ trợ bạn với câu hỏi "${message}" sau khi kết nối được khôi phục.\n\n`,
            "Vui lòng thử lại sau hoặc liên hệ với quản trị viên để được hỗ trợ."
          ];
          
          let i = 0;
          const interval = setInterval(() => {
            if (i < fallbackChunks.length) {
              if (onChunk) onChunk(fallbackChunks[i]);
              i++;
            } else {
              clearInterval(interval);
              if (onComplete) onComplete();
            }
          }, 800);
        }
      }, 5000);
      
      let streamingContentStarted = false;
      
      // Sử dụng URL tương đối với proxy trong development
      // và URL đầy đủ trong production
      const apiUrl = isDevelopment 
        ? `/api${API_CONFIG.AGENT.STREAM.replace('/api', '')}` 
        : `${API_CONFIG.API_BASE_URL}${API_CONFIG.AGENT.STREAM}`;

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('phone_analysis_token')}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          sessionId,
          metadata
        }),
        signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        streamingContentStarted = true;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Hàm đọc dữ liệu từ stream
        function readStream() {
          reader.read().then(({ done, value }) => {
            if (done) {
              // Xử lý bất kỳ dữ liệu còn lại trong buffer
              if (buffer.trim()) {
                processChunks(buffer);
              }
              if (onComplete) onComplete();
              return;
            }

            // Decode và xử lý dữ liệu
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Xử lý từng dòng SSE "data: {...}"
            let lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Giữ phần còn lại cho lần đọc tiếp theo

            processChunks(lines.join('\n\n'));
            readStream();
          }).catch(err => {
            if (err.name === 'AbortError') {
              console.log('Stream was aborted');
            } else if (onError) {
              onError(err);
            }
          });
        }

        // Xử lý các chunks
        function processChunks(text) {
          const lines = text.split('\n\n');
          for (let line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.type === 'chunk' && onChunk) {
                  onChunk(data.content);
                } else if (data.type === 'error' && onError) {
                  onError(new Error(data.error || 'Unknown stream error'));
                } else if (data.type === 'complete' && onComplete) {
                  onComplete();
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, line);
              }
            }
          }
        }

        readStream();
      })
      .catch(err => {
        console.error('Stream fetch error:', err);
        if (onError) onError(err);
      });

      return controller; // Trả về controller để có thể hủy stream nếu cần
    } catch (error) {
      console.error('Stream function error:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Phương thức mới: kiểm tra sức khỏe API
  async checkHealth() {
    try {
      const response = await apiClient.get(API_CONFIG.HEALTH.CHECK);
      return {
        success: true,
        status: response.status,
        message: response.message,
        version: response.version,
        adkEnabled: response.adkEnabled
      };
    } catch (error) {
      console.error('Error checking API health:', error);
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  },

  // Phương thức mới: lấy thông tin về API
  async getAPIInfo() {
    try {
      const response = await apiClient.get('/');
      return {
        success: true,
        ...response
      };
    } catch (error) {
      console.error('Error getting API info:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Phương thức mới: lấy thông tin về Root Agent API
  async getRootAgentInfo() {
    try {
      const response = await apiClient.get(API_CONFIG.AGENT.ROOT);
      return response;
    } catch (error) {
      console.error('Error getting Root Agent info:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Phương thức mới: lấy thông tin về Bát Cục Linh Số API
  async getBatCucLinhSoInfo() {
    try {
      const response = await apiClient.get(API_CONFIG.BAT_CUC_LINH_SO.ROOT);
      return response;
    } catch (error) {
      console.error('Error getting Bát Cục Linh Số info:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Lấy số câu hỏi còn lại của người dùng trong ngày
   * @returns {Promise} - Số câu hỏi còn lại
   */
  async getRemainingQuestions() {
    try {
      // Sử dụng endpoint query mới
      const response = await apiClient.post(API_CONFIG.AGENT.QUERY, {
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
}

export default analysisService