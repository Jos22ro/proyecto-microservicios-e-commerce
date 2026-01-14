<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header del carrito -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
      <p class="mt-2 text-gray-600" v-if="cartItems.length > 0">
        Tienes {{ cartItemCount }} {{ cartItemCount === 1 ? 'producto' : 'productos' }} en tu carrito
      </p>
    </div>

    <!-- Carrito vacío -->
    <div v-if="cartItems.length === 0 && !isProcessingCheckout" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
      <p class="mt-1 text-sm text-gray-500">
        ¡Descubre nuestros productos y encuentra lo que necesitas!
      </p>
      <div class="mt-6">
        <router-link
          to="/catalog"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          Explorar Catálogo
        </router-link>
      </div>
    </div>

    <!-- Carrito con productos -->
    <div v-else-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Lista de productos -->
      <div class="lg:col-span-2">
        <div class="space-y-4">
          <CartItem
            v-for="item in cartItems"
            :key="item.product_id"
            :item="item"
            @quantity-changed="onQuantityChanged"
            @removed="onItemRemoved"
          />
        </div>

        <!-- Acciones del carrito -->
        <div class="mt-6 flex justify-between items-center">
          <router-link
            to="/catalog"
            class="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Continuar comprando
          </router-link>

          <button
            @click="clearCart"
            class="text-red-600 hover:text-red-500 text-sm font-medium transition-colors duration-200"
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      <!-- Resumen del pedido -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
          
          <!-- Items del pedido -->
          <div class="space-y-3 mb-4">
            <div v-for="item in cartItems" :key="item.product_id" class="flex justify-between text-sm">
              <span class="text-gray-600">
                {{ item.name }}
                <span class="text-gray-400">(x{{ item.quantity }})</span>
              </span>
              <span class="font-medium text-gray-900">
                ${{ formatPrice(item.price * item.quantity) }}
              </span>
            </div>
          </div>

          <!-- Totales -->
          <div class="border-t border-gray-200 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium text-gray-900">
                ${{ formatPrice(totalAmount) }}
              </span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Envío</span>
              <span class="font-medium text-gray-900">
                {{ shippingCost > 0 ? `$${formatPrice(shippingCost)}` : 'Gratis' }}
              </span>
            </div>
            
            <div v-if="taxAmount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600">Impuestos</span>
              <span class="font-medium text-gray-900">
                ${{ formatPrice(taxAmount) }}
              </span>
            </div>
            
            <div class="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span class="text-indigo-600">
                ${{ formatPrice(finalTotal) }}
              </span>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="mt-4 p-3 bg-gray-50 rounded-md">
            <p class="text-xs text-gray-600">
              ✅ Envío gratuito en pedidos superiores a $100
            </p>
            <p class="text-xs text-gray-600 mt-1">
              🔒 Pago 100% seguro
            </p>
          </div>

          <!-- Botón de checkout -->
          <button
            @click="proceedToCheckout"
            :disabled="isProcessingCheckout"
            class="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200"
          >
            <span v-if="isProcessingCheckout" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
            <span v-else>
              Proceder al Pago
            </span>
          </button>

          <!-- Métodos de pago -->
          <div class="mt-4 text-center">
            <p class="text-xs text-gray-500 mb-2">Aceptamos:</p>
            <div class="flex justify-center space-x-2">
              <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">VISA</div>
              <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">MC</div>
              <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">PayPal</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de limpieza -->
    <div
      v-if="showClearCartModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Vaciar carrito</h3>
          <p class="text-sm text-gray-500 mt-2">
            ¿Estás seguro de que deseas eliminar todos los productos de tu carrito?
          </p>
          <div class="mt-4 flex space-x-3">
            <button
              @click="showClearCartModal = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              @click="confirmClearCart"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Vaciar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de éxito de checkout -->
    <div
      v-if="showCheckoutSuccess"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">¡Pedido realizado!</h3>
          <p class="text-sm text-gray-500 mt-2">
            Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación pronto.
          </p>
          <div class="mt-4">
            <router-link
              to="/"
              @click="showCheckoutSuccess = false"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              Volver al inicio
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import CartItem from '../components/CartItem.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Estados reactivos
const showClearCartModal = ref(false)
const showCheckoutSuccess = ref(false)
const isProcessingCheckout = ref(false)

// Computed properties
const cartItems = computed(() => cartStore.items)
const cartItemCount = computed(() => cartStore.itemCount)
const totalAmount = computed(() => cartStore.totalAmount)

// Cálculos de costos adicionales
const shippingCost = computed(() => {
  return totalAmount.value >= 100 ? 0 : 10
})

const taxAmount = computed(() => {
  // Ejemplo: 8% de impuesto
  return totalAmount.value * 0.08
})

const finalTotal = computed(() => {
  return totalAmount.value + shippingCost.value + taxAmount.value
})

// Métodos
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const clearCart = () => {
  showClearCartModal.value = true
}

const confirmClearCart = () => {
  cartStore.clearCart()
  showClearCartModal.value = false
}

const onQuantityChanged = (item) => {
  // Recalcular totales automáticamente
  console.log('Cantidad cambiada:', item)
}

const onItemRemoved = (item) => {
  console.log('Producto removido:', item)
}

const proceedToCheckout = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  isProcessingCheckout.value = true

  try {
    // Simular procesamiento de pago
    const order = await cartStore.checkout()
    
    // Mostrar modal de éxito
    showCheckoutSuccess.value = true
    
    // Log del pedido (en una app real se enviaría al backend)
    console.log('Pedido procesado:', order)
    
  } catch (error) {
    console.error('Error processing checkout:', error)
    alert('Error al procesar el pago. Por favor, intenta nuevamente.')
  } finally {
    isProcessingCheckout.value = false
  }
}

// Verificar si el usuario está autenticado al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated) {
    // Opcional: redirigir al login o mostrar mensaje
    console.log('Usuario no autenticado')
  }
})
</script>