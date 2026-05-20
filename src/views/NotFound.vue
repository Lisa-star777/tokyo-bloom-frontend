<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <h1 class="not-found-code">404</h1>
        <h2 class="not-found-title">Страница не найдена</h2>
        <p class="not-found-text">Извините, страница, которую вы ищете, не существует или была перемещена.</p>
        <router-link to="/" class="back-home-btn">Вернуться на главную</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  text-align: center;
}
.not-found-code {
  font-family: 'Russo One', sans-serif;
  font-size: 120px;
  color: #292966;
  margin: 0;
  line-height: 1;
}
.not-found-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 28px;
  color: #333;
  margin: 10px 0;
}
.not-found-text {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}
.back-home-btn {
  display: inline-block;
  padding: 14px 30px;
  background-color: #292966;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  transition: all 0.3s;
}
.back-home-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}
</style>
