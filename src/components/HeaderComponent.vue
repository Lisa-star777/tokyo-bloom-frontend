<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">Тоkyo Bloom</router-link>
        
        <nav>
          <ul class="nav-menu">
            <li><router-link to="/">ГЛАВНАЯ</router-link></li>
            <li><router-link to="/bouquets">БУКЕТЫ</router-link></li>
            <li><router-link to="/gifts">ПОДАРКИ</router-link></li>
            <li><router-link to="/box-flowers">ЦВЕТЫ В КОРОБКАХ</router-link></li>
            <li><router-link to="/certificates">СЕРТИФИКАТЫ</router-link></li>
            <li><router-link to="/about">О НАС</router-link></li>
          </ul>
        </nav>
        
        <div class="auth-buttons">
          <a href="#" class="auth-btn">Войти</a>
          <a href="#" class="auth-btn">Регистрация</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent'
}
</script>

<style scoped>
.header {
  background-color: #333333;
  padding: 35px 0;
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
}

.logo {
  color: white;
  font-size: 27px;
  font-weight: bold;
  text-decoration: none;
  font-family: 'Russo One', sans-serif;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
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

.auth-buttons {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
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
  font-size: 17px;
  white-space: nowrap;
}

.auth-btn:hover {
  background-color: white;
  color: #333333;
}

/* Адаптивность */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 0px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 15px;
  }
}
</style>