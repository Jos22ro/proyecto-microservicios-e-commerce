<template>
  <div class="page">
    <h1>Gestión de Inventario</h1>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Stock Actual</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.productId">
          <td>{{ item.productName }}</td>
          <td>{{ item.stock }}</td>
          <td>
            <div class="actions">
              <input type="number" v-model.number="item.newStock" placeholder="Nuevo Stock" />
              <button @click="updateStock(item)">Actualizar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import inventoryService from '@/api/inventoryService'

const inventory = ref([])

onMounted(async () => {
  await loadInventory()
})

const loadInventory = async () => {
  try {
    const response = await inventoryService.getInventory()
    // Mapeamos para añadir un campo temporal 'newStock' para el input
    inventory.value = response.data.map((i) => ({ ...i, newStock: '' }))
  } catch (error) {
    console.error('Error cargando inventario', error)
  }
}

const updateStock = async (item) => {
  if (!item.newStock && item.newStock !== 0) return alert('Ingresa una cantidad')

  try {
    await inventoryService.updateStock(item.productId, item.newStock)
    alert('Stock actualizado correctamente')
    await loadInventory() // Recargamos la tabla
  } catch (error) {
    alert('Error al actualizar stock')
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.actions {
  display: flex;
  gap: 10px;
}
</style>
