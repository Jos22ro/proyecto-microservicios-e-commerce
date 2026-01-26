import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8080'

// Helper para configurar headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    },
    filters: {
      status: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortDir: 'desc'
    }
  }),

  getters: {
    // Obtener órdenes del usuario actual
    userOrders: (state) => state.orders,
    
    // Obtener orden actual
    getOrderById: (state) => (orderId) => {
      return state.orders.find(order => order.id === orderId) || state.currentOrder
    },
    
    // Contar órdenes por estado
    ordersByStatus: (state) => {
      const statusCount = {}
      state.orders.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1
      })
      return statusCount
    },
    
    // Calcular monto total de todas las órdenes
    totalOrdersAmount: (state) => {
      return state.orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
    },
    
    // Órdenes que pueden ser canceladas
    cancellableOrders: (state) => {
      return state.orders.filter(order => order.status === 'CREATED')
    },
    
    // Verificar si hay error
    hasError: (state) => !!state.error,
    
    // Verificar si está cargando
    loading: (state) => state.isLoading
  },

  actions: {
    // Obtener todas las órdenes del usuario
    async fetchOrders(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const queryParams = new URLSearchParams({
          page: params.page || this.pagination.page,
          size: params.size || this.pagination.size,
          sortBy: params.sortBy || this.filters.sortBy,
          sortDir: params.sortDir || this.filters.sortDir,
          ...(params.status && { status: params.status }),
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate })
        })

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/orders?${queryParams}`,
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        // Actualizar estado con los datos paginados
        this.orders = response.data.content || response.data
        this.pagination = {
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar las órdenes'
        console.error('Error fetching orders:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Obtener detalles de una orden específica
    async fetchOrder(orderId) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/orders/${orderId}`,
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        this.currentOrder = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar los detalles de la orden'
        console.error('Error fetching order:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Crear una nueva orden
    async createOrder(orderData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/orders`,
          orderData,
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        // Agregar la nueva orden al estado
        if (response.data) {
          this.orders.unshift(response.data)
          this.currentOrder = response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al crear la orden'
        console.error('Error creating order:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Cancelar una orden
    async cancelOrder(orderId) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/orders/${orderId}/cancel`,
          {},
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        // Actualizar la orden en el estado
        const orderIndex = this.orders.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = response.data
        }
        
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cancelar la orden'
        console.error('Error cancelling order:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Actualizar estado de una orden (solo admin/staff)
    async updateOrderStatus(orderId, statusUpdate) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/v1/orders/${orderId}/status`,
          statusUpdate,
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        // Actualizar la orden en el estado
        const orderIndex = this.orders.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = response.data
        }
        
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al actualizar el estado de la orden'
        console.error('Error updating order status:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Obtener estadísticas de órdenes del usuario
    async fetchOrdersStatistics() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/orders/statistics`,
          { 
            headers: getAuthHeaders(),
            withCredentials: true 
          }
        )

        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar las estadísticas'
        console.error('Error fetching orders statistics:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Limpiar estado actual
    clearCurrentOrder() {
      this.currentOrder = null
    },

    // Limpiar errores
    clearError() {
      this.error = null
    },

    // Resetear filtros
    resetFilters() {
      this.filters = {
        status: '',
        startDate: '',
        endDate: '',
        sortBy: 'createdAt',
        sortDir: 'desc'
      }
      this.pagination = {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    },

    // Formatear monto como moneda
    formatAmount(amount) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(amount || 0)
    },

    // Obtener texto descriptivo del estado
    getStatusText(status) {
      const statusMap = {
        'CREATED': 'Creado',
        'PAID': 'Pagado',
        'SHIPPED': 'Enviado',
        'DELIVERED': 'Entregado',
        'CANCELLED': 'Cancelado'
      }
      return statusMap[status] || status
    },

    // Obtener color del estado para UI
    getStatusColor(status) {
      const colorMap = {
        'CREATED': 'yellow',
        'PAID': 'blue', 
        'SHIPPED': 'purple',
        'DELIVERED': 'green',
        'CANCELLED': 'red'
      }
      return colorMap[status] || 'gray'
    },

    // Verificar si una orden puede ser cancelada
    canCancelOrder(order) {
      return order?.status === 'CREATED'
    },

    // Verificar si una orden puede ser retornada
    canReturnOrder(order) {
      return order?.status === 'DELIVERED'
    }
  }
})