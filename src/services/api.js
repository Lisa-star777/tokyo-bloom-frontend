import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})


// Интерсептор для добавления токена
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Интерсептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Токен истек, удаляем данные
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            window.dispatchEvent(new Event('user-logged-out'));
        }
        return Promise.reject(error);
    }
);

// Базовый URL для изображений
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Функция для получения полного URL изображения
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return API_BASE_URL + path;
};

export default api;