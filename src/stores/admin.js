// src/stores/admin.js
import { supabase } from '@/config/supabase'

// Кэш для товаров
let productsCache = null
let productsCacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export const adminStore = {
  // ===== ПРОВЕРКА АДМИНА =====
  isAdmin() {
    const user = JSON.parse(localStorage.getItem('current_user'))
    return user?.isAdmin === true
  },

  getAdminInfo() {
    return JSON.parse(localStorage.getItem('current_user'))
  },

  // ===== УПРАВЛЕНИЕ ТОВАРАМИ С КЭШИРОВАНИЕМ =====
  
  async getProducts(forceRefresh = false) {
    const now = Date.now()
    if (!forceRefresh && productsCache && productsCacheTime && (now - productsCacheTime) < CACHE_DURATION) {
      console.log('📦 Используем кэш товаров')
      return productsCache
    }
    
    try {
      console.log('🔄 Загружаем товары из Supabase...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id')
      
      if (error) throw error
      
      productsCache = data || []
      productsCacheTime = now
      
      console.log(`✅ Загружено ${productsCache.length} товаров`)
      return productsCache
    } catch (error) {
      console.error('Ошибка получения товаров:', error)
      return productsCache || []
    }
  },

  async refreshProducts() {
    return await this.getProducts(true)
  },

  // ===== ЗАГРУЗКА ИЗОБРАЖЕНИЙ =====

  async uploadProductImage(file, productId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}.${fileExt}`
      const filePath = fileName
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      
      console.log('✅ Изображение загружено:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      return null
    }
  },

  async deleteProductImage(imageUrl) {
    if (!imageUrl) return true
    
    try {
      const fileName = imageUrl.split('/').pop()
      const { error } = await supabase.storage
        .from('product-images')
        .remove([fileName])
      
      if (error) throw error
      console.log('✅ Изображение удалено')
      return true
    } catch (error) {
      console.error('Ошибка удаления изображения:', error)
      return false
    }
  },

  // ===== ДОБАВЛЕНИЕ/ОБНОВЛЕНИЕ/УДАЛЕНИЕ ТОВАРОВ =====

  async addProduct(product, imageFile = null) {
    try {
      const newProduct = {
        id: Date.now(),
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description || '',
        materials: product.materials || '',
        image_url: null,
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
      
      if (error) throw error
      
      const addedProduct = data?.[0] || newProduct
      
      if (imageFile) {
        const imageUrl = await this.uploadProductImage(imageFile, addedProduct.id)
        if (imageUrl) {
          await this.updateProduct(addedProduct.id, { image_url: imageUrl })
          addedProduct.image_url = imageUrl
        }
      }
      
      await this.refreshProducts()
      return addedProduct
    } catch (error) {
      console.error('Ошибка добавления товара:', error)
      return null
    }
  },

  async updateProduct(productId, updatedData, imageFile = null) {
    try {
      if (imageFile) {
        const oldProduct = (await this.getProducts()).find(p => p.id === productId)
        if (oldProduct?.image_url) {
          await this.deleteProductImage(oldProduct.image_url)
        }
        
        const imageUrl = await this.uploadProductImage(imageFile, productId)
        if (imageUrl) {
          updatedData.image_url = imageUrl
        }
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', productId)
        .select()
      
      if (error) throw error
      
      await this.refreshProducts()
      return data?.[0] || null
    } catch (error) {
      console.error('Ошибка обновления товара:', error)
      return null
    }
  },

  async deleteProduct(productId) {
    try {
      const product = (await this.getProducts()).find(p => p.id === productId)
      if (product?.image_url) {
        await this.deleteProductImage(product.image_url)
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      
      if (error) throw error
      
      await this.refreshProducts()
      return true
    } catch (error) {
      console.error('Ошибка удаления товара:', error)
      return false
    }
  },

  // ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====
  
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('registered_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Ошибка получения пользователей:', error)
      return []
    }
  },

  async updateUserBonuses(userId, newBonuses) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ bonuses: newBonuses })
        .eq('id', userId)
      
      if (error) throw error
      
      const currentUser = JSON.parse(localStorage.getItem('current_user'))
      if (currentUser && currentUser.id === userId) {
        currentUser.bonuses = newBonuses
        localStorage.setItem('current_user', JSON.stringify(currentUser))
      }
      
      return true
    } catch (error) {
      console.error('Ошибка обновления баллов:', error)
      return false
    }
  },

  // ===== УПРАВЛЕНИЕ ЗАКАЗАМИ =====
  
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users!orders_user_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (ordersError) throw ordersError
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
        
        if (usersError) throw usersError
        
        const userMap = {}
        usersData?.forEach(user => {
          userMap[user.id] = { name: user.name, email: user.email }
        })
        
        return ordersData?.map(order => ({
          ...order,
          user: userMap[order.user_id] || { name: '—', email: '—' }
        })) || []
      }
      
      return data?.map(order => ({
        ...order,
        user: order.users || { name: '—', email: '—' }
      })) || []
    } catch (error) {
      console.error('❌ Ошибка получения заказов:', error)
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
      return true
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error)
      return false
    }
  },

  // ===== УПРАВЛЕНИЕ СЕРТИФИКАТАМИ =====
  
  async getCertificates() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Ошибка получения сертификатов:', error)
      return []
    }
  },

  async createCertificate(certificateData) {
    try {
      const code = 'TOKYO-' + Math.random().toString(36).substring(2, 10).toUpperCase()
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
      
      const { data, error } = await supabase
        .from('certificates')
        .insert([newCertificate])
        .select()
      
      if (error) throw error
      return data?.[0] || newCertificate
    } catch (error) {
      console.error('Ошибка создания сертификата:', error)
      return null
    }
  },

  async deactivateCertificate(certificateId) {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'used' })
        .eq('id', certificateId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Ошибка деактивации сертификата:', error)
      return false
    }
  },

  // ===== СООБЩЕНИЯ ОБРАТНОЙ СВЯЗИ =====

async getFeedback() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    console.log('📋 Загружено сообщений:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Ошибка получения сообщений:', error)
    return []
  }
},

async markFeedbackAsRead(messageId) {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'read' })
      .eq('id', messageId)
    
    if (error) throw error
    console.log('✅ Сообщение отмечено как прочитанное')
    return true
  } catch (error) {
    console.error('Ошибка отметки сообщения:', error)
    return false
  }
},

  // ===== СТАТИСТИКА =====
  
  async getStats() {
    try {
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError

      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      if (ordersError) throw ordersError

      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      if (productsError) throw productsError

      const { count: certificatesCount, error: certificatesError } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
      
      if (certificatesError) throw certificatesError

      const { count: feedbackCount, error: feedbackError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
      
      if (feedbackError) throw feedbackError

      const { data: ordersData, error: ordersDataError } = await supabase
        .from('orders')
        .select('total')
      
      if (ordersDataError) throw ordersDataError
      
      const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
      
      const { count: activeCertsCount, error: activeCertsError } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      if (activeCertsError) throw activeCertsError
      
      const { count: newFeedbackCount, error: newFeedbackError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
      
      if (newFeedbackError) throw newFeedbackError
      
      return {
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        totalCertificates: certificatesCount || 0,
        totalFeedback: feedbackCount || 0,
        newFeedback: newFeedbackCount || 0,
        totalRevenue: totalRevenue,
        activeCertificates: activeCertsCount || 0
      }
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCertificates: 0,
        totalFeedback: 0,
        newFeedback: 0,
        totalRevenue: 0,
        activeCertificates: 0
      }
    }
  }
}