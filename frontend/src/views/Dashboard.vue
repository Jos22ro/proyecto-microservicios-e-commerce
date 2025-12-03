<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="border-4 border-dashed border-gray-200 rounded-lg min-h-[500px] flex items-center justify-center">
      <div class="text-center">
        <div v-if="isRedirecting" class="mb-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-lg text-gray-600">Redirigiendo a tu panel...</p>
          <p class="text-sm text-gray-500 mt-2">
            Serás redirigido en {{ countdown }} segundos
          </p>
        </div>
        
        <div v-else>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido al Sistema de Microservicios
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Sistema Distribuido con FastAPI y Vue.js
          </p>
          
          <!-- Mostrar info del usuario -->
          <div class="max-w-md mx-auto mb-8 bg-white rounded-lg shadow p-6">
            <div class="flex items-center mb-4">
              <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <span class="text-xl font-bold text-white">
                  {{ getUserInitials() }}
                </span>
              </div>
              <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-gray-900">{{ authStore.user?.name }}</h3>
                <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                  :class="authStore.user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'">
                  {{ authStore.user?.role === 'admin' ? 'Administrador' : 'Usuario' }}
                </span>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <button
                @click="goToMyDashboard"
                class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Ir a mi panel
              </button>
              <button
                @click="logout"
                class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

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
            <router-link
              v-if="authStore.user?.role === 'admin'"
              to="/admin"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              Panel Admin
            </router-link>
            <router-link
              v-else
              to="/user"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Panel Usuario
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isRedirecting = ref(false)
const countdown = ref(3)
let countdownInterval = null

// Obtener iniciales del usuario
const getUserInitials = () => {
  if (!authStore.user?.name) return 'US'
  return authStore.user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Función para redirigir automáticamente
const autoRedirect = () => {
  isRedirecting.value = true
  
  countdownInterval = setInterval(() => {
    countdown.value -= 1
    
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      goToMyDashboard()
    }
  }, 1000)
}

// Ir al dashboard correspondiente
const goToMyDashboard = () => {
  if (authStore.user?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/user')
  }
}

// Función para cerrar sesión
const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  // Refrescar información del usuario
  await authStore.refreshUserInfo()
  
  // Iniciar redirección automática después de 3 segundos
  setTimeout(() => {
    autoRedirect()
  }, 3000)
})

onUnmounted(() => {
  // Limpiar el intervalo al desmontar el componente
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>