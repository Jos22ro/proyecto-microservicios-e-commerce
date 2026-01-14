<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Imagen del producto -->
    <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="h-48 w-full object-cover object-center"
        @error="handleImageError"
      />
      <div
        v-else
        class="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-400"
      >
        <svg class="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Información del producto -->
    <div class="p-4">
      <!-- SKU y marca -->
      <div class="flex justify-between items-start mb-2">
        <p class="text-xs text-gray-500 font-mono">{{ product.sku }}</p>
        <p v-if="product.brand" class="text-xs text-gray-600 font-medium">{{ product.brand }}</p>
      </div>

      <!-- Nombre del producto -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ product.name }}
      </h3>

      <!-- Descripción -->
      <p v-if="product.description" class="text-sm text-gray-600 mb-3 line-clamp-3">
        {{ product.description }}
      </p>

      <!-- Precio -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-2xl font-bold text-indigo-600">
          ${{ formatPrice(product.price) }}
        </span>
        <span
          v-if="product.stock_quantity !== undefined"
          :class="[
            'text-xs font-medium px-2 py-1 rounded-full',
            product.stock_quantity > 10
              ? 'bg-green-100 text-green-800'
              : product.stock_quantity > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          ]"
        >
          {{ product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Sin stock' }}
        </span>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2">
        <button
          v-if="showDetailButton"
          @click="$emit('view-detail', product)"
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Ver Detalle
        </button>
        
        <button
          @click="handleAddToCart"
          :disabled="!canAddToCart || isAddingToCart"
          :class="[
            'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
            canAddToCart
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <span v-if="isAddingToCart" class="flex items-center justify-center">
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Agregando...
          </span>
          <span v-else>
            {{ isInCart ? 'En el Carrito' : 'Agregar al Carrito' }}
          </span>
        </button>
      </div>

      <!-- Mensaje de error -->
      <p v-if="error" class="text-xs text-red-600 mt-2">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showDetailButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['view-detail', 'added-to-cart'])

const cartStore = useCartStore()
const isAddingToCart = ref(false)
const error = ref('')

const isInCart = computed(() => cartStore.isInCart(props.product.id))

const canAddToCart = computed(() => {
  return props.product.stock_quantity === undefined || props.product.stock_quantity > 0
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const handleAddToCart = async () => {
  if (!canAddToCart.value || isAddingToCart.value) return

  isAddingToCart.value = true
  error.value = ''

  try {
    cartStore.addToCart(props.product, 1)
    emit('added-to-cart', props.product)
  } catch (err) {
    error.value = 'Error al agregar al carrito'
    console.error('Error adding to cart:', err)
  } finally {
    isAddingToCart.value = false
  }
}

const handleImageError = (event) => {
  // Si la imagen falla al cargar, mostrar placeholder
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>