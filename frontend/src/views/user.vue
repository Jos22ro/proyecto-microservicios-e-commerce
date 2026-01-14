<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Mi Tienda</h1>
          <div class="flex space-x-4">
            <router-link 
              to="/catalog" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Ver Catálogo
            </router-link>
            <button 
              @click="handleLogout"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-grow">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ¡Bienvenido, {{ user?.username || 'Usuario' }}!
          </h2>
          <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Gracias por ser parte de nuestra comunidad. Explora nuestros productos y encuentra lo que necesitas.
          </p>
          
          <div class="mt-10 flex justify-center">
            <div class="rounded-md shadow">
              <router-link 
                to="/catalog" 
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Comenzar a Comprar
              </router-link>
            </div>
          </div>
        </div>

        <!-- Sección de destacados -->
        <div class="mt-16">
          <h3 class="text-2xl font-bold text-center text-gray-900 mb-8">¿Por qué elegirnos?</h3>
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                <div class="-mt-6">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-medium text-gray-900">Productos de Calidad</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Ofrecemos solo los mejores productos seleccionados cuidadosamente para ti.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                <div class="-mt-6">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-medium text-gray-900">Envíos Rápidos</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Recibe tus productos en tiempo récord con nuestro servicio de envío exprés.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                <div class="-mt-6">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-medium text-gray-900">Pago Seguro</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Tus pagos están protegidos con la última tecnología de encriptación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white mt-12">
      <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-500">
          &copy; 2023 Mi Tienda. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const user = ref(null)

// Cargar datos del usuario
onMounted(async () => {
  if (!authStore.user) {
    await authStore.refreshUserInfo()
  }
  user.value = authStore.user
})

// Cerrar sesión
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
    /* Estilos base para el layout */
.min-h-screen {
  min-height: 100vh;
}

/* Transiciones suaves */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Efecto hover en botones y enlaces */
.hover\:bg-indigo-700:hover {
  background-color: #4338ca;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

/* Estilos para las tarjetas de características */
.flow-root > div {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ajustes responsivos */
@media (max-width: 767px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .text-4xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
  
  .py-12 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

/* Mejoras de accesibilidad */
[type='button']:focus, 
[type='submit']:focus, 
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #4f46e5;
}

/* Ajustes para el botón de catálogo */
.rounded-md.shadow a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Efecto de hover en las tarjetas */
.bg-white {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Estilo para el mensaje de bienvenida */
.text-indigo-600 {
  color: #4f46e5;
}

/* Ajustes para el footer */
footer {
  margin-top: auto;
}

/* Mejoras en el contraste para accesibilidad */
.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

/* Ajustes para el botón de cierre de sesión */
button.border-gray-300 {
  transition: all 0.2s ease-in-out;
}

button.border-gray-300:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

/* Efecto de escala en el botón de catálogo */
.rounded-md.shadow {
  transition: transform 0.2s ease-in-out;
}

.rounded-md.shadow:hover {
  transform: scale(1.02);
}
</style>