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
</style>