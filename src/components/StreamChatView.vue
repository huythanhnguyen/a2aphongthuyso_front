<template>
  <div class="stream-chat-container">
    <!-- Header -->
    <div class="stream-chat-header">
      <h2>Chat với Phong Thủy Số</h2>
      <div v-if="sessionId" class="session-info">
        <span>Session ID: {{ sessionId }}</span>
      </div>
    </div>
    
    <!-- Chat Messages Area -->
    <div class="chat-messages" ref="chatMessagesRef">
      <!-- System welcome message -->
      <div class="message system-message">
        <div class="message-content">
          <p>Chào mừng bạn đến với Phong Thủy Số! Tôi có thể giúp gì cho bạn hôm nay?</p>
          <p>Bạn có thể:</p>
          <ul>
            <li>Phân tích số điện thoại</li>
            <li>Phân tích CCCD/CMND</li>
            <li>Phân tích mật khẩu</li>
            <li>Phân tích số tài khoản ngân hàng</li>
            <li>Gợi ý số tài khoản hợp phong thủy</li>
          </ul>
        </div>
      </div>
      
      <!-- User and agent messages -->
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role === 'user' ? 'user-message' : 'agent-message']">
        <div class="message-meta">
          <span class="message-author">{{ message.role === 'user' ? 'Bạn' : 'Phong Thủy Số' }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content" v-html="formatMessage(message.content)"></div>
      </div>
      
      <!-- Typing indicator -->
      <div v-if="isStreaming" class="message agent-message">
        <div class="message-meta">
          <span class="message-author">Phong Thủy Số</span>
          <span class="message-time">{{ formatTime(new Date()) }}</span>
        </div>
        <div class="message-content">
          <div class="streaming-content" v-html="formatMessage(streamingContent)"></div>
          <span v-if="streamingContent.length === 0" class="typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- Chat Input -->
    <div class="stream-chat-input">
      <textarea 
        v-model="inputText" 
        placeholder="Nhập câu hỏi của bạn..."
        @keydown.enter.prevent="sendMessage" 
        :disabled="isStreaming"
      ></textarea>
      <button @click="sendMessage" :disabled="!inputText.trim() || isStreaming" class="send-button">
        <font-awesome-icon :icon="isStreaming ? 'spinner' : 'paper-plane'" :spin="isStreaming" />
      </button>
      <button v-if="isStreaming" @click="stopStream" class="stop-button" title="Dừng trả lời">
        <font-awesome-icon icon="stop" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import analysisService from '@/services/analysisService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { API_CONFIG } from '@/services/api';

// Cấu hình tắt cảnh báo từ marked
marked.setOptions({
  mangle: false,
  headerIds: false
});

// State
const messages = ref([]);
const inputText = ref('');
const isStreaming = ref(false);
const streamingContent = ref('');
const sessionId = ref(null);
const chatMessagesRef = ref(null);
const streamController = ref(null);

// Initialize session
onMounted(async () => {
  // Tạo phiên chat mới
  try {
    console.log('Initializing chat session');
    const response = await analysisService.createNewSession();
    console.log('Session creation response:', response);
    
    if (response.success && response.sessionId) {
      sessionId.value = response.sessionId;
    }
  } catch (error) {
    console.error('Error creating session:', error);
    messages.value.push({
      role: 'system',
      content: 'Không thể kết nối đến máy chủ. Vui lòng tải lại trang và thử lại.',
      timestamp: new Date()
    });
  }
  
  // Scroll to bottom on initial load
  scrollToBottom();
});

// Scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

// Watch streaming content to scroll
watch(streamingContent, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

// Methods
const sendMessage = async () => {
  if (!inputText.value.trim() || isStreaming.value) return;
  
  // Add user message
  const message = {
    role: 'user',
    content: inputText.value,
    timestamp: new Date()
  };
  messages.value.push(message);
  
  // Clear input
  const sentText = inputText.value;
  inputText.value = '';
  
  // Start streaming
  isStreaming.value = true;
  streamingContent.value = '';
  
  try {
    // Log request details for debugging
    console.log('Send message request:', {
      text: sentText,
      sessionId: sessionId.value,
      url: API_CONFIG.AGENT.STREAM,
      baseUrl: API_CONFIG.API_BASE_URL
    });
    
    if (!sessionId.value) {
      throw new Error('Không có phiên chat. Vui lòng tải lại trang.');
    }
    
    // Handle streaming response
    streamController.value = await analysisService.streamChat(
      sentText,
      sessionId.value,
      null,
      // onChunk callback
      (chunk) => {
        streamingContent.value += chunk;
      },
      // onComplete callback
      () => {
        finishStreaming();
      },
      // onError callback
      (error) => {
        console.error('Stream error:', error);
        streamingContent.value = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.';
        finishStreaming();
      }
    );
  } catch (error) {
    console.error('Error in stream chat:', error);
    streamingContent.value = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.';
    finishStreaming();
  }
};

const stopStream = () => {
  if (streamController.value) {
    streamController.value.abort();
    streamController.value = null;
    finishStreaming();
  }
};

const finishStreaming = () => {
  if (streamingContent.value) {
    messages.value.push({
      role: 'assistant',
      content: streamingContent.value,
      timestamp: new Date()
    });
  }
  streamingContent.value = '';
  isStreaming.value = false;
};

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// Format message with markdown
const formatMessage = (text) => {
  if (!text) return '';
  // Convert markdown to HTML and sanitize
  return DOMPurify.sanitize(marked.parse(text));
};

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.stream-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stream-chat-header {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stream-chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #334155;
}

.session-info {
  font-size: 0.75rem;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.user-message {
  align-self: flex-end;
  background-color: #4361ee;
  color: white;
  border-bottom-right-radius: 4px;
}

.agent-message {
  align-self: flex-start;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.system-message {
  align-self: center;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  width: 90%;
  color: #475569;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.75rem;
}

.user-message .message-meta {
  color: rgba(255, 255, 255, 0.8);
}

.agent-message .message-meta {
  color: #64748b;
}

.message-content {
  line-height: 1.5;
}

.message-content p {
  margin: 0.5em 0;
}

.message-content ul, .message-content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.stream-chat-input {
  padding: 16px 24px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.stream-chat-input textarea {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  resize: none;
  height: 56px;
  outline: none;
  transition: border-color 0.2s;
}

.stream-chat-input textarea:focus {
  border-color: #4361ee;
}

.stream-chat-input button {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: none;
  background-color: #4361ee;
  color: white;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stream-chat-input button:hover:not(:disabled) {
  background-color: #3651d5;
}

.stream-chat-input button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.stop-button {
  background-color: #ef4444 !important;
}

.stop-button:hover {
  background-color: #dc2626 !important;
}

/* Typing indicator */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  background-color: #64748b;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator .dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Streaming content */
.streaming-content {
  min-height: 20px;
}
</style> 