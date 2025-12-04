<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verificar Código
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ingresa el código de 6 dígitos enviado a tu email
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleVerify">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Tu nombre de usuario"
          />
        </div>

        <div>
          <label for="code" class="block text-sm font-medium text-gray-700">Código de Verificación</label>
          <input
            id="code"
            v-model="form.code"
            type="text"
            maxlength="6"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-lg tracking-widest"
            placeholder="123456"
            @input="formatCode"
          />
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ error }}
          </div>
        </div>

        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-700">
            {{ success }}
          </div>
        </div>

        <div class="space-y-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Verificando...' : 'Verificar Código' }}
          </button>

          <button
            type="button"
            @click="handleResendCode"
            :disabled="isResending"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="isResending" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isResending ? 'Enviando...' : 'Reenviar Código' }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Volver al inicio de sesión
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  code: ''
})

const error = ref('')
const success = ref('')
const isLoading = ref(false)
const isResending = ref(false)

const formatCode = (event) => {
  // Solo permitir números
  const value = event.target.value.replace(/\D/g, '')
  form.code = value.slice(0, 6)
}

const handleVerify = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true
  
  try {
    await authStore.verifyCode(form.username, form.code)
    success.value = 'Verificación exitosa. Redirigiendo...'
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err) {
    error.value = authStore.error || 'Error al verificar código'
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  if (!form.username) {
    error.value = 'Por favor ingresa tu nombre de usuario'
    return
  }
  
  isResending.value = true
  error.value = ''
  
  try {
    await authStore.resendCode(form.username)
    success.value = 'Código reenviado a tu email'
  } catch (err) {
    error.value = authStore.error || 'Error al reenviar código'
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>