<template>
  <div class="cart-page">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <span class="current">Корзина</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <h1 class="page-title">Корзина</h1>

      <div v-if="!isAuthenticated" class="not-auth">
        <div class="not-auth-icon">🛒</div>
        <h2 class="not-auth-title">Войдите, чтобы увидеть корзину</h2>
        <p class="not-auth-text">Ваши товары сохранятся и будут ждать вас</p>
        <div class="not-auth-buttons">
          <button class="login-btn" @click="openAuthModal('login')">Войти</button>
          <button class="register-btn" @click="openAuthModal('register')">Регистрация</button>
        </div>
      </div>

      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Корзина пуста</h2>
        <p class="empty-cart-text">Но это никогда не поздно исправить :)</p>
        <router-link to="/bouquets" class="continue-shopping-btn">
          Перейти к покупкам
        </router-link>
      </div>

      <div v-else class="cart-layout">
        <!-- Список товаров -->
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <div class="image-placeholder">{{ item.title }}</div>
            </div>
            
            <div class="item-details">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-description">{{ item.description }}</p>
              
              <div class="item-controls">
                <div class="quantity-control">
                  <button class="quantity-btn" @click="decreaseQuantity(item.id)">−</button>
                  <span class="quantity-value">{{ item.quantity }}</span>
                  <button class="quantity-btn" @click="increaseQuantity(item.id)">+</button>
                </div>
                
                <button class="remove-btn" @click="removeItem(item.id)">
                  <span class="remove-icon">×</span>
                  Удалить
                </button>
              </div>
            </div>
            
            <div class="item-price">
              {{ formatPrice(item.price * item.quantity) }} ₽
            </div>
          </div>
        </div>

        <!-- Итоги заказа -->
        <div class="cart-summary">
          <h2 class="summary-title">Ваш заказ</h2>
          
          <div class="summary-items">
            <div class="summary-row">
              <span>Товары ({{ totalItems }} шт.)</span>
              <span>{{ formatPrice(subtotal) }} ₽</span>
            </div>
            <div class="summary-row">
              <span>Доставка</span>
              <span>{{ formatPrice(deliveryCost) }} ₽</span>
            </div>
            <div v-if="bonusDiscount > 0" class="summary-row discount">
              <span>Скидка баллами</span>
              <span>-{{ formatPrice(bonusDiscount) }} ₽</span>
            </div>
            <div class="summary-row">
              <span>Будет начислено баллов</span>
              <span class="bonus-earn">+{{ formatPrice(bonusesToEarn) }}</span>
            </div>
          </div>

          <div class="summary-total">
            <span class="total-label">Итого:</span>
            <span class="total-value">{{ formatPrice(total) }} ₽</span>
          </div>

          <button class="checkout-button" @click="goToCheckout">
            Оформить заказ
          </button>
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
import { cartStore } from '@/stores/cart'
import { authStore } from '@/stores/auth'
import AuthModal from '@/components/AuthModal.vue'
import { notifications } from '@/services/notifications'

