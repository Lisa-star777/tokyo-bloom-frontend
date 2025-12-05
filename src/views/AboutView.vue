<template>
  <div class="catalog-page">
    <!-- Верхняя часть -->
    <section class="catalog-top-section">
      <div class="container">
        <div class="catalog-header">
          <h1 class="catalog-main-title">О НАС</h1>
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
          <h2 class="about-subtitle">Почему мы?</h2>
          
          <!-- Текстовая часть -->
          <div class="about-text">
            <p class="about-paragraph">- Потому что для нас флористика - это страсть. Мы знаем все о свежести цветов, умеем слышать ваши пожелания и создаем букеты, которые говорят без слов. Наша цель - делать ваш день ярче, а моменты - памятнее.</p>
            <p class="about-signature"><b><em>Просто любим свое дело и дарим яркость с 2007 года.</em></b></p>
          </div>


          <!-- Контактная информация -->
          <div class="contact-section">
            <h3 class="contact-title">Контакты</h3>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-label">✦ Телефон:</span>
                <span class="contact-value">+7 (800) 555-35-35</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">✦ Email:</span>
                <span class="contact-value">info@tokusbloom.ru</span>
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
        </div>
      </div>
    </section>
  </div>
</template>


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

/* Секция преимуществ */
.advantages-section {
  margin: 60px 0;
}

.advantages-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 40px;
  font-weight: 600;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 50px;
}

.advantage-card {
  background: white;
  border: 2px solid #A3A3CC;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.advantage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #292966;
}

.advantage-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.advantage-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 15px;
  font-weight: 600;
}

.advantage-description {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Секция контактов */
.contact-section {
  margin: 60px 0;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid #A3A3CC;
}

.contact-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 30px;
  font-weight: 600;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-label {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  color: #292966;
  margin-bottom: 5px;
  font-size: 18px;
}

.contact-value {
  font-family: 'Albert Sans', sans-serif;
  color: #666;
  font-size: 16px;
}

/* Картинка */
.about-image {
  text-align: center;
  margin-top: 60px;
}

.image-placeholder {
  width: 100%;
  height: 300px;
  background-color: #B8B8B8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #292966;
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 500;
  border: 2px dashed #292966;
  margin: 0 auto;
  max-width: 600px;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .about-content {
    max-width: 900px;
  }
  
  .advantages-grid {
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
  
  .advantages-title,
  .contact-title {
    font-size: 28px;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
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
  
  .advantages-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .advantage-card {
    padding: 25px 15px;
  }
  
  .advantages-title,
  .contact-title {
    font-size: 24px;
  }
  
  .contact-section {
    margin: 40px 0;
    padding: 30px 20px;
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