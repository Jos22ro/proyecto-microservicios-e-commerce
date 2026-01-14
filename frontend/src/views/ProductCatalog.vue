<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header del catálogo -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
      <p class="mt-2 text-gray-600">
        Descubre nuestra selección de productos de alta calidad
      </p>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Búsqueda -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Buscar productos
          </label>
          <div class="relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Nombre, marca o SKU..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filtro por categoría -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            id="category"
            v-model="selectedCategory"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todas las categorías</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Filtro por precio -->
        <div>
          <label for="priceRange" class="block text-sm font-medium text-gray-700 mb-1">
            Rango de precio
          </label>
          <select
            id="priceRange"
            v-model="selectedPriceRange"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos los precios</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="500-999999">Más de $500</option>
          </select>
        </div>
      </div>

      <!-- Botón limpiar filtros -->
      <div class="mt-4 flex justify-between items-center">
        <button
          @click="clearFilters"
          class="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar filtros
        </button>
        <span class="text-sm text-gray-500">
          Mostrando {{ filteredProducts.length }} productos
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <LoadingSpinner v-if="isLoading" size="lg" message="Cargando productos..." />

    <!-- Estado vacío -->
    <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V6a2 2 0 00-2-2H9a2 2 0 00-2 2v3" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
      <p class="mt-1 text-sm text-gray-500">
        No se encontraron productos que coincidan con los filtros seleccionados.
      </p>
      <div class="mt-6">
        <button
          @click="clearFilters"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Grid de productos -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @view-detail="viewProductDetail"
        @added-to-cart="onProductAdded"
      />
    </div>

    <!-- Modal de confirmación de producto agregado -->
    <div
      v-if="showAddedModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Producto agregado</h3>
          <p class="text-sm text-gray-500 mt-2">
            El producto ha sido agregado a tu carrito exitosamente.
          </p>
          <div class="mt-4 flex space-x-3">
            <button
              @click="continueShopping"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Continuar comprando
            </button>
            <router-link
              to="/cart"
              @click="closeModal"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center transition-colors duration-200"
            >
              Ver carrito
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()

// Estados reactivos
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedPriceRange = ref('')
const showAddedModal = ref(false)

// Computed properties
const isLoading = computed(() => productsStore.isLoading)
const products = computed(() => productsStore.products)
const categories = computed(() => productsStore.categories)

const filteredProducts = computed(() => {
  let filtered = products.value

  // Filtro por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    )
  }

  // Filtro por categoría
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === selectedCategory.value)
  }

  // Filtro por precio
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-').map(Number)
    filtered = filtered.filter(product => {
      if (max) {
        return product.price >= min && product.price <= max
      } else {
        return product.price >= min
      }
    })
  }

  return filtered
})

// Métodos
const loadProducts = async () => {
  try {
    await productsStore.fetchProducts()
    await productsStore.fetchCategories()
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedPriceRange.value = ''
}

const viewProductDetail = (product) => {
  router.push(`/products/${product.id}`)
}

const onProductAdded = (product) => {
  showAddedModal.value = true
  // Auto-cerrar después de 3 segundos
  setTimeout(() => {
    showAddedModal.value = false
  }, 3000)
}

const closeModal = () => {
  showAddedModal.value = false
}

const continueShopping = () => {
  showAddedModal.value = false
}

// Lifecycle
onMounted(() => {
  loadProducts()
})

// Watchers para búsqueda en tiempo real (opcional)
watch(searchQuery, () => {
  // Aquí podrías implementar búsqueda en tiempo real
  // Por ahora, la búsqueda se hace computada
})
</script>