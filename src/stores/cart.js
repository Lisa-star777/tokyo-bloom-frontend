// src/stores/cart.js
import api from '@/services/api';

export const cartStore = {
    async getCart() {
        try {
            const response = await api.get('/cart');
            return response.data.items || [];
        } catch (error) {
            console.error('Ошибка получения корзины:', error);
            return [];
        }
    },

    async getTotalCount() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

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

    async removeItem(productId) {
        try {
            await api.delete(`/cart/items/${productId}`);
            await this.emitCartUpdate();
            return true;
        } catch (error) { return false; }
    },

    async updateQuantity(productId, newQuantity) {
        try {
            if (newQuantity <= 0) return await this.removeItem(productId);
            await api.put(`/cart/items/${productId}`, { quantity: newQuantity });
            await this.emitCartUpdate();
            return true;
        } catch (error) { return false; }
    },

    async clearCart() {
        try {
            await api.delete('/cart');
            await this.emitCartUpdate();
            return true;
        } catch (error) { return false; }
    },

    async createOrderFromCart(userId, userInfo) {
        try {
            const response = await api.post('/orders', userInfo);
            await this.clearCart();
            return response.data;
        } catch (error) { return null; }
    },

    async emitCartUpdate() {
        const count = await this.getTotalCount();
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
    }
};
