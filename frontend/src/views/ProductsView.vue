<template>
  <div class="page">
    <h1>Catálogo de Productos</h1>
    <div v-if="loading">Cargando productos...</div>

    <div v-else class="grid">
      <div v-for="product in products" :key="product.id" class="card">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p class="price">${{ product.price }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import productService from '@/api/productService'

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await productService.getProducts()
    products.value = response.data
  } catch (error) {
    console.error('Error cargando productos', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}
.price {
  font-weight: bold;
  color: green;
}
</style>
