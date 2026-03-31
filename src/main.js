import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { supabase } from './config/supabase'

const app = createApp(App)
app.use(router)
app.mount('#app')

// ===== ВРЕМЕННЫЙ КОД: СОЗДАНИЕ АДМИНИСТРАТОРА =====
const createAdminManually = async () => {
  console.log('🔧 Проверка...')
  
  // Проверяем, есть ли админ в таблице users
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@tokyobloom.ru')
    .maybeSingle()
  
  if (existingAdmin) {
    console.log('✅ Администратор уже существует!')
    console.log('📧 Email: admin@tokyobloom.ru')
    console.log('🔑 Пароль: admin123')
    return
  }
  
  // Получаем список пользователей из Auth (если есть)
  console.log('⚠️ Администратор не найден в таблице users')
  console.log('👉 Войдите в Supabase Dashboard и создайте пользователя вручную:')
  console.log('   Authentication → Users → Add User')
  console.log('   Email: admin@tokyobloom.ru')
  console.log('   Password: admin123')
}

createAdminManually()