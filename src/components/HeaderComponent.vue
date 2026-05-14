<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <button class="burger" @click="menuOpen = !menuOpen">
            <span></span><span></span><span></span>
        </button>
        <router-link to="/" class="logo">Тоkyo Bloom</router-link>
        
        <nav>
          <ul class="nav-menu" :class="{ open: menuOpen }">
            <li><router-link to="/">ГЛАВНАЯ</router-link></li>
            <li><router-link to="/bouquets">БУКЕТЫ</router-link></li>
            <li><router-link to="/gifts">ПОДАРКИ</router-link></li>
            <li><router-link to="/box-flowers">ЦВЕТЫ В КОРОБКАХ</router-link></li>
            <li><router-link to="/certificates">СЕРТИФИКАТЫ</router-link></li>
            <li><router-link to="/about">О НАС</router-link></li>
          </ul>
        </nav>
        
        <!-- Правая часть -->
        <div class="header-actions">
          <!-- Кнопка корзины с реальным счетчиком -->
          <button class="cart-btn" @click="goToCart">
            <span class="cart-icon">🛒</span>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </button>

          <!-- Кнопки авторизации или профиль -->
          <div v-if="!isAuthenticated" class="auth-buttons">
            <a href="#" class="auth-btn" @click.prevent="openAuthModal('login')">Войти</a>
            <a href="#" class="auth-btn" @click.prevent="openAuthModal('register')">Регистрация</a>
          </div>
          
          <!-- Профиль пользователя -->
          <div v-else class="user-menu">
            <button class="user-btn" @click="toggleUserMenu">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ userName }}</span>
              <span class="user-arrow">▼</span>
            </button>
            
            <!-- Выпадающее меню -->
            <div v-if="showUserMenu" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                <span class="item-icon">👤</span>
                Мой профиль
              </router-link>
              <router-link to="/orders" class="dropdown-item" @click="showUserMenu = false">
                <span class="item-icon">📦</span>
                Мои заказы
              </router-link>
              
              <!-- Пункт для админа -->
              <router-link v-if="isAdmin" to="/admin" class="dropdown-item" @click="showUserMenu = false">
                <span class="item-icon">⚙️</span>
                Админ-панель
              </router-link>
              
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout" @click="logout">
                <span class="item-icon">🚪</span>
                Выйти
              </button>
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
  </header>
</template>

<script>
import AuthModal from './AuthModal.vue'
import { authStore } from '@/stores/auth'
import { cartStore } from '@/stores/cart'

export default {
  name: 'HeaderComponent',
  components: {
    AuthModal
  },
  data() {
    return {
      showAuthModal: false,
      authModalTab: 'login',
      showUserMenu: false,
      user: null,
      menuOpen: false,
      cartCount: 0
    }
  },
  computed: {
    isAuthenticated() {
      return !!this.user
    },
    userName() {
      return this.user?.name || 'Пользователь'
    },
    isAdmin() {
      return this.user?.is_admin === true
    }
  },
  methods: {
    loadUser() {
      this.user = authStore.getCurrentUser()
    },
    
    async loadCartCount() {
      this.cartCount = await cartStore.getTotalCount()
    },
    
    openAuthModal(tab) {
      this.authModalTab = tab
      this.showAuthModal = true
    },
    
    closeAuthModal() {
      this.showAuthModal = false
    },
    
    async handleLoginSuccess(user) {
      this.user = user
      this.closeAuthModal()
      await this.loadCartCount()
    },
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    
    async logout() {
      await authStore.logout()
      this.user = null
      this.showUserMenu = false
      this.cartCount = 0
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
    
    goToCart() {
      this.$router.push('/cart')
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.user-menu')) {
        this.showUserMenu = false
      }
    },
    
    // Обработчики событий
    onUserLoggedIn(event) {
      this.user = event.detail
      this.loadCartCount()
    },
    
    onUserLoggedOut() {
      this.user = null
      this.cartCount = 0
    },
    
    onUserUpdated(event) {
      this.user = event.detail
    },
    
    onCartUpdated(event) {
      this.cartCount = event.detail?.count || 0
    }
  },
  async mounted() {
    this.loadUser()
    await this.loadCartCount()
    document.addEventListener('click', this.handleClickOutside)
    
    // Слушаем события
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
.header {
  background-color: #333333;
  padding: 20px 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 7px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  gap: 20px;
}

.logo {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  font-family: 'Russo One', sans-serif;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 10px;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 15px;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: 'Albert Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  padding: 4px 0;
}

.nav-menu a.router-link-active {
  color: #A3A3CC;
}

.nav-menu a:hover {
  color: #A3A3CC;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  margin-left: auto;
}

/* Кнопка корзины */
.cart-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.cart-icon {
  font-size: 22px;
  color: white;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #A3A3CC;
  color: white;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-family: 'Albert Sans', sans-serif;
}

/* Кнопки авторизации */
.auth-buttons {
  display: flex;
  gap: 8px;
}

.auth-btn {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid white;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
}

.auth-btn:hover {
  background-color: white;
  color: #333333;
  transform: translateY(-1px);
}

/* Меню пользователя */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid white;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  font-size: 18px;
}

.user-name {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.user-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

/* Выпадающее меню */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background-color: #fff0f0;
}

.item-icon {
  font-size: 16px;
  width: 20px;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 5px 0;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .nav-menu {
    gap: 12px;
  }
  
  .nav-menu a {
    font-size: 13px;
  }
  
  .logo {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 12px;
  }
  
  .nav-menu a {
    font-size: 12px;
  }
  
  .auth-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .user-name {
    display: none;
  }
  
  .user-btn {
    padding: 6px 8px;
  }
  
  .cart-icon {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 20px;
  }
  
  .nav-menu a {
    font-size: 11px;
  }
  
  .auth-btn {
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .auth-buttons {
    gap: 5px;
  }
}
</style>
