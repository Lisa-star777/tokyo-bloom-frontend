// src/stores/admin.js
import api from '@/services/api';

export const adminStore = {
    // Проверка, админ ли пользователь
    isAdmin() {
        const user = JSON.parse(localStorage.getItem('current_user'));
        return user?.is_admin === true;
    },

    // Получить информацию об админе
    getAdminInfo() {
        return JSON.parse(localStorage.getItem('current_user'));
    },

    // ===== ТОВАРЫ =====
    
    async getProducts(forceRefresh = false) {
        try {
            const response = await api.get('/products');
            console.log('Загружено товаров:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка получения товаров:', error);
            return [];
        }
    },

   async addProduct(product, imageFile = null) {
    // Если есть файл — отправляем FormData
    if (imageFile) {
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('price', product.price);
        formData.append('category', product.category);
        formData.append('description', product.description || '');
        formData.append('materials', product.materials || '');
        formData.append('image', imageFile);
        
        try {
            const response = await api.post('/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
            return null;
        }
    }
    
    // Без файла — отправляем как JSON
    try {
        const response = await api.post('/admin/products', product);
        return response.data;
    } catch (error) {
        console.error('Ошибка добавления товара:', error);
        return null;
    }
},
        
        // Если есть файл — отправляем FormData
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('price', product.price);
        formData.append('category', product.category);
        formData.append('description', product.description || '');
        formData.append('materials', product.materials || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        try {
            const response = await api.post('/admin/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
            return null;
        }
    },

    async updateProduct(productId, updatedData, imageFile = null) {
        // Если есть image_url — отправляем как JSON
        if (updatedData.image_url && !imageFile) {
            try {
                const response = await api.put(`/admin/products/${productId}`, updatedData);
                return response.data;
            } catch (error) {
                console.error('Ошибка обновления товара:', error);
                return null;
            }
        }
        
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', updatedData.title);
        formData.append('price', updatedData.price);
        formData.append('category', updatedData.category);
        formData.append('description', updatedData.description || '');
        formData.append('materials', updatedData.materials || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        try {
            const response = await api.post(`/admin/products/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
            return null;
        }
    },

    async deleteProduct(productId) {
        try {
            await api.delete(`/admin/products/${productId}`);
            return true;
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            return false;
        }
    },

    // ===== ПОЛЬЗОВАТЕЛИ =====
    
    async getUsers() {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения пользователей:', error);
            return [];
        }
    },

    async updateUserBonuses(userId, newBonuses) {
        try {
            await api.put(`/admin/users/${userId}/bonuses`, { bonuses: newBonuses });
            return true;
        } catch (error) {
            console.error('Ошибка обновления бонусов:', error);
            return false;
        }
    },

    // ===== ЗАКАЗЫ =====
    
    async getOrders() {
        try {
            const response = await api.get('/admin/orders');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            return [];
        }
    },

    async updateOrderStatus(orderId, newStatus, statusText) {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus, status_text: statusText });
            return true;
        } catch (error) {
            console.error('Ошибка обновления статуса заказа:', error);
            return false;
        }
    },

    // ===== СЕРТИФИКАТЫ =====
    
    async getCertificates() {
        try {
            const response = await api.get('/admin/certificates');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения сертификатов:', error);
            return [];
        }
    },

    async createCertificate(certificateData) {
        try {
            const response = await api.post('/admin/certificates', certificateData);
            return response.data;
        } catch (error) {
            console.error('Ошибка создания сертификата:', error);
            return null;
        }
    },

    async deactivateCertificate(certificateId) {
        try {
            await api.delete(`/admin/certificates/${certificateId}`);
            return true;
        } catch (error) {
            console.error('Ошибка деактивации сертификата:', error);
            return false;
        }
    },

    // ===== СООБЩЕНИЯ =====
    
    async getFeedback() {
        try {
            const response = await api.get('/admin/feedback');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения сообщений:', error);
            return [];
        }
    },

    async markFeedbackAsRead(messageId) {
        try {
            await api.put(`/admin/feedback/${messageId}/read`);
            return true;
        } catch (error) {
            console.error('Ошибка отметки сообщения:', error);
            return false;
        }
    },

    async sendFeedbackReply(messageId, replyText) {
        try {
            const response = await api.post(`/admin/feedback/${messageId}/reply`, { reply_text: replyText });
            return response.data;
        } catch (error) {
            console.error('Ошибка отправки ответа:', error);
            return null;
        }
    },

    // ===== СТАТИСТИКА =====
    
    async getStats() {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return {
                totalUsers: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalCertificates: 0,
                totalFeedback: 0,
                newFeedback: 0,
                totalRevenue: 0,
                activeCertificates: 0
            };
        }
    }
};
