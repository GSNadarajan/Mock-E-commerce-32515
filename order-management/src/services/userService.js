const axios = require('axios');

/**
 * User Service - Handles integration with user-management component
 */
class UserService {
  constructor() {
    // Use environment variables with sensible defaults
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
    this.usersEndpoint = `${this.baseUrl}/users`;
    this.authEndpoint = `${this.baseUrl}/auth`;
    
    // Configure axios defaults
    this.axiosConfig = {
      timeout: parseInt(process.env.API_TIMEOUT || '5000'), // 5 seconds default timeout
      maxRetries: parseInt(process.env.API_MAX_RETRIES || '3'), // 3 retries by default
      retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000') // 1 second delay between retries
    };
  }

  /**
   * Execute an API request with retry logic
   * @private
   * @param {Function} apiCall - The API call function to execute
   * @returns {Promise<any>} The API response
   */
  async _executeWithRetry(apiCall) {
    let lastError;
    for (let attempt = 0; attempt < this.axiosConfig.maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // Don't retry for client errors (4xx) except for 429 (too many requests)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          break;
        }
        
        // Don't retry for the last attempt
        if (attempt === this.axiosConfig.maxRetries - 1) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.axiosConfig.retryDelay));
      }
    }
    throw lastError;
  }

  /**
   * Get user by ID
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId, token) {
    try {
      const apiCall = () => axios.get(`${this.usersEndpoint}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall);
      return response.data;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to user service timed out');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('User service is unavailable');
      } else if (error.response) {
        throw new Error(`Failed to retrieve user data: ${error.response.status} ${error.response.statusText}`);
      } else {
        throw new Error('Failed to retrieve user data');
      }
    }
  }

  /**
   * Validate user exists
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<boolean>} True if user exists
   */
  async validateUser(userId, token) {
    try {
      await this.getUserById(userId, token);
      return true;
    } catch (error) {
      console.error(`User validation error for user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Check if user has admin role
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<boolean>} True if user is admin
   */
  async isAdmin(userId, token) {
    try {
      const user = await this.getUserById(userId, token);
      return user.role === 'admin';
    } catch (error) {
      console.error(`Admin check error for user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Verify user token
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Decoded token payload if valid
   */
  async verifyToken(token) {
    try {
      const apiCall = () => axios.post(`${this.authEndpoint}/verify-token`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall);
      
      // Ensure the response contains the expected data structure
      if (!response.data || !response.data.valid) {
        throw new Error('Invalid token response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to authentication service timed out');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Authentication service is unavailable');
      } else if (error.response) {
        // Handle specific HTTP status codes
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Invalid or expired token');
        } else {
          throw new Error(`Token verification failed: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        throw new Error('Invalid or expired token');
      }
    }
  }

  /**
   * Get user profile
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(token) {
    try {
      const apiCall = () => axios.get(`${this.authEndpoint}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall);
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to authentication service timed out');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Authentication service is unavailable');
      } else if (error.response) {
        throw new Error(`Failed to retrieve user profile: ${error.response.status} ${error.response.statusText}`);
      } else {
        throw new Error('Failed to retrieve user profile');
      }
    }
  }
}

module.exports = new UserService();