export default {
  name: 'CartView',
  components: {
    AuthModal
  },
  data() {
    return {
      showAuthModal: false,
      authModalTab: 'login',
      cartItems: [],
      bonusesToSpend: 0,
      bonusDiscount: 0,
      certificateCode: '',
      appliedCertificate: null,
      certificateError: '',
      isApplyingCertificate: false
    }
  },
  computed: {
    isAuthenticated() {
      return authStore.isAuthenticated()
    },
    user() {
      return authStore.getCurrentUser() || {}
    },
    userBonuses() {
      return this.user.bonuses || 0
    },
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    deliveryCost() {
      return this.subtotal > 5000 ? 0 : 300
    },
    maxAvailableBonuses() {
      return Math.min(this.userBonuses, Math.floor(this.subtotal / 2))
    },
    bonusesToEarn() {
      return Math.floor(this.subtotal * 0.1)
    },
    total() {
      let total = this.subtotal + this.deliveryCost - this.bonusDiscount
      if (this.appliedCertificate) {
        total = Math.max(0, total - this.appliedCertificate.value)
      }
      return total
    }
  },
  watch: {
    cartItems: {
      handler() {
        if (this.bonusDiscount > 0) {
          this.bonusDiscount = 0
          this.bonusesToSpend = 0
        }
      },
      deep: true
    }
  },
  methods: {
    formatPrice(price) {
        return Math.round(price).toLocaleString('ru-RU');
    },
    
    // Загрузить корзину из API
    async loadCart() {
      this.cartItems = await cartStore.getCart()
      console.log('Корзина загружена:', this.cartItems)
    },
    
    // Увеличить количество
    async increaseQuantity(id) {
      const item = this.cartItems.find(i => i.id === id)
      if (item) {
        await cartStore.updateQuantity(id, item.quantity + 1)
        await this.loadCart()
      }
    },
    
    // Уменьшить количество
    async decreaseQuantity(id) {
      const item = this.cartItems.find(i => i.id === id)
      if (item && item.quantity > 1) {
        await cartStore.updateQuantity(id, item.quantity - 1)
        await this.loadCart()
      }
    },
    
    // Удалить товар
    async removeItem(id) {
      await cartStore.removeItem(id)
      await this.loadCart()
    },
    
    // Применить бонусы
    applyBonuses() {
      if (this.bonusesToSpend < 0) {
        this.bonusesToSpend = 0
        return
      }
      
      if (this.bonusesToSpend > this.maxAvailableBonuses) {
        this.bonusesToSpend = this.maxAvailableBonuses
      }
      
      this.bonusDiscount = this.bonusesToSpend
      
      if (this.bonusesToSpend > 0) {
        notifications.success(`Списано ${this.bonusesToSpend} баллов. Скидка: ${this.formatPrice(this.bonusDiscount)} ₽`)
      }
    },
    
    // Применить сертификат
    async applyCertificate() {
      if (!this.certificateCode) return
      
      this.isApplyingCertificate = true
      this.certificateError = ''
      
      const result = await cartStore.validateCertificate(this.certificateCode)
      
      if (result.valid) {
        this.appliedCertificate = result.certificate
        this.certificateCode = ''
        this.certificateError = ''
      } else {
        this.certificateError = result.error
      }
      
      this.isApplyingCertificate = false
    },
    
    removeCertificate() {
      this.appliedCertificate = null
      this.certificateCode = ''
      this.certificateError = ''
    },
    
    // Перейти к оформлению заказа
    goToCheckout() {
      if (!this.isAuthenticated) {
        this.openAuthModal('login')
        return
      }
      this.$router.push('/checkout')
    },
    
    // Открыть модальное окно авторизации
    openAuthModal(tab) {
      this.authModalTab = tab
      this.showAuthModal = true
    },
    
    // Закрыть модальное окно
    closeAuthModal() {
      this.showAuthModal = false
    },
    
    // Обработчик успешного входа
    async handleLoginSuccess() {
      this.closeAuthModal()
      await this.loadCart()
    }
  },
  async mounted() {
    await this.loadCart()
    
    // Слушаем события обновления корзины
    window.addEventListener('cart-updated', async () => {
      console.log('Корзина обновлена')
      await this.loadCart()
    })
  },
  beforeUnmount() {
    window.removeEventListener('cart-updated', this.loadCart)
  }
}
</script>

<style scoped>
/* Стили из вашего текущего CartView.vue - оставьте их без изменений */
.cart-page {
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

/* Стили для неавторизованного пользователя */
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

/* Пустая корзина */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  border: 2px dashed #A3A3CC;
}

.empty-cart-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 10px;
  font-weight: 600;
}

.empty-cart-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.continue-shopping-btn {
  display: inline-block;
  padding: 15px 40px;
  background-color: #292966;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  transition: all 0.3s ease;
}

.continue-shopping-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

/* Основной макет */
.cart-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
}

/* Список товаров */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.cart-item:hover {
  border-color: #A3A3CC;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 100px;
  height: 100px;
  background-color: #B8B8B8;
  border-radius: 8px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
  padding: 5px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  font-weight: 600;
  margin: 0;
}

