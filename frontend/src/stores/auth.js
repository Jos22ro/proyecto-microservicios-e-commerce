import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/api/authService'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // --- LOGIN (Ya lo tenías) ---
  const login = async (credentials) => {
    const response = await authService.login(credentials)
    _setSession(response.data)
    router.push('/productos')
  }

  // --- REGISTRO (Nuevo) ---
  const register = async (userData) => {
    // Asumimos que el backend devuelve lo mismo que el login (token + user)
    // Si tu backend solo devuelve "ok" y pide loguearse, cambia esto.
    const response = await authService.register(userData)
    _setSession(response.data)
    router.push('/productos') // Redirigir al dashboard tras registro exitoso
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Helper privado para guardar sesión
  const _setSession = (data) => {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return { token, user, login, register, logout }
})
