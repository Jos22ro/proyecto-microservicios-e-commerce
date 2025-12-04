<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Panel de Administración</h1>
        <p class="mt-2 text-sm text-gray-700">
          Gestión avanzada del sistema y usuarios.
        </p>
      </div>
    </div>

    <!-- Estadísticas generales -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ productStats?.total_products || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Productos</dt>
                <dd class="text-lg font-medium text-gray-900">{{ productStats?.total_products || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ productStats?.active_products || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Productos Activos</dt>
                <dd class="text-lg font-medium text-gray-900">{{ productStats?.active_products || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ inventoryStats?.total_items || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Ítems Inventario</dt>
                <dd class="text-lg font-medium text-gray-900">{{ inventoryStats?.total_items || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ inventoryStats?.low_stock_items || 0 }}</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                <dd class="text-lg font-medium text-gray-900">{{ inventoryStats?.low_stock_items || 0 }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categorías de productos -->
    <div v-if="productStats?.categories" class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Productos por Categoría</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="(count, category) in productStats.categories" :key="category" class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm font-medium text-gray-900">{{ category }}</div>
          <div class="text-2xl font-bold text-indigo-600">{{ count }}</div>
        </div>
      </div>
    </div>

    <!-- Servicios del sistema -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Estado de Servicios</h3>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">A</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">Auth Service</div>
                    <div class="text-sm text-gray-500">Servicio de Autenticación</div>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ● Activo
                  </span>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    Puerto: 8000
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-green-600">P</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">Products Service</div>
                    <div class="text-sm text-gray-500">Servicio de Gestión de Productos</div>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ● Activo
                  </span>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    Puerto: 8001
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li>
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-purple-600">I</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">Inventory Service</div>
                    <div class="text-sm text-gray-500">Servicio de Gestión de Inventario</div>
                  </div>
                </div>
                <div class="ml-2 flex-shrink-0 flex">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ● Activo
                  </span>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500">
                    Puerto: 8002
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Gestión de usuarios -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Gestión de Usuarios</h3>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div class="sm:flex sm:items-start sm:justify-between">
            <div>
              <h4 class="text-base font-medium text-gray-900">Administrar Roles de Usuario</h4>
              <p class="mt-1 text-sm text-gray-500">
                Los administradores pueden cambiar los roles de otros usuarios del sistema.
              </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                @click="showUserModal = true"
                class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Gestionar Usuarios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información del sistema -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 class="text-base font-medium text-gray-900">Tecnología</h4>
              <dl class="mt-2 space-y-2">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Backend</dt>
                  <dd class="text-sm text-gray-900">FastAPI + PostgreSQL</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Frontend</dt>
                  <dd class="text-sm text-gray-900">Vue.js 3 + Tailwind CSS</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Contenedores</dt>
                  <dd class="text-sm text-gray-900">Docker + Docker Compose</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-900">Arquitectura</h4>
              <dl class="mt-2 space-y-2">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Patrón</dt>
                  <dd class="text-sm text-gray-900">Microservicios</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">Autenticación</dt>
                  <dd class="text-sm text-gray-900">JWT + Email Verification</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">API</dt>
                  <dd class="text-sm text-gray-900">RESTful</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal gestión de usuarios -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Gestión de Usuarios</h3>
          
          <div v-if="isLoading" class="text-center py-4">
            <svg class="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-4">
            <p class="text-gray-500">No se encontraron usuarios</p>
          </div>

          <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usuario</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rol</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="user in users" :key="user.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ user.username }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <select
                      v-model="user.role"
                      @change="updateUserRole(user)"
                      :disabled="user.id === currentUser?.id"
                      class="border-gray-300 rounded-md text-sm"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                        'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                      ]"
                    >
                      {{ user.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <button
                      v-if="user.id !== currentUser?.id"
                      @click="toggleUserStatus(user)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      {{ user.is_active ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="closeUserModal"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useProductsStore } from '../stores/products'
import { useInventoryStore } from '../stores/inventory'
import { useAuthStore } from '../stores/auth'

const productsStore = useProductsStore()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

const productStats = ref(null)
const inventoryStats = ref(null)
const users = ref([])
const isLoading = ref(false)
const showUserModal = ref(false)
const error = ref('')

const API_BASE_URL = 'http://localhost'
const currentUser = computed(() => authStore.user)

const loadStats = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // Cargar estadísticas de productos
    await productsStore.fetchStats()
    productStats.value = productsStore.stats
    
    // Cargar estadísticas de inventario
    await inventoryStore.fetchStats()
    inventoryStats.value = inventoryStore.stats
  } catch (err) {
    error.value = 'Error al cargar estadísticas'
    console.error('Error loading stats:', err)
  } finally {
    isLoading.value = false
  }
}

const loadUsers = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/admin/users`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = response.data
  } catch (err) {
    error.value = 'Error al cargar usuarios'
    console.error('Error loading users:', err)
  } finally {
    isLoading.value = false
  }
}

const updateUserRole = async (user) => {
  if (!confirm(`¿Cambiar rol de ${user.username} a ${user.role}?`)) {
    return
  }
  
  try {
    await axios.put(`${API_BASE_URL}/api/auth/admin/users/${user.id}/role`, 
      { new_role: user.role },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    
    alert(`Rol actualizado exitosamente`)
  } catch (err) {
    error.value = 'Error al actualizar rol de usuario'
    console.error('Error updating user role:', err)
  }
}

const toggleUserStatus = async (user) => {
  const action = user.is_active ? 'desactivar' : 'activar'
  if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${user.username}?`)) {
    return
  }
  
  try {
    // Aquí se implementaría la funcionalidad para activar/desactivar usuarios
    alert(`Funcionalidad de ${action} de usuarios en desarrollo`)
  } catch (err) {
    error.value = `Error al ${action} usuario`
    console.error(`Error ${action}ing user:`, err)
  }
}

const closeUserModal = () => {
  showUserModal.value = false
  users.value = []
}

onMounted(async () => {
  await loadStats()
})
</script>