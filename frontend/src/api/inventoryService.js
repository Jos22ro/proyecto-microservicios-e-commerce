import api from './axios'

export default {
  getInventory() {
    return api.get('/inventory')
  },
  updateStock(productId, quantity) {
    return api.post(`/inventory/update`, { productId, quantity })
  },
}
