<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Gestión de Inventario</h1>
        <p class="mt-2 text-sm text-gray-700">
          Control y seguimiento de stock por producto.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="showMovementModal = true"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto mr-2"
        >
          Nuevo Movimiento
        </button>
        <button
          v-if="isAdmin"
          @click="showCreateModal = true"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Nuevo Ítem
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ stats?.total_items || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Ítems</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.total_items || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ stats?.total_available_stock || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Stock Disponible</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.total_available_stock || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ stats?.low_stock_items || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.low_stock_items || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ stats?.out_of_stock_items || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Sin Stock</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats?.out_of_stock_items || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas de stock bajo -->
    <div v-if="lowStockAlerts.length > 0" class="mt-8">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong>Alerta de Stock Bajo:</strong> Hay {{ lowStockAlerts.length }} productos con stock por debajo del mínimo.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de inventario -->
    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Producto ID</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cantidad</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Última Actualización</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in inventoryItems" :key="item.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ item.id }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.product_id }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span :class="[item.quantity <= 0 ? 'text-red-600 font-bold' : 'text-gray-900']">
                      {{ item.quantity }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.warehouse_location || 'N/A' }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ item.last_updated ? new Date(item.last_updated).toLocaleString() : 'N/A' }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="viewMovements(item)"
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Movimientos
                    </button>
                    <button
                      v-if="isAdmin"
                      @click="adjustStock(item)"
                      class="text-green-600 hover:text-green-900 mr-4"
                    >
                      Ajustar
                    </button>
                    <button
                      v-if="isAdmin"
                      @click="deleteItem(item)"
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

    <!-- Modal crear ítem -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Ítem de Inventario</h3>
          
          <form @submit.prevent="handleCreateItem" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="sku" class="block text-sm font-medium text-gray-700">Producto (SKU) *</label>
                <select
                  id="sku"
                  v-model="form.sku"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Selecciona un producto</option>
                  <option 
                    v-for="product in products" 
                    :key="product.id" 
                    :value="product.sku"
                  >
                    {{ product.sku }} - {{ product.name }} (Stock: {{ product.current_stock }})
                  </option>
                </select>
              </div>
              <div>
                <label for="quantity" class="block text-sm font-medium text-gray-700">Cantidad *</label>
                <input
                  id="quantity"
                  v-model.number="form.quantity"
                  type="number"
                  min="0"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="warehouse_location" class="block text-sm font-medium text-gray-700">Ubicación en Almacén *</label>
                <input
                  id="warehouse_location"
                  v-model="form.warehouse_location"
                  type="text"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ej: A-12-B-3"
                />
              </div>
            </div>

            <div v-if="error" class="text-red-600 text-sm">
              {{ error }}
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeCreateModal"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ isLoading ? 'Creando...' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal movimiento de stock -->
    <div v-if="showMovementModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Nuevo Movimiento de Stock</h3>
          
          <form @submit.prevent="handleMovement" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="movement_sku" class="block text-sm font-medium text-gray-700">Producto (SKU) *</label>
                <select
                  id="movement_sku"
                  v-model="movementForm.sku"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Selecciona un producto</option>
                  <option 
                    v-for="product in products" 
                    :key="product.id" 
                    :value="product.sku"
                  >
                    {{ product.sku }} - {{ product.name }} (Stock: {{ product.current_stock }})
                  </option>
                </select>
              </div>
              <div>
                <label for="movement_type" class="block text-sm font-medium text-gray-700">Tipo de Movimiento *</label>
                <select
                  id="movement_type"
                  v-model="movementForm.movement_type"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="IN">Entrada (IN)</option>
                  <option value="OUT">Salida (OUT)</option>
                  <option value="ADJUSTMENT">Ajuste (ADJUSTMENT)</option>
                  <option value="RESERVATION">Reservación (RESERVATION)</option>
                  <option value="RELEASE">Liberación (RELEASE)</option>
                </select>
              </div>
              <div>
                <label for="quantity" class="block text-sm font-medium text-gray-700">Cantidad *</label>
                <input
                  id="quantity"
                  v-model.number="movementForm.quantity"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="reason" class="block text-sm font-medium text-gray-700">Razón</label>
                <input
                  id="reason"
                  v-model="movementForm.reason"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="warehouse_location" class="block text-sm font-medium text-gray-700">Ubicación en Almacén</label>
                <input
                  id="warehouse_location"
                  v-model="movementForm.warehouse_location"
                  type="text"
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
                @click="closeMovementModal"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {{ isLoading ? 'Procesando...' : 'Procesar Movimiento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useInventoryStore } from '../stores/inventory'
import { useAuthStore } from '../stores/auth'
import { useProductsStore } from '../stores/products'

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()
const productsStore = useProductsStore()

const inventoryItems = ref([])
const lowStockAlerts = ref([])
const products = ref([])
const stats = ref(null)
const isLoading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showMovementModal = ref(false)
const selectedProduct = ref(null)

const isAdmin = computed(() => authStore.isAdmin)

const form = reactive({
  sku: '',
  product_id: null,
  quantity: 0,
  warehouse_location: ''
})

const movementForm = reactive({
  sku: '',
  product_id: null,
  quantity: 1,
  movement_type: 'IN',
  reason: '',
  warehouse_location: ''
})

const loadInventory = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    await Promise.all([
      inventoryStore.fetchInventory(),
      loadProducts()
    ])
    
    inventoryItems.value = inventoryStore.inventoryItems
    
    await inventoryStore.fetchLowStockAlerts()
    lowStockAlerts.value = inventoryStore.lowStockAlerts
    
    await inventoryStore.fetchStats()
    stats.value = inventoryStore.stats
  } catch (err) {
    error.value = inventoryStore.error || 'Error al cargar inventario'
  } finally {
    isLoading.value = false
  }
}

