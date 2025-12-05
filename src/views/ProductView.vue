<template>
  <div class="product-page">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <router-link :to="breadcrumbLink">{{ breadcrumbCategory }}</router-link>
          <span class="divider">/</span>
          <span class="current">{{ currentProduct.title }}</span>
        </nav>
      </div>
    </section>

    <!-- Основная информация о товаре -->
    <section class="product-main-section">
      <div class="container">
        <div class="product-layout">
          <!-- Изображение товара -->
          <div class="product-image">
            <img :src="currentProduct.image" :alt="currentProduct.title">
          </div>

          <!-- Информация о товаре -->
          <div class="product-info">
            <h1 class="product-title">{{ currentProduct.title }}</h1>
            
            <div class="availability">
              <span class="available">В наличии</span>
            </div>

            <div class="product-price">
              {{ formatPrice(currentProduct.price) }} ₽
            </div>

            

            <div class="product-materials">
              <strong>Материалы</strong>
              <p>{{ currentProduct.materials }}</p>
            </div>

          

          </div>
        </div>
      </div>
    </section>

    <!-- Рекомендуемые товары -->
    <section class="recommended-section">
      <div class="container">
        <h2 class="recommended-title">К букету можно добавить</h2>
        
        <div class="recommended-grid">
          <div v-for="product in recommendedProducts" :key="product.id" class="recommended-card" @click="goToProduct(product.id)">
            <div class="recommended-badge" v-if="product.isTop">TOP</div>
            <div class="recommended-image">
              <img :src="product.image" :alt="product.title">
            </div>
            <h3 class="recommended-product-title">{{ product.title }}</h3>
            <div class="recommended-price">{{ formatPrice(product.price) }} ₽</div>
            <button class="recommended-order-button" @click="goToProduct(product.id)">
              Посмотреть
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ProductView',
  data() {
    return {
      // Все товары из всех категорий
      allProducts: [
        // Букеты (id: 9-16)
        { id: 9, title: '"Cotton candy"', price: 6550, description: 'Нежные розы для романтического настроения' },
        { id: 10, title: '«Утро в Париже»', price: 4900, description: 'Яркие цветы в естественной композиции' },
        { id: 11, title: '"Кружева"', price: 8200, description: 'Редкие цветы для особого случая' },
        { id: 12, title: '"Passion"', price: 5800, description: 'Элегантные розы' },
        { id: 13, title: '"Milkshake”', price: 4500, description: 'Свежие розы - символ нежности' },
        { id: 14, title: '"Apple Jack"', price: 12500, description: 'Букет из премиальных роз' },
        { id: 15, title: '"Coco Choco"', price: 6700, description: 'Яркая композиция из сезонных цветов' },
        { id: 16, title: 'Букет из бело-розовых гортензий с эвкалиптом', price: 5200, description: '' },

        // Подарки (id: 1-8)
        { id: 1, title: 'Огромный плюшевый медведь Степан', price: 7777, description: 'Медведь, котрой понравиться каждому' },
        { id: 2, title: 'Корзина "Red"', price: 2777, description: 'Корзина для души сладкоежки' },
        { id: 3, title: 'Свеча ароматическая 100 мл', price: 1400, description: 'Премиальная свеча на любой запах' },
        { id: 4, title: 'Корзина "Tea Time"', price: 4550, description: 'Корзина подходящаяя для лучшего чаепития' },
        { id: 5, title: 'Плитка бельгийского шоколада', price: 1000, description: 'Изысканный шоколад для самых близких' },
        { id: 6, title: 'Сырное плато S', price: 2800, description: 'Яркая композиция для романтического вечера' },
        { id: 7, title: 'Связка гелиевых шаров "So this is love"', price: 1500, description: 'Лучшее дополнение для лучших поздравлений' },
        { id: 8, title: 'Связка гелиевых шаров "Красотка"', price: 2500, description: 'Для того, чтобы порадовать свою любимую крастоку' },

        // Цветы в коробках (id: 17-24)
        { id: 17, title: '"Дейнерис"', price: 7200, description: 'Элегантные белые розы в стильной коробке', materials: 'Бокс' },
        { id: 18, title: '«Батори»', price: 6800, description: 'Пушистые розы в романтичной упаковке', materials: 'Бокс' },
        { id: 19, title: '"Монако"', price: 8900, description: 'Разнообразие цветов в стильной коробке', materials: 'Бокс' },
        { id: 20, title: '"La Crème"', price: 5500, description: 'Яркие и разные цветы в современной прозрачной упаковке', materials: 'Бокс' },
        { id: 21, title: '"Moon"', price: 7500, description: 'Чистые белые хризантемы в минималистичной коробке', materials: 'Бокс' },
        { id: 22, title: 'Сумочка "Сюрприз"', price: 6200, description: 'Модные цветы в интересной упаковке', materials: 'Бокс' },
        { id: 23, title: '«Мишель»', price: 5800, description: 'Яркие розы в праздничной упаковке', materials: 'Бокс' },
        { id: 24, title: '«Мия»', price: 9500, description: 'Изысканный набор цветов в премиальной коробке', materials: 'Бокс' }
      ],
      
      // Рекомендуемые товары (можно менять логику подбора)
      recommendedProducts: [
        { id: 3, title: 'Свеча ароматическая 100 мл', price: 1400, description: 'Премиальная свеча на любой запах' },
        { id: 4, title: 'Корзина "Tea Time"', price: 4550, description: 'Корзина подходящаяя для лучшего чаепития' },
        { id: 5, title: 'Плитка бельгийского шоколада', price: 1000, description: 'Изысканный шоколад для самых близких' },
        { id: 6, title: 'Сырное плато S', price: 2800, description: 'Яркая композиция для романтического вечера' },
        { id: 7, title: 'Связка гелиевых шаров "So this is love"', price: 1500, description: 'Лучшее дополнение для лучших поздравлений' },
      ]
    }
  },
  computed: {
    // Текущий товар на основе ID из URL
    currentProduct() {
      const productId = parseInt(this.$route.params.id);
      const product = this.allProducts.find(p => p.id === productId);
      
      // Если товар не найден, показываем заглушку
      return product || {
        id: 0,
        title: 'Товар не найден',
        price: 0,
        description: 'Извините, товар не найден',
        category: 'Неизвестно',
        materials: 'Не указано',
        fullDescription: 'Запрошенный товар не существует или был удален',
        image: '/images/products/not-found.jpg'
      };
    },
    
    // Ссылка для хлебных крошек
    breadcrumbLink() {
      const category = this.currentProduct.category;
      switch(category) {
        case 'Букеты': return '/bouquets';
        case 'Подарки': return '/gifts';
        case 'Цветы в коробках': return '/box-flowers';
        default: return '/';
      }
    },
    
    // Название категории для хлебных крошек
    breadcrumbCategory() {
      return this.currentProduct.category;
    }
  },
  methods: {
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },
    
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`);
    },
    
    goToCheckout() {
      this.$router.push('/checkout');
    }
  },
  watch: {
    // При изменении ID в URL перезагружаем данные
    '$route.params.id': {
      handler() {
        // Здесь можно добавить логику загрузки данных
        console.log('ID товара изменен:', this.$route.params.id);
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.product-page {
  margin-top: 120px;
  min-height: 100vh;
  background-color: #ffffff;
}

/* Хлебные крошки */
.breadcrumb-section {
  background-color: #ffffff;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
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

/* Основная секция товара */
.product-main-section {
  padding: 50px 0;
  background-color: #ffffff;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.product-image {
  width: 100%;
  background-color: #B8B8B8;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px 0;
}

.product-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 32px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.availability {
  margin-bottom: 20px;
}

.available {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
}

.product-price {
  font-family: 'Russo One', sans-serif;
  font-size: 48px;
  color: #292966;
  margin-bottom: 30px;
  font-weight: bold;
}

.product-category,
.product-materials,
.product-description {
  margin-bottom: 25px;
}

.product-category strong,
.product-materials strong,
.product-description strong {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #292966;
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.product-category p,
.product-materials p,
.product-description p {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.order-button {
  background-color: #292966;
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 10px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 30px;
}

.order-button:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.3);
}

/* Секция рекомендованных товаров */
.recommended-section {
  padding: 60px 0;
  background-color: #f8f9fa;
  border-top: 3px solid #292966;
}

.recommended-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 28px;
  color: #292966;
  margin-bottom: 40px;
  text-align: center;
  font-weight: 600;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.recommended-card {
  background-color: #B8B8B8;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.recommended-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recommended-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #292966;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recommended-image {
  width: 100%;
  height: 120px;
  background-color: #A3A3CC;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.recommended-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommended-card:hover .recommended-image img {
  transform: scale(1.05);
}

.recommended-product-title {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
  color: #292966;
  line-height: 1.3;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommended-price {
  font-family: 'Albert Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #292966;
  margin-bottom: 15px;
}

.recommended-order-button {
  background-color: #A3A3CC;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.recommended-order-button:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .recommended-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .recommended-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-title {
    font-size: 28px;
  }
  
  .product-price {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .product-page {
    margin-top: 140px;
  }
  
  .recommended-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .product-title {
    font-size: 24px;
  }
  
  .product-price {
    font-size: 36px;
  }
  
  .recommended-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .product-page {
    margin-top: 160px;
  }
  
  .recommended-grid {
    grid-template-columns: 1fr;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 32px;
  }
  
  .order-button {
    padding: 16px 30px;
    font-size: 16px;
  }
}
</style>