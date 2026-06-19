<template>
  <!-- Cookie-плашка -->
  <div v-if="showCookie" class="cookie-banner">
    <p>Мы используем cookie для улучшения работы сайта. Продолжая, вы соглашаетесь с их использованием.</p>
    <button @click="acceptCookies">OK</button>
  </div>

  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="close">×</button>
      
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">Вход</button>
        <button class="tab" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">Регистрация</button>
      </div>

      <!-- Форма входа -->
      <div v-if="activeTab === 'login'" class="form-container">
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" v-model="loginForm.email" class="form-input" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input type="password" v-model="loginForm.password" class="form-input" placeholder="Пароль" required>
          </div>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          <button type="submit" class="submit-button" :disabled="isSubmitting">{{ isSubmitting ? 'Вход...' : 'Войти' }}</button>
        </form>
      </div>

      <!-- Форма регистрации -->
      <div v-else class="form-container">
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Имя</label>
            <input type="text" v-model="registerForm.name" class="form-input" placeholder="Ваше имя" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" v-model="registerForm.email" class="form-input" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input type="password" v-model="registerForm.password" class="form-input" placeholder="Не менее 6 символов" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label">Подтверждение</label>
            <input type="password" v-model="registerForm.confirmPassword" class="form-input" placeholder="Повторите пароль" required>
          </div>
          
          <!-- Чекбокс согласия -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="registerForm.agreeToDataProcessing" class="checkbox-input">
              <span class="checkbox-text">Согласен на обработку персональных данных</span>
            </label>
          </div>

          <div v-if="registerError" class="error-message">{{ registerError }}</div>
          <button type="submit" class="submit-button" :disabled="isSubmitting || !registerForm.agreeToDataProcessing">
            {{ isSubmitting ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '@/stores/auth'

export default {
  name: 'AuthModal',
  props: {
    initialTab: { type: String, default: 'login' }
  },
  data() {
    return {
      activeTab: this.initialTab,
      loginForm: { email: '', password: '' },
      registerForm: { name: '', email: '', password: '', confirmPassword: '', agreeToDataProcessing: false },
      loginError: '',
      registerError: '',
      isSubmitting: false,
      showCookie: !localStorage.getItem('cookies_accepted')
    }
  },
  watch: {
    initialTab(newVal) { this.activeTab = newVal }
  },
  methods: {
    acceptCookies() {
      localStorage.setItem('cookies_accepted', 'true')
      this.showCookie = false
    },
    switchTab(tab) {
      this.activeTab = tab
      this.loginError = ''
      this.registerError = ''
      this.loginForm = { email: '', password: '' }
      this.registerForm = { name: '', email: '', password: '', confirmPassword: '', agreeToDataProcessing: false }
    },
    async handleLogin() {
      if (!this.loginForm.email || !this.loginForm.password) { this.loginError = 'Заполните все поля'; return }
      this.isSubmitting = true
      this.loginError = ''
      try {
        const result = await authStore.login(this.loginForm.email, this.loginForm.password)
        if (result.success) { this.$emit('login-success', result.user); this.close(); if (result.isAdmin) this.$router.push('/admin') }
        else { this.loginError = result.error }
      } catch (error) { this.loginError = 'Произошла ошибка. Попробуйте позже.' }
      finally { this.isSubmitting = false }
    },
    async handleRegister() {
      if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) { this.registerError = 'Заполните все поля'; return }
      if (!this.registerForm.agreeToDataProcessing) { this.registerError = 'Необходимо согласие на обработку данных'; return }
      if (this.registerForm.password !== this.registerForm.confirmPassword) { this.registerError = 'Пароли не совпадают'; return }
      if (this.registerForm.password.length < 6) { this.registerError = 'Пароль должен быть не менее 6 символов'; return }
      this.isSubmitting = true
      this.registerError = ''
      try {
        const result = await authStore.register(this.registerForm.name, this.registerForm.email, this.registerForm.password)
        if (result.success) { this.$emit('login-success', result.user); this.close() }
        else { this.registerError = result.error }
      } catch (error) { this.registerError = 'Произошла ошибка. Попробуйте позже.' }
      finally { this.isSubmitting = false }
    },
    close() { this.$emit('close') }
  }
}
</script>

<style scoped>
/* Cookie-плашка */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #333333;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 9999;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
}
.cookie-banner button {
  background: #A3A3CC;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

/* Чекбокс */
.checkbox-group {
  margin: 10px 0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}
.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.checkbox-text {
  user-select: none;
}

/* Остальные стили без изменений */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: white; border-radius: 12px; padding: 40px; max-width: 400px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.close-button { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #999; transition: color 0.3s ease; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.close-button:hover { color: #292966; background-color: rgba(163,163,204,0.1); }
.tabs { display: flex; gap: 15px; margin-bottom: 30px; justify-content: center; }
.tab { padding: 10px 24px; border: 2px solid #333333; border-radius: 6px; background: none; font-family: 'Albert Sans', sans-serif; font-size: 16px; font-weight: 600; color: #333333; cursor: pointer; transition: all 0.2s ease; min-width: 120px; }
.tab.active { background-color: #333333; color: white; }
.tab:hover:not(.active) { background-color: rgba(51,51,51,0.05); transform: translateY(-2px); }
.form-container { margin-bottom: 10px; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-family: 'Albert Sans', sans-serif; font-size: 14px; color: #333333; margin-bottom: 8px; font-weight: 500; }
.form-input { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: 'Albert Sans', sans-serif; font-size: 15px; color: #333333; transition: all 0.3s ease; background-color: white; }
.form-input:focus { outline: none; border-color: #A3A3CC; }
.form-input::placeholder { color: #aaa; }
.error-message { color: #ff6b6b; font-family: 'Albert Sans', sans-serif; font-size: 14px; margin-bottom: 15px; text-align: center; padding: 8px; background-color: #fff0f0; border-radius: 4px; }
.submit-button { width: 100%; padding: 14px 24px; background-color: #333333; color: white; border: 2px solid #333333; border-radius: 6px; font-family: 'Albert Sans', sans-serif; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin-top: 10px; }
.submit-button:hover:not(:disabled) { background-color: white; color: #333333; transform: translateY(-2px); }
.submit-button:disabled { background-color: #ccc; border-color: #ccc; cursor: not-allowed; transform: none; }
@media (max-width: 768px) { .modal-content { padding: 30px 25px; } .tab { padding: 8px 20px; font-size: 15px; min-width: 100px; } .submit-button { padding: 12px 20px; font-size: 16px; } }
@media (max-width: 480px) { .tabs { flex-direction: column; gap: 10px; } .tab { width: 100%; } }
</style>
