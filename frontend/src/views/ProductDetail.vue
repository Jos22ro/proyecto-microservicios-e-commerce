<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Loading state -->
    <LoadingSpinner v-if="isLoading" size="lg" message="Cargando producto..." />

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Error al cargar producto</h3>
      <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
      <div class="mt-6">
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Volver al catálogo
        </button>
      </div>
    </div>

    <!-- Product detail -->
    <div v-else-if="product" class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <router-link to="/catalog" class="hover:text-gray-700 transition-colors duration-200">
              Catálogo
            </router-link>
          </li>
          <li>
            <svg class="h-4 w-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </li>
          <li class="text-gray-900 font-medium">{{ product.name }}</li>
        </ol>
      </nav>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Imagen del producto -->
          <div class="aspect-w-1 aspect-h-1 bg-gray-100">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-96 lg:h-full object-cover object-center"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-full h-96 lg:h-full flex items-center justify-center bg-gray-100 text-gray-400"
            >
              <svg class="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Información del producto -->
          <div class="p-6 lg:p-8">
            <!-- SKU y categoría -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-sm text-gray-500 font-mono">SKU: {{ product.sku }}</p>
                <p v-if="product.category?.name" class="text-sm text-indigo-600 font-medium">
                  {{ product.category.name }}
                </p>
              </div>
              <button
                @click="toggleWishlist"
                :class="[
                  'p-2 rounded-full transition-colors duration-200',
                  isInWishlist
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-gray-500'
                ]"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- Nombre del producto -->
            <h1 class="text-3xl font-bold text-gray-900 mb-4">
              {{ product.name }}
            </h1>

            <!-- Marca -->
            <p v-if="product.brand" class="text-lg text-gray-600 mb-4">
              <span class="font-medium">Marca:</span> {{ product.brand }}
            </p>

            <!-- Precio -->
            <div class="flex items-center space-x-4 mb-6">
              <span class="text-4xl font-bold text-indigo-600">
                ${{ formatPrice(product.price) }}
              </span>
              <span
                v-if="originalPrice && originalPrice > product.price"
                class="text-xl text-gray-400 line-through"
              >
                ${{ formatPrice(originalPrice) }}
              </span>
            </div>

            <!-- Stock status -->
            <div class="flex items-center mb-6">
              <div
                :class="[
                  'w-3 h-3 rounded-full mr-2',
                  stockStatus.color
                ]"
              ></div>
              <span :class="['text-sm font-medium', stockStatus.textColor]">
                {{ stockStatus.message }}
              </span>
            </div>

            <!-- Descripción -->
            <div v-if="product.description" class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
              <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
            </div>

            <!-- Controles de cantidad -->
            <div class="mb-6">
              <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div class="flex items-center space-x-3">
                <div class="flex items-center border border-gray-300 rounded-md">
                  <button
                    @click="decrementQuantity"
                    :disabled="quantity <= 1"
                    class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <span class="px-4 py-2 text-lg font-medium text-gray-900 min-w-[4rem] text-center">
                    {{ quantity }}
                  </span>
                  
                  <button
                    @click="incrementQuantity"
                    :disabled="quantity >= product.stock_quantity"
                    class="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <span class="text-sm text-gray-500">
                  {{ product.stock_quantity }} disponibles
                </span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex space-x-4">
              <button
                @click="addToCart"
                :disabled="!canAddToCart || isAddingToCart"
                :class="[
                  'flex-1 px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200',
                  canAddToCart
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <span v-if="isAddingToCart" class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Agregando...
                </span>
                <span v-else>
                  Agregar al Carrito
                </span>
              </button>
              
              <button
                @click="buyNow"
                :disabled="!canAddToCart"
                class="px-6 py-3 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md text-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comprar Ahora
              </button>
            </div>

            <!-- Mensajes de error/éxito -->
            <p v-if="error" class="text-red-600 text-sm mt-4">
              {{ error }}
            </p>
            
            <p v-if="successMessage" class="text-green-600 text-sm mt-4">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Productos relacionados (opcional) -->
      <div v-if="relatedProducts.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
            @view-detail="viewProductDetail"
            @added-to-cart="onProductAdded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

// Estados reactivos
const quantity = ref(1)
const isAddingToCart = ref(false)
const error = ref('')
const successMessage = ref('')
const isInWishlist = ref(false)

// Producto y productos relacionados
const product = ref(null)
const relatedProducts = ref([])

// Computed properties
const isLoading = computed(() => productsStore.isLoading)

const canAddToCart = computed(() => {
  return product.value && (product.value.stock_quantity === undefined || product.value.stock_quantity > 0)
})

const originalPrice = computed(() => {
  // Aquí podrías implementar lógica de precios originales (descuentos)
  return null
})

const stockStatus = computed(() => {
  if (!product.value || product.value.stock_quantity === undefined) {
    return {
      color: 'bg-gray-400',
      textColor: 'text-gray-500',
      message: 'Estado del stock no disponible'
    }
  }
  
  const stock = product.value.stock_quantity
  
  if (stock === 0) {
    return {
      color: 'bg-red-400',
      textColor: 'text-red-600',
      message: 'Sin stock'
    }
  } else if (stock <= 5) {
    return {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-600',
      message: `¡Solo ${stock} restantes!`
    }
  } else {
    return {
      color: 'bg-green-400',
      textColor: 'text-green-600',
      message: 'En stock'
    }
  }
})

// Métodos
const loadProduct = async () => {
  try {
    error.value = ''
    const productId = route.params.id
    product.value = await productsStore.fetchProduct(productId)
    
    // Cargar productos relacionados (ejemplo: mismo categoría)
    if (product.value.category_id) {
      await productsStore.fetchProducts({ category: product.value.category_id })
      relatedProducts.value = productsStore.products
        .filter(p => p.id !== product.value.id)
        .slice(0, 4)
    }
    
  } catch (err) {
    error.value = productsStore.error || 'Error al cargar el producto'
    console.error('Error loading product:', err)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const incrementQuantity = () => {
  if (quantity.value < (product.value?.stock_quantity || Infinity)) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (!canAddToCart.value || isAddingToCart.value) return

  isAddingToCart.value = true
  error.value = ''
  successMessage.value = ''

  try {
    cartStore.addToCart(product.value, quantity.value)
    successMessage.value = 'Producto agregado al carrito exitosamente'
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = 'Error al agregar al carrito'
    console.error('Error adding to cart:', err)
  } finally {
    isAddingToCart.value = false
  }
}

const buyNow = () => {
  addToCart()
  router.push('/cart')
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
  // Aquí implementarías la lógica real del wishlist
}

const viewProductDetail = (product) => {
  router.push(`/products/${product.id}`)
}

const onProductAdded = (product) => {
  // Manejar cuando se agrega un producto relacionado
  console.log('Producto relacionado agregado:', product)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

const goBack = () => {
  router.push('/catalog')
}

// Lifecycle
onMounted(() => {
  loadProduct()
})
</script>