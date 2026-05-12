<template>
  <div class="product-page">
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

    <section class="product-main-section">
      <div class="container">
        <div class="product-layout">
          <div class="product-image">
            <img 
              v-if="currentProduct.image_url" 
              :src="getImageUrl(currentProduct.image_url)" 
              :alt="currentProduct.title"
              class="product-img"
            >
            <div v-else class="image-placeholder">{{ currentProduct.title }}</div>
          </div>

          <div class="product-info">
            <h1 class="product-title">{{ currentProduct.title }}</h1>

            <div class="product-price">
              {{ formatPrice(currentProduct.price) }} ₽
            </div>

            <div class="product-materials">
              <strong>Состав: </strong>
              <p>{{ currentProduct.materials || 'Не указаны' }}</p>
            </div>

            <div class="product-actions">
              <button class="add-to-cart-btn" @click="addToCart(currentProduct)">
                В корзину
              </button>
              <button class="buy-now-btn" @click="buyNow(currentProduct)">
                Купить сейчас
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="recommended-section">
      <div class="container">
        <h2 class="recommended-title">К букету можно добавить</h2>
        
        <div class="recommended-grid">
          <div 
            v-for="product in recommendedProducts" 
            :key="product.id" 
            class="recommended-card" 
            @click="goToProduct(product.id)"
          >
            <div class="recommended-badge" v-if="product.isTop">TOP</div>
            <div class="recommended-image">
              <img 
                v-if="product.image_url" 
                :src="getImageUrl(product.image_url)" 
                :alt="product.title"
              >
              <div v-else class="image-placeholder-sm">{{ product.title }}</div>
            </div>
            <h3 class="recommended-product-title">{{ product.title }}</h3>
            <div class="recommended-price">{{ formatPrice(product.price) }} ₽</div>
            <button class="recommended-order-button" @click.stop="goToProduct(product.id)">
              Посмотреть
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { adminStore } from '@/stores/admin'
import { cartStore } from '@/stores/cart'
import { authStore } from '@/stores/auth'
import { API_BASE_URL } from '@/services/api'
import { notifications } from '@/services/notifications'


export default {
  name: 'ProductView',
  data() {
    return {
      loading: true,
      allProducts: []
    }
  },
  computed: {
    currentProduct() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) {
        return {
          id: 0,
          title: 'Товар не найден',
          price: 0,
          description: 'Извините, товар не найден',
          materials: 'Не указано',
          category: 'Неизвестно',
          image_url: null
        }
      }
      const productId = parseInt(this.$route.params.id)
      const product = this.allProducts.find(p => p.id === productId)
      
      return product || {
        id: 0,
        title: 'Товар не найден',
        price: 0,
        description: 'Извините, товар не найден',
        materials: 'Не указано',
        category: 'Неизвестно',
        image_url: null
      }
    },
    
    breadcrumbCategory() {
      const category = this.currentProduct.category
      switch(category) {
        case 'bouquets': return 'Букеты'
        case 'gifts': return 'Подарки'
        case 'box-flowers': return 'Цветы в коробках'
        default: return 'Каталог'
      }
    },
    
    breadcrumbLink() {
      const category = this.currentProduct.category
      switch(category) {
        case 'bouquets': return '/bouquets'
        case 'gifts': return '/gifts'
        case 'box-flowers': return '/box-flowers'
        default: return '/'
      }
    },
    
    recommendedProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) return []
      return this.allProducts
        .filter(p => p.id !== this.currentProduct.id)
        .slice(0, 5)
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
        const products = await adminStore.getProducts()
        this.allProducts = Array.isArray(products) ? products : []
        console.log('📦 Загружено товаров для ProductView:', this.allProducts.length)
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
    },
    
        async addToCart(product) {
        const success = await cartStore.addItem(product, 1)
        if (success) notifications.success(`Товар ${product.title} теперь в корзине!`)
        else notifications.error('Ошибка при добавлении в корзину')
    },

    async buyNow(product) {
        if (!authStore.isAuthenticated()) {
            this.$emit('open-auth-modal')
            return
        }
        const success = await cartStore.addItem(product, 1)
        if (success) this.$router.push('/checkout')
    },
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

.product-info {
  padding: 20px 0;
}

.product-title {
  font-family: 'Russo One', sans-serif;  
  font-size: 47px;
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
  font-family: 'Albert Sans', sans-serif; 
  font-size: 42px;
  color: #292966;
  margin-bottom: 30px;
  font-weight: 700;
}

.product-materials {
  margin-bottom: 28px;
}

.product-materials strong {
  font-family: 'Albert Sans', sans-serif;
  font-size: 22px;
  color: #292966;
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.product-materials p {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Кнопки действий */
.product-actions {
  display: flex;
  gap: 15px;
  margin: 30px 0;
}

.add-to-cart-btn,
.buy-now-btn {
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: white;
  color: #292966;
  border: 2px solid #292966;
}

.add-to-cart-btn:hover,
.buy-now-btn:hover {
  background-color: #292966;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(41, 41, 102, 0.2);
}

.btn-icon {
  font-size: 20px;
}

/* Секция рекомендованных товаров */
.recommended-section {
  padding: 60px 0;
  background-color: #ffffff;
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
  background-color: #9887bc63;
  border-radius: 5px;
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
  height: 170px;
  background-color: #A3A3CC;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommended-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-placeholder-sm {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 10px;
  text-align: center;
  padding: 5px;
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
  
  .product-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .add-to-cart-btn,
  .buy-now-btn {
    padding: 14px;
    font-size: 16px;
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
}
</style>