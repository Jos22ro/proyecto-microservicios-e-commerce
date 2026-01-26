<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Estado del Pago</h1>
          <p class="mt-2 text-gray-600">
            Seguimiento en tiempo real de tu transacción
          </p>
        </div>
        
        <!-- Indicador de progreso -->
        <div class="hidden sm:flex items-center space-x-2">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span class="ml-2 text-sm text-gray-600">Carrito</span>
          </div>
          <div class="w-8 h-0.5 bg-green-600"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span class="ml-2 text-sm text-gray-600">Pago</span>
          </div>
          <div class="w-8 h-0.5" :class="statusProgressColor"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" :class="statusProgressBg">
              3
            </div>
            <span class="ml-2 text-sm" :class="statusProgressText">Confirmación</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Validación de ID de transacción -->
    <div v-if="!transactionId" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Transacción no encontrada</h3>
      <p class="mt-1 text-sm text-gray-500">
        No se proporcionó un ID de transacción válido.
      </p>
      <div class="mt-6">
        <router-link
          to="/cart"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          Ir al Carrito
        </router-link>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Estado del pago -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <StatusIndicator
          :status="currentStatus"
          :payment-details="currentPayment"
          :is-checking="isCheckingStatus"
          @retry-payment="handleRetryPayment"
          @continue-shopping="handleContinueShopping"
          @view-orders="handleViewOrders"
          @view-order-details="viewOrderDetails"
          @check-status="handleCheckStatus"
          @cancel="handleCancel"
        />
      </div>

      <!-- Detalles de la transacción -->
      <div v-if="currentPayment" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Detalles de la Transacción</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información de la transacción -->
          <div class="space-y-3">
            <div>
              <span class="text-sm text-gray-600">ID de Transacción:</span>
              <p class="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                {{ currentPayment.transaction_id }}
              </p>
            </div>
            
            <div>
              <span class="text-sm text-gray-600">ID del Pedido:</span>
              <p class="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                {{ currentPayment.order_id }}
              </p>
            </div>
            
            <div>
              <span class="text-sm text-gray-600">Estado:</span>
              <p>
                <span 
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    statusBadgeClass
                  ]"
                >
                  {{ statusConfig.text }}
                </span>
              </p>
            </div>
          </div>
          
          <!-- Información financiera -->
          <div class="space-y-3">
            <div>
              <span class="text-sm text-gray-600">Monto:</span>
              <p class="text-lg font-bold text-gray-900">
                ${{ formatPrice(currentPayment.amount) }}
              </p>
            </div>
            
            <div>
              <span class="text-sm text-gray-600">Fecha de Creación:</span>
              <p class="text-sm text-gray-900">
                {{ formatDate(currentPayment.created_at) }}
              </p>
            </div>
            
            <div v-if="currentPayment.updated_at !== currentPayment.created_at">
              <span class="text-sm text-gray-600">Última Actualización:</span>
              <p class="text-sm text-gray-900">
                {{ formatDate(currentPayment.updated_at) }}
              </p>
          </div>
        </div>
        
        <!-- Notificaciones Recientes -->
        <div v-if="notificationsStore.hasRecentNotifications" class="mt-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-900 mb-2">Notificaciones Enviadas</h3>
            <div class="space-y-2">
              <div 
                v-for="notification in notificationsStore.recentNotificationsSorted.slice(0, 3)" 
                :key="notification.id"
                class="text-sm"
              >
                <div class="flex items-center justify-between">
                  <span class="text-blue-700">
                    {{ getNotificationMessage(notification) }}
                  </span>
                  <span 
                    :class="notification.status === 'success' ? 'text-green-600' : 'text-red-600'"
                    class="text-xs"
                  >
                    {{ notification.status === 'success' ? '✓ Enviado' : '✗ Error' }}
                  </span>
                </div>
                <div class="text-xs text-blue-500">
                  {{ formatNotificationTime(notification.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Items del pedido -->
      <div v-if="orderItems && orderItems.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
        
        <div class="space-y-3">
          <div v-for="item in orderItems" :key="item.product_id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div class="flex items-center space-x-3">
              <!-- Imagen del producto -->
              <div class="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.image_url" 
                  :src="item.image_url" 
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <!-- Detalles -->
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-xs text-gray-500">{{ item.brand }} • SKU: {{ item.sku }}</p>
              </div>
            </div>
            
            <!-- Precio y cantidad -->
            <div class="text-right">
              <p class="text-sm text-gray-600">x{{ item.quantity }}</p>
              <p class="text-sm font-medium text-gray-900">
                ${{ formatPrice(item.price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Total -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-base font-medium text-gray-900">Total del Pedido:</span>
            <span class="text-lg font-bold text-indigo-600">
              ${{ formatPrice(currentPayment?.amount || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información de soporte -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-900 mb-3">¿Necesitas ayuda?</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <svg class="h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p class="text-sm text-gray-600 mb-1">Teléfono</p>
            <a href="tel:+1234567890" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              +1 (234) 567-890
            </a>
          </div>
          
          <div class="text-center">
            <svg class="h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-600 mb-1">Email</p>
            <a href="mailto:soporte@ejemplo.com" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              soporte@ejemplo.com
            </a>
          </div>
          
          <div class="text-center">
            <svg class="h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm text-gray-600 mb-1">Chat en vivo</p>
            <button class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Iniciar chat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentsStore } from '../stores/payments'
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { useAuthStore } from '../stores/auth'
import StatusIndicator from '../components/StatusIndicator.vue'

const route = useRoute()
const router = useRouter()
const paymentsStore = usePaymentsStore()
const cartStore = useCartStore()
const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()

// Estado
const isCheckingStatus = ref(false)
const pollingInterval = ref(null)
const orderItems = ref([])

// Computed properties
const transactionId = computed(() => route.params.transactionId)

const currentPayment = computed(() => paymentsStore.currentPayment)

const currentStatus = computed(() => paymentsStore.paymentStatus)

const statusConfig = computed(() => {
  const configs = {
    'PENDING': { text: 'Pendiente', color: 'yellow' },
    'PROCESSING': { text: 'Procesando', color: 'blue' },
    'APPROVED': { text: 'Aprobado', color: 'green' },
    'REJECTED': { text: 'Rechazado', color: 'red' }
  }
  return configs[currentStatus.value] || configs['PENDING']
})

const statusBadgeClass = computed(() => {
  const colorClasses = {
    'yellow': 'bg-yellow-100 text-yellow-800',
    'blue': 'bg-blue-100 text-blue-800',
    'green': 'bg-green-100 text-green-800',
    'red': 'bg-red-100 text-red-800'
  }
  return colorClasses[statusConfig.value.color] || colorClasses['yellow']
})

const statusProgressColor = computed(() => {
  if (currentStatus.value === 'APPROVED') return 'bg-green-600'
  if (currentStatus.value === 'PROCESSING') return 'bg-blue-600'
  return 'bg-gray-300'
})

const statusProgressBg = computed(() => {
  if (currentStatus.value === 'APPROVED') return 'bg-green-600 text-white'
  if (currentStatus.value === 'PROCESSING') return 'bg-blue-600 text-white'
  return 'bg-gray-300 text-gray-600'
})

const statusProgressText = computed(() => {
  if (currentStatus.value === 'APPROVED') return 'text-gray-600'
  if (currentStatus.value === 'PROCESSING') return 'text-gray-600'
  return 'text-gray-400'
})

// Métodos
const checkPaymentStatus = async () => {
  if (!transactionId.value) return
  
  isCheckingStatus.value = true
  
  try {
    await paymentsStore.checkPaymentStatus(transactionId.value)
  } catch (error) {
    console.error('Error checking payment status:', error)
  } finally {
    isCheckingStatus.value = false
  }
}

const startPolling = () => {
  // Iniciar polling para estados pendientes/procesando
  if (['PENDING', 'PROCESSING'].includes(currentStatus.value)) {
    pollingInterval.value = setInterval(() => {
      checkPaymentStatus()
    }, 3000) // Verificar cada 3 segundos
  }
}

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

const handleRetryPayment = () => {
  // Limpiar estado actual
  paymentsStore.clearCurrentPayment()
  
  // Redirigir a la pasarela de pago
  router.push('/payment-gateway')
}

const handleContinueShopping = () => {
  // Redirigir al catálogo
  router.push('/catalog')
}

const handleViewOrders = () => {
  // Redirigir a la página de órdenes del usuario
  router.push('/orders')
}

const viewOrderDetails = () => {
  if (currentPayment.value?.order_id) {
    router.push(`/orders/${currentPayment.value.order_id}`)
  }
}

const handleCheckStatus = () => {
  checkPaymentStatus()
}

const handleCancel = () => {
  // Redirigir al carrito
  router.push('/cart')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Watchers
watch(currentStatus, (newStatus) => {
  // Manejar cambios de estado
  if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
    // Detener polling cuando el pago esté completo
    stopPolling()
    
    // Si fue aprobado, limpiar el carrito y enviar notificación
    if (newStatus === 'APPROVED') {
      cartStore.clearCart()
      
      // Enviar notificación de cambio de estado (no bloqueante)
      try {
        const notificationsStore = useNotificationsStore()
        if (paymentsStore.currentPayment) {
          notificationsStore.sendStatusChangeNotification(
            { id: paymentsStore.currentPayment.order_id, email: authStore.user?.email },
            'APPROVED',
            'Pago procesado exitosamente'
          )
        }
      } catch (notificationError) {
        console.warn('Error al enviar notificación de aprobación:', notificationError.message)
      }
    }
  } else if (['PENDING', 'PROCESSING'].includes(newStatus)) {
    // Iniciar polling para estados intermedios
    startPolling()
  }
})

// Ciclo de vida
onMounted(async () => {
  // Verificar que haya un ID de transacción
  if (!transactionId.value) {
    router.push('/cart')
    return
  }
  
  // Verificar estado inicial del pago
  await checkPaymentStatus()
  
  // Iniciar polling si es necesario
  startPolling()
})

onUnmounted(() => {
  // Limpiar polling al salir del componente
  stopPolling()
})

// Helper functions
const getNotificationMessage = (notification) => {
  const messages = {
    'order_created': 'Pedido confirmado',
    'payment_confirmed': 'Pago aprobado',
    'status_changed': 'Estado actualizado'
  }
  return messages[notification.event] || 'Notificación enviada'
}

const formatNotificationTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>