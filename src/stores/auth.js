// src/stores/auth.js
import { supabase } from '@/config/supabase'

export const authStore = {
  // ===== БАЗОВЫЕ МЕТОДЫ =====
  
  // Получить текущего пользователя
  getCurrentUser() {
    const user = localStorage.getItem('current_user')
    return user ? JSON.parse(user) : null
  },

  // Проверить, авторизован ли пользователь
  isAuthenticated() {
    return !!this.getCurrentUser()
  },

  // Проверить, является ли текущий пользователь админом
  isCurrentUserAdmin() {
    const user = this.getCurrentUser()
    return user?.isAdmin === true
  },

  // ===== РЕГИСТРАЦИЯ (через Supabase) =====
  
  async register(name, email, password) {
    try {
      // 1. Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (authError) throw authError

      // 2. Создаем пользователя в таблице users
      const newUser = {
        id: authData.user?.id,
        email: email,
        name: name,
        password: password,
        bonuses: 500,
        is_admin: false,
        registered_at: new Date().toISOString()
      }

      const { error: dbError } = await supabase
        .from('users')
        .insert([newUser])

      if (dbError) throw dbError

      // 3. Сохраняем в localStorage для быстрого доступа
      const userForStorage = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        bonuses: newUser.bonuses,
        isAdmin: false
      }
      localStorage.setItem('current_user', JSON.stringify(userForStorage))

      // 🔔 ОТПРАВЛЯЕМ СОБЫТИЕ О ВХОДЕ
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail: userForStorage }))

      return { 
        success: true, 
        user: userForStorage,
        isAdmin: false
      }

    } catch (error) {
      console.error('Ошибка регистрации:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка при регистрации' 
      }
    }
  },

  // ===== ВХОД =====
  
  async login(email, password) {
    try {
      // 1. Вход в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // 2. Получаем данные пользователя из таблицы users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      // 3. Сохраняем в localStorage
      const userForStorage = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        bonuses: userData.bonuses,
        isAdmin: userData.is_admin || false
      }
      localStorage.setItem('current_user', JSON.stringify(userForStorage))

      // 🔔 ОТПРАВЛЯЕМ СОБЫТИЕ О ВХОДЕ
      window.dispatchEvent(new CustomEvent('user-logged-in', { detail: userForStorage }))

      return { 
        success: true, 
        user: userForStorage,
        isAdmin: userData.is_admin || false
      }

    } catch (error) {
      console.error('Ошибка входа:', error)
      return { 
        success: false, 
        error: error.message || 'Неверный email или пароль' 
      }
    }
  },

  // ===== ВЫХОД =====
  
  async logout() {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('current_user')
      
      // 🔔 ОТПРАВЛЯЕМ СОБЫТИЕ О ВЫХОДЕ
      window.dispatchEvent(new Event('user-logged-out'))
      
      return { success: true }
    } catch (error) {
      console.error('Ошибка выхода:', error)
      return { success: false, error: error.message }
    }
  },

  // ===== РАБОТА С БАЛЛАМИ =====
  
  getUserBonuses() {
    const user = this.getCurrentUser()
    return user?.bonuses || 0
  },

  async addBonuses(amount) {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    try {
      const newBonuses = (currentUser.bonuses || 0) + amount
      
      // Обновляем в Supabase
      const { error } = await supabase
        .from('users')
        .update({ bonuses: newBonuses })
        .eq('id', currentUser.id)

      if (error) throw error

      // Обновляем в localStorage
      currentUser.bonuses = newBonuses
      localStorage.setItem('current_user', JSON.stringify(currentUser))

      // 🔔 ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
      window.dispatchEvent(new CustomEvent('user-updated', { detail: currentUser }))

      return newBonuses
    } catch (error) {
      console.error('Ошибка начисления баллов:', error)
      return null
    }
  },

  async spendBonuses(amount) {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    const currentBonuses = currentUser.bonuses || 0
    if (currentBonuses < amount) return null

    try {
      const newBonuses = currentBonuses - amount
      
      // Обновляем в Supabase
      const { error } = await supabase
        .from('users')
        .update({ bonuses: newBonuses })
        .eq('id', currentUser.id)

      if (error) throw error

      // Обновляем в localStorage
      currentUser.bonuses = newBonuses
      localStorage.setItem('current_user', JSON.stringify(currentUser))

      // 🔔 ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
      window.dispatchEvent(new CustomEvent('user-updated', { detail: currentUser }))

      return newBonuses
    } catch (error) {
      console.error('Ошибка списания баллов:', error)
      return null
    }
  },

  // ===== ОБНОВЛЕНИЕ ПРОФИЛЯ =====
  
  async updateUserProfile(updatedData) {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    try {
      // Обновляем в Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedData.name,
          email: updatedData.email
        })
        .eq('id', currentUser.id)

      if (error) throw error

      // Обновляем в localStorage
      currentUser.name = updatedData.name
      currentUser.email = updatedData.email
      localStorage.setItem('current_user', JSON.stringify(currentUser))

      // 🔔 ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
      window.dispatchEvent(new CustomEvent('user-updated', { detail: currentUser }))

      return currentUser
    } catch (error) {
      console.error('Ошибка обновления профиля:', error)
      return null
    }
  },

  // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (для совместимости) =====
  
  // Получить всех пользователей (для админки)
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

  // Обновить баллы пользователя (для админки)
  async updateUserBonuses(userId, newBonuses) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ bonuses: newBonuses })
        .eq('id', userId)

      if (error) throw error

      // Если обновляем текущего пользователя
      const currentUser = this.getCurrentUser()
      if (currentUser && currentUser.id === userId) {
        currentUser.bonuses = newBonuses
        localStorage.setItem('current_user', JSON.stringify(currentUser))
        
        // 🔔 ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
        window.dispatchEvent(new CustomEvent('user-updated', { detail: currentUser }))
      }

      return true
    } catch (error) {
      console.error('Ошибка обновления баллов:', error)
      return false
    }
  }
}