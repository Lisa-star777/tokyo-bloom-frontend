<template>
  <div class="home-page">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-image"></div>
          <h1>ПОДАРОК, КОТОРЫЙ НЕ ЗАВЯНЕТ</h1>
          <router-link to="/certificates" class="cta-button">Купить сертификат</router-link>
        </div>
      </div>
    </section>

    <!-- Спиннер при загрузке -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка товаров...</p>
    </div>

    <!-- Товары -->
    <template v-else>
      <section class="products-section">
        <div class="container">
          <h2 class="section-title">Акции</h2>
          <div class="products-grid">
            <div v-for="product in promotionProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
              <div class="product-image">
                <img v-if="product.image_url" :src="getImageUrl(product.image_url)" :alt="product.title" class="product-img">
                <div v-else class="image-placeholder">{{ product.title }}</div>
              </div>
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
            </div>
          </div>
        </div>
      </section>

      <section class="products-section">
        <div class="container">
          <h2 class="section-title">Букеты</h2>
          <div class="products-grid">
            <div v-for="product in bouquetProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
              <div class="product-image">
                <img v-if="product.image_url" :src="getImageUrl(product.image_url)" :alt="product.title" class="product-img">
                <div v-else class="image-placeholder">{{ product.title }}</div>
              </div>
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
            </div>
          </div>
          <div class="section-footer">
            <router-link to="/bouquets" class="view-more-link">Смотреть больше →</router-link>
          </div>
        </div>
      </section>

      <section class="products-section">
        <div class="container">
          <h2 class="section-title">Подарки</h2>
          <div class="products-grid">
            <div v-for="product in giftProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
              <div class="product-image">
                <img v-if="product.image_url" :src="getImageUrl(product.image_url)" :alt="product.title" class="product-img">
                <div v-else class="image-placeholder">{{ product.title }}</div>
              </div>
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
            </div>
          </div>
          <div class="section-footer">
            <router-link to="/gifts" class="view-more-link">Смотреть больше →</router-link>
          </div>
        </div>
      </section>

      <section class="products-section">
        <div class="container">
          <h2 class="section-title">Цветы в коробках</h2>
          <div class="products-grid">
            <div v-for="product in boxProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
              <div class="product-image">
                <img v-if="product.image_url" :src="getImageUrl(product.image_url)" :alt="product.title" class="product-img">
                <div v-else class="image-placeholder">{{ product.title }}</div>
              </div>
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
            </div>
          </div>
          <div class="section-footer">
            <router-link to="/box-flowers" class="view-more-link">Смотреть больше →</router-link>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import SkeletonCard from '@/components/SkeletonCard.vue'
import { adminStore } from '@/stores/admin'
import { API_BASE_URL } from '@/services/api'

