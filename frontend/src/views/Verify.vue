<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Revisa tu correo
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Hemos enviado un enlace de verificación a tu dirección de correo electrónico.
        </p>
        <p class="mt-2 text-center text-sm text-gray-500">
          Por favor, haz clic en el enlace para activar tu cuenta.
        </p>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {{ error }}
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-md bg-blue-50 p-4">
          <div class="text-sm text-blue-700">
            <p class="font-medium">¿No recibiste el correo?</p>
            <ul class="mt-2 list-disc list-inside space-y-1 text-xs">
              <li>Revisa tu carpeta de spam</li>
              <li>Verifica que la dirección de correo sea correcta</li>
              <li>El enlace expirará en 24 horas</li>
            </ul>
          </div>
        </div>

        <button
          @click="goToLogin"
          class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Ir al inicio de sesión
        </button>

        <button
          @click="goToHome"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Ir a la página principal
        </button>
      </div>

      <div class="text-center">
        <p class="text-xs text-gray-500">
          Después de verificar tu cuenta, podrás iniciar sesión normalmente.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref('')

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  // Mostrar mensaje de éxito si viene del registro
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('registered') === 'true') {
    // Podríamos mostrar un toast o mensaje temporal aquí
  }
})
</script>