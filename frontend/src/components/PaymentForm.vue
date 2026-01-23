<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">Información de Pago</h2>
    
    <!-- Indicador de seguridad -->
    <div class="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-green-800">Pago 100% seguro y encriptado</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Datos de la tarjeta -->
      <div class="space-y-4">
        <h3 class="text-sm font-medium text-gray-900">Datos de la Tarjeta</h3>
        
        <!-- Número de tarjeta -->
        <div>
          <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2">
            Número de Tarjeta
          </label>
          <div class="relative">
            <input
              id="cardNumber"
              v-model="formData.cardNumber"
              @input="formatCardNumber"
              type="text"
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-300 focus:ring-red-500': errors.cardNumber }"
              required
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <div class="h-6 w-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                <span v-if="cardType">{{ cardType }}</span>
                <span v-else>card</span>
              </div>
            </div>
          </div>
          <p v-if="errors.cardNumber" class="mt-1 text-sm text-red-600">{{ errors.cardNumber }}</p>
        </div>

        <!-- Nombre del titular -->
        <div>
          <label for="cardholderName" class="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Titular
          </label>
          <input
            id="cardholderName"
            v-model="formData.cardholderName"
            type="text"
            placeholder="JUAN PÉREZ"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
            :class="{ 'border-red-300 focus:ring-red-500': errors.cardholderName }"
            required
          />
          <p v-if="errors.cardholderName" class="mt-1 text-sm text-red-600">{{ errors.cardholderName }}</p>
        </div>

        <!-- Fecha de expiración y CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              id="expiryDate"
              v-model="formData.expiryDate"
              @input="formatExpiryDate"
              type="text"
              maxlength="5"
              placeholder="MM/AA"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-300 focus:ring-red-500': errors.expiryDate }"
              required
            />
            <p v-if="errors.expiryDate" class="mt-1 text-sm text-red-600">{{ errors.expiryDate }}</p>
          </div>

          <div>
            <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <div class="relative">
              <input
                id="cvv"
                v-model.trim="formData.cvv"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="4"
                placeholder="123"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="{ 'border-red-300 focus:ring-red-500': errors.cvv }"
                required
                @input="validateCvv"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  @click="showCvvHelp = !showCvvHelp"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="errors.cvv" class="mt-1 text-sm text-red-600">{{ errors.cvv }}</p>
            
            <!-- Ayuda CVV -->
            <div v-if="showCvvHelp" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              El CVV son los 3 dígitos en el reverso de tu tarjeta (o 4 en el frente para American Express)
            </div>
          </div>
        </div>
      </div>

      <!-- Datos de contacto -->
      <div class="space-y-4 border-t border-gray-200 pt-4">
        <h3 class="text-sm font-medium text-gray-900">Datos de Contacto</h3>
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="correo@ejemplo.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            :class="{ 'border-red-300 focus:ring-red-500': errors.email }"
            required
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Teléfono -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="+1 234 567 8900"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <!-- Métodos de pago aceptados -->
      <div class="border-t border-gray-200 pt-4">
        <p class="text-sm text-gray-600 mb-2">Métodos de pago aceptados:</p>
        <div class="flex space-x-2">
          <div class="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600 font-medium">VISA</div>
          <div class="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600 font-medium">MasterCard</div>
          <div class="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600 font-medium">American Express</div>
          <div class="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600 font-medium">Discover</div>
        </div>
      </div>

      <!-- Botón de envío -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSubmitting">Procesando...</span>
          <span v-else>Pagar ${{ formatAmount(totalAmount) }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentsStore } from '../stores/payments'
import { useAuthStore } from '../stores/auth'

