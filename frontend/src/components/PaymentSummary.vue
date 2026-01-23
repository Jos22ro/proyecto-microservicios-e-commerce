<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">Resumen del Pedido</h2>
    
    <!-- Items del pedido -->
    <div class="space-y-3 mb-6">
      <div v-for="item in orderItems" :key="item.product_id" class="flex items-center space-x-3">
        <!-- Imagen del producto -->
        <div class="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
          <img 
            v-if="item.image_url" 
            :src="item.image_url" 
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <!-- Detalles del producto -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
          <p class="text-xs text-gray-500">{{ item.brand }} • SKU: {{ item.sku }}</p>
        </div>
        
        <!-- Cantidad y precio -->
        <div class="flex-shrink-0 text-right">
          <p class="text-sm text-gray-600">x{{ item.quantity }}</p>
          <p class="text-sm font-medium text-gray-900">${{ formatPrice(item.price * item.quantity) }}</p>
        </div>
      </div>
    </div>

    <!-- Información de envío -->
    <div class="border-t border-gray-200 pt-4 mb-4">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Información de Envío</h3>
      
      <div class="space-y-2">
        <div class="flex items-center text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Envío estándar</span>
        </div>
        
        <div class="flex items-center text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>3-5 días hábiles</span>
        </div>
        
        <div v-if="shippingAddress" class="flex items-start text-sm text-gray-600">
          <svg class="h-4 w-4 mr-2 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <div>
            <p>{{ shippingAddress.name }}</p>
            <p>{{ shippingAddress.street }}</p>
            <p>{{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zipCode }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Totales -->
    <div class="border-t border-gray-200 pt-4 space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Subtotal ({{ itemCount }} items)</span>
        <span class="font-medium text-gray-900">
          ${{ formatPrice(subtotal) }}
        </span>
      </div>
      
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Envío</span>
        <span class="font-medium text-gray-900">
          {{ shippingCost > 0 ? `$${formatPrice(shippingCost)}` : 'Gratis' }}
        </span>
      </div>
      
      <div v-if="taxAmount > 0" class="flex justify-between text-sm">
        <span class="text-gray-600">Impuestos (8%)</span>
        <span class="font-medium text-gray-900">
          ${{ formatPrice(taxAmount) }}
        </span>
      </div>
      
      <!-- Descuento si aplica -->
      <div v-if="discountAmount > 0" class="flex justify-between text-sm text-green-600">
        <span>Descuento</span>
        <span class="font-medium">
          -${{ formatPrice(discountAmount) }}
        </span>
      </div>
      
      <!-- Total -->
      <div class="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
        <span class="text-gray-900">Total</span>
        <span class="text-indigo-600 text-lg">
          ${{ formatPrice(finalTotal) }}
        </span>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="mt-4 space-y-2">
      <!-- Envío gratuito -->
      <div v-if="shippingCost === 0" class="flex items-center p-2 bg-green-50 rounded-md">
        <svg class="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs text-green-800">Envío gratuito aplicado</span>
      </div>
      
      <!-- Seguridad -->
      <div class="flex items-center p-2 bg-blue-50 rounded-md">
        <svg class="h-4 w-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs text-blue-800">Transacción segura y encriptada</span>
      </div>
      
      <!-- Política de devolución -->
      <div class="flex items-center p-2 bg-gray-50 rounded-md">
        <svg class="h-4 w-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs text-gray-600">30 días de devolución</span>
      </div>
    </div>

    <!-- Métodos de pago -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <p class="text-xs text-gray-500 mb-2">Métodos de pago aceptados:</p>
      <div class="flex flex-wrap gap-2">
        <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">VISA</div>
        <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">MasterCard</div>
        <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">AMEX</div>
        <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">Discover</div>
        <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">PayPal</div>
      </div>
    </div>

    <!-- Términos y condiciones -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <p class="text-xs text-gray-500">
        Al completar esta compra, aceptas nuestros 
        <a href="#" class="text-indigo-600 hover:text-indigo-500">términos y condiciones</a> 
        y nuestra 
        <a href="#" class="text-indigo-600 hover:text-indigo-500">política de privacidad</a>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

// Props
const props = defineProps({
  orderItems: {
    type: Array,
    default: () => []
  },
  shippingAddress: {
    type: Object,
    default: null
  },
  discountCode: {
    type: String,
    default: ''
  }
})

// Stores
const cartStore = useCartStore()
const authStore = useAuthStore()

// Computed properties
const orderItems = computed(() => {
  return props.orderItems.length > 0 ? props.orderItems : cartStore.items
})

const itemCount = computed(() => {
  return orderItems.value.reduce((total, item) => total + item.quantity, 0)
})

const subtotal = computed(() => {
  return orderItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const shippingCost = computed(() => {
  return subtotal.value >= 100 ? 0 : 10
})

const taxAmount = computed(() => {
  return subtotal.value * 0.08
})

const discountAmount = computed(() => {
  // Lógica de descuento (puede ser expandida)
  if (props.discountCode === 'WELCOME10') {
    return subtotal.value * 0.1
  }
  return 0
})

const finalTotal = computed(() => {
  return subtotal.value + shippingCost.value + taxAmount.value - discountAmount.value
})

// Métodos
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>