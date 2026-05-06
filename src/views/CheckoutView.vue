<template>
  <div class="checkout-page">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <span class="current">Оформление заказа</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <div class="checkout-layout">
        <!-- Левая колонка - Форма оформления -->
        <div class="checkout-form-section">
          <h1 class="checkout-title">Оформление заказа</h1>

          <!-- 1. Контакты получателя -->
          <div class="form-section">
            <h2 class="form-section-title">1. Контакты получателя</h2>
            
            <div class="form-group">
              <label class="form-label">Имя получателя *</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="form.recipientName" 
                placeholder="Иван Иванов"
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Адрес *</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.address" 
                  placeholder="ул. Улицы, 12"
                  required
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">Время доставки</label>
                <select class="form-select" v-model="form.deliveryTime">
                  <option>6:00 - 9:00</option>
                  <option>9:00 - 12:00</option>
                  <option>12:00 - 15:00</option>
                  <option>15:00 - 18:00</option>
                  <option>18:00 - 21:00</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Контактный телефон *</label>
              <input 
                type="tel" 
                class="form-input" 
                v-model="form.recipientPhone" 
                placeholder="+7 (999) 123-45-67"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Дата доставки</label>
              <input 
                type="date" 
                class="form-input" 
                v-model="form.deliveryDate"
              >
            </div>
          </div>

          <!-- Разделитель -->
          <div class="section-divider"></div>

          <!-- 2. Контакты отправителя -->
          <div class="form-section">
            <h2 class="form-section-title">2. Контакты отправителя</h2>
            
            <div class="form-group">
              <label class="form-label">Имя отправителя</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="form.senderName" 
                placeholder="Иван Иванов"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Номер телефона отправителя *</label>  <!-- ← ЗВЁЗДОЧКА -->
              <input 
                type="tel" 
                class="form-input" 
                v-model="form.senderPhone" 
                placeholder="+7 (999) 123-45-67"
                required
              >
            </div>
          </div>
          <!-- Разделитель -->
          <div class="section-divider"></div>

          <!-- 3. Детали доставки -->
          <div class="form-section">
            <h2 class="form-section-title">3. Детали доставки</h2>
            
            <div class="form-group">
              <label class="form-label">Открытка</label>
              <textarea 
                class="form-textarea" 
                v-model="form.postcard" 
                placeholder="Текст открытки" 
                rows="3"
                maxlength="70"
              ></textarea>
              <div class="char-counter">{{ form.postcard.length }}/70</div>
            </div>
          </div>
        </div>

        <!-- Правая колонка - Итоги заказа -->
        <div class="order-summary-section">
          <div class="order-summary-card">
            <h2 class="summary-title">Ваш заказ</h2>
            
            <div class="order-items">
              <div v-for="item in cartItems" :key="item.id" class="order-item">
                <span class="item-name">{{ item.title }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
                <span class="item-price">{{ formatPrice(item.price * item.quantity) }} ₽</span>
              </div>
              <div v-if="cartItems.length === 0" class="empty-cart-message">
                Корзина пуста
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span class="summary-label">Сумма заказа</span>
              <span class="summary-value">{{ formatPrice(subtotal) }} ₽</span>
            </div>

            <div class="summary-row">
              <span class="summary-label">Доставка</span>
              <span class="summary-value">{{ formatPrice(deliveryCost) }} ₽</span>
            </div>

            <!-- ===== СЕРТИФИКАТ ===== -->
            <div class="promo-block">
              <div class="promo-header">
                <span class="promo-title">Подарочный сертификат</span>
              </div>
              
              <div v-if="!appliedCertificate" class="promo-input-group">
                <input 
                  type="text" 
                  class="promo-input" 
                  placeholder="Введите код сертификата"
                  v-model="certificateCode"
                >
                <button 
                  class="promo-apply-btn" 
                  @click="applyCertificate"
                  :disabled="!certificateCode || isApplyingCertificate"
                >
                  {{ isApplyingCertificate ? 'Проверка...' : 'Применить' }}
                </button>
              </div>
              
              <div v-else class="promo-applied">
                <span class="promo-success">Применен сертификат на {{ formatPrice(appliedCertificate.value) }} ₽</span>
                <button class="promo-remove-btn" @click="removeCertificate">Удалить</button>
              </div>
              
              <div v-if="certificateError" class="promo-error">
                {{ certificateError }}
              </div>
            </div>

            <!-- ===== СПИСАТЬ БАЛЛЫ ===== -->
            <div class="promo-block">
              <div class="promo-header">
                <span class="promo-title">Бонусные баллы</span>
                <span class="promo-balance">Доступно: {{ userBonuses }} баллов</span>
              </div>
              
              <div v-if="!bonusApplied" class="promo-input-group">
                <input 
                  type="number" 
                  class="promo-input" 
                  placeholder="Сколько баллов списать?"
                  v-model.number="bonusesToSpend"
                  :max="maxAvailableBonuses"
                  min="0"
                >
                <button 
                  class="promo-apply-btn" 
                  @click="applyBonuses"
                  :disabled="!bonusesToSpend || bonusesToSpend <= 0 || bonusesToSpend > maxAvailableBonuses"
                >
                  Списать
                </button>
              </div>
              
              <div v-else class="promo-applied">
                <span class="promo-success">Списано {{ bonusDiscount }} баллов ({{ formatPrice(bonusDiscount) }} ₽)</span>
                <button class="promo-remove-btn" @click="removeBonuses">Отменить</button>
              </div>
              
              <div v-if="bonusError" class="promo-error">
                {{ bonusError }}
              </div>
            </div>

            <!-- ===== ОПЛАТА КАРТОЙ ===== -->
            <div class="payment-section">
              <h3 class="payment-title">Оплата банковской картой</h3>
              
              <div class="payment-form">
                <div class="form-group">
                  <label class="form-label">Номер карты</label>
                  <input 
                    type="text" 
                    class="payment-input" 
                    v-model="payment.cardNumber"
                    placeholder="0000 0000 0000 0000"
                    maxlength="19"
                    @input="formatCardNumber"
                  >
                </div>

                <div class="form-row">
                  <div class="form-group half">
                    <label class="form-label">Срок действия</label>
                    <input 
                      type="text" 
                      class="payment-input" 
                      v-model="payment.expiry"
                      placeholder="MM/YY"
                      maxlength="5"
                      @input="formatExpiry"
                    >
                  </div>
                  <div class="form-group half">
                    <label class="form-label">CVV/CVC</label>
                    <input 
                      type="password" 
                      class="payment-input" 
                      v-model="payment.cvv"
                      placeholder="***"
                      maxlength="3"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Имя держателя</label>
                  <input 
                    type="text" 
                    class="payment-input" 
                    v-model="payment.cardHolder"
                    placeholder="IVAN IVANOV"
                  >
                </div>
              </div>


            <div class="summary-divider"></div>

            <div class="summary-total">
              <span class="total-label">Итого к оплате:</span>
              <span class="total-value">{{ formatPrice(finalTotal) }} ₽</span>
            </div>

            <div class="bonus-info" v-if="bonusesToEarn > 0">
              После оплаты будет начислено {{ bonusesToEarn }} баллов
            </div>

              <button 
                class="submit-order-button" 
                @click="submitOrder"
                :disabled="cartItems.length === 0 || !isFormValid || !isPaymentValid"
              >
                Оплатить {{ formatPrice(finalTotal) }} ₽
              </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с контактами после оформления -->
    <div v-if="showContactsModal" class="contacts-modal" @click="hideContacts">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="hideContacts">×</button>
        <div class="success-icon">✓</div>
        <h3>Заказ успешно оформлен!</h3>
        <p class="modal-subtitle">Ваш заказ №{{ lastOrder?.id }} принят</p>
        
        <div class="order-summary-modal">
          <div class="summary-item">
            <span>Сумма заказа:</span>
            <span class="summary-value">{{ formatPrice(lastOrder?.total) }} ₽</span>
          </div>
          <div class="summary-item">
            <span>Начислено баллов:</span>
            <span class="bonus-value">
              {{ lastOrder?.bonuses_earned ? '+' + lastOrder.bonuses_earned : '+' + (lastOrder?.bonusesEarned || 0) }}
            </span>
          </div>
        </div>

        <p class="modal-note">Мы позвоним вам для подтверждения заказа, а так же отправим уведомление на почту</p>
        
        <div class="modal-actions">
          <button class="view-orders-btn" @click="goToOrders">Мои заказы</button>
          <button class="back-to-home-btn" @click="goToHome">На главную</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно авторизации -->
    <AuthModal 
      v-if="showAuthModal" 
      :initial-tab="'login'"
      @close="closeAuthModal"
      @login-success="handleLoginSuccess"
    />
  </div>
</div>
</template>

<script>
import { cartStore } from '@/stores/cart'
import { authStore } from '@/stores/auth'
import AuthModal from '@/components/AuthModal.vue'
import { notifications } from '@/services/notifications'

export default {
  name: 'CheckoutView',
  components: {
    AuthModal
  },
  data() {
    return {
      showContactsModal: false,
      showAuthModal: false,
      lastOrder: null,
      certificateCode: '',
      appliedCertificate: null,
      certificateError: '',
      isApplyingCertificate: false,
      bonusesToSpend: 0,
      bonusApplied: false,
      bonusDiscount: 0,
      bonusError: '',
      cartItems: [],
      payment: {
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardHolder: ''
      },
      form: {
        recipientName: '',
        address: '',
        deliveryTime: '9:00 - 12:00',
        recipientPhone: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        senderName: '',
        senderPhone: '',
        postcard: ''
      }
    }
  },
  computed: {
    subtotal() {
      if (!this.cartItems.length) return 0
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    deliveryCost() {
      return this.subtotal > 5000 ? 0 : 300
    },
    userBonuses() {
      return this.currentUser?.bonuses || 0
    },
    maxAvailableBonuses() {
      const maxByOrder = Math.floor((this.subtotal + this.deliveryCost) / 2)
      return Math.min(this.userBonuses, maxByOrder)
    },
    bonusesToEarn() {
      return Math.floor(this.subtotal * 0.1)
    },
    finalTotal() {
      let total = this.subtotal + this.deliveryCost
      if (this.appliedCertificate) {
        total = Math.max(0, total - this.appliedCertificate.value)
      }
      if (this.bonusDiscount) {
        total = Math.max(0, total - this.bonusDiscount)
      }
      return total
    },
    currentUser() {
      return authStore.getCurrentUser()
    },
    isAuthenticated() {
      return authStore.isAuthenticated()
    },
    isFormValid() {
      return this.form.recipientName && 
             this.form.address && 
             this.form.recipientPhone &&
             this.form.senderPhone    
    },
    isPaymentValid() {
      const cardNumber = this.payment.cardNumber.replace(/\s/g, '')
      const expiryValid = /^\d{2}\/\d{2}$/.test(this.payment.expiry)
      const cvvValid = /^\d{3}$/.test(this.payment.cvv)
      const cardHolderValid = this.payment.cardHolder.trim().length >= 3
      return cardNumber.length === 16 && expiryValid && cvvValid && cardHolderValid
    }
  },
  methods: {
    formatPrice(price) {
        return Math.round(price).toLocaleString('ru-RU');
    },
    
    formatCardNumber(event) {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length > 16) value = value.slice(0, 16)
      value = value.replace(/(\d{4})/g, '$1 ').trim()
      this.payment.cardNumber = value
    },
    
    formatExpiry(event) {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length > 4) value = value.slice(0, 4)
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2)
      }
      this.payment.expiry = value
    },
    
    async loadCartData() {
      this.cartItems = await cartStore.getCart()
    },
    
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
    
    applyBonuses() {
      if (!this.bonusesToSpend || this.bonusesToSpend <= 0) {
        this.bonusError = 'Введите количество баллов'
        return
      }
      if (this.bonusesToSpend > this.maxAvailableBonuses) {
        this.bonusError = `Можно списать не более ${this.maxAvailableBonuses} баллов`
        return
      }
      this.bonusDiscount = this.bonusesToSpend
      this.bonusApplied = true
      this.bonusError = ''
    },
    
    removeBonuses() {
      this.bonusDiscount = 0
      this.bonusApplied = false
      this.bonusesToSpend = 0
      this.bonusError = ''
    },
    
    async sendOrderConfirmation(order) {
      try {
        const userEmail = this.currentUser?.email
        if (!userEmail) return
        
        const orderItemsHtml = order.items?.map(item => `
          <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${item.title}</strong> - ${item.quantity} шт. x ${this.formatPrice(item.price)} ₽ = ${this.formatPrice(item.price * item.quantity)} ₽
          </div>
        `).join('') || ''
        
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          'template_44lwinv',
          {
            to_email: userEmail,
            customer_name: this.currentUser?.name,
            order_id: order.id,
            order_total: this.formatPrice(order.total),
            order_items: orderItemsHtml
          }
        )
      } catch (error) {
        console.error('Ошибка отправки email:', error)
      }
    },
    
    async submitOrder() {
      console.log('🔵 submitOrder вызван')

      if (!this.isAuthenticated) {
        console.log('❌ Не авторизован')
        this.openAuthModal()
        return
      }
      
      if (this.cartItems.length === 0) {
        console.log('❌ Корзина пуста')
        notifications.error('Корзина пуста')
        this.$router.push('/')
        return
      }

      if (!this.isFormValid) {
        console.log('❌ Форма невалидна')
        notifications.error('Пожалуйста, заполните все обязательные поля (отмечены *)')
        return
      }

      if (!this.isPaymentValid) {
        console.log('❌ Данные карты невалидны')
        notifications.error('Пожалуйста, заполните данные карты корректно')
        return
      }

      let certificateDiscount = 0
      let certificateData = null
      if (this.appliedCertificate) {
        certificateDiscount = Math.min(this.appliedCertificate.value, this.subtotal + this.deliveryCost)
        certificateData = {
          code: this.appliedCertificate.code,
          discount: certificateDiscount,
          value: this.appliedCertificate.value
        }
      }

      let bonusesUsed = 0
      if (this.bonusDiscount) {
        bonusesUsed = this.bonusDiscount
      }

      try {
        const order = await cartStore.createOrderFromCart(this.currentUser.id, {
          certificateUsed: certificateData,
          bonusesUsed: bonusesUsed,
          deliveryDetails: {
            recipientName: this.form.recipientName,
            address: this.form.address,
            deliveryTime: this.form.deliveryTime,
            recipientPhone: this.form.recipientPhone,
            deliveryDate: this.form.deliveryDate,
            senderName: this.form.senderName,
            senderPhone: this.form.senderPhone,
            postcard: this.form.postcard
          }
        })

        if (order) {
          console.log('✅ Заказ создан:', order.id)

          if (this.appliedCertificate) {
            await cartStore.useCertificate(
              this.appliedCertificate.code,
              this.currentUser.id,
              order.id
            )
          }

          if (this.bonusDiscount) {
            await authStore.spendBonuses(this.bonusDiscount)
          }

          const bonusesToEarn = Math.floor(this.subtotal * 0.1)
          await authStore.addBonuses(bonusesToEarn)

          //await this.sendOrderConfirmation(order)

          this.lastOrder = order
          this.showContactsModal = true

        } else {
          notifications.error('Не удалось создать заказ. Попробуйте позже.')
        }

      } catch (error) {
        console.error('❌ Ошибка при оформлении заказа:', error)
        notifications.error('Произошла ошибка при оформлении заказа. Попробуйте позже.')
      }
    },
    
    openAuthModal() {
      this.showAuthModal = true
    },
    
    closeAuthModal() {
      this.showAuthModal = false
    },
    
    handleLoginSuccess() {
      this.closeAuthModal()
      this.loadCartData()
    },
    
    hideContacts() {
      this.showContactsModal = false
    },
    
    goToHome() {
      this.$router.push('/')
    },
    
    goToOrders() {
      this.$router.push('/orders')
    }
  },
  
  async mounted() {
    await this.loadCartData()
    window.addEventListener('cart-updated', async () => {
      await this.loadCartData()
    })
  },
  
  beforeUnmount() {
    window.removeEventListener('cart-updated', this.loadCartData)
  }
}
</script>

