<template>
  <div class="api-tester">
    <h2>Kiểm tra API</h2>
    
    <div class="controls">
      <button @click="testAllEndpoints" :disabled="loading" class="test-button">
        {{ loading ? 'Đang kiểm tra...' : 'Kiểm tra tất cả API' }}
      </button>
      
      <div class="custom-endpoint">
        <input v-model="customEndpoint" placeholder="Nhập URL API để kiểm tra" />
        <button @click="testCustomEndpoint" :disabled="loading || !customEndpoint">Kiểm tra</button>
      </div>
      
      <div class="bypass-cors">
        <label>
          <input type="checkbox" v-model="bypassCors" />
          Bypass CORS (sử dụng proxy)
        </label>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Đang kiểm tra các endpoints...</p>
    </div>
    
    <div v-if="results.length > 0" class="results">
      <h3>Kết quả kiểm tra</h3>
      
      <div v-for="(result, index) in results" :key="index" 
           :class="['result-item', { success: result.success, error: !result.success }]">
        <div class="result-header">
          <strong>{{ result.url }}</strong>
          <span class="status">{{ result.status ? `${result.status} ${result.statusText}` : 'Lỗi CORS hoặc mạng' }}</span>
        </div>
        
        <div class="result-details">
          <div v-if="result.error" class="error-message">
            {{ result.error }}
          </div>
          
          <div v-if="result.responseTime" class="response-time">
            Thời gian phản hồi: {{ result.responseTime }}ms
          </div>
          
          <div v-if="result.data" class="data">
            <pre>{{ typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data }}</pre>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { testEndpoint, testAllEndpoints as testAll, getCorsProxyUrl } from '@/utils/apiTester';

const results = ref([]);
const loading = ref(false);
const error = ref('');
const customEndpoint = ref('');
const bypassCors = ref(false);

const testAllEndpoints = async () => {
  loading.value = true;
  error.value = '';
  results.value = [];
  
  try {
    const endpointsToTest = [
      'https://phongthuybotbackend.onrender.com/',
      'https://phongthuybotbackend.onrender.com/api',
      'https://phongthuybotbackend.onrender.com/api/health',
      'https://phongthuybotbackend.onrender.com/api/v2/agent',
      'https://phongthuybotbackend.onrender.com/v2/agent',
      'https://phongthuybotbackend.onrender.com/api/v2/agent/chat',
      'https://phongthuybotbackend.onrender.com/v2/agent/chat'
    ];
    
    for (const endpoint of endpointsToTest) {
      const url = bypassCors.value ? getCorsProxyUrl(endpoint) : endpoint;
      const result = await testEndpoint(url);
      result.originalUrl = endpoint;
      result.url = endpoint; // Hiển thị URL gốc, không phải URL proxy
      results.value.push(result);
    }
  } catch (err) {
    error.value = `Lỗi khi kiểm tra API: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const testCustomEndpoint = async () => {
  if (!customEndpoint.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const url = bypassCors.value ? getCorsProxyUrl(customEndpoint.value) : customEndpoint.value;
    const result = await testEndpoint(url);
    result.originalUrl = customEndpoint.value;
    result.url = customEndpoint.value;
    
    // Thêm kết quả mới lên đầu
    results.value = [result, ...results.value];
  } catch (err) {
    error.value = `Lỗi khi kiểm tra API: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.api-tester {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.test-button {
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
}

.test-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.custom-endpoint {
  display: flex;
  gap: 10px;
  width: 100%;
}

.custom-endpoint input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
}

.custom-endpoint button {
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  cursor: pointer;
}

.custom-endpoint button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4361ee;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results {
  margin-top: 20px;
}

.result-item {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #a0aec0;
}

.result-item.success {
  border-left-color: #48bb78;
}

.result-item.error {
  border-left-color: #f56565;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status {
  font-size: 0.9rem;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #e2e8f0;
}

.result-item.success .status {
  background-color: #c6f6d5;
  color: #276749;
}

.result-item.error .status {
  background-color: #fed7d7;
  color: #c53030;
}

.error-message {
  color: #c53030;
  margin-top: 10px;
}

.response-time {
  color: #718096;
  font-size: 0.9rem;
  margin-top: 8px;
}

.data {
  margin-top: 15px;
  background-color: #f7fafc;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.bypass-cors {
  margin-top: 10px;
}

.bypass-cors label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.error-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #fed7d7;
  color: #c53030;
  border-radius: 6px;
}
</style> 