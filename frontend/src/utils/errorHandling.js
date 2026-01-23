// Utilidades para manejo de errores y estados de carga

export class ErrorHandler {
  static handleApiError(error, context = '') {
    console.error(`API Error in ${context}:`, error)
    
    if (error.response) {
      // Error del servidor (4xx, 5xx)
      const status = error.response.status
      const message = error.response.data?.error || error.response.data?.message || 'Error del servidor'
      
      switch (status) {
        case 400:
          return { message: 'Solicitud inválida. Verifica los datos enviados.', type: 'validation' }
        case 401:
          return { message: 'No autorizado. Por favor, inicia sesión nuevamente.', type: 'auth' }
        case 403:
          return { message: 'Acceso denegado. No tienes permisos para esta acción.', type: 'auth' }
        case 404:
          return { message: 'Recurso no encontrado.', type: 'not_found' }
        case 408:
          return { message: 'Tiempo de espera agotado. Inténtalo nuevamente.', type: 'timeout' }
        case 429:
          return { message: 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.', type: 'rate_limit' }
        case 500:
          return { message: 'Error interno del servidor. Inténtalo más tarde.', type: 'server' }
        case 502:
        case 503:
        case 504:
          return { message: 'Servicio no disponible. Inténtalo más tarde.', type: 'service' }
        default:
          return { message: message || 'Error desconocido del servidor.', type: 'server' }
      }
    } else if (error.request) {
      // Error de red o timeout
      return { message: 'Error de conexión. Verifica tu conexión a internet.', type: 'network' }
    } else {
      // Error del cliente
      return { message: error.message || 'Error desconocido.', type: 'client' }
    }
  }
  
  static getErrorMessage(error, fallbackMessage = 'Ha ocurrido un error') {
    const handledError = this.handleApiError(error)
    return handledError.message || fallbackMessage
  }
  
  static getErrorType(error) {
    const handledError = this.handleApiError(error)
    return handledError.type || 'unknown'
  }
  
  static shouldRetry(error) {
    const errorType = this.getErrorType(error)
    return ['network', 'timeout', 'service', 'rate_limit'].includes(errorType)
  }
}

export class LoadingManager {
  constructor() {
    this.loadingStates = new Map()
    this.retryAttempts = new Map()
    this.maxRetries = 3
  }
  
  setLoading(key, loading = true) {
    this.loadingStates.set(key, loading)
  }
  
  isLoading(key) {
    return this.loadingStates.get(key) || false
  }
  
  anyLoading() {
    return Array.from(this.loadingStates.values()).some(loading => loading)
  }
  
  async withLoading(key, asyncFunction, retryOnError = true) {
    this.setLoading(key, true)
    
    try {
      const result = await this.executeWithRetry(asyncFunction, key, retryOnError)
      this.retryAttempts.delete(key)
      return result
    } catch (error) {
      this.retryAttempts.delete(key)
      throw error
    } finally {
      this.setLoading(key, false)
    }
  }
  
  async executeWithRetry(asyncFunction, key, retryOnError = true) {
    const maxRetries = retryOnError ? this.maxRetries : 0
    const attempts = this.retryAttempts.get(key) || 0
    
    try {
      return await asyncFunction()
    } catch (error) {
      if (attempts < maxRetries && ErrorHandler.shouldRetry(error)) {
        this.retryAttempts.set(key, attempts + 1)
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempts) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return this.executeWithRetry(asyncFunction, key, retryOnError)
      }
      
      throw error
    }
  }
  
  clearAll() {
    this.loadingStates.clear()
    this.retryAttempts.clear()
  }
}

export class ToastManager {
  constructor() {
    this.toasts = []
    this.maxToasts = 5
  }
  
  addToast(message, type = 'info', duration = 5000) {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration,
      timestamp: new Date()
    }
    
    this.toasts.unshift(toast)
    
    // Limitar número de toasts
    if (this.toasts.length > this.maxToasts) {
      this.toasts = this.toasts.slice(0, this.maxToasts)
    }
    
    // Auto-remove después de la duración
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id)
      }, duration)
    }
    
    return toast.id
  }
  
  removeToast(id) {
    const index = this.toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      this.toasts.splice(index, 1)
    }
  }
  
  success(message, duration = 5000) {
    return this.addToast(message, 'success', duration)
  }
  
  error(message, duration = 0) {
    return this.addToast(message, 'error', duration)
  }
  
  warning(message, duration = 5000) {
    return this.addToast(message, 'warning', duration)
  }
  
  info(message, duration = 5000) {
    return this.addToast(message, 'info', duration)
  }
  
  clear() {
    this.toasts = []
  }
  
  getToasts() {
    return this.toasts
  }
}

// Instancias globales
export const loadingManager = new LoadingManager()
export const toastManager = new ToastManager()

// Composables para Vue
export function useErrorHandler() {
  const handleError = (error, context = '', showToast = true) => {
    const message = ErrorHandler.getErrorMessage(error)
    const type = ErrorHandler.getErrorType(error)
    
    if (showToast) {
      toastManager.error(message)
    }
    
    return { message, type, originalError: error }
  }
  
  const handleSuccess = (message, showToast = true) => {
    if (showToast) {
      toastManager.success(message)
    }
  }
  
  return { handleError, handleSuccess }
}

export function useLoading() {
  const setLoading = (key, loading) => {
    loadingManager.setLoading(key, loading)
  }
  
  const isLoading = (key) => {
    return loadingManager.isLoading(key)
  }
  
  const anyLoading = () => {
    return loadingManager.anyLoading()
  }
  
  const withLoading = async (key, asyncFunction, retryOnError = true) => {
    return loadingManager.withLoading(key, asyncFunction, retryOnError)
  }
  
  return { setLoading, isLoading, anyLoading, withLoading }
}

export function useToast() {
  return toastManager
}