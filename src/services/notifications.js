import Swal from 'sweetalert2'

// Настройка глобального z-index для всех модальных окон
Swal.defaultConfig = {
    ...Swal.defaultConfig,
    backdrop: true,
    customClass: {
        container: 'swal-container'
    }
}

// Устанавливаем высокий z-index через CSS
const style = document.createElement('style')
style.textContent = `
    .swal2-container {
        z-index: 10000 !important;
    }
    .swal2-popup {
        z-index: 10001 !important;
    }
    .swal2-backdrop {
        z-index: 9999 !important;
    }
`
document.head.appendChild(style)

// Стилизованные тост-уведомления
const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
        container: 'swal2-container',
        popup: 'swal2-popup'
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

export const notifications = {
    success(message) {
        toast.fire({
            icon: 'success',
            title: message,
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#4CAF50'
        })
    },

    error(message) {
        toast.fire({
            icon: 'error',
            title: message,
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#f44336'
        })
    },

    warning(message) {
        toast.fire({
            icon: 'warning',
            title: message,
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#ff9800'
        })
    },

    info(message) {
        toast.fire({
            icon: 'info',
            title: message,
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#2196f3'
        })
    },

    async confirm(message, title = 'Подтверждение') {
        const result = await Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#f44336',
            confirmButtonText: 'Да',
            cancelButtonText: 'Отмена',
            background: '#fff',
            color: '#2d2d2d',
            customClass: {
                container: 'swal2-container',
                popup: 'swal2-popup'
            }
        })
        return result.isConfirmed
    },

    addedToCart(productName) {
        const cleanName = productName.replace(/^["']|["']$/g, '').replace(/^«|»$/g, '')
        toast.fire({
            icon: 'success',
            title: 'В корзину!',
            text: cleanName,
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#4CAF50',
            timer: 2000
        })
    },

    needAuth() {
        toast.fire({
            icon: 'warning',
            title: 'Требуется вход',
            text: 'Войдите в аккаунт',
            background: '#fff',
            color: '#2d2d2d',
            iconColor: '#ff9800'
        })
    },

    loading(message = 'Загрузка...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
            customClass: {
                container: 'swal2-container',
                popup: 'swal2-popup'
            }
        })
    },

    closeLoading() {
        Swal.close()
    }
}