// src/stores/auth.js
import api from '@/services/api';

export const authStore = {
    // Получить текущего пользователя
    getCurrentUser() {
        const user = localStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    },

    // Проверить авторизацию
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Проверить, админ ли пользователь
    isCurrentUserAdmin() {
        const user = this.getCurrentUser();
        return user?.is_admin === true;
    },

    // Регистрация
    async register(name, email, password) {
        try {
            const response = await api.post('/register', { name, email, password });
            const { user, token } = response.data;
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('current_user', JSON.stringify(user));
            
            window.dispatchEvent(new CustomEvent('user-logged-in', { detail: user }));
            
            return { 
                success: true, 
                user,
                isAdmin: user.is_admin
            };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Ошибка при регистрации' 
            };
        }
    },

    // Вход
    async login(email, password) {
        try {
            const response = await api.post('/login', { email, password });
            const { user, token } = response.data;
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('current_user', JSON.stringify(user));
            
            window.dispatchEvent(new CustomEvent('user-logged-in', { detail: user }));
            
            return { 
                success: true, 
                user,
                isAdmin: user.is_admin
            };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Неверный email или пароль' 
            };
        }
    },

    // Выход
    async logout() {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            window.dispatchEvent(new Event('user-logged-out'));
        }
        return { success: true };
    },

    // Получить бонусы пользователя
    getUserBonuses() {
        const user = this.getCurrentUser();
        return user?.bonuses || 0;
    },

    // Обновить профиль
    async updateUserProfile(updatedData) {
        try {
            const response = await api.put('/user', updatedData);
            const updatedUser = response.data;
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser }));
            return updatedUser;
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return null;
        }
    },

    // Начислить бонусы (вызывается после заказа)
    async addBonuses(amount) {
        // Бонусы начисляются автоматически на сервере при создании заказа
        // Этот метод нужен для обновления локального хранилища
        const user = this.getCurrentUser();
        if (user) {
            user.bonuses = (user.bonuses || 0) + amount;
            localStorage.setItem('current_user', JSON.stringify(user));
            window.dispatchEvent(new CustomEvent('user-updated', { detail: user }));
        }
    },

    // Списать бонусы
    async spendBonuses(amount) {
        // Бонусы списываются на сервере при создании заказа
        // Этот метод нужен для обновления локального хранилища
        const user = this.getCurrentUser();
        if (user && (user.bonuses || 0) >= amount) {
            user.bonuses = (user.bonuses || 0) - amount;
            localStorage.setItem('current_user', JSON.stringify(user));
            window.dispatchEvent(new CustomEvent('user-updated', { detail: user }));
        }
    }
};