<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Левая часть - навигация -->
        <div class="footer-nav-section">
          <nav>
            <ul class="footer-nav">
              <li><router-link to="/bouquets">БУКЕТЫ</router-link></li>
              <li><router-link to="/gifts">ПОДАРКИ</router-link></li>
              <li><router-link to="/box-flowers">ЦВЕТЫ В КОРОБКАХ</router-link></li>
              <li><router-link to="/certificates">СЕРТИФИКАТЫ</router-link></li>
              <li><router-link to="/about">О НАС</router-link></li>
            </ul>
          </nav>
          <div class="social-text">
            НАШИ СОЦИАЛЬНЫЕ СЕТИ
          </div>
        </div>

        <!-- Правая часть - ссылка на форму обратной связи -->
        <div class="footer-feedback">
          <router-link to="/feedback" class="feedback-link">
            <span class="feedback-icon">✉</span>
            Обратная связь
          </router-link>
          <p class="feedback-note">Есть вопросы? Напишите нам!</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
.footer {
  background-color: #333333;
  color: white;
  padding: 50px 0 25px;
  margin-top: 80px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-nav-section {
  flex: 2;
}

.footer-nav {
  display: flex;
  list-style: none;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.footer-nav a {
  color: white;
  text-decoration: none;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.footer-nav a:hover {
  color: #A3A3CC;
}

.social-text {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 500;
  font-size: 16px;
}

.footer-feedback {
  flex: 1;
  text-align: right;
}

.feedback-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  padding: 12px 24px;
  background-color: #A3A3CC;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.feedback-link:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
  color: white;
}

.feedback-icon {
  font-size: 20px;
}

.feedback-note {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

/* Адаптивность */
@media (max-width: 992px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-nav-section {
    width: 100%;
  }
  
  .footer-nav {
    justify-content: center;
  }
  
  .footer-feedback {
    width: 100%;
    text-align: center;
  }
  
  .social-text {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .footer-nav {
    gap: 20px;
  }
  
  .feedback-link {
    font-size: 16px;
    padding: 10px 20px;
  }
}
</style>