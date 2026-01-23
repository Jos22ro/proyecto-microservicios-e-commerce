import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { ErrorHandler, loadingManager } from '../utils/errorHandling'
import axios from 'axios'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    isLoading: false,
    error: null,
    notificationsConfig: {
      apiUrl: 'http://localhost:8082/api/v1',
      timeout: 10000
    },
    recentNotifications: []
  }),

  getters: {
    hasRecentNotifications: (state) => state.recentNotifications.length > 0,
    recentNotificationsSorted: (state) => {
      return [...state.recentNotifications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    }
  },

  actions: {
    clearError() {
      this.error = null
    },
    
    addRecentNotification(notification) {
      const recentNotification = {
        id: Date.now() + Math.random(),
        ...notification,
        timestamp: new Date().toISOString()
      }
      this.recentNotifications.unshift(recentNotification)
      if (this.recentNotifications.length > 10) {
        this.recentNotifications = this.recentNotifications.slice(0, 10)
      }
    },
    
    async sendNotification(event, email, orderId, extraData = '') {
      return await loadingManager.withLoading('sendNotification', async () => {
        this.error = null
        
        try {
          // CAMBIO CRÍTICO: Aunque el código fuente de Go diga string, 
          // el log del contenedor confirma que espera un 'uint'.
          // Usamos Number() para que el JSON sea un entero y no un texto.
          const payload = {
            event: String(event),
            email: String(email || ''),
            order_id: Number(orderId), 
            extra_data: String(extraData)
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
          
          if (response.status === 200 || response.status === 201) {
            const successMsg = response.data.message || 'Notificación enviada con éxito'
            
            this.addRecentNotification({
              event,
              email,
              order_id: orderId,
              extra_data: extraData,
              status: 'success',
              message: successMsg
            })
            
            return { success: true, message: successMsg }
          } else {
            throw new Error('Respuesta inesperada del servicio de notificaciones')
          }
          
        } catch (error) {
          // Capturamos el error específico que devuelve Gin (Go) si falla el binding
          const serverError = error.response?.data?.error || error.response?.data?.message;
          const errorInfo = ErrorHandler.handleApiError(error, 'sendNotification');
          
          this.error = serverError || errorInfo.message;
          
          this.addRecentNotification({
            event,
            email,
            order_id: orderId,
            extra_data: extraData,
            status: 'error',
            error: this.error
          })
          
          throw new Error(this.error)
        }
      })
    },
    
    async sendOrderConfirmation(orderId, email, customerName = '') {
      return await this.sendNotification(
        'order_created',
        email,
        orderId,
        customerName ? `Cliente: ${customerName}` : ''
      )
    },
    
    async sendPaymentConfirmation(orderId, email, amount) {
      return await this.sendNotification(
        'payment_confirmed',
        email,
        orderId,
        `Monto: $${amount}`
      )
    },
    
    async sendStatusChangeNotification(orderId, email, newStatus) {
      return await this.sendNotification(
        'status_changed',
        email,
        orderId,
        newStatus
      )
    },
    
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
    
    async sendCompletePaymentConfirmation(payment) {
      const authStore = useAuthStore()
      return await this.sendPaymentConfirmation(
        payment.order_id,
        authStore.user?.email || payment.email,
        payment.amount || payment.total
      )
    },
    
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
    
    clearRecentNotifications() {
      this.recentNotifications = []
    },
    
    resetStore() {
      this.clearError()
      this.clearRecentNotifications()
      this.isLoading = false
    }
  }
})