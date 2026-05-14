<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">Тоkyo Bloom</router-link>
        
        <!-- Бургер-кнопка -->
        <button class="burger" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
        
        <nav>
          <ul class="nav-menu" :class="{ open: menuOpen }">
            <li><router-link to="/" @click="menuOpen = false">ГЛАВНАЯ</router-link></li>
            <li><router-link to="/bouquets" @click="menuOpen = false">БУКЕТЫ</router-link></li>
            <li><router-link to="/gifts" @click="menuOpen = false">ПОДАРКИ</router-link></li>
            <li><router-link to="/box-flowers" @click="menuOpen = false">ЦВЕТЫ В КОРОБКАХ</router-link></li>
            <li><router-link to="/certificates" @click="menuOpen = false">СЕРТИФИКАТЫ</router-link></li>
            <li><router-link to="/about" @click="menuOpen = false">О НАС</router-link></li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <button class="cart-btn" @click="goToCart">
            <span class="cart-icon">🛒</span>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </button>

          <div v-if="!isAuthenticated" class="auth-buttons">
            <a href="#" class="auth-btn" @click.prevent="openAuthModal('login')">Войти</a>
            <a href="#" class="auth-btn" @click.prevent="openAuthModal('register')">Регистрация</a>
          </div>
          
          <div v-else class="user-menu">
            <button class="user-btn" @click="toggleUserMenu">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ userName }}</span>
              <span class="user-arrow">▼</span>
            </button>
            <div v-if="showUserMenu" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">👤 Мой профиль</router-link>
              <router-link to="/orders" class="dropdown-item" @click="showUserMenu = false">📦 Мои заказы</router-link>
              <router-link v-if="isAdmin" to="/admin" class="dropdown-item" @click="showUserMenu = false">⚙️ Админ-панель</router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout" @click="logout">🚪 Выйти</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AuthModal v-if="showAuthModal" :initial-tab="authModalTab" @close="closeAuthModal" @login-success="handleLoginSuccess" />
  </header>
</template>

<script>
import AuthModal from './AuthModal.vue'
import { authStore } from '@/stores/auth'
import { cartStore } from '@/stores/cart'

export default {
  name: 'HeaderComponent',
  components: { AuthModal },
  data() {
    return {
      menuOpen: false,
      showAuthModal: false,
      authModalTab: 'login',
      showUserMenu: false,
      user: null,
      cartCount: 0
    }
  },
  computed: {
    isAuthenticated() { return !!this.user },
    userName() { return this.user?.name || 'Пользователь' },
    isAdmin() { return this.user?.is_admin === true }
  },
  methods: {
    loadUser() { this.user = authStore.getCurrentUser() },
    async loadCartCount() { this.cartCount = await cartStore.getTotalCount() },
    openAuthModal(tab) { this.authModalTab = tab; this.showAuthModal = true },
    closeAuthModal() { this.showAuthModal = false },
    async handleLoginSuccess(user) { this.user = user; this.closeAuthModal(); await this.loadCartCount() },
    toggleUserMenu() { this.showUserMenu = !this.showUserMenu },
    async logout() { await authStore.logout(); this.user = null; this.showUserMenu = false; this.cartCount = 0; if (this.$route.path !== '/') this.$router.push('/') },
    goToCart() { this.$router.push('/cart') },
    handleClickOutside(e) { if (!e.target.closest('.user-menu')) this.showUserMenu = false },
    onUserLoggedIn(e) { this.user = e.detail; this.loadCartCount() },
    onUserLoggedOut() { this.user = null; this.cartCount = 0 },
    onUserUpdated(e) { this.user = e.detail },
    onCartUpdated(e) { this.cartCount = e.detail?.count || 0 }
  },
  async mounted() {
    this.loadUser(); await this.loadCartCount()
    document.addEventListener('click', this.handleClickOutside)
    window.addEventListener('user-logged-in', this.onUserLoggedIn)
    window.addEventListener('user-logged-out', this.onUserLoggedOut)
    window.addEventListener('user-updated', this.onUserUpdated)
    window.addEventListener('cart-updated', this.onCartUpdated)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('user-logged-in', this.onUserLoggedIn)
    window.removeEventListener('user-logged-out', this.onUserLoggedOut)
    window.removeEventListener('user-updated', this.onUserUpdated)
    window.removeEventListener('cart-updated', this.onCartUpdated)
  }
}
</script>

