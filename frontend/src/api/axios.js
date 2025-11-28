import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  // Cambia esto por la URL de tu API Gateway o Backend principal
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: Se ejecuta ANTES de que salga la petición
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor opcional: Si el token expira (error 401), cerrar sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  },
)

export default api
