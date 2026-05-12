// src/stores/cart.js
import api from '@/services/api';
import { authStore } from '@/stores/auth';

export const cartStore = {
    // Получить корзину
    async getCart() {
        // Для гостей — localStorage
        if (!authStore.isAuthenticated()) {
            return JSON.parse(localStorage.getItem('guest_cart') || '[]');
        }
        // Для авторизованных — с сервера
        try {
            const response = await api.get('/cart');
            return response.data.items || [];
        } catch (error) {
            console.error('Ошибка получения корзины:', error);
            return [];
        }
    },

    saveCart(cart) {
        console.warn('saveCart устарел, корзина хранится на сервере');
    },

    async getTotalCount() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    async getTotal() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Добавить товар
    async addItem(product, quantity = 1) {
        // Для гостей — localStorage
        if (!authStore.isAuthenticated()) {
            let guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
            const existing = guestCart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += quantity;
            } else {
                guestCart.push({ id: product.id, title: product.title, price: product.price, quantity, description: product.description });
            }
            localStorage.setItem('guest_cart', JSON.stringify(guestCart));
            await this.emitCartUpdate();
            return true;
        }
        // Для авторизованных — на сервер
        try {
            await api.post('/cart/items', { product_id: product.id, quantity });
            await this.emitCartUpdate();
            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            return false;
        }
    },

    // Удалить товар
    async removeItem(productId) {
        if (!authStore.isAuthenticated()) {
            let guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
            guestCart = guestCart.filter(item => item.id !== productId);
            localStorage.setItem('guest_cart', JSON.stringify(guestCart));
            await this.emitCartUpdate();
            return true;
        }
        try {
            await api.delete(`/cart/items/${productId}`);
            await this.emitCartUpdate();
            return true;
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            return false;
        }
    },

    // Обновить количество
    async updateQuantity(productId, newQuantity) {
        if (!authStore.isAuthenticated()) {
            let guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
            if (newQuantity <= 0) {
                guestCart = guestCart.filter(item => item.id !== productId);
            } else {
                const item = guestCart.find(item => item.id === productId);
                if (item) item.quantity = newQuantity;
            }
            localStorage.setItem('guest_cart', JSON.stringify(guestCart));
            await this.emitCartUpdate();
            return true;
        }
        try {
            if (newQuantity <= 0) return await this.removeItem(productId);
            await api.put(`/cart/items/${productId}`, { quantity: newQuantity });
            await this.emitCartUpdate();
            return true;
        } catch (error) {
            console.error('Ошибка обновления количества:', error);
            return false;
        }
    },

    // Очистить корзину
    async clearCart() {
        if (!authStore.isAuthenticated()) {
            localStorage.removeItem('guest_cart');
            await this.emitCartUpdate();
            return true;
        }
        try {
            await api.delete('/cart');
            await this.emitCartUpdate();
            return true;
        } catch (error) {
            console.error('Ошибка очистки корзины:', error);
            return false;
        }
    },

    // Создать заказ из корзины
    async createOrderFromCart(userId, userInfo) {
        try {
            const response = await api.post('/orders', userInfo);
            await this.clearCart();
            window.dispatchEvent(new Event('orders-updated'));
            return response.data;
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            return null;
        }
    },

    async getUserOrders(userId) {
        try { const response = await api.get('/orders'); return response.data; }
        catch (error) { console.error('Ошибка получения заказов:', error); return []; }
    },

    async getAllOrders() {
        try { const response = await api.get('/admin/orders'); return response.data; }
        catch (error) { console.error('Ошибка получения заказов:', error); return []; }
    },

    async updateOrderStatus(orderId, newStatus, statusText) {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus, status_text: statusText });
            window.dispatchEvent(new Event('orders-updated'));
            return true;
        } catch (error) { console.error('Ошибка обновления статуса:', error); return false; }
    },

    async getAllCertificates() {
        try { const response = await api.get('/certificates'); return response.data; }
        catch (error) { console.error('Ошибка получения сертификатов:', error); return []; }
    },

    async createCertificate(certificateData) {
        try { const response = await api.post('/certificates', certificateData); return response.data; }
        catch (error) { console.error('Ошибка создания сертификата:', error); return null; }
    },

    async validateCertificate(code) {
        try { const response = await api.post('/certificates/validate', { code }); return response.data; }
        catch (error) { return { valid: false, error: 'Сертификат не найден' }; }
    },

    async useCertificate(code, userId, orderId) {
        try { await api.post('/certificates/use', { code, order_id: orderId }); return true; }
        catch (error) { console.error('Ошибка использования сертификата:', error); return false; }
    },

    async emitCartUpdate() {
        const count = await this.getTotalCount();
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
    }
};
