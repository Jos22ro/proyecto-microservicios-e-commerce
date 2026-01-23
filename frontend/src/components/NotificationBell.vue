<template>
  <!-- Notificaciones flotantes -->
  <div v-if="showNotifications" class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="notification in visibleNotifications"
      :key="notification.id"
      :class="[
        'max-w-sm p-4 rounded-lg shadow-lg border transform transition-all duration-300',
        notificationClass(notification)
      ]"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <component 
            :is="notificationIcon(notification)" 
            class="h-5 w-5" 
            :class="notificationIconClass(notification)"
          />
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">
            {{ notificationTitle(notification) }}
          </p>
          <p class="mt-1 text-sm">
            {{ notificationMessage(notification) }}
          </p>
          <p class="mt-1 text-xs opacity-75">
            {{ formatNotificationTime(notification.timestamp) }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="dismissNotification(notification.id)"
            class="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Badge de notificaciones en header -->
  <div class="relative">
    <button
      @click="toggleNotificationPanel"
      class="p-2 rounded-full hover:bg-gray-100 relative"
      :class="unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'"
    >
      <BellIcon class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Panel de notificaciones -->
    <div
      v-if="showPanel"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <div class="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Notificaciones</h3>
          <button
            @click="clearAllNotifications"
            class="text-blue-200 hover:text-white text-sm"
          >
            Limpiar todas
          </button>
        </div>
      </div>
      
      <div class="max-h-80 overflow-y-auto">
        <div
          v-for="notification in notificationsStore.recentNotificationsSorted"
          :key="notification.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <component
                    :is="notificationIcon(notification)"
                    class="h-4 w-4 mr-2"
                    :class="notificationIconClass(notification)"
                  />
                  <p class="text-sm font-medium text-gray-900">
                    {{ notificationTitle(notification) }}
                  </p>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  {{ notificationMessage(notification) }}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  {{ formatFullNotificationTime(notification.timestamp) }}
                </p>
              </div>
              <button
                @click="dismissNotification(notification.id)"
                class="ml-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div
          v-if="!notificationsStore.hasRecentNotifications"
          class="text-center py-8 text-gray-500"
        >
          <BellIcon class="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p class="text-sm">No hay notificaciones recientes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '../stores/notifications'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  showNotifications: {
    type: Boolean,
    default: true
  }
})

const notificationsStore = useNotificationsStore()
const showPanel = ref(false)
const dismissedNotifications = ref(new Set())

// Computed properties
const unreadCount = computed(() => {
  return notificationsStore.recentNotifications.filter(
    n => !dismissedNotifications.value.has(n.id) && n.status === 'success'
  ).length
})

const visibleNotifications = computed(() => {
  return notificationsStore.recentNotifications
    .filter(n => !dismissedNotifications.value.has(n.id))
    .slice(0, 3) // Mostrar máximo 3 notificaciones flotantes
})

// Methods
const toggleNotificationPanel = () => {
  showPanel.value = !showPanel.value
}

const dismissNotification = (notificationId) => {
  dismissedNotifications.value.add(notificationId)
  
  // Si se descarta una notificación del panel, cerrar el panel
  if (showPanel.value) {
    showPanel.value = false
  }
}

const clearAllNotifications = () => {
  notificationsStore.clearRecentNotifications()
  showPanel.value = false
  dismissedNotifications.value.clear()
}

const notificationClass = (notification) => {
  if (notification.status === 'success') {
    return 'bg-green-50 border-green-200 text-green-800'
  } else if (notification.status === 'error') {
    return 'bg-red-50 border-red-200 text-red-800'
  } else {
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

const notificationIcon = (notification) => {
  if (notification.status === 'success') {
    return CheckCircleIcon
  } else if (notification.status === 'error') {
    return ExclamationCircleIcon
  } else {
    return InformationCircleIcon
  }
}

const notificationIconClass = (notification) => {
  if (notification.status === 'success') {
    return 'text-green-500'
  } else if (notification.status === 'error') {
    return 'text-red-500'
  } else {
    return 'text-blue-500'
  }
}

const notificationTitle = (notification) => {
  const titles = {
    'order_created': 'Pedido Confirmado',
    'payment_confirmed': 'Pago Aprobado',
    'status_changed': 'Actualización de Pedido'
  }
  return titles[notification.event] || 'Notificación'
}

const notificationMessage = (notification) => {
  if (notification.status === 'error') {
    return 'Error al enviar notificación'
  }
  
  const messages = {
    'order_created': `Tu pedido #${notification.order_id} ha sido confirmado`,
    'payment_confirmed': `El pago de ${notification.extra_data} ha sido procesado`,
    'status_changed': `Estado actualizado: ${notification.extra_data}`
  }
  
  return messages[notification.event] || 'Notificación enviada'
}

const formatNotificationTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFullNotificationTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Cerrar panel cuando se hace clic fuera
  const handleClickOutside = (event) => {
    if (showPanel.value && !event.target.closest('.relative')) {
      showPanel.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>