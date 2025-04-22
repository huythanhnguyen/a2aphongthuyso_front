/**
 * Utility để kiểm tra API endpoints cho ứng dụng Phong Thủy Số
 */

/**
 * Lấy URL proxy để bypass CORS nếu cần
 * @param {string} url - URL gốc cần kiểm tra
 * @returns {string} URL với proxy CORS
 */
export function getCorsProxyUrl(url) {
  // Có thể sử dụng các dịch vụ proxy CORS như corsanywhere hoặc allorigins
  return `https://cors-anywhere.herokuapp.com/${url}`;
  // Alternative: return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
}

/**
 * Kiểm tra một endpoint API cụ thể
 * @param {string} url - URL endpoint cần kiểm tra
 * @returns {Promise<Object>} Kết quả kiểm tra với status, data, và các thông tin khác
 */
export async function testEndpoint(url) {
  const startTime = performance.now();
  const result = {
    url,
    success: false,
    responseTime: 0,
    status: null,
    statusText: '',
    data: null,
    error: null
  };

  try {
    const controller = new AbortController();
    // Timeout 10 giây
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      credentials: 'omit', // Không gửi cookies để tránh các vấn đề CORS phức tạp
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    result.status = response.status;
    result.statusText = response.statusText;
    result.success = response.ok;

    // Thử đọc response dưới dạng JSON
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result.data = await response.json();
      } else {
        // Nếu không phải JSON, đọc dưới dạng text
        result.data = await response.text();
        
        // Nếu dữ liệu trả về dưới dạng text có thể là JSON, thử parse
        if (result.data && result.data.trim().startsWith('{')) {
          try {
            result.data = JSON.parse(result.data);
          } catch (e) {
            // Nếu parse thất bại, giữ nguyên dưới dạng text
          }
        }
      }
    } catch (e) {
      result.error = `Lỗi xử lý dữ liệu: ${e.message}`;
    }
  } catch (error) {
    result.success = false;
    
    if (error.name === 'AbortError') {
      result.error = 'Timeout sau 10 giây';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      result.error = 'Lỗi CORS hoặc mạng: Máy chủ từ chối kết nối';
    } else {
      result.error = `Lỗi: ${error.message}`;
    }
  } finally {
    result.responseTime = Math.round(performance.now() - startTime);
    return result;
  }
}

/**
 * Kiểm tra tất cả endpoint API được định nghĩa
 * @returns {Promise<Array<Object>>} Mảng kết quả kiểm tra từ mỗi endpoint
 */
export async function testAllEndpoints() {
  const endpointsToTest = [
    'https://phongthuybotbackend.onrender.com/',
    'https://phongthuybotbackend.onrender.com/api',
    'https://phongthuybotbackend.onrender.com/api/health',
    'https://phongthuybotbackend.onrender.com/api/v2/agent',
    'https://phongthuybotbackend.onrender.com/v2/agent',
    'https://phongthuybotbackend.onrender.com/api/v2/agent/chat',
    'https://phongthuybotbackend.onrender.com/v2/agent/chat'
  ];

  return Promise.all(endpointsToTest.map(testEndpoint));
}

/**
 * Lấy path API đã được làm sạch, loại bỏ những phần trùng lặp
 * @param {string} endpoint - Endpoint API ban đầu
 * @returns {string} Endpoint đã được làm sạch
 */
export function getCleanedEndpoint(endpoint) {
  // Xóa các phần /api trùng lặp
  let cleaned = endpoint;
  
  // Nếu endpoint đã có tiền tố '/api' và chứa '/api/' trong phần còn lại
  if (cleaned.startsWith('/api') && cleaned.substring(4).includes('/api/')) {
    cleaned = cleaned.replace('/api', '');
  }
  
  return cleaned;
} 