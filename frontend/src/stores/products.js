import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

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
        const response = await axios.get(`/api/products`, {
          params,
          ...this.getAuthHeaders()
        })
        
        this.products = Array.isArray(response.data) ? response.data : response.data.products || []
        this.total = response.data.total || this.products.length
        this.page = response.data.page || 1
        this.per_page = response.data.per_page || 10
        this.pages = response.data.pages || 1
        
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
        const response = await axios.get(`/api/products/${id}`, {
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
        const response = await axios.post(`/api/products`, productData, {
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
        const response = await axios.put(`/api/products/${id}`, productData, {
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
        const response = await axios.delete(`/api/products/${id}`, {
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
        const response = await axios.patch(`/api/products/${id}/toggle`, {}, {
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
        const response = await axios.get(`/api/categories`, {
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

    async createCategory(categoryData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`/api/categories`, categoryData, {
          ...this.getAuthHeaders()
        })
        
        // Recargar lista de categorías
        await this.fetchCategories()
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al crear categoría'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStats() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/products/admin/products/stats`, {
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