const loadProducts = async () => {
  try {
    await productsStore.fetchProducts({ lowStock: true })
    products.value = productsStore.products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      current_stock: p.stock_quantity || 0
    }))
  } catch (err) {
    console.error('Error loading products:', err)
  }
}

// Watch for SKU changes to update product_id
watch(() => form.sku, (newSku) => {
  if (newSku) {
    const product = products.value.find(p => p.sku === newSku)
    form.product_id = product ? product.id : null
  } else {
    form.product_id = null
  }
})

// Watch for SKU changes in movement form
watch(() => movementForm.sku, (newSku) => {
  if (newSku) {
    const product = products.value.find(p => p.sku === newSku)
    movementForm.product_id = product ? product.id : null
  } else {
    movementForm.product_id = null
  }
})

const closeCreateModal = () => {
  showCreateModal.value = false
  form.sku = ''
  form.product_id = null
  form.quantity = 0
  form.warehouse_location = ''
  error.value = ''
}

const closeMovementModal = () => {
  showMovementModal.value = false
  movementForm.sku = ''
  movementForm.product_id = null
  movementForm.quantity = 1
  movementForm.movement_type = 'IN'
  movementForm.reason = ''
  movementForm.warehouse_location = ''
  error.value = ''
}

const handleCreateItem = async function handleCreateItem() {
  if (!form.sku || !form.product_id) {
    error.value = 'Por favor selecciona un producto válido'
    return
  }

  try {
    isLoading.value = true
    await inventoryStore.createInventoryItem({
      product_id: form.product_id,
      quantity: form.quantity,
      warehouse_location: form.warehouse_location
    })
    await loadInventory()
    closeCreateModal()
  } catch (err) {
    error.value = inventoryStore.error || 'Error al crear el ítem de inventario'
  } finally {
    isLoading.value = false
  }
}

const handleMovement = async () => {
  if (!movementForm.sku || !movementForm.product_id) {
    error.value = 'Por favor selecciona un producto válido'
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    await inventoryStore.processStockMovement({
      ...movementForm,
      product_id: movementForm.product_id
    })
    closeMovementModal()
    await loadInventory()
  } catch (err) {
    error.value = inventoryStore.error || 'Error al procesar movimiento'
  } finally {
    isLoading.value = false
  }
}

async function adjustStock(item) {
  const newQuantity = prompt(`Ajustar stock para Producto ID ${item.product_id} (actual: ${item.quantity}):`, item.quantity)
  
  if (newQuantity === null) return
  
  try {
    await inventoryStore.updateInventoryItem(item.id, {
      quantity: parseInt(newQuantity, 10)
    })
  } catch (error) {
    console.error('Error adjusting stock:', error)
  }
}

const viewMovements = async (item) => {
  try {
    await inventoryStore.fetchMovementHistory(item.sku)
    // Aquí se podría abrir un modal para mostrar el historial
    alert(`Historial de movimientos para SKU ${item.sku} cargado. Total: ${inventoryStore.movementHistory.length} movimientos`)
  } catch (err) {
    error.value = inventoryStore.error || 'Error al cargar historial'
  }
}

const deleteItem = async (item) => {
  if (!confirm('¿Estás seguro de eliminar este ítem de inventario?')) {
    return
  }
  
  try {
    await inventoryStore.deleteInventoryItem(item.id)
    await loadInventory()
  } catch (err) {
    error.value = inventoryStore.error || 'Error al eliminar ítem'
  }
}

onMounted(() => {
  loadInventory()
})
</script>