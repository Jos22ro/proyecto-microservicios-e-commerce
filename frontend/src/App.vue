<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Header mejorado con navegación por roles -->
    <Header />

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>