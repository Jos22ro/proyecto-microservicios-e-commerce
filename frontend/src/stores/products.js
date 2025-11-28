import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '@/api/productService'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentProduct = ref(null)

  // Getters
  const totalProducts = computed(() => products.value.length)
  const lowStockProducts = computed(() =>
    products.value.filter((product) => product.stock < product.minStock),
  )

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await productService.getAll()
      products.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar los productos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    loading.value = true
    try {
      const response = await productService.getById(id)
      currentProduct.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar el producto'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      const response = await productService.create(productData)
      products.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear el producto'
      throw err
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const response = await productService.update(id, productData)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar el producto'
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      await productService.delete(id)
      products.value = products.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar el producto'
      throw err
    }
  }

  const searchProducts = (query) => {
    if (!query) return products.value
    return products.value.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()),
    )
  }

  return {
    // State
    products,
    loading,
    error,
    currentProduct,

    // Getters
    totalProducts,
    lowStockProducts,

    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  }
})
