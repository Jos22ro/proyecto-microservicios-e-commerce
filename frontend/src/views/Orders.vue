<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
          <p class="mt-2 text-gray-600">
            {{ pagination.totalElements }} {{ pagination.totalElements === 1 ? 'orden encontrada' : 'órdenes encontradas' }}
          </p>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex space-x-3">
          <button
            @click="refreshOrders"
            :disabled="isLoading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          
          <button
            @click="showFilters = !showFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Panel de filtros -->
    <div v-if="showFilters" class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Filtrar Órdenes</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="CREATED">Creado</option>
            <option value="PAID">Pagado</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <!-- Filtro por fecha inicio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
          <input
            v-model="filters.startDate"
            @change="applyFilters"
            type="date"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Filtro por fecha fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
          <input
            v-model="filters.endDate"
            @change="applyFilters"
            type="date"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Ordenamiento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select
            v-model="filters.sortBy"
            @change="applyFilters"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="createdAt">Fecha de creación</option>
            <option value="totalAmount">Monto total</option>
            <option value="status">Estado</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Total Órdenes</p>
            <p class="text-lg font-medium text-gray-900">{{ pagination.totalElements }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Completadas</p>
            <p class="text-lg font-medium text-gray-900">{{ ordersByStatus.DELIVERED || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">En Proceso</p>
            <p class="text-lg font-medium text-gray-900">{{ (ordersByStatus.CREATED || 0) + (ordersByStatus.PAID || 0) + (ordersByStatus.SHIPPED || 0) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-600">Monto Total</p>
            <p class="text-lg font-medium text-gray-900">{{ formatAmount(totalOrdersAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner size="large" />
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar las órdenes</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <div class="mt-4">
            <button
              @click="refreshOrders"
              class="text-sm font-medium text-red-800 hover:text-red-700 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de órdenes -->
    <div v-else-if="orders.length === 0" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No tienes órdenes</h3>
      <p class="mt-1 text-sm text-gray-500">
        Comienza comprando productos para ver tus órdenes aquí.
      </p>
      <div class="mt-6">
        <router-link
          to="/catalog"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          Ir al Catálogo
        </router-link>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-center justify-between">
          <!-- Información principal -->
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-medium text-gray-900">Orden #{{ order.id?.slice(0, 8) || 'N/A' }}</h3>
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusBadgeClass(order.status)
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>

            <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">Fecha:</span>
                {{ formatDate(order.createdAt) }}
              </div>
              <div>
                <span class="font-medium">Items:</span>
                {{ order.items?.length || 0 }} productos
              </div>
              <div>
                <span class="font-medium">Total:</span>
                <span class="text-gray-900 font-bold">{{ formatAmount(order.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center space-x-2">
            <router-link
              :to="`/orders/${order.id}`"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Ver detalles
            </router-link>

            <button
              v-if="canCancelOrder(order)"
              @click="confirmCancelOrder(order)"
              class="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Items preview (máximo 3 items) -->
        <div v-if="order.items && order.items.length > 0" class="mt-4 border-t border-gray-100 pt-4">
          <div class="flex items-center space-x-2">
            <div 
              v-for="(item, index) in order.items.slice(0, 3)" 
              :key="index"
              class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md overflow-hidden"
            >
              <img 
                v-if="item.imageUrl" 
                :src="item.imageUrl" 
                :alt="item.productName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <span v-if="order.items.length > 3" class="text-sm text-gray-500">
              +{{ order.items.length - 3 }} más
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="pagination.totalPages > 1" class="mt-8 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Mostrando 
        <span class="font-medium">{{ (pagination.page * pagination.size) + 1 }}</span>
        a
        <span class="font-medium">{{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }}</span>
        de
        <span class="font-medium">{{ pagination.totalElements }}</span>
        resultados
      </div>

      <div class="flex space-x-2">
        <button
          @click="previousPage"
          :disabled="!pagination.hasPrevious"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div class="flex space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md',
              page === pagination.page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page + 1 }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="!pagination.hasNext"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
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
            ¿Estás seguro de que deseas cancelar la orden #{{ orderToCancel?.id?.slice(0, 8) }}? 
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
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const ordersStore = useOrdersStore()

// Estado local
const showFilters = ref(false)
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const isCancelling = ref(false)

// Datos del store
const orders = computed(() => ordersStore.orders)
const isLoading = computed(() => ordersStore.isLoading)
const error = computed(() => ordersStore.error)
const pagination = computed(() => ordersStore.pagination)
const filters = computed(() => ordersStore.filters)
const ordersByStatus = computed(() => ordersStore.ordersByStatus)
const totalOrdersAmount = computed(() => ordersStore.totalOrdersAmount)

// Computed properties
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const delta = 2
  
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  return range
})

// Métodos
const loadOrders = async () => {
  try {
    await ordersStore.fetchOrders({
      page: pagination.value.page,
      size: pagination.value.size,
      ...filters.value
    })
  } catch (error) {
    console.error('Error loading orders:', error)
  }
}

const refreshOrders = async () => {
  await loadOrders()
}

const applyFilters = async () => {
  await ordersStore.fetchOrders({
    ...filters.value,
    page: 0 // Resetear a la primera página
  })
}

const resetFilters = () => {
  ordersStore.resetFilters()
  loadOrders()
}

const previousPage = async () => {
  if (pagination.value.hasPrevious) {
    await ordersStore.fetchOrders({
      ...filters.value,
      page: pagination.value.page - 1
    })
  }
}

const nextPage = async () => {
  if (pagination.value.hasNext) {
    await ordersStore.fetchOrders({
      ...filters.value,
      page: pagination.value.page + 1
    })
  }
}

const goToPage = async (page) => {
  await ordersStore.fetchOrders({
    ...filters.value,
    page
  })
}

const confirmCancelOrder = (order) => {
  orderToCancel.value = order
  showCancelModal.value = true
}

const cancelOrder = async () => {
  if (!orderToCancel.value) return
  
  isCancelling.value = true
  try {
    await ordersStore.cancelOrder(orderToCancel.value.id)
    showCancelModal.value = false
    orderToCancel.value = null
    await refreshOrders() // Recargar la lista
  } catch (error) {
    console.error('Error cancelling order:', error)
  } finally {
    isCancelling.value = false
  }
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
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const canCancelOrder = (order) => {
  return ordersStore.canCancelOrder(order)
}

// Ciclo de vida
onMounted(() => {
  loadOrders()
})
</script>