<style scoped>
.checkout-page {
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

.checkout-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.checkout-form-section {
  padding-right: 40px;
  border-right: 1px solid #e0e0e0;
}

.checkout-title {
  font-family: 'Russo One', sans-serif;
  font-size: 36px;
  color: #292966;
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #A3A3CC;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #A3A3CC;
  box-shadow: 0 0 0 3px rgba(163, 163, 204, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-counter {
  text-align: right;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.section-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 30px 0;
}

.order-summary-section {
  position: sticky;
  top: 140px;
  align-self: start;
}

.order-summary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #A3A3CC;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.summary-title {
  font-family: 'Russo One', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 25px;
  font-weight: 600;
  text-align: center;
}

.order-items {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.item-name {
  flex: 2;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
}

.item-quantity {
  flex: 0.5;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
}

.item-price {
  flex: 1;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #292966;
  text-align: right;
}

.empty-cart-message {
  text-align: center;
  padding: 20px;
  font-family: 'Albert Sans', sans-serif;
  color: #666;
}

.summary-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.summary-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
}

.summary-value {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  font-weight: 500;
}

.promo-block {
  margin: 20px 0;
  padding: 12px 0;
  border-top: 1px solid #e0e0e0;
}

.promo-block:first-child {
  border-top: none;
}

.promo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.promo-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #292966;
}

.promo-balance {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #666;
}

.promo-input-group {
  display: flex;
  gap: 10px;
}

.promo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.promo-input:focus {
  outline: none;
  border-color: #A3A3CC;
}

.promo-apply-btn {
  padding: 12px 24px;
  background-color: #292966;
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

.promo-apply-btn:hover:not(:disabled) {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

.promo-apply-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  background-color: #e8f5e9;
  border-radius: 8px;
}

.promo-success {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 500;
}

.promo-remove-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.promo-remove-btn:hover {
  color: #ff5252;
  text-decoration: underline;
}

.promo-error {
  margin-top: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #ff6b6b;
}

.payment-section {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid #A3A3CC;
}

.payment-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.payment-form {
  margin-bottom: 20px;
}

.payment-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.payment-input:focus {
  outline: none;
  border-color: #A3A3CC;
  box-shadow: 0 0 0 3px rgba(163, 163, 204, 0.1);
}

.payment-icons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.payment-icon {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 20px 0;
  padding-top: 15px;
  border-top: 2px solid #292966;
}

.total-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  font-weight: 600;
}

.total-value {
  font-family: 'Russo One', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: bold;
}

.bonus-info {
  text-align: center;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 500;
  margin-bottom: 20px;
}

.submit-order-button {
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
}

.submit-order-button:hover:not(:disabled) {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

.submit-order-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.contacts-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 450px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #292966;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #4CAF50;
  color: white;
  font-size: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-content h3 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 600;
}

.modal-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.order-summary-modal {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #A3A3CC;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
}

.summary-item .summary-value {
  font-weight: 600;
  color: #292966;
}

.bonus-value {
  color: #4CAF50;
  font-weight: 600;
}

.modal-note {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 15px;
  font-style: italic;
}

.contact-info {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
  font-weight: 600;
}

.contact-value {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.view-orders-btn,
.back-to-home-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-orders-btn {
  background-color: #292966;
  color: white;
  border: none;
}

.view-orders-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

.back-to-home-btn {
  background-color: white;
  color: #292966;
  border: 2px solid #292966;
}

.back-to-home-btn:hover {
  background-color: #292966;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .checkout-form-section {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 30px;
  }
  .order-summary-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    margin-top: 140px;
  }
  .checkout-title {
    font-size: 28px;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .form-section-title {
    font-size: 18px;
  }
  .modal-content {
    padding: 30px 20px;
  }
  .modal-actions {
    flex-direction: column;
  }
  .order-item {
    flex-wrap: wrap;
  }
  .item-name {
    flex: 1 1 100%;
    margin-bottom: 5px;
  }
  .item-quantity {
    text-align: left;
  }
  .promo-input-group {
    flex-direction: column;
  }
  .promo-apply-btn {
    width: 100%;
  }
  .promo-applied {
    flex-direction: column;
    text-align: center;
  }
  .form-row {
    flex-direction: column;
  }
  .form-group.half {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    margin-top: 160px;
  }
  .checkout-title {
    font-size: 24px;
  }
  .total-value {
    font-size: 24px;
  }
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .contact-value {
    text-align: left;
  }
}
</style>