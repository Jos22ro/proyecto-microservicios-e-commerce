<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
    <div class="flex items-center space-x-4">
      <!-- Imagen del producto -->
      <div class="flex-shrink-0">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="h-16 w-16 object-cover rounded-md"
          @error="handleImageError"
        />
        <div
          v-else
          class="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"
        >
          <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>

      <!-- Información del producto -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900 truncate">
              {{ item.name }}
            </h3>
            <p v-if="item.brand" class="text-xs text-gray-500 mt-1">
              {{ item.brand }}
            </p>
            <p class="text-xs text-gray-400 font-mono mt-1">
              SKU: {{ item.sku }}
            </p>
          </div>
          
          <!-- Botón eliminar -->
          <button
            @click="removeItem"
            class="ml-2 text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
            title="Eliminar del carrito"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 101.414 1.414L10 13.414l2.293 2.293a1 1 0 001.414-1.414L12.414 12l1.293-1.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="flex justify-between items-center mt-3">
          <!-- Controles de cantidad -->
          <div class="flex items-center border border-gray-300 rounded-md">
            <button
              @click="decrementQuantity"
              :disabled="item.quantity <= 1"
              class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <span class="px-3 py-1 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
              {{ item.quantity }}
            </span>
            
            <button
              @click="incrementQuantity"
              :disabled="item.quantity >= item.stock"
              class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Precio unitario y total -->
          <div class="text-right">
            <p class="text-sm text-gray-500">
              ${{ formatPrice(item.price) }} c/u
            </p>
            <p class="text-sm font-semibold text-gray-900">
              ${{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>

        <!-- Stock disponible -->
        <div class="mt-2 flex justify-between items-center">
          <p class="-500">
           text-xs text-gray Stock disponible: {{ item.stock }} unidades
          </p>
          
          <!-- Indicador de stock bajo -->
          <span
            v-if="item.stock <= 5 && item.quantity >= item.stock - 2"
            class="text-xs text-orange-600 font-medium"
          >
            ⚠️ Stock limitado
          </span>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-xs text-red-600 mt-3">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['quantity-changed', 'removed'])

const cartStore = useCartStore()
const error = ref('')

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const incrementQuantity = () => {
  error.value = ''
  const success = cartStore.incrementQuantity(props.item.product_id)
  if (success) {
    emit('quantity-changed', props.item)
  } else {
    error.value = cartStore.error
  }
}

const decrementQuantity = () => {
  error.value = ''
  cartStore.decrementQuantity(props.item.product_id)
  emit('quantity-changed', props.item)
}

const removeItem = () => {
  error.value = ''
  cartStore.removeFromCart(props.item.product_id)
  emit('removed', props.item)
}

const handleImageError = (event) => {
  // Si la imagen falla al cargar, ocultar y mostrar placeholder
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}
</script>