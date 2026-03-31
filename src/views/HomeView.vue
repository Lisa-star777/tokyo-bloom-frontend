<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-image">
            <!-- Placeholder для изображения сертификата -->
          </div>
          <h1>ПОДАРОК, КОТОРЫЙ НЕ ЗАВЯНЕТ</h1>
          <router-link to="/certificates" class="cta-button">Купить сертификат</router-link>
        </div>
      </div>
    </section>

    <!-- Акции -->
    <section class="products-section">
      <div class="container">
        <h2 class="section-title">Акции</h2>
        <div class="products-grid">
          <div v-for="product in promotionProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
            <div class="product-image">
              <img 
                v-if="product.image_url" 
                :src="product.image_url" 
                :alt="product.title"
                class="product-img"
              >
              <div v-else class="image-placeholder">{{ product.title }}</div>
            </div>
            <h3 class="product-title">{{ product.title }}</h3>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Букеты -->
    <section class="products-section">
      <div class="container">
        <h2 class="section-title">Букеты</h2>
        <div class="products-grid">
          <div v-for="product in bouquetProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
            <div class="product-image">
              <img 
                v-if="product.image_url" 
                :src="product.image_url" 
                :alt="product.title"
                class="product-img"
              >
              <div v-else class="image-placeholder">{{ product.title }}</div>
            </div>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
          </div>
        </div>
        <div class="section-footer">
          <router-link to="/bouquets" class="view-more-link">Смотреть больше </router-link>
        </div>
      </div>
    </section>

    <!-- Подарки -->
    <section class="products-section">
      <div class="container">
        <h2 class="section-title">Подарки</h2>
        <div class="products-grid">
          <div v-for="product in giftProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
            <div class="product-image">
              <img 
                v-if="product.image_url" 
                :src="product.image_url" 
                :alt="product.title"
                class="product-img"
              >
              <div v-else class="image-placeholder">{{ product.title }}</div>
            </div>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
          </div>
        </div>
        <div class="section-footer">
          <router-link to="/gifts" class="view-more-link">Смотреть больше </router-link>
        </div>
      </div>
    </section>

    <!-- Цветы в коробках -->
    <section class="products-section">
      <div class="container">
        <h2 class="section-title">Цветы в коробках</h2>
        <div class="products-grid">
          <div v-for="product in boxProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
            <div class="product-image">
              <img 
                v-if="product.image_url" 
                :src="product.image_url" 
                :alt="product.title"
                class="product-img"
              >
              <div v-else class="image-placeholder">{{ product.title }}</div>
            </div>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
          </div>
        </div>
        <div class="section-footer">
          <router-link to="/box-flowers" class="view-more-link">Смотреть больше </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { adminStore } from '@/stores/admin'

export default {
  name: 'HomeView',
  data() {
    return {
      loading: true,
      allProducts: []
    }
  },
  computed: {
    promotionProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts.slice(0, 4)
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
      if (!price && price !== 0) return '0'
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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
  font-size: 25px;
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
  .hero {
    margin-top: 140px;
    padding: 80px 0;
  }
  
  .hero h1 {
    font-size: 36px;
  }
  
  .cta-button {
    padding: 14px 35px;
    font-size: 16px;
  }
  
  .section-title {
    font-size: 36px;
    margin-bottom: 40px;
    padding: 0 15px;
  }
  
  .products-section {
    padding: 70px 0;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .section-footer {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero {
    margin-top: 160px;
    padding: 60px 0;
  }
  
  .hero h1 {
    font-size: 28px;
  }
  
  .cta-button {
    padding: 12px 30px;
    font-size: 15px;
  }
  
  .section-title {
    font-size: 32px;
    margin-bottom: 35px;
  }
  
  .products-section {
    padding: 60px 0;
  }
}
</style>