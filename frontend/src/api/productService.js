import api from './axios'

export default {
  getProducts() {
    return api.get('/products') // Endpoint del microservicio de productos
  },
}
