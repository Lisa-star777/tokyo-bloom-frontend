import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CartView from '@/views/CartView.vue'
import ProfileView from '@/views/ProfileView.vue'
import FeedbackView from '@/views/FeedbackView.vue'
import OrdersView from '@/views/OrdersView.vue'
import TestAdminView from '@/views/TestAdminView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/bouquets',
    name: 'bouquets',
    component: () => import('@/views/BouquetsView.vue')
  },
  {
    path: '/gifts',
    name: 'gifts',
    component: () => import('@/views/GiftsView.vue')
  },
  {
    path: '/box-flowers',
    name: 'box-flowers', 
    component: () => import('@/views/BoxFlowersView.vue')
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('@/views/ProductView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/certificates',
    name: 'certificates',
    component: () => import('@/views/CertificatesView.vue')
  },
  {
    path: '/certificate-order',
    name: 'certificate-order',
    component: () => import('@/views/CertificateOrderView.vue')
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: FeedbackView
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView
  },
  {
    path: '/admin',
    name: 'admin',
    component: TestAdminView,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
  console.log('Переход на:', to.path)
  console.log('Требуется админ:', to.meta.requiresAdmin)
  
  // Проверка для админ-маршрутов
  if (to.meta.requiresAdmin) {
    // Получаем текущего пользователя из localStorage
    const userStr = localStorage.getItem('current_user')
    const user = userStr ? JSON.parse(userStr) : null
    
    console.log('Пользователь:', user)
    
    // Проверяем, является ли пользователь админом
    if (user && user.is_admin === true) {
      console.log('✅ Админ, пропускаем')
      next()
    } else {
      console.log('❌ Не админ, перенаправляем на главную')
      next('/')
    }
  } else {
    next()
  }
})

export default router