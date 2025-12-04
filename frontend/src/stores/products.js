import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_PRODUCTS_SERVICE_URL || 'http://localhost:8001'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    categories: [],
    total: 0,
    page: 1,
    per_page: 10,
    pages: 0
  }),

  getters: {
    filteredProducts: (state) => {
      if (state.products.length === 0) return []
      return state.products
    }
  },

  actions: {
    getAuthHeaders() {
      const authStore = useAuthStore()
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    },

    async fetchProducts(params = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/products`, {
          params,
          ...this.getAuthHeaders()
        })
        
        this.products = response.data.products
        this.total = response.data.total
        this.page = response.data.page
        this.per_page = response.data.per_page
        this.pages = response.data.pages
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar productos'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchProduct(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/products/${id}`, {
          ...this.getAuthHeaders()
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar producto'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createProduct(productData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/products/products`, productData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de productos
        await this.fetchProducts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al crear producto'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateProduct(id, productData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.put(`${API_BASE_URL}/api/products/products/${id}`, productData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de productos
        await this.fetchProducts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al actualizar producto'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteProduct(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/products/products/${id}`, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de productos
        await this.fetchProducts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al eliminar producto'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async toggleProductStatus(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.patch(`${API_BASE_URL}/api/products/products/${id}/toggle`, {}, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de productos
        await this.fetchProducts()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cambiar estado del producto'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCategories() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/categories`, {
          ...this.getAuthHeaders()
        })
        
        this.categories = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar categorías'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStats() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/admin/products/stats`, {
          ...this.getAuthHeaders()
        })
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al cargar estadísticas'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})