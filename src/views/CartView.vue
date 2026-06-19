<template>
  <div class="cart-page">
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
        <div class="not-auth-buttons">
          <button class="login-btn" @click="openAuthModal('login')">Войти</button>
          <button class="register-btn" @click="openAuthModal('register')">Регистрация</button>
        </div>
      </div>

      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Корзина пуста</h2>
        <p class="empty-cart-text">Но это никогда не поздно исправить</p>
        <router-link to="/bouquets" class="continue-shopping-btn">Перейти к покупкам</router-link>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.title" style="width:100%;height:100%;object-fit:cover;">
              <div v-else class="image-placeholder">{{ item.title }}</div>
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
                <button class="remove-btn" @click="removeItem(item.id)"><span class="remove-icon">×</span> Удалить</button>
              </div>
            </div>
            <div class="item-price">{{ formatPrice(item.price * item.quantity) }} ₽</div>
          </div>
        </div>

        <div class="cart-summary">
          <h2 class="summary-title">Ваш заказ</h2>
          <div class="summary-items">
            <div class="summary-row"><span>Товары ({{ totalItems }} шт.)</span><span>{{ formatPrice(subtotal) }} ₽</span></div>
            <div v-if="bonusDiscount > 0" class="summary-row discount"><span>Скидка баллами</span><span>-{{ formatPrice(bonusDiscount) }} ₽</span></div>
            <div class="summary-row"><span>Будет начислено баллов</span><span class="bonus-earn">+{{ formatPrice(bonusesToEarn) }}</span></div>
          </div>
          <div class="summary-total"><span class="total-label">Итого:</span><span class="total-value">{{ formatPrice(total) }} ₽</span></div>
          <button class="checkout-button" @click="goToCheckout">Оформить заказ</button>
        </div>
      </div>
    </div>

    <AuthModal v-if="showAuthModal" :initial-tab="authModalTab" @close="closeAuthModal" @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import { cartStore } from '@/stores/cart'
import { authStore } from '@/stores/auth'
import AuthModal from '@/components/AuthModal.vue'
import { notifications } from '@/services/notifications'

export default {
  name: 'CartView',
  components: { AuthModal },
  data() {
    return {
      showAuthModal: false, authModalTab: 'login', cartItems: [],
      bonusesToSpend: 0, bonusDiscount: 0, certificateCode: '',
      appliedCertificate: null, certificateError: '', isApplyingCertificate: false
    }
  },
  computed: {
    isAuthenticated() { return authStore.isAuthenticated() },
    user() { return authStore.getCurrentUser() || {} },
    userBonuses() { return this.user.bonuses || 0 },
    totalItems() { return this.cartItems.reduce((s, i) => s + i.quantity, 0) },
    subtotal() { return this.cartItems.reduce((s, i) => s + (i.price * i.quantity), 0) },
    maxAvailableBonuses() { return Math.min(this.userBonuses, Math.floor(this.subtotal / 2)) },
    bonusesToEarn() { return Math.floor(this.subtotal * 0.1) },
    total() { let t = this.subtotal - this.bonusDiscount; if (this.appliedCertificate) t = Math.max(0, t - this.appliedCertificate.value); return t }
  },
  methods: {
    formatPrice(p) { return Math.round(p).toLocaleString('ru-RU') },
    async loadCart() { this.cartItems = await cartStore.getCart() },
    async increaseQuantity(id) { const item = this.cartItems.find(i => i.id === id); if (item) { await cartStore.updateQuantity(id, item.quantity + 1); await this.loadCart() } },
    async decreaseQuantity(id) { const item = this.cartItems.find(i => i.id === id); if (item && item.quantity > 1) { await cartStore.updateQuantity(id, item.quantity - 1); await this.loadCart() } },
    async removeItem(id) { await cartStore.removeItem(id); await this.loadCart() },
    goToCheckout() { if (!this.isAuthenticated) { this.openAuthModal('login'); return } this.$router.push('/checkout') },
    openAuthModal(tab) { this.authModalTab = tab; this.showAuthModal = true },
    closeAuthModal() { this.showAuthModal = false },
    async handleLoginSuccess() { this.closeAuthModal(); await this.loadCart() }
  },
  async mounted() { await this.loadCart(); window.addEventListener('cart-updated', async () => { await this.loadCart() }) },
  beforeUnmount() { window.removeEventListener('cart-updated', this.loadCart) }
}
</script>

