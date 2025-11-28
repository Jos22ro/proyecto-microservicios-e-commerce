<template>
  <div class="inventory-container">
    <div class="inventory-header">
      <h1>Gestión de Inventario</h1>
      <button @click="showAddProductModal = true" class="add-product-btn">
        + Añadir Producto
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando inventario...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>❌ Error al cargar el inventario. Por favor, intente nuevamente.</p>
      <button @click="loadInventory" class="retry-button">Reintentar</button>
    </div>

    <div v-else>
      <div class="inventory-filters">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar productos..."
            @input="filterInventory"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="stock-filter">
          <label>
            <input type="checkbox" v-model="showLowStock" />
            Mostrar solo bajo stock
          </label>
        </div>
      </div>

      <div class="inventory-table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock Actual</th>
              <th>Actualizar Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.id" :class="{ 'low-stock': item.stock < 10 }">
              <td class="product-cell">
                <div v-if="item.image_url" class="product-image">
                  <img :src="item.image_url" :alt="item.name" />
                </div>
                <div class="product-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.brand }}</small>
                </div>
              </td>
              <td>{{ item.sku }}</td>
              <td>{{ item.category?.name || 'Sin categoría' }}</td>
              <td>${{ formatPrice(item.price) }}</td>
              <td :class="{ 'text-warning': item.stock < 10, 'text-danger': item.stock === 0 }">
                {{ item.stock }}
                <span v-if="item.stock < 10 && item.stock > 0" class="low-stock-badge">¡Bajo stock!</span>
                <span v-else-if="item.stock === 0" class="out-of-stock-badge">Agotado</span>
              </td>
              <td class="stock-update-cell">
                <div class="stock-update-form">
                  <input 
                    type="number" 
                    v-model.number="item.newStock" 
                    min="0"
                    :class="{ 'is-invalid': stockUpdateError[item.id] }"
                    @keyup.enter="updateStock(item)"
                  />
                  <button 
                    @click="updateStock(item)" 
                    class="update-btn"
                    :disabled="!isValidStockUpdate(item)"
                  >
                    Actualizar
                  </button>
                  <div v-if="stockUpdateError[item.id]" class="error-feedback">
                    {{ stockUpdateError[item.id] }}
                  </div>
                </div>
              </td>
              <td class="actions-cell">
                <button @click="editProduct(item)" class="icon-btn" title="Editar">
                  ✏️
                </button>
                <button @click="confirmDelete(item)" class="icon-btn delete" title="Eliminar">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredInventory.length === 0" class="no-results">
        <p>No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddProductModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</h2>
        <form @submit.prevent="saveProduct">
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" v-model="productForm.name" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio</label>
              <input type="number" v-model.number="productForm.price" min="0" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Stock Inicial</label>
              <input type="number" v-model.number="productForm.stock" min="0" required />
            </div>
          </div>
          <div class="form-group">
            <label>SKU</label>
            <input type="text" v-model="productForm.sku" required />
          </div>
          <div class="form-group">
            <label>Marca</label>
            <input type="text" v-model="productForm.brand" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="productForm.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="productForm.category_id" required>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save">
              {{ editingProduct ? 'Guardar Cambios' : 'Añadir Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content delete-confirmation">
        <h3>¿Estás seguro de eliminar este producto?</h3>
        <p>Esta acción no se puede deshacer.</p>
        <div class="confirmation-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">Cancelar</button>
          <button @click="deleteProduct" class="btn-delete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import inventoryService from '@/api/inventoryService'
import productService from '@/api/productService'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const inventory = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const showLowStock = ref(false)
const showAddProductModal = ref(false)
const showDeleteModal = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)
const stockUpdateError = ref({})
const categories = ref([])

// Product form
const productForm = ref({
  name: '',
  price: 0,
  stock: 0,
  sku: '',
  brand: '',
  description: '',
  category_id: ''
})

// Computed
const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStockFilter = !showLowStock.value || item.stock < 10
    return matchesSearch && matchesStockFilter
  })
})