// Props
const props = defineProps({
  totalAmount: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['submit', 'validation-change'])

// Stores
const paymentsStore = usePaymentsStore()
const authStore = useAuthStore()

// Estado del formulario
const formData = ref({
  cardNumber: '',
  cardholderName: '',
  expiryDate: '',
  cvv: '',
  email: '',
  phone: ''
})

const errors = ref({})
const isSubmitting = ref(false)
const showCvvHelp = ref(false)

// Computed properties
const isFormValid = computed(() => {
  // Validar campos requeridos
  const hasCardNumber = formData.value.cardNumber.replace(/\s/g, '').length >= 13
  const hasCardholderName = formData.value.cardholderName.trim().length >= 3
  const hasExpiryDate = formData.value.expiryDate.length === 5 && formData.value.expiryDate.includes('/')
  const hasCvv = formData.value.cvv.length >= 3 && formData.value.cvv.length <= 4
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
  
  return hasCardNumber && hasCardholderName && hasExpiryDate && hasCvv && hasEmail
})

const cardType = computed(() => {
  const number = formData.value.cardNumber.replace(/\s/g, '')
  
  if (number.startsWith('4')) return 'VISA'
  if (number.startsWith('5') || number.startsWith('2')) return 'MC'
  if (number.startsWith('3')) return 'AMEX'
  if (number.startsWith('6')) return 'DISC'
  
  return null
})

// Métodos
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.replace(/(.{4})/g, '$1 ').trim()
  formData.value.cardNumber = value
  
  // Validar en tiempo real
  validateCardNumber()
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  
  formData.value.expiryDate = value
  validateExpiryDate()
}

const validateCardNumber = () => {
  const number = formData.value.cardNumber.replace(/\s/g, '')
  
  if (number.length < 13 || number.length > 19) {
    errors.value.cardNumber = 'El número de tarjeta debe tener entre 13 y 19 dígitos'
    return false
  }
  
  // Validación Luhn
  let sum = 0
  let isEven = false
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  if (sum % 10 !== 0) {
    errors.value.cardNumber = 'El número de tarjeta no es válido'
    return false
  }
  
  delete errors.value.cardNumber
  return true
}

const validateExpiryDate = () => {
  const expiry = formData.value.expiryDate
  
  if (!expiry.includes('/') || expiry.length !== 5) {
    errors.value.expiryDate = 'Formato inválido. Usa MM/AA'
    return false
  }
  
  const [month, year] = expiry.split('/')
  const monthNum = parseInt(month)
  const yearNum = parseInt(year) + 2000 // Convertir YY a YYYY
  
  if (monthNum < 1 || monthNum > 12) {
    errors.value.expiryDate = 'Mes inválido'
    return false
  }
  
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    errors.value.expiryDate = 'La tarjeta ha expirado'
    return false
  }
  
  delete errors.value.expiryDate
  return true
}

const validateCvv = () => {
  // Eliminar espacios en blanco al principio y al final
  const cvv = formData.value.cvv.trim()
  
  if (!cvv) {
    errors.value.cvv = 'El CVV es requerido'
    return false
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.value.cvv = 'El CVV debe tener 3 o 4 dígitos numéricos'
    return false
  }
  
  delete errors.value.cvv
  return true
}

const validateEmail = () => {
  const email = formData.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    errors.value.email = 'El email no es válido'
    return false
  }
  
  delete errors.value.email
  return true
}

const validateForm = () => {
  let isValid = true
  
  isValid = validateCardNumber() && isValid
  isValid = validateExpiryDate() && isValid
  isValid = validateCvv() && isValid
  isValid = validateEmail() && isValid
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Actualizar store con los datos del formulario
    Object.assign(paymentsStore.paymentData, formData.value)
    
    // Emitir evento de submit
    emit('submit', formData.value)
    
  } catch (error) {
    console.error('Error submitting payment form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Watchers
watch(isFormValid, (newValue) => {
  emit('validation-change', newValue)
})

// Inicialización
onMounted(() => {
  // Prellenar email si el usuario está autenticado
  if (authStore.user?.email) {
    formData.value.email = authStore.user.email
  }
  
  // Validar formulario inicial
  validateForm()
})
</script>