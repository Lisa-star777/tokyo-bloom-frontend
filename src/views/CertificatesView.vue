<template>
  <div class="catalog-page">
    <!-- Верхняя часть -->
    <section class="catalog-top-section">
      <div class="container">
        <div class="catalog-header">
          <h1 class="catalog-main-title">СЕРТИФИКАТЫ</h1>
        </div>
      </div>
    </section>

    <!-- Полоска между заголовком и контентом -->
    <div class="catalog-divider-container">
      <div class="container">
        <div class="catalog-divider"></div>
      </div>
    </div>

    <!-- Основной контент -->
    <section class="catalog-products-section">
      <div class="container">
        <div class="about-content">
          
          <!-- Текстовая часть -->
          <div class="about-text">
            <p class="about-paragraph">Сомневаетесь в выборе? Подарочный сертификат - отличное решение! Он дарит близкому человеку море цветов и возможность выбрать именно то, что порадует его сердце.</p>
            <p class="about-signature"><b><em>Идеальный подарок для тех, кого сложно удивить!</em></b></p>
          </div>

          <!-- Сетка сертификатов -->
          <div class="certificates-grid">
            <div 
              v-for="certificate in certificates" 
              :key="certificate.id" 
              class="certificate-card"
            >
              <div class="certificate-value">{{ formatPrice(certificate.value) }} ₽</div>
              <div class="certificate-description">{{ certificate.description }}</div>
              
            </div>
          </div>

          <!-- Кнопка оформления сертификата -->
          <div class="certificate-cta">
            <button class="cta-certificate-button" @click="goToCertificateOrder">
              Оформить сертификат
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'CertificatesView',
  data() {
    return {
      certificates: [
        { id: 1, value: 3000, description: 'Небольшой букет или композиция' },
        { id: 2, value: 5000, description: 'Стандартный букет премиум-класса' },
        { id: 4, value: 10000, description: 'Эксклюзивный букет или большая композиция' }
      ]
    }
  },
  methods: {
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },
    buyCertificate(certificateId) {
      const certificate = this.certificates.find(c => c.id === certificateId)
      alert(`Вы выбрали сертификат номиналом ${this.formatPrice(certificate.value)} ₽!\n${certificate.description}`)
      console.log('Покупка сертификата:', certificate)
    },
    goToCertificateOrder() {
      this.$router.push('/certificate-order')
    }
  }
}
</script>

<style scoped>
.catalog-page {
  margin-top: 120px !important;
  min-height: 100vh;
}

.catalog-top-section {
  background-color: #ffffff;
  padding: 40px 0;
  border-bottom: 3px solid #292966;
  margin-bottom: 40px;
}

.catalog-header {
  text-align: center;
  padding: 30px 0;
}

.catalog-main-title {
  font-family: 'Russo One', sans-serif;
  font-size: 52px;
  color: #292966;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
}

.catalog-divider-container {
  background-color: #ffffff;
  padding: 0;
}



.catalog-products-section {
  padding: 20px 0 60px;
  background-color: #ffffff;
}

.about-content {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}
ы
.about-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 36px;
  color: #292966;
  margin-bottom: 40px;
  font-weight: 600;
  line-height: 1.3;
}

.about-text {
  text-align: left;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 50px;
  margin-bottom: 50px;
}

.about-paragraph {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: center;
}

.about-signature {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #333;
  line-height: 1.6;
  font-style: italic;
  text-align: center;
  margin: 0;
  padding-top: 30px;
  border-top: 2px solid #A3A3CC;
}

/* Сетка сертификатов */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin: 50px 0;
}

.certificate-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #A3A3CC;
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.certificate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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
  color: #5c5b5b;
  margin-bottom: 20px;
  line-height: 1.4;
  min-height: 45px;
}

.certificate-button {
  background-color: #292966;
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

.certificate-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

/* Кнопка оформления сертификата */
.certificate-cta {
  text-align: center;
  margin: 40px 0;
}

.cta-certificate-button {
  background-color: #292966;
  color: white;
  border: none;
  padding: 30px 45px;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.cta-certificate-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}


/* Адаптивность */
@media (max-width: 1200px) {
  .about-content {
    max-width: 900px;
  }
  
  .certificates-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .about-paragraph,
  .about-signature {
    font-size: 22px;
  }
}

@media (max-width: 992px) {
  .catalog-main-title {
    font-size: 44px;
  }
  
  .about-subtitle {
    font-size: 30px;
  }
  
  .about-content {
    max-width: 700px;
  }
  
  .about-text {
    padding: 40px;
    margin-bottom: 40px;
  }
  
  .about-paragraph,
  .about-signature {
    font-size: 20px;
  }
  
  .certificate-value {
    font-size: 28px;
  }
  
  .about-image {
    margin-top: 40px;
  }
}

@media (max-width: 768px) {
  .catalog-page {
    margin-top: 140px !important;
  }
  
  .catalog-main-title {
    font-size: 36px;
  }
  
  .about-subtitle {
    font-size: 26px;
    margin-bottom: 30px;
  }
  
  .about-content {
    max-width: 500px;
  }
  
  .about-text {
    padding: 30px;
    text-align: center;
    margin-bottom: 30px;
  }
  
  .about-paragraph,
  .about-signature {
    font-size: 18px;
  }
  
  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 30px 0;
  }
  
  .certificate-card {
    padding: 25px 15px;
  }
  
  .certificate-value {
    font-size: 24px;
  }
  
  .about-image {
    margin-top: 30px;
  }
  
  .image-placeholder {
    height: 250px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .catalog-page {
    margin-top: 160px !important;
  }
  
  .catalog-main-title {
    font-size: 32px;
  }
  
  .about-subtitle {
    font-size: 22px;
    margin-bottom: 25px;
  }
  
  .about-content {
    max-width: 100%;
    margin: 0 15px;
  }
  
  .about-text {
    padding: 25px;
    margin-bottom: 25px;
  }
  
  .about-paragraph,
  .about-signature {
    font-size: 16px;
  }
  
  .about-image {
    margin-top: 25px;
  }
  
  .image-placeholder {
    height: 200px;
    font-size: 14px;
  }
}
</style>