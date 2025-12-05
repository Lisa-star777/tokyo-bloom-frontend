<template>
  <div class="catalog-page">
    <!-- Верхняя часть над карточками -->
    <section class="catalog-top-section">
      <div class="container">
        <div class="catalog-header">
          <h1 class="catalog-main-title">Цветы в коробках</h1>
          <p class="catalog-main-subtitle">Готовое счастье в коробке!</p>
        </div>
      </div>
    </section>

    <!-- Полоска между подзаголовком и каталогом -->
    <div class="catalog-divider-container">
      <div class="container">
        <div class="catalog-divider"></div>
      </div>
    </div>

    <!-- Сетка товаров -->
    <section class="catalog-products-section">
      <div class="container">
        <div class="products-grid">
          <div v-for="product in boxProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
            <div class="product-image">
              <div class="image-placeholder">{{ product.title }}</div>
            </div>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'BoxFlowersView',
  data() {
    return {
      boxProducts: [
        { id: 17, title: '"Дейнерис"', price: 7200, description: 'Элегантные белые розы в стильной коробке', materials: 'Бокс' },
        { id: 18, title: '«Батори»', price: 6800, description: 'Пушистые розы в романтичной упаковке', materials: 'Бокс' },
        { id: 19, title: '"Монако"', price: 8900, description: 'Разнообразие цветов в стильной коробке', materials: 'Бокс' },
        { id: 20, title: '"La Crème"', price: 5500, description: 'Яркие и разные цветы в современной прозрачной упаковке', materials: 'Бокс' },
        { id: 21, title: '"Moon"', price: 7500, description: 'Чистые белые хризантемы в минималистичной коробке', materials: 'Бокс' },
        { id: 22, title: 'Сумочка "Сюрприз"', price: 6200, description: 'Модные цветы в интересной упаковке', materials: 'Бокс' },
        { id: 23, title: '«Мишель»', price: 5800, description: 'Яркие розы в праздничной упаковке', materials: 'Бокс' },
        { id: 24, title: '«Мия»', price: 9500, description: 'Изысканный набор цветов в премиальной коробке', materials: 'Бокс' }
      ]
    }
  },
  methods: {
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },
    addToCart(productId) {
      alert('Товар добавлен в корзину! ID: ' + productId)
      console.log('Добавлен товар с ID:', productId)
    },
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style scoped>
.catalog-page {
  margin-top: 120px !important;
  min-height: 100vh;
}

/* Верхняя часть над карточками */
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

.catalog-main-subtitle {
  font-family: 'Albert Sans', sans-serif;
  font-size: 22px;
  color: #666;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

/* Контейнер для полоски */
.catalog-divider-container {
  background-color: #ffffff;
  padding: 0;
}



.catalog-products-section {
  padding: 20px 0 60px;
  background-color: #ffffff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin: 0 auto;
}

/* Стили для карточек товаров */
.product-card {
  background-color: #B8B8B8;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  background-color: #A3A3CC;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  position: relative;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  padding: 10px;
}

.product-title {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
  color: #292966;
  line-height: 1.3;
}

.product-description {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
  flex-grow: 1;
}

.product-price {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #292966;
  margin-bottom: 15px;
}

.product-button {
  background-color: #A3A3CC;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.product-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .catalog-main-title {
    font-size: 44px;
  }
  
  .catalog-main-subtitle {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .catalog-page {
    margin-top: 140px !important;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .catalog-main-title {
    font-size: 36px;
  }
  
  .catalog-main-subtitle {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .catalog-page {
    margin-top: 160px !important;
  }
  
  .catalog-main-title {
    font-size: 32px;
  }
  
  .catalog-main-subtitle {
    font-size: 16px;
  }
}
</style>