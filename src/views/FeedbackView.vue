<template>
  <div class="feedback-page">
    <div class="container">
      <div class="feedback-form">
        <h3 class="feedback-title">Обратная связь</h3>
        <p class="feedback-subtitle">Оставьте ваше сообщение, и мы свяжемся с вами</p>
        
        <form @submit.prevent="submitForm" class="form">
          <!-- Поле имени -->
          <div class="form-group">
            <label for="name" class="form-label">Ваше имя *</label>
            <input 
              type="text" 
              id="name"
              v-model="form.name" 
              class="form-input"
              :class="{ 'error': errors.name }"
              placeholder="Иван Иванов"
              @blur="validateField('name')"
            >
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <!-- Поле email -->
          <div class="form-group">
            <label for="email" class="form-label">Email *</label>
            <input 
              type="email" 
              id="email"
              v-model="form.email" 
              class="form-input"
              :class="{ 'error': errors.email }"
              placeholder="ivan@example.com"
              @blur="validateField('email')"
            >
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <!-- Поле телефона -->
          <div class="form-group">
            <label for="phone" class="form-label">Телефон</label>
            <input 
              type="tel" 
              id="phone"
              v-model="form.phone" 
              class="form-input"
              placeholder="+7 (999) 123-45-67"
            >
          </div>

          <!-- Поле сообщения -->
          <div class="form-group">
            <label for="message" class="form-label">Сообщение *</label>
            <textarea 
              id="message"
              v-model="form.message" 
              class="form-textarea"
              :class="{ 'error': errors.message }"
              rows="4"
              placeholder="Напишите ваш вопрос или пожелание..."
              @blur="validateField('message')"
            ></textarea>
            <span v-if="errors.message" class="error-text">{{ errors.message }}</span>
            <div class="char-counter">{{ form.message.length }} / 500</div>
          </div>

          <!-- Кнопка отправки -->
          <button 
            type="submit" 
            class="submit-button"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="!isSubmitting">Отправить сообщение</span>
            <span v-else>Отправка...</span>
          </button>

          <!-- Сообщение об успехе -->
          <div v-if="submitted" class="success-message">
            <div class="success-icon">✓</div>
            <h4>Спасибо за обращение!</h4>
            <p>Мы получили ваше сообщение и ответим в ближайшее время.</p>
            <button class="new-message-button" @click="resetForm">
              Отправить еще сообщение
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'FeedbackForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        message: ''
      },
      errors: {
        name: '',
        email: '',
        message: ''
      },
      isSubmitting: false,
      submitted: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.name.trim() !== '' &&
        this.isValidEmail(this.form.email) &&
        this.form.message.trim() !== '' &&
        this.form.message.length <= 500
      )
    }
  },
  methods: {
    validateField(field) {
      switch(field) {
        case 'name':
          if (!this.form.name.trim()) {
            this.errors.name = 'Имя обязательно для заполнения'
          } else if (this.form.name.length < 2) {
            this.errors.name = 'Имя должно содержать минимум 2 символа'
          } else {
            this.errors.name = ''
          }
          break
        case 'email':
          if (!this.form.email) {
            this.errors.email = 'Email обязателен для заполнения'
          } else if (!this.isValidEmail(this.form.email)) {
            this.errors.email = 'Введите корректный email'
          } else {
            this.errors.email = ''
          }
          break
        case 'message':
          if (!this.form.message.trim()) {
            this.errors.message = 'Сообщение обязательно для заполнения'
          } else if (this.form.message.length > 500) {
            this.errors.message = 'Сообщение не должно превышать 500 символов'
          } else {
            this.errors.message = ''
          }
          break
      }
    },
    
    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },
    
    async submitForm() {
      this.validateField('name')
      this.validateField('email')
      this.validateField('message')
      
      if (this.errors.name || this.errors.email || this.errors.message) {
        return
      }

      this.isSubmitting = true

      try {
        const response = await api.post('/feedback', {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone || null,
          message: this.form.message
        })

        console.log('✅ Сообщение отправлено:', response.data)
        this.submitted = true
        
        this.form = {
          name: '',
          email: '',
          phone: '',
          message: ''
        }
        
      } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error)
        alert('Произошла ошибка при отправке. Попробуйте позже.')
      } finally {
        this.isSubmitting = false
      }
    },
    
    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone: '',
        message: ''
      }
      this.submitted = false
    }
  }
}
</script>

<style scoped>
.feedback-page {
  margin-top: 120px;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.feedback-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #A3A3CC;
}

.feedback-title {
  font-family: 'Russo One', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 10px;
  text-align: center;
}

.feedback-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  text-align: center;
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
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #A3A3CC;
  box-shadow: 0 0 0 3px rgba(163, 163, 204, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ff6b6b;
}

.error-text {
  display: block;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 5px;
}

.char-counter {
  text-align: right;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.submit-button {
  width: 100%;
  padding: 16px 24px;
  background-color: #292966;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-top: 20px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #4CAF50;
  color: white;
  font-size: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-message h4 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 10px;
  font-weight: 600;
}

.success-message p {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.new-message-button {
  background-color: #A3A3CC;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-message-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .feedback-page {
    margin-top: 140px;
  }
  
  .feedback-form {
    padding: 20px;
    margin: 0 15px;
  }

  .feedback-title {
    font-size: 20px;
  }

  .feedback-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .feedback-page {
    margin-top: 160px;
  }
}
</style>