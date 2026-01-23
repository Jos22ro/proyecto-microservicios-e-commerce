import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:8003'

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

    async fetchInventory() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/stock`, {
          ...this.getAuthHeaders()
        })
        
        this.inventoryItems = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar el inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchInventoryItem(productId) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/stock/${productId}`, {
          ...this.getAuthHeaders()
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar el ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createInventoryItem(itemData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/stock`, itemData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al crear el ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateInventoryItem(productId, itemData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.put(`${API_BASE_URL}/stock/${productId}`, itemData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al actualizar el ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async processStockMovement(movementData) {
      this.isLoading = true
      this.error = null
      
      try {
        
        const response = await axios.post(`${API_BASE_URL}/stock`, movementData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al procesar el movimiento de stock'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async adjustStock(adjustmentData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await this.updateInventoryItem(
          adjustmentData.product_id,
          { current_stock: adjustmentData.new_quantity }
        )
        
        return response
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al ajustar el stock'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteInventoryItem(productId) {
      this.isLoading = true
      this.error = null
      
      try {
        await axios.delete(`${API_BASE_URL}/stock/${productId}`, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de inventario
        await this.fetchInventory()
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al eliminar el ítem de inventario'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})