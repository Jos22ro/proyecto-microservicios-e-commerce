<template>
  <AppLayout>
    <template #header>
      <h1>Dashboard</h1>
      <p>Bienvenido de vuelta, {{ authStore.userFullName }}</p>
    </template>

    <div class="dashboard-grid">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">📦</div>
          <div class="stat-info">
            <h3>{{ productsStore.totalProducts }}</h3>
            <p>Productos Totales</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning">⚠️</div>
          <div class="stat-info">
            <h3>{{ productsStore.lowStockProducts.length }}</h3>
            <p>Productos con Stock Bajo</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success">📊</div>
          <div class="stat-info">
            <h3>{{ inventoryStats.totalValue }}</h3>
            <p>Valor Total del Inventario</p>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <!-- Contenido de actividad reciente -->
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import AppLayout from '@/components/layout/AppLayout.vue'

const authStore = useAuthStore()
const productsStore = useProductsStore()

const inventoryStats = computed(() => {
  const totalValue = productsStore.products.reduce((sum, product) => {
    return sum + product.price * product.stock
  }, 0)

  return {
    totalValue: new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(totalValue),
  }
})

onMounted(async () => {
  await productsStore.fetchProducts()
})
</script>