export default {
  name: 'HomeView',
  components: { SkeletonCard },
  data() {
    return {
      loading: true,
      allProducts: []
    }
  },
  computed: {
    promotionProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      const bouquets = this.allProducts.filter(p => p.category === 'bouquets').slice(0, 2)
      const gifts = this.allProducts.filter(p => p.category === 'gifts').slice(0, 1)
      const boxFlowers = this.allProducts.filter(p => p.category === 'box-flowers').slice(0, 1)
      return [...bouquets, ...gifts, ...boxFlowers]
    },
    bouquetProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts.filter(p => p.category === 'bouquets').slice(0, 4)
    },
    giftProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts.filter(p => p.category === 'gifts').slice(0, 4)
    },
    boxProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts.filter(p => p.category === 'box-flowers').slice(0, 4)
    }
  },
  async mounted() {
    await this.loadProducts()
  },
  methods: {
    getImageUrl(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      return API_BASE_URL + path
    },
    async loadProducts() {
      this.loading = true
      try {
        this.allProducts = await adminStore.getProducts()
        console.log('🏠 Загружено товаров для HomeView:', this.allProducts.length)
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        this.allProducts = []
      } finally {
        this.loading = false
      }
    },
    formatPrice(price) {
      return Math.round(price).toLocaleString('ru-RU');
    },
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style scoped>
.home-page {
  margin-top: 80px;
}

.hero {
  padding: 100px 0;
  text-align: center;
  background: #ffffff;
  position: relative;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 30px;
  font-weight: 700;
  font-family: 'Russo One', sans-serif;
  color: #292966;
  line-height: 1.2;
}

.cta-button {
  display: inline-block;
  background-color: #292966;
  color: white;
  padding: 30px 60px;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 23px;
  transition: all 0.3s ease;
  font-family: 'Albert Sans', sans-serif;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(41, 41, 102, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(41, 41, 102, 0.5);
  background-color: #1a1a4d;
}

/* ===== SECTION TITLES ===== */
.section-title {
  font-family: 'Russo One', sans-serif;
  font-size: 48px;
  text-align: center;
  margin-bottom: 60px;
  color: #292966;
  position: relative;
  padding: 0 20px;
}

/* ===== PRODUCTS SECTION ===== */
.products-section {
  padding: 100px 0;
  position: relative;
}

.products-section + .products-section {
  margin-top: 40px;
}

.products-section:nth-child(even) {
  background-color: #ffffff;
}

/* ===== PRODUCTS GRID ===== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 30px;
}

/* ===== PRODUCT CARDS ===== */
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
  height: 250px;
  background-color: #A3A3CC;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 20px;
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

/* Кнопка "Смотреть больше" */
.section-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.view-more-link {
  color: #292966;
  text-decoration: none;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #292966;
  border-radius: 8px;
}

.view-more-link:hover {
  color: #A3A3CC;
  border-color: #A3A3CC;
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .section-title {
    font-size: 44px;
    margin-bottom: 50px;
  }
  
  .products-section {
    padding: 90px 0;
  }
}

@media (max-width: 992px) {
  .section-title {
    font-size: 40px;
    margin-bottom: 45px;
  }
  
  .products-section {
    padding: 80px 0;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .catalog-page, .home-page {
    margin-top: 80px !important;
  }
  
  /* 3 карточки в ряд, вытянутые */
  .products-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }
  
  .product-card {
    padding: 6px !important;
    border-radius: 8px !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Квадратное изображение */
.product-card .product-image {
  height: auto !important;
  aspect-ratio: 1 / 1 !important;
}
  
  .product-card .product-image img {
    object-fit: cover !important;
  }
  
  /* Заголовок - 2 строки, вытягивает карточку */
  .product-card h3, 
  .product-card .product-title {
    font-size: 11px !important;
    margin: 4px 0 2px !important;
    line-height: 1.3 !important;
    min-height: 28px !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }
  
  /* Цена - крупная и жирная */
  .product-card .product-price {
    font-size: 13px !important;
    font-weight: 800 !important;
    margin: 4px 0 6px !important;
    color: #292966 !important;
  }
  
  /* Описание скрываем */
  .product-card .product-description {
    display: none !important;
  }
  
  .section-title {
    font-size: 22px !important;
    margin-bottom: 15px !important;
  }
  
  .view-more-link {
    font-size: 12px !important;
    padding: 8px 16px !important;
  }
  
  .section-footer {
    margin-top: 10px !important;
  }
}

/* Для очень маленьких телефонов (320-400px) */
@media (max-width: 400px) {
  .products-grid {
    gap: 5px !important;
  }
  
  .product-card {
    padding: 4px !important;
  }
  
  .product-card h3, 
  .product-card .product-title {
    font-size: 10px !important;
    min-height: 24px !important;
  }
  
  .product-card .product-price {
    font-size: 11px !important;
  }
}

@media (max-width: 480px) {
  .products-grid {
    gap: 8px !important;
  }
  .product-card {
    padding: 8px !important;
  }
  .product-card .product-image {
    height: 120px !important;
  }
  .product-card h3, .product-card .product-title {
    font-size: 12px !important;
  }
  .product-card .product-price {
    font-size: 12px !important;
  }
  .section-title {
    font-size: 20px !important;
  }
}
</style>
