import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Helper functions for cookies
const setCookie = (name, value, days) => {
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = "; expires=" + date.toUTCString()
  }
  // Añadir SameSite=None y Secure para CORS cross-origin
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=None; Secure"
}

const getCookie = (name) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || null
      } catch {
        return null
      }
    })(),
    token: localStorage.getItem('token') || getCookie('access_token') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async register(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`/api/auth/register`, userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error en el registro'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async verifyCode(username, code) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`/api/auth/verify-code`, {
          username,
          code
        }, {
          withCredentials: true // Importante para CORS con cookies
        })
        
        this.token = response.data.access_token
        this.user = response.data.user
        
        // Guardar en localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        // Guardar token en cookie para que el backend lo lea
        setCookie('access_token', this.token, 1) // 1 día
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error en la verificación'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async login(email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`/api/auth/login`, {
          email,
          password
        }, {
          withCredentials: true // Importante para CORS con cookies
        })
        
        this.token = response.data.access_token
        
        // Obtener datos del usuario después del login
        const userResponse = await axios.get(`/api/auth/me`, {
          withCredentials: true
        })
        
        this.user = userResponse.data
        
        // Guardar en localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        // Guardar token en cookie para que el backend lo lea
        setCookie('access_token', this.token, 1) // 1 día
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error en el login'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async resendCode(email) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post(`/api/auth/resend-code`, {
          email
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al reenviar código'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      
      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Limpiar cookies
      deleteCookie('access_token')
      
      // Redirigir a login
      window.location.href = '/login'
    },

    async refreshUserInfo() {
      if (!this.token) return
      
      try {
        // Enviar token en header como fallback, ya que las cookies no cruzan orígenes fácilmente
        const response = await axios.get(`/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          withCredentials: true // Importante para CORS con cookies
        })
        
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        // Si hay error al refrescar, hacer logout
        this.logout()
      }
    }
  }
})