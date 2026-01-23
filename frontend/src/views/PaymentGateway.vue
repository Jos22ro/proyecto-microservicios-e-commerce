<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Pasarela de Pago</h1>
          <p class="mt-2 text-gray-600">
            Completa tus datos de forma segura para procesar tu pedido
          </p>
        </div>
        
        <!-- Indicador de progreso -->
        <div class="hidden sm:flex items-center space-x-2">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span class="ml-2 text-sm text-gray-600">Carrito</span>
          </div>
          <div class="w-8 h-0.5 bg-green-600"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span class="ml-2 text-sm text-gray-900 font-medium">Pago</span>
          </div>
          <div class="w-8 h-0.5 bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span class="ml-2 text-sm text-gray-600">Confirmación</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Validación de carrito -->
    <div v-if="!hasValidCart" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">Carrito inválido</h3>
      <p class="mt-1 text-sm text-gray-500">
        No hay productos en tu carrito o tu sesión ha expirado.
      </p>
      <div class="mt-6">
        <router-link
          to="/catalog"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          Ir al Catálogo
        </router-link>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulario de pago -->
      <div class="lg:col-span-2">
        <PaymentForm
          :total-amount="finalTotal"
          @submit="handlePaymentSubmit"
          @validation-change="handleValidationChange"
        />
        
        <!-- Mensaje de error -->
        <div v-if="paymentError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800">Error en el pago</h3>
              <p class="mt-1 text-sm text-red-700">{{ paymentError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen del pedido -->
      <div class="lg:col-span-1">
        <PaymentSummary
          :order-items="cartItems"
          :shipping-address="shippingAddress"
        />
        
        <!-- Información de seguridad -->
        <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <svg class="h-5 w-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-blue-900 mb-1">Protección de datos</h4>
              <p class="text-xs text-blue-700">
                Tu información de pago está encriptada y protegida. No almacenamos tus datos de tarjeta.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Política de devolución -->
        <div class="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div class="flex items-start">
            <svg class="h-5 w-5 text-gray-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900 mb-1">Garantía de satisfacción</h4>
              <p class="text-xs text-gray-700">
                30 días de devolución gratuita. Si no estás satisfecho, te devolvemos tu dinero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de procesamiento -->
    <div
      v-if="isProcessingPayment"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Procesando pago</h3>
          <p class="mt-2 text-sm text-gray-500">
            Estamos procesando tu pago de forma segura. Por favor, espera...
          </p>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 70%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { usePaymentsStore } from '../stores/payments'
import PaymentForm from '../components/PaymentForm.vue'
import PaymentSummary from '../components/PaymentSummary.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const paymentsStore = usePaymentsStore()

// Estado
const isFormValid = ref(false)
const isProcessingPayment = ref(false)
const paymentError = ref(null)

// Computed properties
const hasValidCart = computed(() => {
  return cartStore.items.length > 0 && authStore.isAuthenticated
})

const cartItems = computed(() => cartStore.items)

const finalTotal = computed(() => {
  const subtotal = cartStore.totalAmount
  const shippingCost = subtotal >= 100 ? 0 : 10
  const taxAmount = subtotal * 0.08
  return subtotal + shippingCost + taxAmount
})

const shippingAddress = computed(() => {
  // En una implementación real, esto vendría del perfil del usuario
  return authStore.user ? {
    name: `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim() || authStore.user.email,
    street: 'Calle Principal 123',
    city: 'Ciudad de Ejemplo',
    state: 'Estado',
    zipCode: '12345'
  } : null
})

// Métodos
const handleValidationChange = (isValid) => {
  isFormValid.value = isValid
}

const handlePaymentSubmit = async (paymentFormData) => {
  if (!isFormValid.value) {
    paymentError.value = 'Por favor, completa todos los campos requeridos'
    return
  }

  isProcessingPayment.value = true
  paymentError.value = null

  try {
    // Preparar datos del pedido
    const orderData = {
      orderId: paymentsStore.generateOrderId(),
      amount: finalTotal.value,
      items: cartStore.items,
      customerInfo: {
        email: paymentFormData.email,
        phone: paymentFormData.phone,
        name: paymentFormData.cardholderName
      },
      shippingAddress: shippingAddress.value
    }

    // Crear pago en el servidor
    const payment = await paymentsStore.createPayment(orderData)

    // Procesar pago localmente (simulación)
    await paymentsStore.processPayment()

    // Redirigir a página de estado
    router.push({
      name: 'PaymentStatus',
      params: { transactionId: payment.transaction_id }
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    paymentError.value = error.message || 'Error al procesar el pago. Por favor, intenta nuevamente.'
  } finally {
    isProcessingPayment.value = false
  }
}

// Validación inicial
onMounted(() => {
  // Verificar que el usuario esté autenticado
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Verificar que el carrito tenga productos
  if (cartStore.items.length === 0) {
    router.push('/cart')
    return
  }

  // Limpiar cualquier error previo
  paymentError.value = null
})
</script>