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
.home-page { margin-top: 80px; }
.hero { padding: 100px 0; text-align: center; background: #ffffff; position: relative; }
.hero-content { position: relative; z-index: 2; }
.hero h1 { font-size: 48px; margin-bottom: 30px; font-weight: 700; font-family: 'Russo One', sans-serif; color: #292966; line-height: 1.2; }
.cta-button { display: inline-block; background-color: #292966; color: white; padding: 30px 60px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 23px; transition: all 0.3s ease; font-family: 'Albert Sans', sans-serif; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(41,41,102,0.3); }
.cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(41,41,102,0.5); background-color: #1a1a4d; }
.section-title { font-family: 'Russo One', sans-serif; font-size: 48px; text-align: center; margin-bottom: 60px; color: #292966; padding: 0 20px; }
.products-section { padding: 100px 0; }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; margin-bottom: 30px; }
.product-card { background-color: #B8B8B8; border-radius: 12px; padding: 20px; text-align: center; min-height: 380px; display: flex; flex-direction: column; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.product-image { width: 100%; height: 250px; background-color: #A3A3CC; border-radius: 8px; margin-bottom: 15px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.product-img { width: 100%; height: 100%; object-fit: cover; }
.image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; text-align: center; padding: 10px; }
.product-title { font-weight: 600; font-size: 20px; margin-bottom: 10px; color: #292966; line-height: 1.3; }
.product-description { font-size: 14px; color: #666; margin-bottom: 15px; line-height: 1.4; flex-grow: 1; }
.product-price { font-weight: 700; font-size: 20px; color: #292966; margin-bottom: 15px; }
.section-footer { display: flex; justify-content: flex-end; margin-top: 20px; }
.view-more-link { color: #292966; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border: 2px solid #292966; border-radius: 8px; }

/* Спиннер */
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; text-align: center; }
.loading-container p { font-family: 'Albert Sans', sans-serif; font-size: 16px; color: #666; margin-top: 15px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top: 4px solid #292966; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Адаптивность */
@media (max-width: 992px) { .products-grid { grid-template-columns: repeat(2, 1fr); } .section-title { font-size: 40px; } }
@media (max-width: 768px) { .hero h1 { font-size: 32px; } .cta-button { padding: 20px 40px; font-size: 18px; } .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .product-card { padding: 8px; min-height: auto; } .product-image { height: auto; aspect-ratio: 1/1; } .product-title { font-size: 14px; } .product-price { font-size: 16px; } .section-title { font-size: 28px; margin-bottom: 30px; } }
@media (max-width: 480px) { .hero h1 { font-size: 26px; } .cta-button { padding: 15px 30px; font-size: 16px; } .section-title { font-size: 22px; } .products-grid { gap: 6px; } .product-card { padding: 6px; } .product-title { font-size: 12px; } .product-price { font-size: 14px; } }
</style>

