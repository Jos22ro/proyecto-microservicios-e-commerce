<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Sistema de Microservicios</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8" v-if="isAuthenticated">
              <router-link
                to="/"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-indigo-500 text-gray-900"
              >
                Dashboard
              </router-link>
              <router-link
                to="/products"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-indigo-500 text-gray-900"
              >
                Productos
              </router-link>
              <router-link
                to="/inventory"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-indigo-500 text-gray-900"
              >
                Inventario
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-indigo-500 text-gray-900"
              >
                Administración
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="isAuthenticated" class="text-sm text-gray-700">
              Bienvenido, {{ user?.username }} ({{ user?.role }})
            </div>
            <button
              v-if="isAuthenticated"
              @click="logout"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
            <router-link
              v-else
              to="/login"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.role === 'admin')
const user = computed(() => authStore.user)

const logout = () => {
  authStore.logout()
}
</script>