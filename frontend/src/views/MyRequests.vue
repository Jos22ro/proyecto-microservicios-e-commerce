<template>
  <div class="my-requests">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
          <p class="mt-1 text-gray-600">Historial completo de todas tus solicitudes</p>
        </div>
        <button
          @click="$emit('new-request')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              activeFilter === filter.value
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ filter.label }}
            <span class="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full"
              :class="activeFilter === filter.value ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'">
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notas
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
                      {{ getProductInitials(request.product_name) }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ request.product_name }}</div>
                    <div class="text-sm text-gray-500">{{ request.reason }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ request.quantity }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(request.created_at) }}</div>
                <div v-if="request.needed_date" class="text-xs text-gray-500">
                  Necesario: {{ formatDate(request.needed_date) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeClass(request.status)">
                  <span class="mr-1">{{ getStatusIcon(request.status) }}</span>
                  {{ getStatusText(request.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 max-w-xs truncate" :title="request.admin_notes">
                  {{ request.admin_notes || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="request.status === 'pending'"
                  @click="cancelRequest(request.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Cancelar
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRequests.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes {{ getFilterText() }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ activeFilter === 'all' ? 'Comienza creando tu primera solicitud.' : 'Intenta con otro filtro.' }}
        </p>
        <div class="mt-6">
          <button
            @click="$emit('new-request')"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Solicitud
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRequestStore } from '../stores/requests'

export default {
  name: 'MyRequestsView',
  
  emits: ['new-request', 'request-created'],
  
  setup(props, { emit }) {
    const requestStore = useRequestStore()
    const activeFilter = ref('all')
    
    // Configuración de filtros
    const filters = computed(() => [
      { value: 'all', label: 'Todas', count: requestStore.stats?.total || 0 },
      { value: 'pending', label: 'Pendientes', count: requestStore.stats?.pending || 0 },
      { value: 'approved', label: 'Aprobadas', count: requestStore.stats?.approved || 0 },
      { value: 'rejected', label: 'Rechazadas', count: requestStore.stats?.rejected || 0 },
      { value: 'cancelled', label: 'Canceladas', count: requestStore.stats?.cancelled || 0 }
    ])
    
    // Solicitudes filtradas
    const filteredRequests = computed(() => {
      if (activeFilter.value === 'all') {
        return [...requestStore.userRequests].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
      }
      return requestStore.getRequestsByStatus(activeFilter.value)
    })
    
    // Mapeo de estados
    const statusBadgeClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      delivered: 'bg-blue-100 text-blue-800'
    }
    
    const statusIcons = {
      pending: '⏳',
      approved: '✓',
      rejected: '✗',
      cancelled: '🗑',
      delivered: '🚚'
    }
    
    const statusLabels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      delivered: 'Entregado'
    }
    
    // Métodos
    const getProductInitials = (productName) => {
      return productName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    }
    
    const getStatusBadgeClass = (status) => {
      return statusBadgeClasses[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusIcon = (status) => {
      return statusIcons[status] || '?'
    }
    
    const getStatusText = (status) => {
      return statusLabels[status] || status
    }
    
    const getFilterText = () => {
      const filterMap = {
        all: '',
        pending: 'pendientes',
        approved: 'aprobadas',
        rejected: 'rechazadas',
        cancelled: 'canceladas'
      }
      return filterMap[activeFilter.value] ? ` ${filterMap[activeFilter.value]}` : ''
    }
    
    const cancelRequest = async (requestId) => {
      if (!confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
        return
      }
      
      try {
        await requestStore.cancelRequest(requestId)
        emit('request-created')
      } catch (error) {
        console.error('Error canceling request:', error)
        alert('Error al cancelar la solicitud')
      }
    }
    
    // Cargar datos si no están cargados
    onMounted(() => {
      if (requestStore.userRequests.length === 0) {
        // Podrías cargar las solicitudes aquí si es necesario
      }
    })
    
    return {
      // Estados
      activeFilter,
      
      // Computed
      filters,
      filteredRequests,
      
      // Métodos
      getProductInitials,
      formatDate,
      getStatusBadgeClass,
      getStatusIcon,
      getStatusText,
      getFilterText,
      cancelRequest
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para la tabla */
.min-w-full {
  min-width: 100%;
}

/* Asegurar que las celdas de la tabla tengan el ancho correcto */
table {
  table-layout: fixed;
}

td, th {
  word-wrap: break-word;
}

/* Estilos para hover de filas */
tr {
  transition: background-color 0.2s ease;
}

tr:hover {
  background-color: #f9fafb;
}

/* Estilos para el estado vacío */
.text-gray-400 {
  color: #9ca3af;
}
</style>