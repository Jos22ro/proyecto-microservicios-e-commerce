import api from './axios'

export const userService = {
  register(userData) {
    return api.post('/auth/register', userData)
  },

  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  logout() {
    return api.post('/auth/logout')
  },

  getProfile() {
    return api.get('/auth/profile')
  },

  updateProfile(userData) {
    return api.put('/auth/profile', userData)
  },
}
