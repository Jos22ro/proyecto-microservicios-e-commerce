<template>
  <div class="products-container">
    <div class="products-header">
      <h1>Nuestros Productos</h1>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar productos..."
          @input="filterProducts"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>❌ Error al cargar los productos. Por favor, intente nuevamente.</p>
      <button @click="fetchProducts" class="retry-button">Reintentar</button>
    </div>

    <div v-else>
      <div v-if="filteredProducts.length === 0" class="no-results">
        <p>No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img 
              :src="product.image_url || 'https://via.placeholder.com/200x150?text=Sin+imagen'" 
              :alt="product.name"
              class="product-img"
            >
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ truncateDescription(product.description, 100) }}</p>
            <div class="product-footer">
              <span class="product-price">${{ formatPrice(product.price) }}</span>
              <button class="add-to-cart" @click="addToCart(product)">
                <span class="cart-icon">🛒</span> Añadir
              </button>
            </div>
            <div v-if="product.stock > 0" class="stock-available">
              En stock: {{ product.stock }}
            </div>
            <div v-else class="stock-out">
              Sin stock
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import productService from '@/api/productService'

const router = useRouter()
const cartStore = useCartStore()

const products = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.description.toLowerCase().includes(query)
  )
})

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await productService.getProducts()
    products.value = response.data
  } catch (err) {
    console.error('Error loading products:', err)
    error.value = 'No se pudieron cargar los productos. Por favor, intente más tarde.'
  } finally {
    loading.value = false
  }
}

const addToCart = (product) => {
  if (product.stock > 0) {
    cartStore.addToCart(product)
    // Aquí podrías añadir una notificación de éxito
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES').format(price)
}

const truncateDescription = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.products-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 250px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #42b983;
}

.add-to-cart {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background-color: #3aa876;
}

.cart-icon {
  font-size: 1rem;
}

.stock-available {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #42b983;
}

.stock-out {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #e74c3c;
}

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
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin: 1rem 0;
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
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .search-bar input {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
