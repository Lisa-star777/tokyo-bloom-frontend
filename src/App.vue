<template>
  <div id="app">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from '@/components/HeaderComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  }
}
</script>

<style>
/* Импортируем шрифты - ДОЛЖНО БЫТЬ В САМОМ НАЧАЛЕ */
@import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;500;600;700&family=Russo+One&display=swap');

/* Глобальные стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Albert Sans', sans-serif;
  color: #292966;
  line-height: 1.6;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.product-card {
  background-color: #9887bc63 !important;
  border-radius: 5px !important;
}  

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.loading-container p {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-top: 15px;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}
.product-card .product-image,
.product-image {
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: #f0f0f0;
}
.product-card .product-image img,
.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}


.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #292966;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-inline {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

</style>
