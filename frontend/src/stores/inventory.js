import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:8002'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventoryItems: [],
    isLoading: false,
    error: null,
    lowStockAlerts: [],
    stats: null,
    movementHistory: []
  }),

  actions: {
    getAuthHeaders() {
      const authStore = useAuthStore()
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    },

    async fetchInventory(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/inventory`, {
          params,
          ...this.getAuthHeaders()
        })
        
        this.inventoryItems = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchInventoryItem(sku) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/inventory/${sku}`, {
          ...this.getAuthHeaders()
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createInventoryItem(itemData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/inventory/inventory`, itemData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al crear ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateInventoryItem(id, itemData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.put(`${API_BASE_URL}/api/inventory/inventory/${id}`, itemData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al actualizar ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async processStockMovement(movementData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/inventory/inventory/movement`, movementData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario y alertas
        await this.fetchInventory()
        await this.fetchLowStockAlerts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al procesar movimiento de stock'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async adjustStock(adjustmentData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/inventory/inventory/adjust`, adjustmentData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario y alertas
        await this.fetchInventory()
        await this.fetchLowStockAlerts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al ajustar stock'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchLowStockAlerts() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/alerts/low-stock`, {
          ...this.getAuthHeaders()
        })
        
        this.lowStockAlerts = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar alertas de stock'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStats() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/stats`, {
          ...this.getAuthHeaders()
        })
        
        this.stats = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar estadísticas'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchMovementHistory(sku, limit = 50) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inventory/inventory/${sku}/movements`, {
          params: { limit },
          ...this.getAuthHeaders()
        })
        
        this.movementHistory = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar historial de movimientos'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteInventoryItem(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/inventory/inventory/${id}`, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al eliminar ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})