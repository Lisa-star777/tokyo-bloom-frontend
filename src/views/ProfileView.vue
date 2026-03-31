<template>
  <div class="profile-page">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <span class="current">Мой профиль</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <h1 class="page-title">Мой профиль</h1>

      <!-- Не авторизован -->
      <div v-if="!isAuthenticated" class="not-auth">
        <div class="not-auth-icon">👤</div>
        <h2 class="not-auth-title">Войдите в профиль</h2>
        <p class="not-auth-text">Чтобы увидеть информацию о себе, пожалуйста, войдите или зарегистрируйтесь</p>
        <div class="not-auth-buttons">
          <button class="login-btn" @click="openAuthModal('login')">Войти</button>
          <button class="register-btn" @click="openAuthModal('register')">Регистрация</button>
        </div>
      </div>

      <!-- Авторизован -->
      <div v-else class="profile-layout">
        <!-- Левая колонка - информация о пользователе -->
        <div class="profile-info-section">
          <div class="profile-card">
            <h2 class="profile-name">{{ user.name }}</h2>
            <p class="profile-email">{{ user.email }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-label">Заказов</span>
                <span class="stat-value">{{ orders.length }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-label">Бонусы</span>
                <span class="stat-value bonus-value">{{ user.bonuses || 0 }} баллов</span>
              </div>
            </div>

            <button class="edit-profile-btn" @click="showEditForm = !showEditForm">
              {{ showEditForm ? 'Отмена' : 'Редактировать профиль' }}
            </button>

            <!-- Форма редактирования -->
            <div v-if="showEditForm" class="edit-form">
              <div class="form-group">
                <label class="form-label">Имя</label>
                <input type="text" v-model="editForm.name" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" v-model="editForm.email" class="form-input">
              </div>
              <div class="form-actions">
                <button class="save-btn" @click="saveProfile">Сохранить</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка - история заказов -->
        <div class="profile-orders-section">
          <h3 class="orders-title">История заказов</h3>
          
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Загрузка заказов...</p>
          </div>
          
          <div v-else-if="orders.length === 0" class="no-orders">
            <div class="no-orders-icon">📦</div>
            <p class="no-orders-text">У вас пока нет заказов</p>
            <router-link to="/bouquets" class="start-shopping-btn">Начать покупки</router-link>
          </div>

          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-item">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number">Заказ №{{ order.id }}</span>
                  <span class="order-date">{{ formatDate(order.created_at) }}</span>
                </div>
                <span class="order-status" :class="order.status">{{ order.status_text }}</span>
              </div>

              <div class="order-products">
                <div v-for="item in order.items" :key="item.id" class="order-product">
                  <span class="order-product-title">
                    {{ item.title }} <span class="order-product-quantity">({{ item.quantity }} шт.)</span>
                  </span>
                  <span class="order-product-price">{{ formatPrice(item.price * item.quantity) }} ₽</span>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span class="total-label">Итого:</span>
                  <span class="total-value">{{ formatPrice(order.total) }} ₽</span>
                </div>
                <div v-if="order.bonuses_earned" class="order-bonuses">
                  +{{ order.bonuses_earned }} баллов
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно авторизации -->
    <AuthModal 
      v-if="showAuthModal" 
      :initial-tab="authModalTab"
      @close="closeAuthModal"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script>
import { authStore } from '@/stores/auth'
import { cartStore } from '@/stores/cart'
import AuthModal from '@/components/AuthModal.vue'

export default {
  name: 'ProfileView',
  components: {
    AuthModal
  },
  data() {
    return {
      showAuthModal: false,
      authModalTab: 'login',
      showEditForm: false,
      loading: true,
      orders: [],
      editForm: {
        name: '',
        email: ''
      },
      editErrors: {
        name: '',
        email: ''
      }
    }
  },
  computed: {
    user() {
      return authStore.getCurrentUser() || {}
    },
    isAuthenticated() {
      return authStore.isAuthenticated()
    }
  },
  watch: {
    user: {
      handler(newUser) {
        if (newUser) {
          this.editForm.name = newUser.name || ''
          this.editForm.email = newUser.email || ''
          this.loadOrders()
        }
      },
      immediate: true
    }
  },
  methods: {
    formatPrice(price) {
      if (!price && price !== 0) return '0'
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },
    
    formatDate(dateStr) {
      if (!dateStr) return 'Дата не указана'
      return new Date(dateStr).toLocaleString('ru-RU')
    },
    
    async loadOrders() {
      if (!this.user.id) {
        this.loading = false
        return
      }
      
      this.loading = true
      try {
        this.orders = await cartStore.getUserOrders(this.user.id)
        console.log('📋 Загружено заказов для профиля:', this.orders.length)
      } catch (error) {
        console.error('❌ Ошибка загрузки заказов:', error)
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    
    openAuthModal(tab) {
      this.authModalTab = tab
      this.showAuthModal = true
    },
    
    closeAuthModal() {
      this.showAuthModal = false
    },
    
    handleLoginSuccess() {
      this.closeAuthModal()
      this.loadOrders()
    },
    
    validateForm() {
      let isValid = true
      this.editErrors = { name: '', email: '' }
      
      if (!this.editForm.name.trim()) {
        this.editErrors.name = 'Имя обязательно'
        isValid = false
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.editForm.email.trim()) {
        this.editErrors.email = 'Email обязателен'
        isValid = false
      } else if (!emailRegex.test(this.editForm.email)) {
        this.editErrors.email = 'Введите корректный email'
        isValid = false
      }
      
      return isValid
    },
    
    async saveProfile() {
      if (!this.validateForm()) return
      
      try {
        const updatedUser = await authStore.updateUserProfile({
          name: this.editForm.name,
          email: this.editForm.email
        })
        
        if (updatedUser) {
          this.showEditForm = false
          alert('✅ Профиль успешно обновлен!')
        } else {
          alert('❌ Ошибка при обновлении профиля')
        }
      } catch (error) {
        console.error('Ошибка сохранения профиля:', error)
        alert('❌ Ошибка при обновлении профиля')
      }
    }
  },
  mounted() {
    this.loadOrders()
    
    // Слушаем обновление заказов
    window.addEventListener('orders-updated', () => {
      this.loadOrders()
    })
  },
  beforeUnmount() {
    window.removeEventListener('orders-updated', this.loadOrders)
  }
}
</script>

<style scoped>
.profile-page {
  margin-top: 120px;
  min-height: 100vh;
  background-color: #ffffff;
  padding-bottom: 60px;
}

.breadcrumb-section {
  background-color: #ffffff;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 40px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: #292966;
}

.breadcrumb .current {
  color: #292966;
  font-weight: 600;
}

.breadcrumb .divider {
  color: #999;
}

.page-title {
  font-family: 'Russo One', sans-serif;
  font-size: 42px;
  color: #292966;
  margin-bottom: 40px;
}

/* Не авторизован */
.not-auth {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  border: 2px dashed #A3A3CC;
  max-width: 500px;
  margin: 0 auto;
}

.not-auth-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.not-auth-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 10px;
  font-weight: 600;
}

.not-auth-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.not-auth-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.login-btn,
.register-btn {
  padding: 12px 30px;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn {
  background-color: #292966;
  color: white;
  border: 2px solid #292966;
}

.login-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(41, 41, 102, 0.3);
}

.register-btn {
  background-color: white;
  color: #292966;
  border: 2px solid #292966;
}

.register-btn:hover {
  background-color: #292966;
  color: white;
  transform: translateY(-2px);
}

/* Основной макет */
.profile-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

/* Левая колонка */
.profile-info-section {
  position: sticky;
  top: 140px;
  align-self: start;
}

.profile-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #A3A3CC;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
}

.profile-name {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 5px;
  font-weight: 600;
}

.profile-email {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 25px;
}

.profile-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid #A3A3CC;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-family: 'Russo One', sans-serif;
  font-size: 24px;
  color: #292966;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: #e0e0e0;
}

.edit-profile-btn {
  width: 100%;
  padding: 14px;
  background-color: #A3A3CC;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.edit-form {
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid #A3A3CC;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-label {
  display: block;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #A3A3CC;
}

.form-actions {
  text-align: right;
  margin-top: 15px;
}

.save-btn {
  padding: 8px 20px;
  background-color: #292966;
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

/* Правая колонка - заказы */
.profile-orders-section {
  background-color: #ffffff;
}

.orders-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 25px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #292966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-orders {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #A3A3CC;
}

.no-orders-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-orders-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.start-shopping-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #292966;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.start-shopping-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

/* Список заказов */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  background-color: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.order-item:hover {
  border-color: #A3A3CC;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 10px;
}

.order-number {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
}

.order-date {
  font-size: 12px;
  color: #999;
}

.order-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.order-status.new {
  background-color: #A3A3CC;
  color: white;
}

.order-status.processing {
  background-color: #ffd966;
  color: #292966;
}

.order-status.confirmed {
  background-color: #4CAF50;
  color: white;
}

.order-status.delivered {
  background-color: #4CAF50;
  color: white;
}

.order-status.cancelled {
  background-color: #ff6b6b;
  color: white;
}

.order-products {
  margin-bottom: 15px;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.order-product:last-child {
  border-bottom: none;
}

.order-product-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
}

.order-product-quantity {
  font-size: 12px;
  color: #666;
}

.order-product-price {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #292966;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 2px solid #e0e0e0;
}

.order-total {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.total-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.total-value {
  font-family: 'Russo One', sans-serif;
  font-size: 18px;
  color: #292966;
}

.order-bonuses {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #4CAF50;
  padding: 4px 8px;
  background-color: #e8f5e9;
  border-radius: 20px;
}

/* Адаптивность */
@media (max-width: 992px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .profile-info-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-page {
    margin-top: 140px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .not-auth-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-page {
    margin-top: 160px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .profile-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-divider {
    display: none;
  }
  
  .order-product {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>