// Methods
const loadInventory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await inventoryService.getInventory()
    inventory.value = response.data.map(item => ({ 
      ...item, 
      newStock: '',
      stock: item.stock || 0
    }))
    await loadCategories()
  } catch (err) {
    console.error('Error cargando inventario:', err)
    error.value = 'Error al cargar el inventario. Por favor, intente nuevamente.'
    toast.error('Error al cargar el inventario')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await productService.getCategories()
    categories.value = response.data
  } catch (err) {
    console.error('Error cargando categorías:', err)
    toast.error('Error al cargar las categorías')
  }
}

const updateStock = async (item) => {
  if (!isValidStockUpdate(item)) return

  try {
    await inventoryService.updateStock(item.id, parseInt(item.newStock))
    item.stock = parseInt(item.stock) + parseInt(item.newStock)
    item.newStock = ''
    stockUpdateError.value[item.id] = ''
    toast.success('Stock actualizado correctamente')
  } catch (err) {
    console.error('Error actualizando stock:', err)
    stockUpdateError.value[item.id] = 'Error al actualizar el stock'
    toast.error('Error al actualizar el stock')
  }
}

const isValidStockUpdate = (item) => {
  if (item.newStock === '' || item.newStock === null || item.newStock === undefined) {
    stockUpdateError.value[item.id] = 'Ingrese una cantidad'
    return false
  }
  if (isNaN(parseInt(item.newStock))) {
    stockUpdateError.value[item.id] = 'Ingrese un número válido'
    return false
  }
  if (parseInt(item.newStock) < 0) {
    stockUpdateError.value[item.id] = 'La cantidad no puede ser negativa'
    return false
  }
  stockUpdateError.value[item.id] = ''
  return true
}

const addNewProduct = () => {
  editingProduct.value = null
  productForm.value = {
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    brand: '',
    description: '',
    category_id: categories.value[0]?.id || ''
  }
  showAddProductModal.value = true
}

const editProduct = (product) => {
  editingProduct.value = product.id
  productForm.value = {
    name: product.name,
    price: parseFloat(product.price),
    stock: product.stock,
    sku: product.sku,
    brand: product.brand,
    description: product.description,
    category_id: product.category_id
  }
  showAddProductModal.value = true
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      // Update existing product
      await productService.updateProduct(editingProduct.value, productForm.value)
      toast.success('Producto actualizado correctamente')
    } else {
      // Add new product
      await productService.createProduct(productForm.value)
      toast.success('Producto añadido correctamente')
    }
    await loadInventory()
    closeModal()
  } catch (err) {
    console.error('Error guardando producto:', err)
    toast.error('Error al guardar el producto')
  }
}

const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  try {
    await productService.deleteProduct(productToDelete.value.id)
    toast.success('Producto eliminado correctamente')
    await loadInventory()
  } catch (err) {
    console.error('Error eliminando producto:', err)
    toast.error('Error al eliminar el producto')
  } finally {
    showDeleteModal.value = false
    productToDelete.value = null
  }
}

const closeModal = () => {
  showAddProductModal.value = false
  showDeleteModal.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    brand: '',
    description: '',
    category_id: ''
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES').format(price)
}

// Lifecycle
onMounted(() => {
  loadInventory()
})
</script>

<style scoped>
.inventory-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.add-product-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-product-btn:hover {
  background-color: #3aa876;
}

.inventory-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.stock-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inventory-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.inventory-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.inventory-table tr:hover {
  background-color: #f8f9fa;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-info small {
  color: #6c757d;
  font-size: 0.8rem;
}

.stock-update-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stock-update-form input {
  width: 80px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.stock-update-form input.is-invalid {
  border-color: #dc3545;
}

.update-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.update-btn:hover {
  background-color: #138496;
}

.update-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #f1f3f5;
}

.icon-btn.delete {
  color: #dc3545;
}

.icon-btn.delete:hover {
  background-color: #fff5f5;
}

.low-stock {
  background-color: #fff8e6;
}

.low-stock-badge {
  background-color: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.out-of-stock-badge {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.text-warning {
  color: #e0a800;
}

.text-danger {
  color: #dc3545;
}

.error-feedback {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-save {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #3aa876;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #c82333;
}

.delete-confirmation {
  text-align: center;
}

.delete-confirmation h3 {
  margin-top: 0;
  color: #dc3545;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Loading Spinner */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.retry-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #3aa876;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar input {
    width: 100%;
  }
  
  .inventory-table th,
  .inventory-table td {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>