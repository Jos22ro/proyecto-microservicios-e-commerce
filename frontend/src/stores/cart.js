import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items')) || [],
    isLoading: false,
    error: null
  }),

  getters: {
    // Total de items en el carrito
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    // Total de la compra
    totalAmount: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },

    // Verificar si un producto está en el carrito
    isInCart: (state) => {
      return (productId) => state.items.some(item => item.product_id === productId)
    },

    // Obtener cantidad de un producto específico
    getItemQuantity: (state) => {
      return (productId) => {
        const item = state.items.find(item => item.product_id === productId)
        return item ? item.quantity : 0
      }
    }
  },

  actions: {
    // Guardar carrito en localStorage
    saveCart() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    },

    // Agregar producto al carrito
    addToCart(product, quantity = 1) {
      this.error = null
      
      const existingItem = this.items.find(item => item.product_id === product.id)
      
      if (existingItem) {
        // Si el producto ya existe, incrementar cantidad
        existingItem.quantity += quantity
      } else {
        // Si es un nuevo producto, agregarlo
        const cartItem = {
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand || '',
          price: product.price,
          image_url: product.image_url || '',
          stock: product.stock_quantity || 0,
          quantity: quantity
        }
        this.items.push(cartItem)
      }
      
      this.saveCart()
    },

    // Actualizar cantidad de un item
    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        this.removeFromCart(productId)
        return
      }

      const item = this.items.find(item => item.product_id === productId)
      if (item) {
        // Verificar que no exceda el stock disponible
        if (quantity > item.stock) {
          this.error = `No hay suficiente stock. Disponible: ${item.stock} unidades`
          return false
        }
        
        item.quantity = quantity
        this.saveCart()
        return true
      }
      return false
    },

    // Remover producto del carrito
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.product_id !== productId)
      this.saveCart()
    },

    // Vaciar carrito
    clearCart() {
      this.items = []
      this.saveCart()
    },

    // Decrementar cantidad
    decrementQuantity(productId) {
      const item = this.items.find(item => item.product_id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
        this.saveCart()
      } else {
        this.removeFromCart(productId)
      }
    },

    // Incrementar cantidad
    incrementQuantity(productId) {
      const item = this.items.find(item => item.product_id === productId)
      if (item) {
        if (item.quantity < item.stock) {
          item.quantity++
          this.saveCart()
          return true
        } else {
          this.error = `No hay más stock disponible. Máximo: ${item.stock} unidades`
          return false
        }
      }
      return false
    },

    // Obtener item específico
    getItem(productId) {
      return this.items.find(item => item.product_id === productId)
    },

    // Procesar checkout (simulado)
    async checkout() {
      this.isLoading = true
      this.error = null
      
      try {
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Aquí iría la llamada real a la API de pago
        const order = {
          items: [...this.items],
          total: this.totalAmount,
          item_count: this.itemCount,
          order_date: new Date().toISOString()
        }
        
        // Limpiar carrito después del checkout
        this.clearCart()
        
        return order
      } catch (error) {
        this.error = 'Error al procesar el pago'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})