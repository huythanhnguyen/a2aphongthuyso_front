import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_CONFIG, useMockMode } from '@/services/api'

export const usePaymentStore = defineStore('payment', () => {
  // State
  const paymentPackages = ref([
    {
      id: 1,
      name: 'Gói Cơ Bản',
      questions: 10,
      price: 100000,
      discount: 0,
      popular: false,
      description: 'Phù hợp cho người mới bắt đầu, muốn trải nghiệm dịch vụ.'
    },
    {
      id: 2,
      name: 'Gói Tiêu Chuẩn',
      questions: 50,
      price: 450000,
      discount: 10,
      popular: true,
      description: 'Phù hợp cho người dùng thường xuyên, tiết kiệm 10%.'
    },
    {
      id: 3,
      name: 'Gói Cao Cấp',
      questions: 100,
      price: 800000,
      discount: 20,
      popular: false,
      description: 'Phù hợp cho người dùng chuyên nghiệp, tiết kiệm 20%.'
    }
  ])
  
  const paymentHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const paymentUrl = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  
  // Actions
  const fetchPaymentPackages = async () => {
    try {
      isLoading.value = true
      // Trong môi trường thực tế, gọi API để lấy dữ liệu
      // const response = await api.get('/payment/packages')
      // paymentPackages.value = response.data.packages
      
      // Sử dụng dữ liệu mẫu
      isLoading.value = false
    } catch (err) {
      console.error('Error fetching payment packages:', err)
      error.value = 'Không thể tải gói thanh toán. Vui lòng thử lại sau.'
      isLoading.value = false
    }
  }
  
  const getPaymentHistory = async (page = 1) => {
    try {
      isLoading.value = true
      currentPage.value = page
      
      if (useMockMode) {
        console.log('Using mock payment history data');
        // Mock payment history data
        paymentHistory.value = [
          {
            id: 'MOCK-TX-001',
            packageId: 2,
            packageName: 'Gói Tiêu Chuẩn',
            amount: 450000,
            questions: 50,
            status: 'completed',
            paymentDate: new Date().toISOString(),
            paymentMethod: 'Thẻ tín dụng',
            previousTotal: 0,
            newTotal: 50
          }
        ];
        totalPages.value = 1;
        isLoading.value = false;
        return { 
          success: true,
          payments: paymentHistory.value,
          pagination: { currentPage: 1, totalPages: 1, totalItems: 1 }
        };
      }
      
      // Gọi API để lấy dữ liệu
      const response = await apiClient.get(`${API_CONFIG.PAYMENT.HISTORY}?page=${page}`)
      
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải lịch sử thanh toán')
      }
      
      paymentHistory.value = response.payments || []
      totalPages.value = response.pagination?.totalPages || 1
      
      isLoading.value = false
      return response
    } catch (err) {
      console.error('Error fetching payment history:', err)
      error.value = 'Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.'
      isLoading.value = false
      return { payments: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } }
    }
  }
  
  const createPayment = async (packageId) => {
    try {
      isLoading.value = true
      
      // Trong môi trường thực tế, gọi API để tạo thanh toán
      // const response = await api.post('/payment/create', { packageId })
      // paymentUrl.value = response.data.paymentUrl
      
      // Mô phỏng response
      const mockResponse = {
        success: true,
        paymentUrl: 'https://payment-gateway.example.com/checkout?id=123456789',
        message: 'Tạo giao dịch thanh toán thành công'
      }
      
      paymentUrl.value = mockResponse.paymentUrl
      
      // Chuyển hướng người dùng đến trang thanh toán
      if (mockResponse.success) {
        // Thực tế sẽ chuyển hướng sang cổng thanh toán 
        // window.location.href = paymentUrl.value
        
        // Thay vì chuyển hướng thực tế, giả lập chuyển hướng để demo
        console.log('Redirecting to payment gateway:', paymentUrl.value)
        
        // Trong môi trường demo, chuyển hướng đến trang payment với tham số giả lập
        // Trong thực tế, cổng thanh toán sẽ redirect về với status và transaction_id
        setTimeout(() => {
          window.location.href = '/payment?status=success&transaction_id=TX' + Date.now()
        }, 1000)
      }
      
      isLoading.value = false
      return mockResponse
    } catch (err) {
      console.error('Error creating payment:', err)
      error.value = 'Không thể tạo giao dịch thanh toán. Vui lòng thử lại sau.'
      isLoading.value = false
      return { success: false, error: error.value }
    }
  }
  
  const getTransactionDetails = async (transactionId) => {
    try {
      isLoading.value = true
      
      // Trong môi trường thực tế, gọi API để lấy thông tin giao dịch
      // const response = await api.get(`/payment/transaction/${transactionId}`)
      
      // Mô phỏng response
      const selectedPackage = paymentPackages.value.find(pkg => pkg.popular) || paymentPackages.value[0]
      const mockTransaction = {
        id: transactionId,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: selectedPackage.price,
        questions: selectedPackage.questions,
        status: 'completed',
        paymentDate: new Date().toISOString(),
        paymentMethod: 'Thẻ tín dụng',
        previousTotal: 0, // Số câu hỏi trước khi thanh toán
        newTotal: selectedPackage.questions, // Số câu hỏi sau khi thanh toán
      }
      
      // Thêm giao dịch vào lịch sử thanh toán
      paymentHistory.value = [mockTransaction, ...paymentHistory.value]
      
      isLoading.value = false
      return { success: true, transaction: mockTransaction }
    } catch (err) {
      console.error('Error fetching transaction details:', err)
      error.value = 'Không thể lấy thông tin giao dịch. Vui lòng thử lại sau.'
      isLoading.value = false
      return { success: false, error: error.value }
    }
  }
  
  return {
    paymentPackages,
    paymentHistory,
    isLoading,
    error,
    paymentUrl,
    currentPage,
    totalPages,
    fetchPaymentPackages,
    getPaymentHistory,
    createPayment,
    getTransactionDetails
  }
}) 