<style scoped>
.cart-page { margin-top: 120px; min-height: 100vh; background-color: #ffffff; padding-bottom: 60px; }
.breadcrumb-section { background-color: #ffffff; padding: 20px 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 40px; }
.breadcrumb { display: flex; align-items: center; gap: 10px; font-family: 'Albert Sans', sans-serif; font-size: 14px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb .current { color: #292966; font-weight: 600; }
.page-title { font-family: 'Russo One', sans-serif; font-size: 42px; color: #292966; margin-bottom: 40px; }
.not-auth { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 20px; border: 2px dashed #A3A3CC; max-width: 500px; margin: 0 auto; }
.not-auth-title { font-family: 'Albert Sans', sans-serif; font-size: 24px; color: #292966; font-weight: 600; }
.not-auth-buttons { display: flex; gap: 15px; justify-content: center; }
.login-btn, .register-btn { padding: 12px 30px; border-radius: 6px; font-family: 'Albert Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; }
.login-btn { background-color: #292966; color: white; border: 2px solid #292966; }
.register-btn { background-color: white; color: #292966; border: 2px solid #292966; }
.empty-cart { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 20px; border: 2px dashed #A3A3CC; }
.empty-cart-title { font-family: 'Albert Sans', sans-serif; font-size: 32px; color: #292966; font-weight: 600; }
.continue-shopping-btn { display: inline-block; padding: 15px 40px; background-color: #292966; color: white; text-decoration: none; border-radius: 12px; font-family: 'Albert Sans', sans-serif; font-weight: 600; font-size: 18px; }
.cart-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
.cart-items { display: flex; flex-direction: column; gap: 20px; }
.cart-item { display: grid; grid-template-columns: 100px 1fr auto; gap: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 12px; border: 2px solid #e0e0e0; }
.item-image { width: 100px; height: 100px; background-color: #B8B8B8; border-radius: 8px; overflow: hidden; }
.image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px; text-align: center; }
.item-title { font-family: 'Albert Sans', sans-serif; font-size: 18px; color: #292966; font-weight: 600; }
.item-controls { display: flex; align-items: center; gap: 20px; }
.quantity-control { display: flex; align-items: center; border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.quantity-btn { width: 36px; height: 36px; background-color: white; border: none; font-size: 18px; font-weight: 600; color: #292966; cursor: pointer; }
.quantity-value { width: 40px; text-align: center; font-family: 'Albert Sans', sans-serif; font-size: 16px; font-weight: 600; }
.remove-btn { display: flex; align-items: center; gap: 5px; background: none; border: none; color: #ff6b6b; font-family: 'Albert Sans', sans-serif; font-size: 14px; cursor: pointer; }
.item-price { font-family: 'Russo One', sans-serif; font-size: 20px; color: #292966; font-weight: bold; white-space: nowrap; }
.cart-summary { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 3px solid #A3A3CC; border-radius: 15px; padding: 30px; position: sticky; top: 140px; }
.summary-title { font-family: 'Albert Sans', sans-serif; font-size: 24px; color: #292966; font-weight: 600; text-align: center; }
.summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 16px; color: #666; }
.summary-total { display: flex; justify-content: space-between; margin: 25px 0; padding-top: 20px; border-top: 2px solid #292966; }
.total-value { font-family: 'Russo One', sans-serif; font-size: 28px; color: #292966; font-weight: bold; }
.checkout-button { width: 100%; padding: 18px; background-color: #292966; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 18px; cursor: pointer; }
</style>
