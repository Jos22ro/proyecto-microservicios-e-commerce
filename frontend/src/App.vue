<template>
  <header v-if="authStore.token">
    <nav>
      <router-link to="/productos">Productos</router-link> |
      <router-link to="/inventario">Inventario</router-link>
      <button @click="authStore.logout" class="logout-btn">Salir</button>
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
nav {
  padding: 20px;
  background: #f4f4f4;
  margin-bottom: 20px;
}
nav a {
  margin-right: 15px;
  text-decoration: none;
  font-weight: bold;
  color: #2c3e50;
}
nav a.router-link-active {
  color: #42b983;
}
.logout-btn {
  float: right;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