.item-description {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background-color: white;
  border: none;
  font-size: 18px;
  font-weight: 600;
  color: #292966;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background-color: #A3A3CC;
  color: white;
}

.quantity-value {
  width: 40px;
  text-align: center;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #ff6b6b;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background-color: #fff0f0;
}

.remove-icon {
  font-size: 18px;
}

.item-price {
  font-family: 'Russo One', sans-serif;
  font-size: 20px;
  color: #292966;
  font-weight: bold;
  white-space: nowrap;
}

/* Бонусная система */
.bonus-section {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3d6 100%);
  border-radius: 12px;
  border: 2px dashed #ffd966;
}

.bonus-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.bonus-icon {
  font-size: 24px;
}

.bonus-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  font-weight: 600;
}

.bonus-hint {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #999;
  background-color: white;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.bonus-input-group {
  display: flex;
  gap: 10px;
}

.bonus-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.bonus-input:focus {
  outline: none;
  border-color: #ffd966;
  box-shadow: 0 0 0 3px rgba(255, 217, 102, 0.1);
}

.bonus-input::placeholder {
  color: #aaa;
}

.bonus-button {
  padding: 12px 24px;
  background-color: #ffd966;
  color: #292966;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.bonus-button:hover:not(:disabled) {
  background-color: #ffcc66;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 217, 102, 0.3);
}

.bonus-button:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.bonus-discount {
  margin-top: 10px;
  text-align: right;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 600;
}

.bonus-error {
  margin-top: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #ff6b6b;
}

.bonus-earn {
  color: #4CAF50;
  font-weight: 600;
}

/* Итоги заказа */
.cart-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #A3A3CC;
  border-radius: 15px;
  padding: 30px;
  position: sticky;
  top: 140px;
  align-self: start;
}

.summary-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 25px;
  font-weight: 600;
  text-align: center;
}

.summary-items {
  margin-bottom: 25px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
}

.summary-row.discount {
  color: #4CAF50;
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0;
  padding-top: 20px;
  border-top: 2px solid #292966;
}

.total-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  font-weight: 600;
}

.total-value {
  font-family: 'Russo One', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: bold;
}

.checkout-button {
  width: 100%;
  padding: 18px;
  background-color: #292966;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.checkout-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

.payment-methods {
  text-align: center;
}

.payment-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.payment-icons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.payment-icon {
  font-size: 24px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.payment-icon:hover {
  opacity: 1;
}

/* Адаптивность */
@media (max-width: 992px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-page {
    margin-top: 140px;
  }
  
  .page-title {
    font-size: 36px;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 15px;
  }
  
  .item-price {
    grid-column: 2 / -1;
    text-align: right;
  }
  
  .item-controls {
    flex-wrap: wrap;
  }
  
  .bonus-input-group {
    flex-direction: column;
  }
  
  .empty-cart-title {
    font-size: 28px;
  }
  
  .bonus-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .not-auth-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .cart-page {
    margin-top: 160px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .item-image {
    margin: 0 auto;
  }
  
  .item-controls {
    justify-content: center;
  }
  
  .empty-cart-title {
    font-size: 24px;
  }
  
  .empty-cart-text {
    font-size: 16px;
  }
  
  .continue-shopping-btn {
    padding: 12px 30px;
    font-size: 16px;
  }

  /* Сертификат */
.certificate-section {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3d6 100%);
  border-radius: 12px;
  border: 2px dashed #ffd966;
}

.certificate-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.certificate-icon {
  font-size: 24px;
}

.certificate-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
}

.certificate-input-group {
  display: flex;
  gap: 10px;
}

.certificate-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.certificate-input:focus {
  outline: none;
  border-color: #ffd966;
}

.apply-certificate-btn {
  padding: 12px 24px;
  background-color: #ffd966;
  color: #292966;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.apply-certificate-btn:hover:not(:disabled) {
  background-color: #ffcc66;
  transform: translateY(-2px);
}

.apply-certificate-btn:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.remove-certificate-btn {
  padding: 12px 24px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.remove-certificate-btn:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.certificate-error {
  margin-top: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #ff6b6b;
}

.certificate-success {
  margin-top: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #4CAF50;
}
}
</style>