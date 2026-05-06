<template>
  <div class="orders-page">
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <span class="current">Мои заказы</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <h1 class="page-title">Мои заказы</h1>

      <div v-if="!isAuthenticated" class="not-auth">
        <div class="not-auth-icon">📦</div>
        <h2 class="not-auth-title">Войдите, чтобы увидеть заказы</h2>
        <p class="not-auth-text">История заказов доступна только авторизованным пользователям</p>
        <div class="not-auth-buttons">
          <button class="login-btn" @click="openAuthModal('login')">Войти</button>
          <button class="register-btn" @click="openAuthModal('register')">Регистрация</button>
        </div>
      </div>

      <div v-else-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка заказов...</p>
      </div>

      <div v-else-if="orders.length === 0" class="no-orders">
        <div class="no-orders-icon">📭</div>
        <h2 class="no-orders-title">У вас пока нет заказов</h2>
        <p class="no-orders-text">Но это никогда не поздно исправить!</p>
        <router-link to="/bouquets" class="start-shopping-btn">Начать покупки</router-link>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">Заказ №{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-status-badge" :class="order.status">
              {{ order.status_text }}
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="order-item-info">
                <span class="order-item-title">{{ item.title }}</span>
                <span class="order-item-quantity">{{ item.quantity }} шт.</span>
              </div>
              <span class="order-item-price">{{ formatPrice(item.price * item.quantity) }} ₽</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-summary">
              <div class="summary-row">
                <span>Сумма:</span>
                <span>{{ formatPrice(order.subtotal) }} ₽</span>
              </div>
              <div class="summary-row">
                <span>Доставка:</span>
                <span>{{ formatPrice(order.delivery_cost) }} ₽</span>
              </div>
              <div class="summary-row total">
                <span>Итого:</span>
                <span class="total-value">{{ formatPrice(order.total) }} ₽</span>
              </div>
            </div>
            <div class="order-bonuses" v-if="order.bonuses_earned">
              +{{ order.bonuses_earned }} баллов начислено
            </div>
          </div>

          <button class="repeat-order-btn" @click="repeatOrder(order)">
             Повторить заказ
          </button>
        </div>
      </div>
    </div>

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
import { notifications } from '@/services/notifications'
import AuthModal from '@/components/AuthModal.vue'


export default {
  name: 'OrdersView',
  components: {
    AuthModal
  },
  data() {
    return {
      showAuthModal: false,
      authModalTab: 'login',
      orders: [],
      loading: true
    }
  },
  computed: {
    isAuthenticated() {
      return authStore.isAuthenticated()
    },
    currentUser() {
      return authStore.getCurrentUser()
    }
  },
  methods: {
    formatPrice(price) {
        return Math.round(price).toLocaleString('ru-RU');
    },
    
    formatDate(dateStr) {
      if (!dateStr) return 'Дата не указана'
      return new Date(dateStr).toLocaleString('ru-RU')
    },

    async loadOrders() {
      this.loading = true
      try {
        if (this.currentUser) {
          this.orders = await cartStore.getUserOrders(this.currentUser.id)
          console.log('📋 Загружено заказов:', this.orders.length)
        }
      } catch (error) {
        console.error(' Ошибка загрузки заказов:', error)
      } finally {
        this.loading = false
      }
    },

    async repeatOrder(order) {
      if (!order.items) return
      for (const item of order.items) {
        await cartStore.addItem(item, item.quantity)
      }
      notifications.success('Товары добавлены в корзину')
      this.$router.push('/cart')
    },

    openAuthModal(tab) {
      this.authModalTab = tab
      this.showAuthModal = true
    },

    closeAuthModal() {
      this.showAuthModal = false
    },

    async handleLoginSuccess() {
      this.closeAuthModal()
      await this.loadOrders()
    }
  },
  async mounted() {
    await this.loadOrders()
    
    // Слушаем обновление заказов
    window.addEventListener('orders-updated', async () => {
      await this.loadOrders()
    })
  },
  beforeUnmount() {
    window.removeEventListener('orders-updated', this.loadOrders)
  }
}
</script>

<style scoped>
/* Добавьте эти стили, если их нет */
.orders-page {
  margin-top: 120px;
  min-height: 100vh;
  padding-bottom: 60px;
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

.orders-page {
  margin-top: 120px;
  min-height: 100vh;
  background-color: #ffffff;
  padding-bottom: 60px;
}

/* Хлебные крошки */
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

/* Нет заказов */
.no-orders {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  border: 2px dashed #A3A3CC;
  max-width: 500px;
  margin: 0 auto;
}

.no-orders-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-orders-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 10px;
  font-weight: 600;
}

.no-orders-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
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
  box-shadow: 0 4px 15px rgba(41, 41, 102, 0.3);
}

/* Список заказов */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background-color: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #A3A3CC;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #292966;
}

.order-date {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.order-status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.order-status-badge.new {
  background-color: #A3A3CC;
  color: white;
}

.order-status-badge.processing {
  background-color: #ffd966;
  color: #292966;
}

.order-status-badge.confirmed {
  background-color: #4CAF50;
  color: white;
}

.order-status-badge.delivered {
  background-color: #4CAF50;
  color: white;
}

.order-status-badge.cancelled {
  background-color: #ff6b6b;
  color: white;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.order-item-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
}

.order-item-quantity {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.order-item-price {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #e0e0e0;
}

.order-summary {
  text-align: right;
}

.summary-row {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  color: #292966;
  margin-top: 5px;
}

.total-value {
  font-family: 'Russo One', sans-serif;
  color: #292966;
}

.order-bonuses {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 600;
  padding: 5px 10px;
  background-color: #e8f5e9;
  border-radius: 20px;
}

.repeat-order-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
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

.repeat-order-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(163, 163, 204, 0.3);
}

/* Адаптивность */
@media (max-width: 768px) {
  .orders-page {
    margin-top: 140px;
  }

  .page-title {
    font-size: 36px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .order-item-info {
    flex-wrap: wrap;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .order-summary {
    text-align: left;
    width: 100%;
  }

  .summary-row {
    justify-content: space-between;
  }

  .not-auth-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .orders-page {
    margin-top: 160px;
  }

  .page-title {
    font-size: 32px;
  }
}
</style>