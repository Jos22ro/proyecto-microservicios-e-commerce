<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo y navegación principal -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <svg class="h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm2 4h14v14H5V7zm2 2v10h10V9H7z"/>
              </svg>
              <span class="text-xl font-bold text-gray-900">Sistema de Microservicios</span>
            </router-link>
          </div>
          
          <!-- Navegación principal (solo para usuarios autenticados) -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8" v-if="isAuthenticated">
            <router-link
              to="/"
              class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              active-class="border-indigo-500 text-gray-900"
            >
              Dashboard
            </router-link>
            
            <!-- Enlaces para usuarios finales -->
            <router-link
              to="/catalog"
              class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              active-class="border-indigo-500 text-gray-900"
            >
              Catálogo
            </router-link>
            
            <router-link
              v-if="!isAdmin"
              to="/cart"
              class="relative border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              active-class="border-indigo-500 text-gray-900"
            >
              Carrito
              <span
                v-if="cartItemCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
              >
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </span>
            </router-link>
            
            <!-- Enlaces para administradores -->
            <template v-if="isAdmin">
              <router-link
                to="/products"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                active-class="border-indigo-500 text-gray-900"
              >
                Productos
              </router-link>
              <router-link
                to="/inventory"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                active-class="border-indigo-500 text-gray-900"
              >
                Inventario
              </router-link>
              <router-link
                to="/admin"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                active-class="border-indigo-500 text-gray-900"
              >
                Administración
              </router-link>
            </template>
          </div>
        </div>

        <!-- Información del usuario y acciones -->
        <div class="flex items-center space-x-4">
          <!-- Carrito para usuarios no-admin (móvil) -->
          <router-link
            v-if="isAuthenticated && !isAdmin"
            to="/cart"
            class="sm:hidden relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5 5m0 0h12M16 21a2 2 0 100-4 2 2 0 000 4zM8 21a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartItemCount > 99 ? '99+' : cartItemCount }}
            </span>
          </router-link>

          <!-- Información del usuario -->
          <div v-if="isAuthenticated" class="hidden sm:block">
            <div class="text-sm text-gray-700">
              <span class="font-medium">{{ user?.username }}</span>
              <span
                :class="[
                  'ml-2 px-2 py-1 rounded-full text-xs font-medium',
                  isAdmin
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ isAdmin ? 'Administrador' : 'Cliente' }}
              </span>
            </div>
          </div>

          <!-- Botón de logout -->
          <button
            v-if="isAuthenticated"
            @click="logout"
            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Cerrar Sesión
          </button>

          <!-- Enlaces de autenticación para invitados -->
          <div v-else class="flex space-x-2">
            <router-link
              to="/login"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Iniciar Sesión
            </router-link>
            <router-link
              to="/register"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Registrarse
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Menú móvil -->
    <div v-if="showMobileMenu" class="sm:hidden border-t border-gray-200 bg-gray-50">
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          to="/"
          class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
          active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          @click="closeMobileMenu"
        >
          Dashboard
        </router-link>
        <router-link
          to="/catalog"
          class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
          active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          @click="closeMobileMenu"
        >
          Catálogo
        </router-link>
        <router-link
          v-if="!isAdmin"
          to="/cart"
          class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
          active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          @click="closeMobileMenu"
        >
          Carrito ({{ cartItemCount }})
        </router-link>
        <template v-if="isAdmin">
          <router-link
            to="/products"
            class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            @click="closeMobileMenu"
          >
            Productos
          </router-link>
          <router-link
            to="/inventory"
            class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            @click="closeMobileMenu"
          >
            Inventario
          </router-link>
          <router-link
            to="/admin"
            class="border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
            @click="closeMobileMenu"
          >
            Administración
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

const showMobileMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.role?.name === 'admin')
const user = computed(() => authStore.user)
const cartItemCount = computed(() => cartStore.itemCount)

const logout = () => {
  authStore.logout()
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>