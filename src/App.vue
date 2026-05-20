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

</style>
