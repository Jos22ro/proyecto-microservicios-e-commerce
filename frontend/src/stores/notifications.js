import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { ErrorHandler, loadingManager } from '../utils/errorHandling'
import axios from 'axios'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    // Estado de notificaciones
    isLoading: false,
    error: null,
    
    // Configuración
    notificationsConfig: {
      apiUrl: '/api/notify',
      timeout: 10000
    },
    
    // Últimas notificaciones enviadas (para UI feedback)
    recentNotifications: []
  }),

  getters: {
    // Verificar si hay notificaciones recientes
    hasRecentNotifications: (state) => state.recentNotifications.length > 0,
    
    // Obtener notificaciones recientes ordenadas por tiempo
    recentNotificationsSorted: (state) => {
      return [...state.recentNotifications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    }
  },

  actions: {
    // Limpiar errores
    clearError() {
      this.error = null
    },
    
    // Agregar notificación al historial reciente
    addRecentNotification(notification) {
      const recentNotification = {
        id: Date.now() + Math.random(),
        ...notification,
        timestamp: new Date().toISOString()
      }
      
      this.recentNotifications.unshift(recentNotification)
      
      // Mantener solo las últimas 10 notificaciones
      if (this.recentNotifications.length > 10) {
        this.recentNotifications = this.recentNotifications.slice(0, 10)
      }
    },
    
    // Método genérico para enviar notificaciones
    async sendNotification(event, email, orderId, extraData = '') {
      const authStore = useAuthStore()
      
      return await loadingManager.withLoading('sendNotification', async () => {
        this.error = null
        
        try {
          const payload = {
            event,
            email,
            order_id: orderId,
            extra_data: extraData
          }
          
          const response = await axios.post(
            `${this.notificationsConfig.apiUrl}/notify`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: this.notificationsConfig.timeout
            }
          )
          
          if (response.data.message) {
            // Agregar al historial de notificaciones recientes
            this.addRecentNotification({
              event,
              email,
              order_id: orderId,
              extra_data: extraData,
              status: 'success',
              message: response.data.message
            })
            
            return { success: true, message: response.data.message }
          } else {
            throw new Error('Respuesta inesperada del servicio de notificaciones')
          }
          
        } catch (error) {
          const errorInfo = ErrorHandler.handleApiError(error, 'sendNotification')
          this.error = errorInfo.message
          
          // Agregar notificación fallida al historial para debugging
          this.addRecentNotification({
            event,
            email,
            order_id: orderId,
            extra_data: extraData,
            status: 'error',
            error: errorInfo.message
          })
          
          throw new Error(this.error)
        }
      })
    },
    
    // Confirmación de pedido creado
    async sendOrderConfirmation(orderId, email, customerName = '') {
      return await this.sendNotification(
        'order_created',
        email,
        orderId,
        customerName ? `Cliente: ${customerName}` : ''
      )
    },
    
    // Confirmación de pago aprobado
    async sendPaymentConfirmation(orderId, email, amount) {
      return await this.sendNotification(
        'payment_confirmed',
        email,
        orderId,
        `Monto: $${amount}`
      )
    },
    
    // Notificación de cambio de estado
    async sendStatusChangeNotification(orderId, email, newStatus) {
      return await this.sendNotification(
        'status_changed',
        email,
        orderId,
        newStatus
      )
    },
    
    // Confirmación de pedido con información completa
    async sendCompleteOrderConfirmation(order) {
      const authStore = useAuthStore()
      
      let extraData = `Total: $${order.total || order.amount || '0.00'}`
      
      if (order.items && Array.isArray(order.items)) {
        extraData += ` | Productos: ${order.items.length}`
      }
      
      return await this.sendOrderConfirmation(
        order.id || order.order_id,
        order.email || authStore.user?.email,
        order.customer_name || authStore.user?.name || ''
      )
    },
    
    // Confirmación de pago con información del pago
    async sendCompletePaymentConfirmation(payment) {
      const authStore = useAuthStore()
      
      return await this.sendPaymentConfirmation(
        payment.order_id,
        authStore.user?.email || payment.email,
        payment.amount || payment.total
      )
    },
    
    // Actualización de estado de pedido con tracking
    async sendOrderStatusUpdate(order, newStatus, trackingInfo = '') {
      const authStore = useAuthStore()
      
      let extraData = newStatus
      if (trackingInfo) {
        extraData += ` | Tracking: ${trackingInfo}`
      }
      
      return await this.sendStatusChangeNotification(
        order.id || order.order_id,
        authStore.user?.email || order.email,
        extraData
      )
    },
    
    // Limpiar notificaciones recientes
    clearRecentNotifications() {
      this.recentNotifications = []
    },
    
    // Limpiar store completo
    resetStore() {
      this.clearError()
      this.clearRecentNotifications()
      this.isLoading = false
    }
  }
})