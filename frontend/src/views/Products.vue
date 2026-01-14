<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Productos</h1>
        <p class="mt-2 text-sm text-gray-700">
          Gestión completa de productos del sistema.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 flex space-x-3">
        <button
          @click="showCreateCategoryModal = true"
          class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Crear Categoría
        </button>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Nuevo Producto
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          id="category"
          v-model="filters.category"
          @change="loadProducts"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Todas las categorías</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700">Buscar</label>
        <input
          id="search"
          v-model="filters.search"
          type="text"
          placeholder="Buscar productos..."
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          @input="debouncedLoadProducts"
        />
      </div>
    </div>

    <!-- Lista de productos -->
    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">SKU</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nombre</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoría</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Precio</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="product in products" :key="product.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ product.sku }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.category?.name || 'Sin categoría' }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${{ product.price }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.stock || 0 }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        'bg-green-100 text-green-800',
                        'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                      ]"
                    >
                      Activo
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="editProduct(product)"
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      @click="toggleProductStatus(product)"
                      class="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      {{ product.is_active ? 'Desactivar' : 'Activar' }}
                    </button>
                    <button
                      @click="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar producto -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Crear Producto' : 'Editar Producto' }}
          </h3>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="sku" class="block text-sm font-medium text-gray-700">SKU *</label>
                <input
                  id="sku"
                  v-model="form.sku"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :readonly="showEditModal"
                />
              </div>
              
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="brand" class="block text-sm font-medium text-gray-700">Marca *</label>
                <input
                  id="brand"
                  v-model="form.brand"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div class="sm:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="2"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              
              <div>
                <label for="category_id" class="block text-sm font-medium text-gray-700">Categoría *</label>
                <select
                  id="category_id"
                  v-model="form.category_id"
                  required
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700">Precio *</label>
                <input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div v-if="!showCreateModal">
                <label for="stock_quantity" class="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  id="stock_quantity"
                  v-model.number="form.stock_quantity"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label for="image_url" class="block text-sm font-medium text-gray-700">URL Imagen</label>
                <input
                  id="image_url"
                  v-model="form.image_url"
                  type="url"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            

            <div v-if="error" class="text-red-600 text-sm">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ isLoading ? 'Guardando...' : (showCreateModal ? 'Crear' : 'Actualizar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal crear categoría -->
    <div v-if="showCreateCategoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Categoría</h3>
          
          <form @submit.prevent="createCategory" class="space-y-4">
            <div>
              <label for="categoryName" class="block text-sm font-medium text-gray-700">Nombre de la Categoría *</label>
              <input
                id="categoryName"
                v-model="newCategoryName"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div v-if="categoryError" class="text-red-600 text-sm">
              {{ categoryError }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showCreateCategoryModal = false"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ isLoading ? 'Guardando...' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useAuthStore } from '../stores/auth'

const productsStore = useProductsStore()
const authStore = useAuthStore()

const products = ref([])
const categories = ref([])
const categoryError = ref('')
const newCategoryName = ref('')
const isLoading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showCreateCategoryModal = ref(false)

const filters = reactive({
  category: '',
  search: ''
})

const form = reactive({
  sku: '',
  name: '',
  brand: '',
  description: '',
  price: 0,
  category_id: null,
  image_url: '',
  stock_quantity: 0
})

const loadProducts = async () => {
  isLoading.value = true
  error.value = ''
  categoryError.value = ''
  
  try {
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.search) params.search = filters.search
    
    await productsStore.fetchProducts(params)
    products.value = productsStore.products
    
    await loadCategories()
  } catch (err) {
    error.value = productsStore.error || 'Error al cargar productos'
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  isLoading.value = true
  try {
    await productsStore.fetchCategories()
    categories.value = productsStore.categories
  } catch (err) {
    error.value = 'Error al cargar categorías'
  }finally {
    isLoading.value = false
  }
}

const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    categoryError.value = 'El nombre de la categoría es requerido'
    return
  }
  
  isLoading.value = true
  categoryError.value = ''
  
  try {
    await productsStore.createCategory({ name: newCategoryName.value })
    await loadCategories()
    showCreateCategoryModal.value = false
    newCategoryName.value = ''
  } catch (err) {
    categoryError.value = productsStore.error || 'Error al crear la categoría'
  } finally {
    isLoading.value = false
  }
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const debouncedLoadProducts = debounce(loadProducts, 300)

const resetForm = () => {
  form.sku = ''
  form.name = ''
  form.brand = ''
  form.description = ''
  form.price = 0
  form.category_id = null
  form.image_url = ''
  form.stock_quantity = 0
  error.value = ''
  // Ensure stock is always 0 for new products
  if (showCreateModal.value) {
    form.stock_quantity = 0
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const editProduct = (product) => {
  form.sku = product.sku
  form.name = product.name
  form.brand = product.brand || ''
  form.description = product.description || ''
  form.price = product.price
  form.category_id = product.category_id
  form.image_url = product.image_url || ''
  form.stock_quantity = product.stock_quantity || 0
  showEditModal.value = true
}

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    if (showCreateModal.value) {
      // Create a new form object without stock_quantity since it's managed by inventory service
      const { stock_quantity, ...newProduct } = form
      await productsStore.createProduct(newProduct)
    } else {
      const product = products.value.find(p => p.sku === form.sku)
      if (product) {
        // For updates, we don't update stock here as it's managed by inventory service
        const { stock_quantity, ...updateData } = form
        await productsStore.updateProduct(product.id, updateData)
      }
    }
    closeModal()
  } catch (err) {
    error.value = productsStore.error || 'Error al guardar producto'
  } finally {
    isLoading.value = false
  }
}

const toggleProductStatus = async (product) => {
  if (!confirm(`¿Estás seguro de ${product.is_active ? 'desactivar' : 'activar'} este producto?`)) {
    return
  }
  
  try {
    await productsStore.toggleProductStatus(product.id)
    await loadProducts()
  } catch (err) {
    error.value = productsStore.error || 'Error al cambiar estado del producto'
  }
}

const deleteProduct = async (product) => {
  if (!confirm('¿Estás seguro de eliminar este producto?')) {
    return
  }
  
  try {
    await productsStore.deleteProduct(product.id)
    await loadProducts()
  } catch (err) {
    error.value = productsStore.error || 'Error al eliminar producto'
  }
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>