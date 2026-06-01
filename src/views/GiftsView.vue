<template>
  <div class="catalog-page">
    <section class="catalog-top-section">
      <div class="container">
        <div class="catalog-header">
          <h1 class="catalog-main-title">Подарки</h1>
          <p class="catalog-main-subtitle">Листайте, вдохновляйтесь, дарите!</p>
        </div>
      </div>
    </section>

    <div class="catalog-divider-container">
      <div class="container">
        <div class="catalog-divider"></div>
      </div>
    </div>

    <section class="catalog-products-section">
      <div class="container">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Загрузка товаров...</p>
        </div>
        <div v-else class="products-grid">
          <div 
            v-for="product in giftProducts" 
            :key="product.id" 
            class="product-card" 
            @click="goToProduct(product.id)"
          >
            <div class="product-image">
              <img 
                v-if="product.image_url" 
                :src="getImageUrl(product.image_url)" 
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
      </div>
    </section>
  </div>
</template>

<script>
import { adminStore } from '@/stores/admin'
import { API_BASE_URL } from '@/services/api'

export default {
  name: 'GiftsView',
  data() {
    return {
      loading: true,
      allProducts: []
    }
  },
  computed: {
    giftProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts.filter(p => p.category === 'gifts')
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
.catalog-page {
  margin-top: 120px !important;
  min-height: 100vh;
}

.loading {
  text-align: center;
  padding: 50px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #292966;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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

.product-card {
  background-color: #B8B8B8;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-height: 300px;
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

/* Мобильные стили для карточек (3 в ряд) */
@media (max-width: 768px) {
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
  
  .product-card .product-image {
    height: auto !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 6px !important;
    margin-bottom: 6px !important;
  }
  
  .product-card .product-image img {
    object-fit: cover !important;
  }
  
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
  
  .product-card .product-price {
    font-size: 13px !important;
    font-weight: 800 !important;
    margin: 4px 0 6px !important;
    color: #292966 !important;
  }
  
  .product-card .product-description {
    display: none !important;
  }
  
  .section-title {
    font-size: 22px !important;
    margin-bottom: 15px !important;
  }
}

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
