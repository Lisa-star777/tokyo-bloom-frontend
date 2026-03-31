// src/utils/migrateData.js
import { supabase } from '@/config/supabase'

// Функция для преобразования даты из формата "21.03.2026, 15:01:35" в ISO формат
function convertDate(dateStr) {
  if (!dateStr) return new Date().toISOString()
  if (dateStr.includes('T')) return dateStr
  
  try {
    const parts = dateStr.split(', ')
    const dateParts = parts[0].split('.')
    const timeParts = parts[1]?.split(':') || ['00', '00', '00']
    
    const year = dateParts[2]
    const month = dateParts[1].padStart(2, '0')
    const day = dateParts[0].padStart(2, '0')
    const hour = timeParts[0]?.padStart(2, '0') || '00'
    const minute = timeParts[1]?.padStart(2, '0') || '00'
    const second = timeParts[2]?.padStart(2, '0') || '00'
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
  } catch {
    return new Date().toISOString()
  }
}

// Функция для генерации кода сертификата
function generateCertificateCode() {
  return 'TOKYO-' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

export const migrateData = async () => {
  console.log('🚀 Начинаем перенос данных в Supabase...')

  // 1. Перенос пользователей
  const users = JSON.parse(localStorage.getItem('app_users') || '[]')
  console.log(`👥 Пользователей: ${users.length}`)
  
  for (const user of users) {
    // Для старых числовых ID генерируем UUID
    const userId = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
    
    const supabaseUser = {
      id: userId,
      email: user.email,
      name: user.name,
      password: user.password,
      bonuses: user.bonuses || 500,
      is_admin: user.isAdmin || false,
      registered_at: convertDate(user.registeredAt)
    }
    
    const { error } = await supabase
      .from('users')
      .insert([supabaseUser])
      .select()
    
    if (error) {
      console.error('Ошибка при переносе пользователя:', error.message)
    } else {
      console.log(`✅ Пользователь ${user.name} перенесён (новый ID: ${userId})`)
    }
  }

  // 2. Перенос товаров
  const products = JSON.parse(localStorage.getItem('shop_products') || '[]')
  console.log(`📦 Товаров: ${products.length}`)
  
  for (const product of products) {
    const supabaseProduct = {
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description || '',
      materials: product.materials || '',
      created_at: convertDate(product.createdAt)
    }
    
    const { error } = await supabase
      .from('products')
      .insert([supabaseProduct])
    
    if (error) console.error('Ошибка при переносе товара:', error.message)
  }
  console.log('✅ Товары перенесены')

  // 3. Перенос заказов (нужно сопоставить старые ID пользователей с новыми)
  const orders = JSON.parse(localStorage.getItem('shop_orders') || '[]')
  console.log(`📋 Заказов: ${orders.length}`)
  
  // Получаем всех пользователей для сопоставления
  const { data: allUsers } = await supabase.from('users').select('id, email')
  const emailToIdMap = {}
  allUsers?.forEach(u => { emailToIdMap[u.email] = u.id })
  
  for (const order of orders) {
    const newUserId = emailToIdMap[order.user?.email]
    if (!newUserId) {
      console.warn(`⚠️ Не найден пользователь для заказа ${order.id}, пропускаем`)
      continue
    }
    
    const supabaseOrder = {
      id: order.id,
      user_id: newUserId,
      items: order.items,
      subtotal: order.subtotal,
      delivery_cost: order.deliveryCost || 300,
      certificate_discount: order.certificateDiscount || 0,
      bonuses_used: order.bonusesUsed || 0,
      total: order.total,
      bonuses_earned: order.bonusesEarned || 0,
      certificate_used: order.certificateUsed || null,
      delivery_details: order.deliveryDetails || null,
      status: order.status || 'new',
      status_text: order.statusText || 'Новый',
      created_at: convertDate(order.createdAt),
      updated_at: convertDate(order.updatedAt)
    }
    
    const { error } = await supabase
      .from('orders')
      .insert([supabaseOrder])
    
    if (error) console.error('Ошибка при переносе заказа:', error.message)
  }
  console.log('✅ Заказы перенесены')

  // 4. Перенос сертификатов
  const certificates = JSON.parse(localStorage.getItem('shop_certificates') || '[]')
  console.log(`🎫 Сертификатов: ${certificates.length}`)
  
  for (const cert of certificates) {
    let code = cert.code
    if (!code || code === 'undefined') {
      code = generateCertificateCode()
    }
    
    const supabaseCert = {
      id: cert.id,
      code: code,
      value: cert.value || 0,
      status: cert.status || 'active',
      owner_email: cert.ownerEmail || null,
      buyer_name: cert.buyerName || null,
      used_at: cert.usedAt ? convertDate(cert.usedAt) : null,
      used_by: null, // будет заполнено позже
      order_id: cert.orderId || null,
      created_at: convertDate(cert.createdAt),
      expires_at: cert.expiresAt ? convertDate(cert.expiresAt) : null
    }
    
    const { error } = await supabase
      .from('certificates')
      .insert([supabaseCert])
    
    if (error) console.error('Ошибка при переносе сертификата:', error.message)
  }
  console.log('✅ Сертификаты перенесены')

  // 5. Перенос сообщений обратной связи
  const feedback = JSON.parse(localStorage.getItem('feedback_messages') || '[]')
  console.log(`💬 Сообщений: ${feedback.length}`)
  
  for (const msg of feedback) {
    const supabaseMsg = {
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || null,
      message: msg.message,
      status: msg.status || 'new',
      created_at: convertDate(msg.date)
    }
    
    const { error } = await supabase
      .from('feedback')
      .insert([supabaseMsg])
    
    if (error) console.error('Ошибка при переносе сообщения:', error.message)
  }
  console.log('✅ Сообщения перенесены')

  console.log('🎉 Перенос данных завершён!')
}