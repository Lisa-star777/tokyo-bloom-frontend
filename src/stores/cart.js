// src/stores/cart.js
import { supabase } from '@/config/supabase'

const CART_KEY = 'shopping_cart'

export const cartStore = {
  // ===== КОРЗИНА (оставляем в localStorage) =====
  
  getCart() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'))
    if (!currentUser) return []
    
    const allCarts = JSON.parse(localStorage.getItem(CART_KEY) || '{}')
    return allCarts[currentUser.id] || []
  },

  saveCart(cart) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'))
    if (!currentUser) return
    
    const allCarts = JSON.parse(localStorage.getItem(CART_KEY) || '{}')
    allCarts[currentUser.id] = cart
    localStorage.setItem(CART_KEY, JSON.stringify(allCarts))
    
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { count: this.getTotalCount() } 
    }))
  },

  getTotalCount() {
    const cart = this.getCart()
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  },

  addItem(product, quantity = 1) {
    console.log('Добавляем товар:', product)
    
    const cart = this.getCart()
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description || '',
        quantity: quantity,
        maxQuantity: 99
      })
    }
    
    this.saveCart(cart)
    console.log('Корзина после добавления:', cart)
    return cart
  },

  removeItem(productId) {
    const cart = this.getCart().filter(item => item.id !== productId)
    this.saveCart(cart)
    return cart
  },

  updateQuantity(productId, newQuantity) {
    const cart = this.getCart()
    const item = cart.find(item => item.id === productId)
    
    if (item) {
      if (newQuantity <= 0) {
        return this.removeItem(productId)
      }
      item.quantity = newQuantity
      this.saveCart(cart)
    }
    
    return cart
  },

  clearCart() {
    this.saveCart([])
  },

  getTotal() {
    const cart = this.getCart()
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },

  // ===== ЗАКАЗЫ (сохраняем в Supabase) =====

  async createOrderFromCart(userId, userInfo) {
    const cart = this.getCart()
    if (cart.length === 0) return null

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryCost = subtotal > 5000 ? 0 : 300
    const total = subtotal + deliveryCost
    const bonusesEarned = Math.floor(subtotal * 0.1)

    let certificateDiscount = 0
    if (userInfo.certificateUsed) {
      certificateDiscount = userInfo.certificateUsed.discount || 0
    }

    let bonusesUsed = 0
    if (userInfo.bonusesUsed) {
      bonusesUsed = userInfo.bonusesUsed
    }

    const finalTotal = Math.max(0, total - certificateDiscount - bonusesUsed)

    const newOrder = {
      id: 'ORD-' + Date.now(),
      user_id: userId,
      items: cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: subtotal,
      delivery_cost: deliveryCost,
      certificate_discount: certificateDiscount,
      bonuses_used: bonusesUsed,
      total: finalTotal,
      bonuses_earned: bonusesEarned,
      certificate_used: userInfo.certificateUsed || null,
      delivery_details: userInfo.deliveryDetails || null,
      status: 'new',
      status_text: 'Новый',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()

      if (error) throw error

      console.log('✅ Заказ создан в Supabase:', data)
      this.clearCart()
      window.dispatchEvent(new Event('orders-updated'))
      return data?.[0] || newOrder
    } catch (error) {
      console.error('❌ Ошибка создания заказа:', error)
      return null
    }
  },

  // Получить заказы пользователя из Supabase
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)   // ← ВАЖНО: user_id, а не userId
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('📋 Найдено заказов:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Ошибка получения заказов:', error)
      return []
    }
  },

  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Ошибка получения всех заказов:', error)
      return []
    }
  },

  async updateOrderStatus(orderId, newStatus, statusText) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_text: statusText,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      window.dispatchEvent(new Event('orders-updated'))
      return true
    } catch (error) {
      console.error('❌ Ошибка обновления статуса заказа:', error)
      return false
    }
  },

  // ===== СЕРТИФИКАТЫ (Supabase) =====

// Генерация короткого и уникального кода (без Math.random)
generateCertificateCode() {
  // Используем timestamp + короткая строка
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TOKYO-${timestamp}-${random}`
},

// Получить все сертификаты (с кэшированием)
async getAllCertificates() {
  // Если есть кэш и он свежий (5 минут), используем его
  if (this.certificatesCache && Date.now() - this.certificatesCacheTime < 300000) {
    return this.certificatesCache
  }
  
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Сохраняем в кэш
    this.certificatesCache = data || []
    this.certificatesCacheTime = Date.now()
    
    return this.certificatesCache
  } catch (error) {
    console.error('❌ Ошибка получения сертификатов:', error)
    return []
  }
},

// Создать новый сертификат (оптимизированная версия)
async createCertificate(certificateData) {
  try {
    // Генерируем код моментально
    const code = this.generateCertificateCode()
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()

    const newCertificate = {
      id: 'CERT-' + Date.now(),
      code: code,
      value: certificateData.value,
      status: 'active',
      owner_email: certificateData.ownerEmail || null,
      buyer_name: certificateData.buyerName || null,
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    }

    // Отправляем запрос и сразу возвращаем результат
    const { data, error } = await supabase
      .from('certificates')
      .insert([newCertificate])
      .select()
      .single() // .single() для одного результата

    if (error) throw error

    // Обновляем кэш (асинхронно, не блокируем)
    if (this.certificatesCache) {
      this.certificatesCache.unshift(data)
    }

    console.log('✅ Сертификат создан:', data.code)
    return data
  } catch (error) {
    console.error('❌ Ошибка создания сертификата:', error)
    return null
  }
},

// Проверить валидность сертификата (оптимизированная)
async validateCertificate(code) {
  // Сначала проверяем в кэше (быстро)
  if (this.certificatesCache) {
    const cachedCert = this.certificatesCache.find(c => c.code === code)
    if (cachedCert) {
      return this.checkCertificateValidity(cachedCert)
    }
  }
  
  // Если нет в кэше — идём в базу
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Сертификат не найден' }
    }

    return this.checkCertificateValidity(data)
  } catch (error) {
    console.error('❌ Ошибка проверки сертификата:', error)
    return { valid: false, error: 'Ошибка проверки' }
  }
},

// Вспомогательный метод для проверки валидности (без дублирования кода)
checkCertificateValidity(certificate) {
  if (certificate.status !== 'active') {
    return { valid: false, error: 'Сертификат уже использован' }
  }
  
  const expiresDate = new Date(certificate.expires_at)
  if (expiresDate < new Date()) {
    return { valid: false, error: 'Срок действия сертификата истек' }
  }
  
  return { valid: true, certificate }
},

// Использовать сертификат
async useCertificate(code, userId, orderId) {
  try {
    const { error } = await supabase
      .from('certificates')
      .update({
        status: 'used',
        used_at: new Date().toISOString(),
        used_by: userId,
        order_id: orderId
      })
      .eq('code', code)

    if (error) throw error

    // Обновляем кэш
    if (this.certificatesCache) {
      const index = this.certificatesCache.findIndex(c => c.code === code)
      if (index !== -1) {
        this.certificatesCache[index].status = 'used'
        this.certificatesCache[index].used_at = new Date().toISOString()
      }
    }

    console.log('✅ Сертификат использован:', code)
    return true
  } catch (error) {
    console.error('❌ Ошибка использования сертификата:', error)
    return false
  }
 }
}