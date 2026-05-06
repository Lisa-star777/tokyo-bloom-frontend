<template>
  <div class="certificate-order-page">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <router-link to="/certificates">Сертификаты</router-link>
          <span class="divider">/</span>
          <span class="current">Оформление сертификата</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <div class="certificate-layout">
        <!-- Левая колонка - Выбор сертификата -->
        <div class="certificate-selection-section">
          <h1 class="page-title">Выберите сертификат</h1>
          <p class="page-subtitle">Подарите возможность выбора - подарочный сертификат от Tokyo Bloom</p>

          <div class="certificates-grid">
            <div 
              v-for="certificate in certificates" 
              :key="certificate.id" 
              class="certificate-card"
              :class="{ 'selected': selectedCertificate?.id === certificate.id }"
              @click="selectCertificate(certificate)"
            >
              <div class="certificate-value">{{ formatPrice(certificate.value) }} ₽</div>
              <div class="certificate-description">{{ certificate.description }}</div>
              <div class="certificate-features">
                <div class="feature">
                  Срок действия: {{ certificate.validity }}
                </div>
              </div>
              <button class="select-button" :class="{ 'selected': selectedCertificate?.id === certificate.id }">
                {{ selectedCertificate?.id === certificate.id ? 'Выбрано' : 'Выбрать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Правая колонка - Информация о заказе и оплата -->
        <div class="order-info-section">
          <div class="order-summary-card" v-if="selectedCertificate">
            <h2 class="summary-title">Ваш заказ</h2>
            
            <div class="selected-certificate">
              <div class="certificate-preview">
                <div class="certificate-details">
                  <div class="certificate-name">Подарочный сертификат</div>
                  <div class="certificate-amount">{{ formatPrice(selectedCertificate.value) }} ₽</div>
                  <div class="certificate-validity">Срок действия: {{ selectedCertificate.validity }}</div>
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span class="summary-label">Номинал сертификата</span>
              <span class="summary-value">{{ formatPrice(selectedCertificate.value) }} ₽</span>
            </div>

            <!-- Форма оплаты картой -->
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
            </div>

            <div class="summary-total">
              <span class="total-label">К оплате:</span>
              <span class="total-value">{{ formatPrice(selectedCertificate.value) }} ₽</span>
            </div>

            <button 
                class="submit-order-button" 
                @click="generateCertificate" 
                :disabled="!isFormFilled || isGenerating"
                :class="{ 'btn-disabled': !isFormFilled }"
              >
                {{ isGenerating ? 'Оформление...' : 'Оформить сертификат' }}
            </button>
          </div>
          
          <div class="placeholder-card" v-else>
            <div class="placeholder-title">Выберите сертификат</div>
            <p class="placeholder-description">Выберите один из вариантов сертификата слева для продолжения оформления</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с информацией о сертификате -->
    <div v-if="showCertificateModal" class="certificate-modal" @click="hideCertificateModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="hideCertificateModal">×</button>
        
        <div class="certificate-header">
          <div class="certificate-success-icon">✓</div>
          <h3>Оплата прошла успешно!</h3>
          <p class="modal-subtitle">Сертификат успешно создан</p>
        </div>

        <div class="certificate-details-card">
          <div class="certificate-number-section">
            <div class="number-label">Номер сертификата:</div>
            <div class="certificate-number">{{ certificateNumber }}</div>
            <button class="copy-button" @click="copyCertificateNumber">
              Копировать
            </button>
          </div>

          <div class="certificate-info">
            <div class="info-row">
              <span class="info-label">Номинал:</span>
              <span class="info-value">{{ formatPrice(selectedCertificate.value) }} ₽</span>
            </div>
            <div class="info-row">
              <span class="info-label">Срок действия:</span>
              <span class="info-value">{{ selectedCertificate.validity }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Дата создания:</span>
              <span class="info-value">{{ currentDate }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Статус:</span>
              <span class="info-status">Активен</span>
            </div>
          </div>
        </div>

        <div class="modal-notes">
          <p class="note">Мы отпрвим вам отправим уведомление на почту c номером сертификата.</p>
        </div>

        <div class="modal-actions">
          <button class="back-button" @click="goToCertificates">
            Вернуться к сертификатам
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cartStore } from '@/stores/cart'
import { authStore } from '@/stores/auth'
import { notifications } from '@/services/notifications'

export default {
  name: 'CertificateOrderView',
  data() {
    return {
      selectedCertificate: null,
      showCertificateModal: false,
      certificateNumber: '',
      isGenerating: false,
      payment: {
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardHolder: ''
      },
      certificates: [
        {
          id: 1,
          value: 3000,
          description: 'Идеально для небольшого сюрприза',
          validity: '6 месяцев'
        },
        {
          id: 2,
          value: 5000,
          description: 'Популярный выбор для любых поводов',
          validity: '6 месяцев'
        },
        {
          id: 3,
          value: 10000,
          description: 'Роскошный подарок для особых случаев',
          validity: '12 месяцев'
        }
      ]
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    currentUser() {
      return authStore.getCurrentUser()
    },
    // Простая проверка - все поля заполнены
    isFormFilled() {
      const cardNumber = this.payment.cardNumber.replace(/\s/g, '')
      return cardNumber.length > 0 && 
             this.payment.expiry.length > 0 && 
             this.payment.cvv.length > 0 && 
             this.payment.cardHolder.trim().length > 0
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
    
    selectCertificate(certificate) {
      this.selectedCertificate = certificate
    },
    
    async generateCertificate() {
      if (!this.selectedCertificate) {
        notifications.warning('Пожалуйста, выберите номинал сертификата')
        return
      }
      
      // Простая проверка: все ли поля заполнены
      if (!this.payment.cardNumber.replace(/\s/g, '')) {
        notifications.warning('Пожалуйста, заполните номер карты')
        return
      }
      
      if (!this.payment.expiry) {
        notifications.warning('Пожалуйста, заполните срок действия')
        return
      }
      
      if (!this.payment.cvv) {
        notifications.warning('Пожалуйста, заполните CVV код')
        return
      }
      
      if (!this.payment.cardHolder.trim()) {
        notifications.warning('Пожалуйста, заполните имя держателя')
        return
      }
      
      this.isGenerating = true
      
      try {
        const newCertificate = await cartStore.createCertificate({
          value: this.selectedCertificate.value,
          ownerEmail: null,
          buyerName: this.currentUser?.name || this.payment.cardHolder
        })
        
        if (newCertificate) {
          this.certificateNumber = newCertificate.code
          this.showCertificateModal = true
        } else {
          notifications.error('Ошибка при создании сертификата. Попробуйте позже.')
        }
      } catch (error) {
        console.error('Ошибка:', error)
        notifications.error('Произошла ошибка. Попробуйте позже.')
      } finally {
        this.isGenerating = false
      }
    },
    
    copyCertificateNumber() {
      navigator.clipboard.writeText(this.certificateNumber)
        .then(() => {
          notifications.success('Номер сертификата скопирован в буфер обмена!')
        })
        .catch(() => {
          const textArea = document.createElement('textarea')
          textArea.value = this.certificateNumber
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          notifications.success('Номер сертификата скопирован в буфер обмена!')
        })
    },
    
    goToCertificates() {
      this.$router.push('/certificates')
    },
    
    hideCertificateModal() {
      this.showCertificateModal = false
      this.goToCertificates()
    }
  }
}
</script>

<style scoped>
.certificate-order-page {
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

/* Основной макет */
.certificate-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* Левая колонка - Выбор сертификата */
.certificate-selection-section {
  padding-right: 40px;
}

.page-title {
  font-family: 'Russo One', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 15px;
}

.page-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.5;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.certificate-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #e0e0e0;
  border-radius: 15px;
  padding: 30px 25px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.certificate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: #A3A3CC;
}

.certificate-card.selected {
  border-color: #292966;
  background: linear-gradient(135deg, #ffffff 0%, #f0f2ff 100%);
  box-shadow: 0 15px 40px rgba(41, 41, 102, 0.15);
}

.certificate-value {
  font-family: 'Russo One', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: bold;
}

.certificate-description {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
  font-weight: 500;
  line-height: 1.4;
}

.certificate-features {
  margin-bottom: 25px;
}

.feature {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.select-button {
  background-color: #A3A3CC;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.select-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.select-button.selected {
  background-color: #292966;
}

/* Правая колонка - Информация о заказе */
.order-info-section {
  position: sticky;
  top: 140px;
  align-self: start;
}

.order-summary-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  border: 2px solid #A3A3CC;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.summary-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 25px;
  font-weight: 600;
  text-align: center;
}

.selected-certificate {
  margin-bottom: 20px;
}

.certificate-preview {
  padding: 20px;
  background: white;
  border-radius: 10px;
  border: 2px dashed #A3A3CC;
  text-align: center;
}

.certificate-name {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  font-weight: 600;
  margin-bottom: 5px;
}

.certificate-amount {
  font-family: 'Russo One', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: bold;
  margin-bottom: 5px;
}

.certificate-validity {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
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
  font-size: 18px;
  color: #292966;
  font-weight: 500;
}

/* Секция оплаты */
.payment-section {
  margin: 20px 0;
  padding-top: 15px;
  border-top: 2px solid #e0e0e0;
}

.payment-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
}

.payment-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.half {
  width: 48%;
}

.form-row {
  display: flex;
  gap: 15px;
  justify-content: space-between;
}

.form-label {
  display: block;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
  margin-bottom: 5px;
  font-weight: 500;
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

.submit-order-button {
  width: 100%;
  padding: 18px 30px;
  background-color: #292966;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
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

.placeholder-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 40px 30px;
  border: 2px dashed #A3A3CC;
  text-align: center;
}

.placeholder-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: 600;
}

.placeholder-description {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Модальное окно */
.certificate-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  padding: 40px;
  border-radius: 15px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.certificate-header {
  text-align: center;
  margin-bottom: 30px;
}

.certificate-success-icon {
  width: 60px;
  height: 60px;
  background-color: #4CAF50;
  color: white;
  font-size: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.certificate-header h3 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  font-weight: 600;
  margin-bottom: 5px;
}

.modal-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.certificate-details-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  border: 2px solid #A3A3CC;
}

.certificate-number-section {
  text-align: center;
  margin-bottom: 20px;
}

.number-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.certificate-number {
  font-family: 'Russo One', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  word-break: break-all;
}

.copy-button {
  background-color: #A3A3CC;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.certificate-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.info-value {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  font-weight: 500;
}

.info-status {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #4CAF50;
  font-weight: 600;
}

.modal-notes {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 25px;
}

.note {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 0;
  line-height: 1.4;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.back-button {
  padding: 12px 24px;
  background-color: #292966;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .certificates-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .certificate-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .certificate-selection-section {
    padding-right: 0;
  }
  
  .order-info-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .certificate-order-page {
    margin-top: 140px;
  }
  
  .certificates-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group.half {
    width: 100%;
  }
  
  .modal-content {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .certificate-order-page {
    margin-top: 160px;
  }
  
  .certificate-amount {
    font-size: 24px;
  }
  
  .total-value {
    font-size: 24px;
  }
}
</style>