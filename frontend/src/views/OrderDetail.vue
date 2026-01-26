<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Botón de regreso -->
    <div class="mb-6">
      <button
        @click="$router.go(-1)"
        class="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
      >
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver a Mis Órdenes
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner size="large" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar la orden</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="order" class="max-w-6xl mx-auto">
      <!-- Header de la orden -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Orden #{{ order.id?.slice(0, 8) || 'N/A' }}</h1>
            <p class="mt-1 text-sm text-gray-500">ID completo: {{ order.id }}</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <span 
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                getStatusBadgeClass(order.status)
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>

            <!-- Acciones -->
            <div class="flex space-x-2">
              <button
                @click="refreshOrder"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>

              <button
                v-if="canCancelOrder(order)"
                @click="confirmCancelOrder"
                class="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                Cancelar Orden
              </button>
            </div>
          </div>
        </div>

        <!-- Timeline de estado -->
        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Seguimiento de la orden</h3>
          <div class="relative">
            <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
            <div class="relative flex justify-between">
              <div 
                v-for="(step, index) in statusSteps" 
                :key="step.status"
                class="flex flex-col items-center"
                :class="{ 'text-green-600': isStepCompleted(step.status), 'text-gray-400': !isStepCompleted(step.status) }"
              >
                <div 
                  class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium z-10"
                  :class="[
                    isStepCompleted(step.status) 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  ]"
                >
                  <svg v-if="isStepCompleted(step.status)" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="mt-2 text-xs font-medium">{{ step.label }}</span>
                <span v-if="getStepDate(step.status)" class="mt-1 text-xs text-gray-500">
                  {{ formatDate(getStepDate(step.status)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Información principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Items de la orden -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Productos de la orden</h2>
            
            <div v-if="order.items && order.items.length > 0" class="space-y-4">
              <div 
                v-for="item in order.items" 
                :key="item.id || item.productId"
                class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-center space-x-4">
                  <!-- Imagen del producto -->
                  <div class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      v-if="item.imageUrl" 
                      :src="item.imageUrl" 
                      :alt="item.productName"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Detalles del producto -->
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ item.productName || 'Producto' }}</h4>
                    <p class="text-sm text-gray-500">SKU: {{ item.productSku || 'N/A' }}</p>
                    <p class="text-sm text-gray-500">Cantidad: {{ item.quantity || 1 }}</p>
                  </div>
                </div>
                
                <!-- Precio -->
                <div class="text-right">
                  <p class="text-sm text-gray-600">{{ formatAmount(item.unitPrice) }} c/u</p>
                  <p class="text-lg font-medium text-gray-900">{{ formatAmount(item.totalPrice) }}</p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              No hay productos en esta orden
            </div>

            <!-- Resumen de precios -->
            <div class="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">{{ formatAmount(order.subtotalAmount) }}</span>
              </div>
              <div v-if="order.taxAmount > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">Impuestos</span>
                <span class="font-medium">{{ formatAmount(order.taxAmount) }}</span>
              </div>
              <div v-if="order.shippingCost > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">Envío</span>
                <span class="font-medium">{{ formatAmount(order.shippingCost) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span class="text-indigo-600">{{ formatAmount(order.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Información de envío -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Información de envío</h2>
            
            <div v-if="order.shippingAddress" class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Dirección de entrega</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatAddress(order.shippingAddress) }}
                </p>
              </div>

              <div v-if="order.billingAddress">
                <h3 class="text-sm font-medium text-gray-900">Dirección de facturación</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatAddress(order.billingAddress) }}
                </p>
              </div>
            </div>
            
            <div v-else class="text-sm text-gray-500">
              No hay información de envío disponible
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Información del cliente -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Información del cliente</h2>
            
            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Nombre</h3>
                <p class="text-sm text-gray-600">{{ order.customerName || 'N/A' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-900">Email</h3>
                <p class="text-sm text-gray-600">{{ order.customerEmail || 'N/A' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-900">ID de usuario</h3>
                <p class="text-sm font-mono text-gray-600">{{ order.userId || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Fechas importantes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Fechas importantes</h2>
            
            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Creada</h3>
                <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
              </div>
              
              <div v-if="order.updatedAt && order.updatedAt !== order.createdAt">
                <h3 class="text-sm font-medium text-gray-900">Última actualización</h3>
                <p class="text-sm text-gray-600">{{ formatDate(order.updatedAt) }}</p>
              </div>
              
              <div v-if="order.paidAt">
                <h3 class="text-sm font-medium text-gray-900">Pagada</h3>
                <p class="text-sm text-gray-600">{{ formatDate(order.paidAt) }}</p>
              </div>
              
              <div v-if="order.shippedAt">
                <h3 class="text-sm font-medium text-gray-900">Enviada</h3>
                <p class="text-sm text-gray-600">{{ formatDate(order.shippedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Acciones adicionales -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Acciones</h2>
            
            <div class="space-y-3">
              <button
                @click="printOrder"
                class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir orden
              </button>

              <button
                @click="downloadInvoice"
                class="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar factura
              </button>

              <button
                v-if="order.status === 'DELIVERED'"
                @click="requestReturn"
                class="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Solicitar devolución
              </button>

              <router-link
                to="/orders"
                class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Ver todas las órdenes
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de cancelación -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Cancelar Orden</h3>
          <p class="text-sm text-gray-500 mt-2">
            ¿Estás seguro de que deseas cancelar esta orden? 
            Esta acción no se puede deshacer.
          </p>
          <div class="mt-4 flex space-x-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              No, mantener
            </button>
            <button
              @click="cancelOrder"
              :disabled="isCancelling"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {{ isCancelling ? 'Cancelando...' : 'Sí, cancelar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

// Estado local
const showCancelModal = ref(false)
const isCancelling = ref(false)

// Datos del store
const order = computed(() => ordersStore.currentOrder)
const isLoading = computed(() => ordersStore.isLoading)
const error = computed(() => ordersStore.error)

// Timeline de estados
const statusSteps = [
  { status: 'CREATED', label: 'Orden Creada' },
  { status: 'PAID', label: 'Pago Confirmado' },
  { status: 'SHIPPED', label: 'Enviada' },
  { status: 'DELIVERED', label: 'Entregada' }
]

// Métodos
const loadOrder = async () => {
  const orderId = route.params.id
  if (!orderId) {
    router.push('/orders')
    return
  }

  try {
    await ordersStore.fetchOrder(orderId)
  } catch (error) {
    console.error('Error loading order:', error)
    router.push('/orders')
  }
}

const refreshOrder = async () => {
  await loadOrder()
}

const confirmCancelOrder = () => {
  showCancelModal.value = true
}

const cancelOrder = async () => {
  if (!order.value) return
  
  isCancelling.value = true
  try {
    await ordersStore.cancelOrder(order.value.id)
    showCancelModal.value = false
    // Recargar los datos de la orden
    await loadOrder()
  } catch (error) {
    console.error('Error cancelling order:', error)
  } finally {
    isCancelling.value = false
  }
}

const printOrder = () => {
  window.print()
}

const downloadInvoice = () => {
  // Aquí iría la lógica para descargar la factura
  alert('Función de descarga de factura no implementada aún')
}

const requestReturn = () => {
  // Aquí iría la lógica para solicitar devolución
  alert('Función de devolución no implementada aún')
}

// Métodos de utilidad
const formatAmount = (amount) => {
  return ordersStore.formatAmount(amount)
}

const getStatusText = (status) => {
  return ordersStore.getStatusText(status)
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'CREATED': 'bg-yellow-100 text-yellow-800',
    'PAID': 'bg-blue-100 text-blue-800',
    'SHIPPED': 'bg-purple-100 text-purple-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
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

const formatAddress = (address) => {
  if (!address) return 'N/A'
  
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.countryCode
  ].filter(Boolean)
  
  return parts.join(', ')
}

const isStepCompleted = (stepStatus) => {
  if (!order.value) return false
  
  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.value.status)
  const stepIndex = statusSteps.findIndex(step => step.status === stepStatus)
  
  return stepIndex <= currentStatusIndex
}

const getStepDate = (stepStatus) => {
  if (!order.value) return null
  
  switch (stepStatus) {
    case 'CREATED':
      return order.value.createdAt
    case 'PAID':
      return order.value.paidAt
    case 'SHIPPED':
      return order.value.shippedAt
    case 'DELIVERED':
      return order.value.deliveredAt
    default:
      return null
  }
}

const canCancelOrder = (order) => {
  return ordersStore.canCancelOrder(order)
}

// Watch para cambios en la ruta
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadOrder()
    }
  }
)

// Ciclo de vida
onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>