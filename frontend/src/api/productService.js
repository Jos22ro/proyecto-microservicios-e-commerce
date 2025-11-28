import api from './axios'

export default {
  /**
   * Obtiene la lista de productos
   * @returns {Promise} Promise con la lista de productos
   */
  async getProducts() {
    try {
      const response = await api.get('/products')
      // Mapear la respuesta para que coincida con lo que espera el frontend
      return {
        data: response.data.data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          brand: product.brand,
          sku: product.sku,
          category_id: product.category_id,
          category: product.category ? {
            id: product.category.id,
            name: product.category.name
          } : null,
          // Agregar campos necesarios para el frontend
          stock: product.stock || 0, // Asegurar que siempre haya un valor para stock
          image_url: product.image_url || null
        }))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise} Promise con los datos del producto
   */
  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return {
        data: {
          ...response.data.data,
          price: parseFloat(response.data.data.price),
          stock: response.data.data.stock || 0
        }
      }
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw error
    }
  }
}
