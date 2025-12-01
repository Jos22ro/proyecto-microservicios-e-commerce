<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido al Sistema de Microservicios
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Sistema Distribuido con FastAPI y Vue.js
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <!-- Auth Service -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">A</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Auth Service
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      Puerto 8000
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <span class="text-green-600 font-medium">●</span>
                <span class="text-gray-600"> Activo</span>
              </div>
            </div>
          </div>

          <!-- Products Service -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">P</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Products Service
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      Puerto 8001
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <span class="text-green-600 font-medium">●</span>
                <span class="text-gray-600"> Activo</span>
              </div>
            </div>
          </div>

          <!-- Inventory Service -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">I</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Inventory Service
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      Puerto 8002
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <span class="text-green-600 font-medium">●</span>
                <span class="text-gray-600"> Activo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 space-x-4">
          <router-link
            to="/products"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Ver Productos
          </router-link>
          <router-link
            to="/inventory"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Gestionar Inventario
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Refrescar información del usuario al cargar el dashboard
  await authStore.refreshUserInfo()
})
</script>