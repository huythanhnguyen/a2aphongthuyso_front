// src/main.js
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, faPhone, faPhoneAlt, faEnvelope, faLock, faSignOutAlt, faHome, 
  faHistory, faPaperPlane, faTimes, faBars, faKey, faArrowLeft,
  faBriefcase, faHeart, faCoins, faHeartbeat, faStar, 
  faExclamationCircle, faQuestionCircle, faSun, faCloud, 
  faBalanceScale, faPlusCircle, faMinusCircle, faTrashAlt,
  faIdCard, faCreditCard, faChevronDown, faUserCircle, faPlus,
  faMobileAlt, faArrowRight, faChevronUp, faMobile, faMoneyBill, 
  faUniversity, faExclamationTriangle, faCalendarAlt, faChevronLeft, faChevronRight,
  faCompass, faTools, faTags,
  faCheckCircle, faTimesCircle, faInfoCircle,
  faSpinner, faSearch, faFilter, faSort,
  faWallet, faMoneyBillWave, faQuestion,
  faCog, faTrash, faEdit, faCommentDots,
  faStop, faPlayCircle, faPauseCircle, faEllipsisV, faComment
} from '@fortawesome/free-solid-svg-icons'

// Add all the necessary icons
library.add(
  faUser, faPhone, faPhoneAlt, faEnvelope, faLock, faSignOutAlt, faHome, 
  faHistory, faPaperPlane, faTimes, faBars, faKey, faArrowLeft,
  faBriefcase, faHeart, faCoins, faHeartbeat, faStar, 
  faExclamationCircle, faQuestionCircle, faSun, faCloud, 
  faBalanceScale, faPlusCircle, faMinusCircle, faTrashAlt,
  faIdCard, faCreditCard, faChevronDown, faUserCircle, faPlus,
  faMobileAlt, faArrowRight, faChevronUp, faMobile, faMoneyBill,
  faUniversity, faExclamationTriangle, faCalendarAlt, faChevronLeft, faChevronRight,
  faCompass, faTools, faTags,
  faCheckCircle, faTimesCircle, faInfoCircle,
  faSpinner, faSearch, faFilter, faSort,
  faWallet, faMoneyBillWave, faQuestion,
  faCog, faTrash, faEdit, faCommentDots,
  faStop, faPlayCircle, faPauseCircle, faEllipsisV, faComment
)

// In ra biến môi trường khi khởi động ứng dụng
console.log('Environment variables:');
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'Not defined, using default');
console.log('API Timeout:', import.meta.env.VITE_API_TIMEOUT || 'Not defined, using default');

// Import global CSS
import './assets/main.css'

const app = createApp(App)

// Cung cấp các biến môi trường cho Vue
app.config.globalProperties.$env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000')
}

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')