<template>
  <div class="flex flex-col items-center justify-center p-8">
    <!-- Icono principal -->
    <div class="relative mb-6">
      <!-- Icono de estado -->
      <div 
        :class="[
          'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
          statusConfig.bgColor
        ]"
      >
        <svg 
          :class="['w-10 h-10', statusConfig.iconColor]" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <component :is="statusConfig.icon" />
        </svg>
      </div>
      
      <!-- Animación de procesamiento -->
      <div 
        v-if="status === 'PROCESSING'"
        class="absolute inset-0 w-20 h-20 rounded-full border-4 border-indigo-200 animate-ping"
      ></div>
    </div>

    <!-- Texto de estado -->
    <div class="text-center mb-6">
      <h2 :class="['text-2xl font-bold mb-2', statusConfig.textColor]">
        {{ statusConfig.title }}
      </h2>
      <p class="text-gray-600 max-w-md">
        {{ statusConfig.description }}
      </p>
    </div>

    <!-- Detalles adicionales -->
    <div v-if="showDetails && paymentDetails" class="w-full max-w-md space-y-4">
      <!-- ID de transacción -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">ID de Transacción:</span>
          <code class="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
            {{ paymentDetails.transaction_id }}
          </code>
        </div>
      </div>

      <!-- Monto -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Monto:</span>
          <span class="text-lg font-bold text-gray-900">
            ${{ formatPrice(paymentDetails.amount) }}
          </span>
        </div>
      </div>

      <!-- Fecha y hora -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Fecha:</span>
          <span class="text-sm text-gray-900">
            {{ formatDate(paymentDetails.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex flex-col sm:flex-row gap-3 mt-8">
      <button
        v-if="status === 'REJECTED'"
        @click="$emit('retry-payment')"
        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors duration-200"
      >
        Reintentar Pago
      </button>
      
      <button
        v-if="status === 'APPROVED'"
        @click="$emit('continue-shopping')"
        class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200"
      >
        Seguir Comprando
      </button>
      
      <button
        v-if="status === 'APPROVED'"
        @click="$emit('view-orders')"
        class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
      >
        Ver Mis Pedidos
      </button>

      <button
        v-if="status === 'APPROVED' && paymentDetails?.order_id"
        @click="$emit('view-order-details')"
        class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200 ml-2"
      >
        Ver Detalles de Orden
      </button>
      
      <button
        v-if="status === 'PENDING' || status === 'PROCESSING'"
        @click="$emit('check-status')"
        :disabled="isChecking"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors duration-200"
      >
        <span v-if="isChecking" class="flex items-center">
          <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verificando...
        </span>
        <span v-else>Verificar Estado</span>
      </button>
      
      <button
        @click="$emit('cancel')"
        class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors duration-200"
      >
        Cancelar
      </button>
    </div>

    <!-- Mensaje de ayuda -->
    <div v-if="status === 'REJECTED'" class="mt-6 text-center">
      <p class="text-sm text-gray-600 mb-2">
        ¿Necesitas ayuda? Contacta a nuestro equipo de soporte
      </p>
      <div class="flex justify-center space-x-4">
        <a href="tel:+1234567890" class="text-indigo-600 hover:text-indigo-500 text-sm">
          +1 (234) 567-890
        </a>
        <a href="mailto:soporte@ejemplo.com" class="text-indigo-600 hover:text-indigo-500 text-sm">
          soporte@ejemplo.com
        </a>
      </div>
    </div>

    <!-- Indicador de progreso para procesamiento -->
    <div v-if="status === 'PROCESSING'" class="w-full max-w-md mt-6">
      <div class="flex justify-center mb-2">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
      <p class="text-xs text-gray-500 text-center">
        Esto puede tomar unos segundos...
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'].includes(value)
  },
  paymentDetails: {
    type: Object,
    default: null
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  isChecking: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'retry-payment',
  'continue-shopping',
  'view-orders',
  'check-status',
  'cancel'
])

// Configuración de estados
const statusConfig = computed(() => {
  const configs = {
    PENDING: {
      title: 'Pago Pendiente',
      description: 'Tu pago está siendo procesado. Por favor, espera un momento.',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: 'ClockIcon'
    },
    PROCESSING: {
      title: 'Procesando Pago',
      description: 'Estamos procesando tu pago con el banco. Esto puede tardar unos segundos.',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: 'RefreshIcon'
    },
    APPROVED: {
      title: '¡Pago Aprobado!',
      description: 'Tu pago ha sido procesado exitosamente. Recibirás una confirmación por email.',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: 'CheckIcon'
    },
    REJECTED: {
      title: 'Pago Rechazado',
      description: 'Tu pago no pudo ser procesado. Por favor, verifica tus datos o intenta con otro método de pago.',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: 'XIcon'
    }
  }
  
  return configs[props.status] || configs.PENDING
})

// Iconos SVG
const ClockIcon = () => `
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
`

const RefreshIcon = () => `
  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
`

const CheckIcon = () => `
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
`

const XIcon = () => `
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
`

// Métodos
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>