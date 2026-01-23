import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useCartStore } from './cart'
import { useNotificationsStore } from './notifications'
import { ErrorHandler, loadingManager } from '../utils/errorHandling'
import axios from 'axios'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    // Datos del formulario de pago
    paymentData: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      email: '',
      phone: ''
    },
    
    // Pago actual
    currentPayment: null,
    
    // Estado del pago
    paymentStatus: null, // PENDING, PROCESSING, APPROVED, REJECTED
    
    // Estados de UI
    isLoading: false,
    isProcessingPayment: false,
    error: null,
    
    // Historial de pagos
    paymentHistory: [],
    
    // Configuración
    paymentConfig: {
      apiUrl: import.meta.env.VITE_PAYMENTS_SERVICE_URL || 'http://localhost:8003/api',
      timeout: 30000
    }
  }),

  getters: {
    // Verificar si el formulario es válido
    isPaymentFormValid: (state) => {
      const { cardNumber, cardholderName, expiryDate, cvv, email } = state.paymentData
      
      // Validación básica
      const isCardNumberValid = cardNumber.replace(/\s/g, '').length >= 13 && cardNumber.replace(/\s/g, '').length <= 19
      const isCardholderNameValid = cardholderName.trim().length >= 3
      const isExpiryDateValid = expiryDate.length === 5 && expiryDate.includes('/')
      const isCvvValid = cvv.length >= 3 && cvv.length <= 4
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      
      return isCardNumberValid && isCardholderNameValid && isExpiryDateValid && isCvvValid && isEmailValid
    },
    
    // Obtener estado formateado para mostrar
    formattedPaymentStatus: (state) => {
      const statusMap = {
        'PENDING': { text: 'Pendiente', color: 'yellow', icon: 'clock' },
        'PROCESSING': { text: 'Procesando', color: 'blue', icon: 'refresh' },
        'APPROVED': { text: 'Aprobado', color: 'green', icon: 'check' },
        'REJECTED': { text: 'Rechazado', color: 'red', icon: 'x' }
      }
      
      return statusMap[state.paymentStatus] || { text: 'Desconocido', color: 'gray', icon: 'question' }
    },
    
    // Verificar si hay un pago en curso
    hasActivePayment: (state) => {
      return state.currentPayment && ['PENDING', 'PROCESSING'].includes(state.paymentStatus)
    }
  },

  actions: {
    // Limpiar datos del formulario
    clearPaymentData() {
      this.paymentData = {
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        email: '',
        phone: ''
      }
      this.error = null
    },
    
    // Formatear número de tarjeta
    formatCardNumber(number) {
      // Remover todos los espacios y caracteres no numéricos
      const cleaned = number.replace(/\D/g, '')
      // Agregar espacios cada 4 dígitos
      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
      return formatted
    },
    
    // Formatear fecha de expiración
    formatExpiryDate(date) {
      // Remover todos los caracteres no numéricos
      const cleaned = date.replace(/\D/g, '')
      // Formatear como MM/AA
      if (cleaned.length >= 3) {
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      }
      return cleaned
    },
    
    // Validar número de tarjeta con algoritmo Luhn
    validateCardNumber(number) {
      const cleaned = number.replace(/\D/g, '')
      let sum = 0
      let isEven = false
      
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i])
        
        if (isEven) {
          digit *= 2
          if (digit > 9) {
            digit -= 9
          }
        }
        
        sum += digit
        isEven = !isEven
      }
      
      return sum % 10 === 0
    },
    
    // Crear pago
    async createPayment(orderData) {
      const authStore = useAuthStore()
      const cartStore = useCartStore()
      const notificationsStore = useNotificationsStore()
      
      return await loadingManager.withLoading('createPayment', async () => {
        this.error = null
        
        try {
          // Validar que el usuario esté autenticado
          if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
          }
          
          // Validar que el carrito tenga items
          if (cartStore.items.length === 0) {
            throw new Error('El carrito está vacío')
          }
          
          // Preparar datos del pago
          const paymentData = {
            order_id: orderData.orderId || this.generateOrderId(),
            amount: orderData.amount || cartStore.totalAmount
          }
          
          // Realizar llamada a la API
          const response = await axios.post(
            `${this.paymentConfig.apiUrl}/payments`,
            paymentData,
            {
              headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'Content-Type': 'application/json'
              },
              timeout: this.paymentConfig.timeout
            }
          )
          
          if (response.data.success) {
            this.currentPayment = response.data.data
            this.paymentStatus = this.currentPayment.status
            
            // Guardar en historial
            this.paymentHistory.unshift({
              ...this.currentPayment,
              createdAt: new Date().toISOString()
            })
            
            // Enviar notificación de confirmación de pago (no bloqueante)
            try {
              await notificationsStore.sendPaymentConfirmation(
                this.currentPayment.order_id,
                authStore.user?.email,
                this.currentPayment.amount
              )
            } catch (notificationError) {
              // No fallar el flujo si la notificación falla
              console.warn('Error al enviar notificación de pago:', notificationError.message)
            }
            
            return this.currentPayment
          } else {
            throw new Error(response.data.error || 'Error al crear el pago')
          }
          
        } catch (error) {
          const errorInfo = ErrorHandler.handleApiError(error, 'createPayment')
          this.error = errorInfo.message
          throw new Error(this.error)
        }
      })
    },
    
    // Verificar estado del pago
    async checkPaymentStatus(paymentId) {
      const authStore = useAuthStore()
      
      return await loadingManager.withLoading('checkPaymentStatus', async () => {
        this.error = null
        
        try {
          const response = await axios.get(
            `${this.paymentConfig.apiUrl}/payments/${paymentId}`,
            {
              headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'Content-Type': 'application/json'
              },
              timeout: this.paymentConfig.timeout
            }
          )
          
          if (response.data.success) {
            this.currentPayment = response.data.data
            this.paymentStatus = this.currentPayment.status
            
            // Actualizar en historial si existe
            const historyIndex = this.paymentHistory.findIndex(p => p.id === paymentId)
            if (historyIndex !== -1) {
              this.paymentHistory[historyIndex] = {
                ...this.currentPayment,
                createdAt: this.paymentHistory[historyIndex].createdAt
              }
            }
            
            return this.currentPayment
          } else {
            throw new Error(response.data.error || 'Error al verificar el estado del pago')
          }
          
        } catch (error) {
          const errorInfo = ErrorHandler.handleApiError(error, 'checkPaymentStatus')
          this.error = errorInfo.message
          throw new Error(this.error)
        }
      })
    },
    
    // Obtener historial de pagos
    async fetchPaymentHistory() {
      const authStore = useAuthStore()
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(
          `${this.paymentConfig.apiUrl}/payments`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            },
            timeout: this.paymentConfig.timeout
          }
        )
        
        if (response.data.success) {
          this.paymentHistory = response.data.data || []
          return this.paymentHistory
        } else {
          throw new Error(response.data.error || 'Error al obtener el historial de pagos')
        }
        
      } catch (error) {
        console.error('Error fetching payment history:', error)
        
        if (error.response) {
          this.error = error.response.data.error || 'Error al obtener el historial'
        } else if (error.request) {
          this.error = 'Error de conexión al obtener el historial'
        } else {
          this.error = error.message || 'Error desconocido'
        }
        
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    // Procesar pago (simulación de procesamiento de tarjeta)
    async processPayment() {
      if (!this.isPaymentFormValid) {
        throw new Error('El formulario de pago no es válido')
      }
      
      this.isProcessingPayment = true
      this.error = null
      
      try {
        // Simular validación y procesamiento de tarjeta
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simular aprobación/rechazo (90% aprobación)
        const isApproved = Math.random() > 0.1
        
        if (isApproved) {
          this.paymentStatus = 'APPROVED'
        } else {
          this.paymentStatus = 'REJECTED'
          throw new Error('Pago rechazado por el banco')
        }
        
        return this.paymentStatus
        
      } catch (error) {
        this.paymentStatus = 'REJECTED'
        this.error = error.message || 'Error al procesar el pago'
        throw error
      } finally {
        this.isProcessingPayment = false
      }
    },
    
    // Limpiar estado actual
    clearCurrentPayment() {
      this.currentPayment = null
      this.paymentStatus = null
      this.error = null
    },
    
    // Generar ID de orden (simulado)
    generateOrderId() {
      return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },
    
    // Resetear store completo
    resetStore() {
      this.clearPaymentData()
      this.clearCurrentPayment()
      this.paymentHistory = []
      this.isProcessingPayment = false
    }
  }
})