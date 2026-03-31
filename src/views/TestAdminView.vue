<template>
  <div class="admin-panel">
    <!-- Хлебные крошки -->
    <section class="breadcrumb-section">
      <div class="container">
        <nav class="breadcrumb">
          <router-link to="/">Главная</router-link>
          <span class="divider">/</span>
          <span class="current">Панель администратора</span>
        </nav>
      </div>
    </section>

    <div class="container">
      <!-- Шапка админки -->
      <div class="admin-header">
        <h1 class="page-title">Панель управления</h1>
      </div>

      <!-- Приветствие -->
      <div class="welcome-section">
        <h2 class="welcome-title">Здравствуйте, {{ adminInfo?.name || 'Администратор' }}!</h2>
        <p class="welcome-date">{{ currentDate }}</p>
      </div>

      <!-- Навигация по разделам -->
      <div class="admin-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-text">{{ tab.name }}</span>
        </button>
      </div>

      <!-- ===== ДАШБОРД ===== -->
      <div v-if="currentTab === 'dashboard'" class="tab-content">
        <h2 class="section-title">Статистика</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalUsers }}</span>
              <span class="stat-label">Пользователей</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalOrders }}</span>
              <span class="stat-label">Заказов</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalProducts }}</span>
              <span class="stat-label">Товаров</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalCertificates }}</span>
              <span class="stat-label">Сертификатов</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-value">{{ stats.totalFeedback }}</span>
              <span class="stat-label">Сообщений</span>
              <span v-if="stats.newFeedback > 0" class="stat-badge">{{ stats.newFeedback }}</span>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-info">
              <span class="stat-value">{{ formatPrice(stats.totalRevenue) }} ₽</span>
              <span class="stat-label">Выручка</span>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="quick-actions">
          <h3 class="subsection-title">Быстрые действия</h3>
          <div class="actions-grid">
            <button class="action-card" @click="currentTab = 'products'; showProductForm = true">
              <span class="action-icon">+</span>
              <span class="action-text">Добавить товар</span>
            </button>
            <button class="action-card" @click="currentTab = 'certificates'; showCertificateForm = true">
              <span class="action-icon">+</span>
              <span class="action-text">Создать сертификат</span>
            </button>
            <button class="action-card" @click="currentTab = 'feedback'">
              <span class="action-icon">💬</span>
              <span class="action-text">Сообщения <span v-if="stats.newFeedback > 0" class="action-badge">{{ stats.newFeedback }}</span></span>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== ТОВАРЫ ===== -->
      <div v-else-if="currentTab === 'products'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">Управление товарами</h2>
          <button class="add-btn" @click="showProductForm = true">
            <span class="add-icon">+</span>
            Добавить
          </button>
        </div>

        <!-- Форма добавления/редактирования товара -->
        <div v-if="showProductForm" class="form-card">
          <h3 class="form-title">{{ editingProduct ? 'Редактировать товар' : 'Новый товар' }}</h3>
          
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-group">
              <label class="form-label">Название</label>
              <input 
                type="text" 
                v-model="productForm.title"
                class="form-input"
                required
                placeholder="Введите название товара"
              >
            </div>

            <!-- ===== КАСТОМНАЯ ЗАГРУЗКА ИЗОБРАЖЕНИЯ ===== -->
            <div class="form-group">
              <label class="form-label">Изображение товара</label>
              <div class="file-upload-wrapper">
                <label class="file-upload-label">
                  <span class="upload-icon"></span>
                  <span class="upload-text">Выберите файл</span>
                  <input 
                    type="file" 
                    class="file-upload-input" 
                    @change="handleImageUpload"
                    accept="image/*"
                  >
                </label>
                <span class="file-name">{{ productForm.imageFile ? productForm.imageFile.name : (editingProduct?.image_url ? 'Файл выбран' : '') }}</span>
              </div>
              
              <!-- Превью нового изображения -->
              <div v-if="productForm.imagePreview" class="image-preview">
                <img :src="productForm.imagePreview" alt="Preview">
                <button type="button" class="remove-image" @click="removeImage">×</button>
              </div>
              
              <!-- Текущее изображение с кнопкой удаления -->
              <div v-else-if="editingProduct?.image_url" class="current-image-wrapper">
                <div class="current-image-preview">
                  <img :src="editingProduct.image_url" alt="Current image">
                  <button type="button" class="delete-image-btn" @click="deleteProductImage" title="Удалить изображение">
                    🗑️
                  </button>
                </div>
                <span class="current-image-label">Текущее изображение</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Категория</label>
                <select v-model="productForm.category" class="form-select" required>
                  <option value="bouquets">Букеты</option>
                  <option value="gifts">Подарки</option>
                  <option value="box-flowers">Цветы в коробках</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Цена</label>
                <input 
                  type="number" 
                  v-model="productForm.price"
                  class="form-input"
                  required
                  min="0"
                  placeholder="0"
                >
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Материалы</label>
              <input 
                type="text" 
                v-model="productForm.materials"
                class="form-input"
                placeholder="Например: Розы, упаковка, лента"
              >
            </div>

            <div class="form-group">
              <label class="form-label">Описание</label>
              <textarea 
                v-model="productForm.description"
                class="form-textarea"
                rows="3"
                placeholder="Описание товара"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelProductForm">Отмена</button>
              <button type="submit" class="save-btn">{{ editingProduct ? 'Сохранить' : 'Добавить' }}</button>
            </div>
          </form>
        </div>

        <!-- Список товаров -->
        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-header">
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-actions">
                <button class="edit-btn" @click="startEditProduct(product)" title="Редактировать">✎</button>
                <button class="delete-btn" @click="deleteProduct(product.id)" title="Удалить">×</button>
              </div>
            </div>
            
            <div class="product-details">
              <div class="product-image-mini">
                <img v-if="product.image_url" :src="product.image_url" :alt="product.title">
                <div v-else class="no-image">📷</div>
              </div>
              <p class="product-category">{{ getCategoryName(product.category) }}</p>
              <p class="product-price">{{ formatPrice(product.price) }} ₽</p>
              <p v-if="product.materials" class="product-materials">Состав: {{ product.materials }}</p>
              <p class="product-description">{{ product.description || 'Нет описания' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== ПОЛЬЗОВАТЕЛИ ===== -->
      <div v-else-if="currentTab === 'users'" class="tab-content">
        <h2 class="section-title">Управление пользователями</h2>

        <div class="users-list">
          <div v-for="user in users" :key="user.id" class="user-card">
            <div class="user-header">
              <div class="user-info">
                <h3 class="user-name">{{ user.name }}</h3>
                <p class="user-email">{{ user.email }}</p>
              </div>
              <span v-if="user.is_admin" class="admin-badge">Администратор</span>
            </div>
            
            
            <div class="user-bonuses-section">
              <div class="bonuses-info">
                <span class="bonuses-label">Бонусы:</span>
                <span class="bonuses-value">{{ user.bonuses || 0 }} баллов</span>
              </div>
              
              <div class="bonuses-controls">
                
                <div class="custom-bonus">
                  <input 
                    type="number" 
                    v-model.number="user.tempBonus"
                    class="bonus-input"
                    placeholder="Начислить"
                    min="0"
                  >
                  <button class="bonus-apply" @click="applyCustomBonuses(user)">✓</button>
                </div>
              </div>
            </div>

            <div class="user-footer">
              <span class="user-date"> Зарегистрирован: {{ user.registered_at || 'Дата не указана' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== ЗАКАЗЫ ===== -->
      <div v-else-if="currentTab === 'orders'" class="tab-content">
        <h2 class="section-title">Управление заказами</h2>

        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <div>
                <span class="order-number">{{ order.id }}</span>
                <span class="order-date">{{ order.created_at }}</span>
              </div>
              <div class="order-actions-header">
                <select 
                  v-model="order.status" 
                  class="status-select"
                  @change="updateOrderStatus(order)"
                >
                  <option value="new"> Новый</option>
                  <option value="processing"> В обработке</option>
                  <option value="confirmed"> Подтвержден</option>
                  <option value="delivered"> Доставлен</option>
                  <option value="cancelled"> Отменен</option>
                </select>
                <button class="view-order-btn" @click="openOrderDetails(order)">
                   Детали
                </button>
              </div>
            </div>

            <div class="order-details">
              <p><strong>Клиент:</strong> {{ order.user?.name || '—' }}</p>
              <p><strong>Email:</strong> {{ order.user?.email || '—' }}</p>
              <p><strong>Телефон отправителя:</strong> {{ order.delivery_details?.senderPhone || '—' }}</p>
              <p><strong>Сумма:</strong> {{ formatPrice(order.total) }} ₽</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== СЕРТИФИКАТЫ ===== -->
      <div v-else-if="currentTab === 'certificates'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">Управление сертификатами</h2>
          <button class="add-btn" @click="showCertificateForm = true">
            <span class="add-icon">+</span>
            Создать
          </button>
        </div>

        <!-- Форма создания сертификата -->
        <div v-if="showCertificateForm" class="form-card">
          <h3 class="form-title">Новый сертификат</h3>
          
          <form @submit.prevent="createCertificate" class="certificate-form">
            <div class="form-group">
              <label class="form-label">Номинал</label>
              <select v-model="certificateForm.value" class="form-select" required>
                <option value="3000">3 000 ₽</option>
                <option value="5000">5 000 ₽</option>
                <option value="10000">10 000 ₽</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Email получателя</label>
              <input 
                type="email" 
                v-model="certificateForm.ownerEmail"
                class="form-input"
                placeholder="email@example.com"
              >
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showCertificateForm = false">Отмена</button>
              <button type="submit" class="save-btn">Создать</button>
            </div>
          </form>
        </div>

        <!-- Список сертификатов -->
        <div class="certificates-grid">
          <div v-for="cert in certificates" :key="cert.id" class="certificate-card">
            <div class="certificate-header">
              <span class="certificate-id">{{ cert.id }}</span>
              <span class="certificate-status" :class="cert.status">{{ cert.status === 'active' ? 'Активен' : 'Использован' }}</span>
            </div>
            
            <div class="certificate-body">
              <div class="certificate-value">{{ formatPrice(cert.value) }} ₽</div>
              <p v-if="cert.owner_email" class="certificate-owner">📧 {{ cert.owner_email }}</p>
              <p class="certificate-date"> Создан: {{ cert.created_at }}</p>
              <p class="certificate-expires"> Истекает: {{ cert.expires_at }}</p>
            </div>

            <div class="certificate-footer">
              <button 
                v-if="cert.status === 'active'"
                class="deactivate-btn"
                @click="deactivateCertificate(cert.id)"
              >
                Деактивировать
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== СООБЩЕНИЯ ===== -->
      <div v-else-if="currentTab === 'feedback'" class="tab-content">
        <div class="section-header">
          <h2 class="section-title">Сообщения обратной связи</h2>
        </div>

        <div class="feedback-list">
          <div v-for="message in feedback" :key="message.id" class="feedback-card">
            <div class="feedback-header">
              <div class="feedback-info">
                <span class="feedback-name">{{ message.name }}</span>
                <span class="feedback-email">{{ message.email }}</span>
                <span class="feedback-date">{{ message.created_at }}</span>
              </div>
              <span class="feedback-status" :class="message.status">{{ message.status === 'new' ? 'Новое' : 'Прочитано' }}</span>
            </div>
            
            <div class="feedback-body">
              <p class="feedback-message">{{ message.message }}</p>
              <p v-if="message.phone" class="feedback-phone"> {{ message.phone }}</p>
            </div>

            <div class="feedback-footer">
              <div class="feedback-actions">
                <button 
                  v-if="message.status === 'new'"
                  class="mark-read-btn"
                  @click="markAsRead(message.id)"
                >
                  ✓ Отметить прочитанным
                </button>
                <button 
                  class="reply-btn"
                  @click="openReplyModal(message)"
                >
                  ✎ Ответить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно ответа на сообщение -->
    <div v-if="showReplyModal" class="reply-modal" @click="closeReplyModal">
      <div class="reply-modal-content" @click.stop>
        <button class="close-modal-btn" @click="closeReplyModal">×</button>
        <h3 class="reply-title">Ответ на сообщение</h3>
        <div class="original-message">
          <p><strong>От:</strong> {{ currentMessage?.name }} ({{ currentMessage?.email }})</p>
          <p><strong>Сообщение:</strong> {{ currentMessage?.message }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Ваш ответ</label>
          <textarea 
            v-model="replyText" 
            class="reply-textarea" 
            rows="4"
            placeholder="Введите ответ на сообщение..."
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="cancel-reply-btn" @click="closeReplyModal">Отмена</button>
          <button 
            class="send-reply-btn" 
            @click="sendReply" 
            :disabled="!replyText.trim() || isSending"
          >
            {{ isSending ? 'Отправка...' : 'Отправить ответ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно деталей заказа -->
    <div v-if="showOrderModal" class="order-modal" @click="closeOrderModal">
      <div class="order-modal-content" @click.stop>
        <button class="close-modal-btn" @click="closeOrderModal">×</button>
        
        <h3 class="order-modal-title">Детали заказа</h3>
        
        <div v-if="selectedOrder" class="order-details-full">
          <div class="detail-section">
            <h4>Информация о заказе</h4>
            <div class="detail-row">
              <span class="detail-label">Номер заказа:</span>
              <span class="detail-value">{{ selectedOrder.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата создания:</span>
              <span class="detail-value">{{ selectedOrder.created_at }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Статус:</span>
              <select v-model="selectedOrder.status" class="status-select-modal">
                <option value="new"> Новый</option>
                <option value="processing"> В обработке</option>
                <option value="confirmed"> Подтвержден</option>
                <option value="delivered"> Доставлен</option>
                <option value="cancelled"> Отменен</option>
              </select>
            </div>
          </div>

          <div class="detail-section">
            <h4>Клиент</h4>
            <div class="detail-row">
              <span class="detail-label">Имя:</span>
              <span class="detail-value">{{ selectedOrder.user?.name || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedOrder.user?.email || '—' }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="selectedOrder.delivery_details">
            <h4>Детали доставки</h4>
            <div class="detail-row">
              <span class="detail-label">Получатель:</span>
              <span class="detail-value">{{ selectedOrder.delivery_details.recipientName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Адрес:</span>
              <span class="detail-value">{{ selectedOrder.delivery_details.address }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ selectedOrder.delivery_details.recipientPhone }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Время доставки:</span>
              <span class="detail-value">{{ selectedOrder.delivery_details.deliveryTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Открытка:</span>
              <span class="detail-value">{{ selectedOrder.delivery_details.postcard || '—' }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Товары</h4>
            <div class="order-items-list">
              <div v-for="item in selectedOrder.items" :key="item.id" class="order-item-detail">
                <div class="item-info">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">{{ formatPrice(item.price * item.quantity) }} ₽</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Финансовая информация</h4>
            <div class="detail-row">
              <span class="detail-label">Сумма:</span>
              <span class="detail-value">{{ formatPrice(selectedOrder.subtotal) }} ₽</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Доставка:</span>
              <span class="detail-value">{{ formatPrice(selectedOrder.delivery_cost) }} ₽</span>
            </div>
            <div v-if="selectedOrder.certificate_discount" class="detail-row discount">
              <span class="detail-label">Сертификат:</span>
              <span class="detail-value">-{{ formatPrice(selectedOrder.certificate_discount) }} ₽</span>
            </div>
            <div v-if="selectedOrder.bonuses_used" class="detail-row discount">
              <span class="detail-label">Списано баллов:</span>
              <span class="detail-value">-{{ formatPrice(selectedOrder.bonuses_used) }} ₽</span>
            </div>
            <div class="detail-row total">
              <span class="detail-label">Итого:</span>
              <span class="detail-value">{{ formatPrice(selectedOrder.total) }} ₽</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Начислено баллов:</span>
              <span class="detail-value bonus">+{{ selectedOrder.bonuses_earned || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeOrderModal">Закрыть</button>
          <button class="save-btn" @click="updateOrderStatusFromModal">Сохранить изменения</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminStore } from '@/stores/admin'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '@/config/emailjs'

export default {
  name: 'AdminPanelView',
  data() {
    return {
      loading: true,
      currentTab: 'dashboard',
      showProductForm: false,
      showCertificateForm: false,
      showReplyModal: false,
      showOrderModal: false,
      selectedOrder: null,
      editingProduct: null,
      currentMessage: null,
      replyText: '',
      isSending: false,
      productForm: {
        title: '',
        category: 'bouquets',
        price: '',
        materials: '',
        description: '',
        imageFile: null,
        imagePreview: null
      },
      certificateForm: {
        value: '5000',
        ownerEmail: ''
      },
      statsData: {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCertificates: 0,
        totalFeedback: 0,
        newFeedback: 0,
        totalRevenue: 0,
        activeCertificates: 0
      },
      productsData: [],
      usersData: [],
      ordersData: [],
      certificatesData: [],
      feedbackData: [],
      tabs: [
        { id: 'dashboard', name: 'Дашборд', icon: '📊' },
        { id: 'products', name: 'Товары', icon: '📦' },
        { id: 'users', name: 'Пользователи', icon: '👥' },
        { id: 'orders', name: 'Заказы', icon: '📋' },
        { id: 'certificates', name: 'Сертификаты', icon: '🎫' },
        { id: 'feedback', name: 'Сообщения', icon: '💬' }
      ]
    }
  },
  computed: {
    adminInfo() {
      return adminStore.getAdminInfo()
    },
    currentDate() {
      return new Date().toLocaleString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    stats() {
      return this.statsData
    },
    products() {
      return this.productsData
    },
    users() {
      return this.usersData.filter(u => !u.is_admin)
    },
    orders() {
      return this.ordersData
    },
    certificates() {
      return this.certificatesData
    },
    feedback() {
      return this.feedbackData
    }
  },
  async mounted() {
    if (!adminStore.isAdmin()) {
      this.$router.push('/')
      return
    }
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)
    await this.loadAllData()
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        this.productForm.imageFile = file
        this.productForm.imagePreview = URL.createObjectURL(file)
      } else {
        alert('Пожалуйста, выберите изображение')
        event.target.value = ''
      }
    },

    removeImage() {
      this.productForm.imageFile = null
      this.productForm.imagePreview = null
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    },

    async deleteProductImage() {
      if (!confirm('Вы уверены, что хотите удалить изображение?')) return
      
      if (!this.editingProduct) return
      
      try {
        const imageDeleted = await adminStore.deleteProductImage(this.editingProduct.image_url)
        
        if (imageDeleted) {
          await adminStore.updateProduct(this.editingProduct.id, { image_url: null })
          await this.loadAllData()
          this.editingProduct.image_url = null
          this.productForm.imagePreview = null
          this.productForm.imageFile = null
          alert('✅ Изображение удалено')
        } else {
          alert('❌ Не удалось удалить изображение')
        }
      } catch (error) {
        console.error('Ошибка удаления изображения:', error)
        alert('❌ Ошибка при удалении изображения')
      }
    },

    async loadAllData() {
      this.loading = true
      try {
        console.log('🔄 Загрузка данных админ-панели...')
        this.statsData = await adminStore.getStats()
        this.productsData = await adminStore.getProducts()
        this.usersData = await adminStore.getUsers()
        this.ordersData = await adminStore.getOrders()
        this.certificatesData = await adminStore.getCertificates()
        this.feedbackData = await adminStore.getFeedback()
        console.log('✅ Данные загружены')
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error)
      } finally {
        this.loading = false
      }
    },

    formatPrice(price) {
      if (price === undefined || price === null) return '0'
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },

    getCategoryName(category) {
      const categories = {
        bouquets: 'Букеты',
        gifts: 'Подарки',
        'box-flowers': 'Цветы в коробках'
      }
      return categories[category] || category
    },

    handleLogout() {
      adminStore.logout()
      this.$router.push('/')
    },

    // ===== ТОВАРЫ =====
    cancelProductForm() {
      this.showProductForm = false
      this.editingProduct = null
      this.productForm = {
        title: '',
        category: 'bouquets',
        price: '',
        materials: '',
        description: '',
        imageFile: null,
        imagePreview: null
      }
    },

    startEditProduct(product) {
      this.editingProduct = product
      this.productForm = {
        ...product,
        imageFile: null,
        imagePreview: null
      }
      this.showProductForm = true
    },

    async saveProduct() {
      const productData = {
        title: this.productForm.title,
        price: Number(this.productForm.price),
        category: this.productForm.category,
        description: this.productForm.description || '',
        materials: this.productForm.materials || ''
      }

      let result
      if (this.editingProduct) {
        result = await adminStore.updateProduct(
          this.editingProduct.id,
          productData,
          this.productForm.imageFile
        )
        if (result) alert('✅ Товар обновлен')
      } else {
        result = await adminStore.addProduct(
          productData,
          this.productForm.imageFile
        )
        if (result) alert('✅ Товар добавлен')
      }

      if (result) {
        await this.loadAllData()
        this.cancelProductForm()
      }
    },

    async deleteProduct(id) {
      if (confirm('Удалить этот товар?')) {
        await adminStore.deleteProduct(id)
        await this.loadAllData()
      }
    },

    // ===== ПОЛЬЗОВАТЕЛИ =====
    copyPassword(password) {
      navigator.clipboard.writeText(password)
      alert('✅ Пароль скопирован в буфер обмена')
    },

    async addBonuses(user, amount) {
      const newBonuses = (user.bonuses || 0) + amount
      if (newBonuses >= 0) {
        await adminStore.updateUserBonuses(user.id, newBonuses)
        await this.loadAllData()
      }
    },

    async applyCustomBonuses(user) {
      if (user.tempBonus && user.tempBonus > 0) {
        await adminStore.updateUserBonuses(user.id, user.tempBonus)
        user.tempBonus = null
        await this.loadAllData()
      }
    },

    // ===== ЗАКАЗЫ =====
    async updateOrderStatus(order) {
      const statusMap = {
        new: 'Новый',
        processing: 'В обработке',
        confirmed: 'Подтвержден',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
      }
      await adminStore.updateOrderStatus(order.id, order.status, statusMap[order.status])
      alert(`✅ Статус заказа изменен на "${statusMap[order.status]}"`)
      await this.loadAllData()
    },

    openOrderDetails(order) {
      this.selectedOrder = order
      this.showOrderModal = true
    },

    closeOrderModal() {
      this.showOrderModal = false
      this.selectedOrder = null
    },

    async updateOrderStatusFromModal() {
      if (!this.selectedOrder) return

      const statusMap = {
        new: 'Новый',
        processing: 'В обработке',
        confirmed: 'Подтвержден',
        delivered: 'Доставлен',
        cancelled: 'Отменен'
      }

      await adminStore.updateOrderStatus(
        this.selectedOrder.id,
        this.selectedOrder.status,
        statusMap[this.selectedOrder.status]
      )

      alert(`✅ Статус заказа изменен на "${statusMap[this.selectedOrder.status]}"`)
      await this.loadAllData()
      this.closeOrderModal()
    },

    // ===== СЕРТИФИКАТЫ =====
    async createCertificate() {
      await adminStore.createCertificate({
        value: Number(this.certificateForm.value),
        ownerEmail: this.certificateForm.ownerEmail || null
      })
      
      this.certificateForm = { value: '5000', ownerEmail: '' }
      this.showCertificateForm = false
      alert('✅ Сертификат создан')
      await this.loadAllData()
    },

    async deactivateCertificate(id) {
      if (confirm('Деактивировать сертификат?')) {
        await adminStore.deactivateCertificate(id)
        await this.loadAllData()
      }
    },

    // ===== СООБЩЕНИЯ =====
    async markAsRead(id) {
      await adminStore.markFeedbackAsRead(id)
      await this.loadAllData()
    },

    openReplyModal(message) {
      this.currentMessage = message
      this.replyText = ''
      this.showReplyModal = true
    },

    closeReplyModal() {
      this.showReplyModal = false
      this.currentMessage = null
      this.replyText = ''
      this.isSending = false
    },

    async sendReply() {
      if (!this.replyText.trim()) {
        alert('Введите текст ответа')
        return
      }
      if (!this.currentMessage) {
        alert('Ошибка: сообщение не найдено')
        return
      }

      this.isSending = true

      try {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY)

        const templateParams = {
          to_email: this.currentMessage.email,
          to_name: this.currentMessage.name,
          reply_text: this.replyText,
          title: 'Ответ на ваше сообщение'
        }

        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams
        )

        await adminStore.markFeedbackAsRead(this.currentMessage.id)
        await this.loadAllData()

        alert(`✅ Ответ успешно отправлен на ${this.currentMessage.email}`)
        this.closeReplyModal()

      } catch (error) {
        console.error('❌ Ошибка отправки email:', error)
        alert(`❌ Ошибка при отправке: ${error.text || 'Попробуйте позже'}`)
      } finally {
        this.isSending = false
      }
    }
  }
}
</script>

<style scoped>
/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.admin-panel {
  margin-top: 120px;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Хлебные крошки */
.breadcrumb-section {
  background-color: #ffffff;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 32px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: #292966;
}

.breadcrumb .current {
  color: #292966;
  font-weight: 600;
}

.breadcrumb .divider {
  color: #999;
}

/* Шапка */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  font-family: 'Russo One', sans-serif;
  font-size: 36px;
  color: #292966;
  margin: 0;
}

.logout-btn {
  padding: 10px 24px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

/* Приветствие */
.welcome-section {
  margin-bottom: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #A3A3CC;
  border-radius: 12px;
}

.welcome-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.welcome-date {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Навигация */
.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #A3A3CC;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #f0f0f5;
}

.tab-btn.active {
  background-color: #292966;
  color: white;
}

.tab-icon {
  font-size: 18px;
}

/* Заголовки секций */
.section-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.subsection-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 28px;
  color: #292966;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #A3A3CC;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: 'Russo One', sans-serif;
  font-size: 32px;
  color: #292966;
  line-height: 1.2;
}

.stat-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.stat-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #ff6b6b;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
}

.revenue .stat-value {
  color: #292966;
}

/* Быстрые действия */
.quick-actions {
  margin-top: 32px;
}

.actions-grid {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #292966;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #292966;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 18px;
}

.action-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  background-color: #ff6b6b;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
}

/* Кнопки добавления */
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

/* Формы */
.form-card {
  background: white;
  border: 2px solid #A3A3CC;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #292966;
  margin: 0 0 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #A3A3CC;
  box-shadow: 0 0 0 3px rgba(163, 163, 204, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: none;
  border: 2px solid #e0e0e0;
  color: #666;
}

.cancel-btn:hover {
  border-color: #999;
  background-color: #f5f5f5;
}

.save-btn {
  background-color: #292966;
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(41, 41, 102, 0.3);
}

/* Товары */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.product-card:hover {
  border-color: #A3A3CC;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  border-color: #A3A3CC;
  background-color: #f8f9ff;
}

.delete-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.product-details {
  font-family: 'Albert Sans', sans-serif;
  font-size: 13px;
  color: #666;
}

.product-image-mini {
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-mini .no-image {
  font-size: 24px;
  color: #ccc;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #292966;
  margin: 10px 0;
}

/* Пользователи */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.user-card:hover {
  border-color: #A3A3CC;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.user-info h3 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #292966;
  margin: 0 0 4px 0;
}

.user-email {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.admin-badge {
  padding: 4px 12px;
  background-color: #A3A3CC;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.user-password-section {
  margin: 12px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.password-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #292966;
}

.password-value {
  font-family: monospace;
  font-size: 14px;
  color: #666;
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.copy-password-btn {
  padding: 4px 12px;
  background-color: #A3A3CC;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-password-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.user-bonuses-section {
  margin: 12px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.bonuses-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bonuses-label {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #666;
}

.bonuses-value {
  font-family: 'Russo One', sans-serif;
  font-size: 20px;
  color: #292966;
}

.bonuses-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.bonus-btn {
  padding: 6px 14px;
  background-color: #A3A3CC;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bonus-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.bonus-btn.minus {
  background-color: #ff6b6b;
}

.bonus-btn.minus:hover {
  background-color: #ff5252;
}

.custom-bonus {
  display: flex;
  gap: 5px;
}

.bonus-input {
  width: 100px;
  padding: 6px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
}

.bonus-apply {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.user-footer {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* Заказы */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #A3A3CC;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 10px;
}

.order-number {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
  margin-right: 15px;
}

.order-date {
  font-size: 12px;
  color: #999;
}

.status-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  background: white;
}

.order-details p {
  margin: 6px 0;
  font-size: 14px;
  color: #666;
}

.order-details strong {
  color: #292966;
}

/* Сертификаты */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.certificate-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #A3A3CC;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.certificate-id {
  font-family: monospace;
  font-size: 12px;
  color: #666;
}

.certificate-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.certificate-status.active {
  background-color: #4CAF50;
  color: white;
}

.certificate-status.used {
  background-color: #999;
  color: white;
}

.certificate-body {
  text-align: center;
  margin: 12px 0;
}

.certificate-value {
  font-family: 'Russo One', sans-serif;
  font-size: 28px;
  color: #292966;
  margin-bottom: 10px;
}

.certificate-owner,
.certificate-date,
.certificate-expires {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

.certificate-footer {
  text-align: center;
  margin-top: 12px;
}

.deactivate-btn {
  padding: 8px 16px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.deactivate-btn:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

/* Сообщения */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.feedback-card:hover {
  border-color: #A3A3CC;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.feedback-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.feedback-name {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
}

.feedback-email,
.feedback-date {
  font-size: 13px;
  color: #666;
}

.feedback-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.feedback-status.new {
  background-color: #4CAF50;
  color: white;
}

.feedback-status.read {
  background-color: #999;
  color: white;
}

.feedback-body {
  margin-bottom: 15px;
}

.feedback-message {
  font-size: 14px;
  color: #292966;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.feedback-phone {
  font-size: 13px;
  color: #666;
}

.feedback-footer {
  text-align: right;
}

.feedback-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.mark-read-btn,
.reply-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mark-read-btn {
  background-color: #A3A3CC;
  color: white;
  border: none;
}

.mark-read-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.reply-btn {
  background-color: #292966;
  color: white;
  border: none;
}

.reply-btn:hover {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

/* Модальное окно ответа */
.reply-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.reply-modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid #A3A3CC;
}

.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-modal-btn:hover {
  color: #292966;
}

.reply-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 20px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
}

.original-message {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #e0e0e0;
}

.original-message p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
}

.reply-textarea:focus {
  outline: none;
  border-color: #A3A3CC;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-reply-btn,
.send-reply-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-reply-btn {
  background: none;
  border: 2px solid #e0e0e0;
  color: #666;
}

.cancel-reply-btn:hover {
  border-color: #999;
  background-color: #f5f5f5;
}

.send-reply-btn {
  background-color: #292966;
  color: white;
  border: none;
}

.send-reply-btn:hover:not(:disabled) {
  background-color: #1a1a4d;
  transform: translateY(-2px);
}

.send-reply-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Модальное окно деталей заказа */
.order-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.order-modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid #A3A3CC;
}

.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-modal-btn:hover {
  color: #292966;
}

.order-modal-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 24px;
  color: #292966;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.detail-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-section h4 {
  font-family: 'Albert Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #292966;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #292966;
  text-align: right;
}

.detail-row.discount .detail-value {
  color: #4CAF50;
}

.detail-row.total .detail-value {
  font-family: 'Russo One', sans-serif;
  font-size: 18px;
  font-weight: bold;
}

.detail-row.bonus .detail-value {
  color: #4CAF50;
  font-weight: 600;
}

.status-select-modal {
  padding: 4px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Albert Sans', sans-serif;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.order-items-list {
  margin-top: 10px;
}

.order-item-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item-detail:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.item-title {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  color: #292966;
}

.item-quantity {
  font-family: 'Albert Sans', sans-serif;
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 12px;
}

.item-price {
  font-family: 'Albert Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #292966;
}

.order-actions-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.view-order-btn {
  padding: 6px 12px;
  background-color: #A3A3CC;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-order-btn:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

/* Превью изображения */
.image-preview {
  position: relative;
  margin-top: 10px;
  width: 120px;
  height: 120px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.remove-image:hover {
  background-color: #ff5252;
  transform: scale(1.05);
}

.current-image {
  margin-top: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.current-image span {
  font-size: 12px;
  color: #666;
}

.current-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

/* Кастомная кнопка загрузки файла */
.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #cccccc;
  color: #292966;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Albert Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.file-upload-label:hover {
  background-color: #9292c2;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 16px;
}

.file-upload-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.file-name {
  font-family: 'Albert Sans', sans-serif;
  font-size: 13px;
  color: #666;
  font-style: italic;
}

/* Текущее изображение с кнопкой удаления */
.current-image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.current-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  background-color: rgba(255, 107, 107, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  opacity: 0;
  transition: opacity 0.2s;
}

.current-image-preview:hover .delete-image-btn {
  opacity: 1;
}

.delete-image-btn:hover {
  background-color: #ff5252;
  transform: scale(1.05);
}

.current-image-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  display: block;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-panel {
    margin-top: 140px;
  }

  .page-title {
    font-size: 28px;
  }

  .admin-tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .actions-grid {
    flex-direction: column;
  }

  .user-password-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .bonuses-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-bonus {
    width: 100%;
  }

  .bonus-input {
    flex: 1;
  }

  .feedback-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .admin-panel {
    margin-top: 160px;
  }

  .page-title {
    font-size: 24px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .logout-btn {
    width: 100%;
    text-align: center;
  }

  .product-card {
    padding: 15px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-select {
    width: 100%;
  }

  .feedback-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>