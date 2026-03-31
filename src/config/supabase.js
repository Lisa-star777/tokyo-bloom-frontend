// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

// ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ (из Project Settings → API)
const supabaseUrl = 'https://wspfquqcumshpddycpgr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcGZxdXFjdW1zaHBkZHljcGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTg5ODAsImV4cCI6MjA4OTk3NDk4MH0.tlSlxlJ9dixypOBex8WZ9V2EW1I-hsCpMhaDDexMyHk' // ваш anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Arton010422! ПАРОЛЬ


