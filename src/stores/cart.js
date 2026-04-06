// src/stores/cart.js
import api from '@/services/api';

export const cartStore = {
    // Получить корзину
    async getCart() {
        try {
            const response = await api.get('/cart');
            return response.data.items || [];
        } catch (error) {
            console.error('Ошибка получения корзины:', error);
            return [];
        }
    },

    // Сохранить корзину (больше не нужно, но оставим для совместимости)
    saveCart(cart) {
        // Корзина хранится на сервере, этот метод не используется
        console.warn('saveCart устарел, корзина хранится на сервере');
    },

    // Получить количество товаров в корзине
    async getTotalCount() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Получить общую сумму корзины
    async getTotal() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Добавить товар
    async addItem(product, quantity = 1) {
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
        try {
            if (newQuantity <= 0) {
                return await this.removeItem(productId);
            }
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
        console.log('Детали ошибки:', error.response?.data);
        return null;
    }
},

    // Получить заказы пользователя
    async getUserOrders(userId) {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            return [];
        }
    },

    // Получить все заказы (для админа)
    async getAllOrders() {
        try {
            const response = await api.get('/admin/orders');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            return [];
        }
    },

    // Обновить статус заказа
    async updateOrderStatus(orderId, newStatus, statusText) {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus, status_text: statusText });
            window.dispatchEvent(new Event('orders-updated'));
            return true;
        } catch (error) {
            console.error('Ошибка обновления статуса заказа:', error);
            return false;
        }
    },

    // Получить все сертификаты (с кэшированием)
    async getAllCertificates() {
        try {
            const response = await api.get('/certificates');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения сертификатов:', error);
            return [];
        }
    },

    // Создать сертификат
    async createCertificate(certificateData) {
        try {
            const response = await api.post('/certificates', certificateData);
            return response.data;
        } catch (error) {
            console.error('Ошибка создания сертификата:', error);
            return null;
        }
    },

    // Проверить сертификат
    async validateCertificate(code) {
        try {
            const response = await api.post('/certificates/validate', { code });
            return response.data;
        } catch (error) {
            return { valid: false, error: 'Сертификат не найден' };
        }
    },

    // Использовать сертификат
    async useCertificate(code, userId, orderId) {
        try {
            await api.post('/certificates/use', { code, order_id: orderId });
            return true;
        } catch (error) {
            console.error('Ошибка использования сертификата:', error);
            return false;
        }
    },

    // Отправить событие обновления корзины
    async emitCartUpdate() {
        const count = await this.getTotalCount();
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
    }
};