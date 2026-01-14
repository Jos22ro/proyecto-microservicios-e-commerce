const axios = require('axios');

class OrdersServiceClient {
  constructor() {
    this.baseURL = process.env.ORDERS_SERVICE_URL || 'http://orders-service:8080';
    this.timeout = parseInt(process.env.ORDERS_SERVICE_TIMEOUT) || 10000;
  }

  async updateOrderStatus(orderId, status, paymentId) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/api/v1/orders/${orderId}/status`,
        { 
          status: status,
          paymentId: paymentId,
          updatedAt: new Date().toISOString()
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Payments-Service/1.0'
          }
        }
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error.message);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Orders service is unreachable',
          status: 503
        };
      } else {
        return {
          success: false,
          error: 'Internal error when calling orders service',
          status: 500
        };
      }
    }
  }

  async getOrder(orderId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/v1/orders/${orderId}`,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Payments-Service/1.0'
          }
        }
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Failed to get order ${orderId}:`, error.message);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Orders service is unreachable',
          status: 503
        };
      } else {
        return {
          success: false,
          error: 'Internal error when calling orders service',
          status: 500
        };
      }
    }
  }
}

module.exports = OrdersServiceClient;