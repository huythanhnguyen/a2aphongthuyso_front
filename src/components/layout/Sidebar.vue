<template>
  <div class="sidebar" :class="{ active: isActive }">
    <div class="sidebar-header">
      <h2>Phong Thủy Số</h2>
      <button class="new-chat-btn" @click="onNewChat">
        <font-awesome-icon icon="plus" /> Cuộc hội thoại mới
      </button>
      <button class="close-sidebar-btn" @click="closeSidebar">
        <font-awesome-icon icon="times" />
      </button>
    </div>
    
    <!-- User Profile & Quota Section -->
    <div class="sidebar-user-section">
      <div class="user-profile">
        <div class="user-avatar">
          <font-awesome-icon icon="user-circle" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-plan">{{ userPlan }}</div>
        </div>
      </div>
      
      <div class="quota-container">
        <div class="quota-info-header">
          <div class="quota-label">Câu hỏi còn lại:</div>
          <div class="quota-value" :class="quotaColorClass">
            <font-awesome-icon icon="question-circle" /> {{ remainingQuestions }}
          </div>
        </div>
        
        <router-link to="/payment" class="add-quota-button">
          <font-awesome-icon icon="plus-circle" />
          Nạp thêm câu hỏi
        </router-link>
      </div>
    </div>
    
    <!-- Navigation Links -->
    <div class="sidebar-nav">
      <router-link to="/app" class="nav-link" active-class="active">
        <font-awesome-icon icon="home" />
        <span>Trang chính</span>
      </router-link>
      <router-link to="/chat" class="nav-link" active-class="active">
        <font-awesome-icon icon="comment-dots" />
        <span>Chat trực tiếp</span>
      </router-link>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-tabs">
        <button 
          class="sidebar-tab-button" 
          :class="{ active: activeTab === 'history' }"
          @click="setActiveTab('history')"
        >
          Lịch sử
        </button>
        
        <button 
          class="sidebar-tab-button" 
          :class="{ active: activeTab === 'payments' }"
          @click="setActiveTab('payments')"
        >
          Thanh toán
        </button>
      </div>
      
      <!-- Nội dung tab lịch sử -->
      <div 
        class="sidebar-tab-content" 
        :class="{ active: activeTab === 'history' }"
        id="history-tab"
      >
        <div class="history-header">
          <h4>Lịch sử phân tích</h4>
          <button class="clear-button" @click="confirmClearHistory">Xóa lịch sử</button>
        </div>
        <div class="analysis-history-container">
          <div v-if="isLoading" class="empty-history-message">Đang tải lịch sử...</div>
          <div v-else-if="analysisHistory.length === 0" class="empty-history-message">
            Chưa có lịch sử phân tích.
          </div>
          <template v-else>
            <!-- Render lịch sử phân tích -->
            <div 
              v-for="item in analysisHistory" 
              :key="item.phoneNumber" 
              class="history-item"
              @click="selectHistoryItem(item)"
            >
              <div class="history-phone">{{ formatPhoneNumber(item.phoneNumber) }}</div>
              <div class="history-time">
                <span>{{ formatDate(item.createdAt) }}</span>
                <span 
                  v-if="item.result && item.result.balance" 
                  class="history-balance"
                  :class="getBalanceClass(item.result.balance)"
                >
                  <font-awesome-icon :icon="getBalanceIcon(item.result.balance)" />
                  {{ getBalanceText(item.result.balance) }}
                </span>
              </div>
              <!-- Energy info -->
              <div v-if="item.result && item.result.energyLevel" class="history-meta">
                <span v-if="item.result.starSequence && item.result.starSequence.length">
                  <font-awesome-icon icon="star" /> {{ item.result.starSequence.length }} sao
                </span>
                <div class="rating">
                  <span class="cat-rating">
                    <font-awesome-icon icon="plus-circle" /> {{ item.result.energyLevel.cat || 0 }}
                  </span>
                  <span class="hung-rating">
                    <font-awesome-icon icon="minus-circle" /> {{ Math.abs(item.result.energyLevel.hung || 0) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Load more button -->
            <button 
              v-if="canLoadMore" 
              id="load-more-history" 
              class="load-more-btn"
              :disabled="isLoadingMore"
              @click="loadMoreHistory"
            >
              {{ isLoadingMore ? 'Đang tải...' : 'Tải thêm' }}
            </button>
          </template>
        </div>
      </div>
      
      <!-- Nội dung tab thanh toán -->
      <div 
        class="sidebar-tab-content" 
        :class="{ active: activeTab === 'payments' }"
        id="payments-tab"
      >
        <payment-history />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAnalysisStore } from '@/stores/analysis'
import { useChatStore } from '@/stores/chat'
import { formatPhoneNumber, formatDate } from '@/utils'
import PaymentHistory from '@/components/payment/PaymentHistory.vue'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const analysisStore = useAnalysisStore()
const chatStore = useChatStore()

// State
const activeTab = ref('history')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// Computed
const analysisHistory = computed(() => analysisStore.analysisHistory)
const canLoadMore = computed(() => currentPage.value < totalPages.value)
const remainingQuestions = computed(() => chatStore.remainingQuestions)

const userName = computed(() => {
  return authStore.currentUser?.name || 'Người dùng'
})

const userPlan = computed(() => {
  return authStore.currentUser?.subscription?.plan || 'Gói miễn phí'
})

const quotaColorClass = computed(() => {
  if (remainingQuestions.value > 10) return 'quota-high'
  if (remainingQuestions.value >= 5) return 'quota-medium'
  return 'quota-low'
})

// Methods
const setActiveTab = (tab) => {
  activeTab.value = tab
  if (tab === 'history' && analysisHistory.value.length === 0) {
    loadAnalysisHistory()
  }
}

const closeSidebar = () => {
  emit('close')
}

const onNewChat = () => {
  chatStore.clearChat()
  emit('close')
}

const confirmClearHistory = async () => {
  if (confirm('Bạn có chắc muốn xóa lịch sử phân tích?')) {
    const result = await analysisStore.clearAnalysisHistory()
    if (!result.success) {
      alert(result.error || 'Không thể xóa lịch sử. Vui lòng thử lại sau.')
    }
  }
}

const loadAnalysisHistory = async () => {
  isLoading.value = true
  currentPage.value = 1
  
  try {
    const result = await analysisStore.fetchAnalysisHistory(currentPage.value)
    if (result.pagination) {
      totalPages.value = result.pagination.pages || 1
    }
  } finally {
    isLoading.value = false
  }
}

const loadMoreHistory = async () => {
  if (isLoadingMore.value) return
  
  isLoadingMore.value = true
  currentPage.value++
  
  try {
    await analysisStore.fetchAnalysisHistory(currentPage.value, true)
  } finally {
    isLoadingMore.value = false
  }
}

const selectHistoryItem = (item) => {
  chatStore.processUserInput(item.phoneNumber)
  emit('close')
}

// Balance helpers
const getBalanceClass = (balance) => {
  switch(balance) {
    case 'BALANCED': return 'balanced'
    case 'CAT_HEAVY': return 'cat-heavy'
    case 'HUNG_HEAVY': return 'hung-heavy'
    default: return ''
  }
}

const getBalanceIcon = (balance) => {
  switch(balance) {
    case 'BALANCED': return 'balance-scale'
    case 'CAT_HEAVY': return 'sun'
    case 'HUNG_HEAVY': return 'cloud'
    default: return 'question-circle'
  }
}

const getBalanceText = (balance) => {
  switch(balance) {
    case 'BALANCED': return 'Cân bằng'
    case 'CAT_HEAVY': return 'Thiên cát'
    case 'HUNG_HEAVY': return 'Thiên hung'
    default: return 'Không rõ'
  }
}

// Fetch history on mount
onMounted(async () => {
  loadAnalysisHistory()
  // Make sure we have the latest remaining questions
  await chatStore.fetchRemainingQuestions()
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-width: 280px;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  background-color: white;
  border-right: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
  z-index: 5;
  transition: transform 0.3s ease;
}

/* User Profile & Quota Section */
.sidebar-user-section {
  padding: 16px;
  background-color: #f8f8f8;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  font-size: 40px;
  color: var(--primary-color, #4361ee);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary, #212529);
  font-size: 0.95rem;
}

.user-plan {
  font-size: 0.8rem;
  color: var(--text-secondary, #6c757d);
}

.quota-container {
  padding: 10px;
  background-color: white;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
}

.quota-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.quota-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #6c757d);
}

.quota-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 1rem;
}

.quota-high {
  color: #2e7d32;
}

.quota-medium {
  color: #f57f17;
}

.quota-low {
  color: #d32f2f;
}

.add-quota-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--primary-color, #4361ee);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  width: 100%;
}

.add-quota-button:hover {
  background-color: var(--primary-dark, #3a56d4);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* On mobile */
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    width: 280px;
    transform: translateX(-100%);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }
  
  .sidebar.active {
    transform: translateX(0);
  }
}

.sidebar-header {
  padding: 16px;
  background: var(--primary-color, #4361ee);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.sidebar-header h2 {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.new-chat-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.close-sidebar-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: none;
}

@media (max-width: 992px) {
  .close-sidebar-btn {
    display: block;
  }
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Tabs styling */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  background-color: #f8f8f8;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sidebar-tab-button {
  flex: 1;
  background: none;
  border: none;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary, #6c757d);
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
}

.sidebar-tab-button.active {
  color: var(--primary-color, #4361ee);
  font-weight: 600;
  border-bottom: 2px solid var(--primary-color, #4361ee);
  background-color: rgba(67, 97, 238, 0.05);
}

.sidebar-tab-content {
  display: none;
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.sidebar-tab-content.active {
  display: flex;
  flex-direction: column;
}

/* History section */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h4 {
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-primary, #212529);
}

.clear-button {
  background-color: var(--background-color, #f5f7fa);
  color: var(--text-secondary, #6c757d);
  border: 1px solid var(--border-color, #e0e0e0);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: var(--danger-light, #ffebee);
  border-color: var(--danger-color, #f44336);
  color: var(--danger-color, #f44336);
}

.analysis-history-container {
  overflow-y: auto;
  flex: 1;
}

.empty-history-message {
  color: var(--text-secondary, #6c757d);
  text-align: center;
  padding: 16px;
  font-style: italic;
  font-size: 0.9rem;
}

/* History Item */
.history-item {
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background-color: #f5f7fa;
}

.history-item:hover {
  background-color: var(--primary-light, #e7ecfd);
  border-color: var(--primary-color, #4361ee);
}

.history-phone {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--primary-color, #4361ee);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 0.8rem;
  color: var(--text-secondary, #6c757d);
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-balance {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-balance.balanced {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.history-balance.cat-heavy {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.history-balance.hung-heavy {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary, #6c757d);
}

.rating {
  display: flex;
  gap: 8px;
}

.cat-rating {
  color: #4caf50;
  display: flex;
  align-items: center;
  gap: 2px;
}

.hung-rating {
  color: #f44336;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Load more button */
.load-more-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: var(--background-color, #f5f7fa);
  color: var(--primary-color, #4361ee);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.load-more-btn:hover {
  background-color: var(--primary-light, #e7ecfd);
  border-color: var(--primary-color, #4361ee);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sidebar-nav {
  padding: 0 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-primary, #334155);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--hover-color, #f1f5f9);
}

.nav-link.active {
  background-color: var(--primary-light, #eef2ff);
  color: var(--primary-color, #4361ee);
}

.nav-link svg {
  margin-right: 12px;
  width: 18px;
}
</style>