<style scoped>
.header { background-color: #333333; padding: 15px 0; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 7px 8px rgba(0,0,0,0.1); }
.header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 15px; gap: 20px; }
.logo { color: white; font-size: 24px; font-weight: bold; text-decoration: none; font-family: 'Russo One', sans-serif; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0; }

.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 5px; }
.burger span { display: block; width: 25px; height: 3px; background: white; border-radius: 3px; transition: 0.3s; }

.nav-menu { display: flex; list-style: none; gap: 15px; margin: 0; padding: 0; flex-wrap: nowrap; }
.nav-menu a { color: white; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s ease; font-family: 'Albert Sans', sans-serif; text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap; padding: 4px 0; }
.nav-menu a.router-link-active, .nav-menu a:hover { color: #A3A3CC; }

.header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: auto; }
.cart-btn { background: none; border: none; cursor: pointer; position: relative; padding: 8px; border-radius: 4px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
.cart-btn:hover { background-color: rgba(255,255,255,0.1); }
.cart-icon { font-size: 22px; color: white; }
.cart-badge { position: absolute; top: 0; right: 0; background-color: #A3A3CC; color: white; font-size: 11px; font-weight: 600; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Albert Sans', sans-serif; }

.auth-buttons { display: flex; gap: 8px; }
.auth-btn { color: white; text-decoration: none; padding: 8px 16px; border: 1px solid white; border-radius: 4px; transition: all 0.2s ease; font-family: 'Albert Sans', sans-serif; font-weight: 600; font-size: 14px; white-space: nowrap; cursor: pointer; display: inline-block; }
.auth-btn:hover { background-color: white; color: #333333; transform: translateY(-1px); }

.user-menu { position: relative; }
.user-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid white; border-radius: 4px; padding: 8px 12px; cursor: pointer; transition: all 0.2s ease; color: white; background-color: rgba(255,255,255,0.1); }
.user-btn:hover { background-color: rgba(255,255,255,0.2); }
.user-avatar { font-size: 18px; }
.user-name { font-family: 'Albert Sans', sans-serif; font-weight: 600; font-size: 14px; }
.user-arrow { font-size: 10px; }

.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 10px; background: white; border-radius: 8px; min-width: 180px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); overflow: hidden; z-index: 1001; }
.dropdown-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #333; text-decoration: none; font-family: 'Albert Sans', sans-serif; font-size: 14px; transition: all 0.2s ease; width: 100%; text-align: left; border: none; background: none; cursor: pointer; }
.dropdown-item:hover { background-color: #f5f5f5; }
.dropdown-item.logout { color: #ff6b6b; }
.dropdown-divider { height: 1px; background-color: #e0e0e0; margin: 5px 0; }

/* Адаптив */
@media (max-width: 768px) {
  .burger { display: flex; }
  .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; width: 100%; background: #333333; padding: 15px; gap: 10px; box-shadow: 0 5px 10px rgba(0,0,0,0.3); z-index: 999; }
  .nav-menu.open { display: flex; }
  .nav-menu a { font-size: 13px; }
  .user-name { display: none; }
  .auth-btn { padding: 6px 12px; font-size: 13px; }
  .logo { font-size: 20px; }
  .header-content { gap: 10px; }
}
@media (max-width: 480px) {
  .logo { font-size: 18px; }
  .auth-btn { padding: 5px 10px; font-size: 12px; }
  .auth-buttons { gap: 5px; }
  .cart-icon { font-size: 18px; }
}
</style>
