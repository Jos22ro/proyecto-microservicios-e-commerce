const axios = require('axios');

class AuthServiceClient {
  constructor() {
    this.baseURL = process.env.AUTH_SERVICE_URL || 'http://auth_service:8001';
    this.timeout = parseInt(process.env.AUTH_SERVICE_TIMEOUT) || 10000;
  }

  async validateToken(token) {
    try {
      const response = await axios.get(
        `${this.baseURL}/auth/validate`,
        {
          timeout: this.timeout,
          headers: {
            'Authorization': `Bearer ${token}`,
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
      console.error('Failed to validate token with auth service:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Auth service is unreachable',
          status: 503
        };
      } else {
        return {
          success: false,
          error: 'Internal error when calling auth service',
          status: 500
        };
      }
    }
  }

  async getUserInfo(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/auth/users/${userId}`,
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
      console.error(`Failed to get user info for ${userId}:`, error.message);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Auth service is unreachable',
          status: 503
        };
      } else {
        return {
          success: false,
          error: 'Internal error when calling auth service',
          status: 500
        };
      }
    }
  }
}

module.exports = AuthServiceClient;