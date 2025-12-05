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
          <p class="page-subtitle">Подарите возможность выбора - подарочный сертификат от Токус Bloom</p>

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
                <div v-for="feature in certificate.features" :key="feature" class="feature">
                  ✓ {{ feature }}
                </div>
              </div>
              <button class="select-button" :class="{ 'selected': selectedCertificate?.id === certificate.id }">
                {{ selectedCertificate?.id === certificate.id ? 'Выбрано' : 'Выбрать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Правая колонка - Информация о заказе -->
        <div class="order-info-section">
          <div class="order-summary-card" v-if="selectedCertificate">
            <h2 class="summary-title">Ваш заказ</h2>
            
            <div class="selected-certificate">
              <div class="certificate-preview">
                <div class="certificate-icon">🎁</div>
                <div class="certificate-details">
                  <div class="certificate-name">Подарочный сертификат</div>
                  <div class="certificate-amount">{{ formatPrice(selectedCertificate.value) }} ₽</div>
                </div>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row">
              <span class="summary-label">Номинал сертификата</span>
              <span class="summary-value">{{ formatPrice(selectedCertificate.value) }} ₽</span>
            </div>

            <div class="summary-total">
              <span class="total-label">К оплате:</span>
              <span class="total-value">{{ formatPrice(selectedCertificate.value) }} ₽</span>
            </div>

            <button class="submit-order-button" @click="generateCertificate">
              Оформить сертификат
            </button>
          </div>

          <div class="placeholder-card" v-else>
            <div class="placeholder-icon">ꕤ</div>
            <h3 class="placeholder-title">Выберите сертификат</h3>
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
          <h3>Сертификат успешно создан!</h3>
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
              <span class="info-label">Дата создания:</span>
              <span class="info-value">{{ currentDate }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Статус:</span>
              <span class="info-status">Ожидает оплаты</span>
            </div>
          </div>
        </div>

        <div class="contacts-section">
          <h4 class="contacts-title">Для согласования и оплаты свяжитесь с нами:</h4>
          
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-label">✦ Телефон:</span>
              <span class="contact-value">+7 (800) 555-35-35</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">✦ Email:</span>
              <span class="contact-value">certificates@tokusbloom.ru</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">✦ Адрес:</span>
              <span class="contact-value">г. Владивосток, ул. Шепеткого, д. 14</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">✦ Время работы:</span>
              <span class="contact-value">Ежедневно с 9:00 до 21:00</span>
            </div>
          </div>
        </div>

        <div class="modal-notes">
          <p class="note"> <strong>Сохраните номер сертификата!</strong> Он потребуется для активации после оплаты.</p>
          <p class="note"><strong> Сертификат действителен в течение 6 месяцев с момента активации.</strong></p>
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
export default {
  name: 'CertificateOrderView',
  data() {
    return {
      selectedCertificate: null,
      showCertificateModal: false,
      certificateNumber: '',
      certificates: [
        {
          id: 1,
          value: 3000,
          description: 'Идеально для небольшого сюрприза',
          features: [
            'Небольшой букет или композиция',
            'Доставка в пределах города',
            'Срок действия 6 месяцев'
          ]
        },
        {
          id: 2,
          value: 5000,
          description: 'Популярный выбор для любых поводов',
          features: [
            'Стандартный букет премиум-класса',
            'Бесплатная доставка',
            'Персональное поздравление',
            'Срок действия 6 месяцев'
          ]
        },
        {
          id: 3,
          value: 10000,
          description: 'Роскошный подарок для особых случаев',
          features: [
            'Эксклюзивная цветочная композиция',
            'Премиум упаковка',
            'Бесплатная доставка 24/7',
            'Видео-открытка',
            'Срок действия 12 месяцев'
          ]
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
    }
  },
  methods: {
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },
    
    selectCertificate(certificate) {
      this.selectedCertificate = certificate
    },
    
    generateCertificate() {
      if (!this.selectedCertificate) return
      
      // Генерация номера сертификата: CERT-XXXXXX
      const randomNum = Math.floor(100000 + Math.random() * 900000)
      this.certificateNumber = `CERT-${randomNum}`
      
      this.showCertificateModal = true
    },
    
    hideCertificateModal() {
      this.showCertificateModal = false
    },
    
    copyCertificateNumber() {
      navigator.clipboard.writeText(this.certificateNumber)
        .then(() => {
          alert('Номер сертификата скопирован в буфер обмена!')
        })
        .catch(() => {
          // Fallback для старых браузеров
          const textArea = document.createElement('textarea')
          textArea.value = this.certificateNumber
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('Номер сертификата скопирован в буфер обмена!')
        })
    },
    
    printCertificate() {
      window.print()
    },
    
    goToCertificates() {
      this.$router.push('/certificates')
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
  font-family: 'Albert Sans', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: 600;
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
  margin-bottom: 20px;
  font-weight: 500;
  line-height: 1.4;
}

.certificate-features {
  margin-bottom: 25px;
  text-align: left;
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
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  border: 2px dashed #A3A3CC;
}

.certificate-icon {
  font-size: 40px;
}

.certificate-details {
  flex: 1;
}

.certificate-name {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #292966;
  font-weight: 600;
  margin-bottom: 5px;
}

.certificate-amount {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  font-weight: 700;
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
  background-color: #292966;
  color: white;
  border: none;
  padding: 18px 30px;
  border-radius: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.submit-order-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

.placeholder-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 40px 30px;
  border: 2px dashed #A3A3CC;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 20px;
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

/* Модальное окно сертификата */
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #666;
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
  font-size: 48px;
  margin-bottom: 15px;
}

.certificate-header h3 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: 600;
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
  font-size: 24px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 1px;
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
  color: #ff6b35;
  font-weight: 600;
}

.contacts-section {
  margin-bottom: 25px;
}

.contacts-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.contact-label {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  color: #292966;
  font-size: 14px;
}

.contact-value {
  font-family: 'Albert Sans', sans-serif;
  color: #666;
  font-size: 16px;
  text-align: right;
}

.modal-notes {
  background-color: #fff9e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  border-left: 4px solid #ffd043;
}

.note {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
}

.note:last-child {
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.print-button,
.back-button {
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.print-button {
  background-color: #292966;
  color: white;
}

.print-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

.back-button {
  background-color: #292966;
  color: white;
}

.back-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .certificates-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .modal-content {
    padding: 30px 25px;
  }
  
  .certificate-header h3 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .certificate-order-page {
    margin-top: 160px;
  }
  
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .contact-value {
    text-align: left;
  }
  
  .modal-actions {
    gap: 10px;
  }
  
  .print-button,
  .back-button {
    padding: 12px 15px;
    font-size: 14px;
  }
}

@media print {
  .breadcrumb-section,
  .certificate-selection-section,
  .order-info-section,
  .close-button,
  .modal-actions {
    display: none !important;
  }
  
  .certificate-modal {
    position: static;
    background: white;
  }
  
  .modal-content {
    max-width: none;
    width: auto;
    height: auto;
    max-height: none;
    box-shadow: none;
    padding: 20px;
  }
}
</style>