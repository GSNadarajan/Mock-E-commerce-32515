/**
 * Test Helper Utilities
 * Provides helper functions for testing and demonstration
 */

const axios = require('axios');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '5000'); // 5 seconds default timeout
const API_MAX_RETRIES = parseInt(process.env.API_MAX_RETRIES || '3'); // 3 retries by default
const API_RETRY_DELAY = parseInt(process.env.API_RETRY_DELAY || '1000'); // 1 second delay between retries

/**
 * Custom API Error class for better error categorization
 */
class ApiError extends Error {
  constructor(message, statusCode, errorType, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.originalError = originalError;
  }

  static fromError(error, defaultMessage = 'API request failed') {
    // Handle Axios errors
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      const statusCode = error.response.status;
      let errorType = 'UNKNOWN_ERROR';
      let message = `${defaultMessage}: ${statusCode} ${error.response.statusText}`;
      
      // Categorize based on status code
      if (statusCode === 400) {
        errorType = 'VALIDATION_ERROR';
        message = `Validation error: ${error.response.data?.error || error.response.statusText}`;
      } else if (statusCode === 401) {
        errorType = 'UNAUTHORIZED';
        message = 'Authentication failed: Invalid credentials or token';
      } else if (statusCode === 403) {
        errorType = 'FORBIDDEN';
        message = 'Access denied: Insufficient permissions';
      } else if (statusCode === 404) {
        errorType = 'NOT_FOUND';
        message = `Resource not found: ${error.response.data?.error || 'The requested resource does not exist'}`;
      } else if (statusCode === 409) {
        errorType = 'CONFLICT';
        message = `Resource conflict: ${error.response.data?.error || 'The resource already exists'}`;
      } else if (statusCode === 429) {
        errorType = 'RATE_LIMIT';
        message = 'Rate limit exceeded: Too many requests';
      } else if (statusCode >= 500) {
        errorType = 'SERVER_ERROR';
        message = `Server error: ${error.response.data?.error || 'Internal server error'}`;
      }
      
      return new ApiError(message, statusCode, errorType, error);
    } else if (error.request) {
      // Request was made but no response received
      let errorType = 'CONNECTION_ERROR';
      let message = 'No response received from server';
      let statusCode = 0;
      
      if (error.code === 'ECONNABORTED') {
        errorType = 'TIMEOUT';
        message = 'Connection timed out: Server took too long to respond';
      } else if (error.code === 'ECONNREFUSED') {
        errorType = 'SERVICE_UNAVAILABLE';
        message = 'Connection refused: Service is unavailable';
      } else if (error.code === 'ECONNRESET') {
        errorType = 'CONNECTION_RESET';
        message = 'Connection reset: The connection was reset during the request';
      }
      
      return new ApiError(message, statusCode, errorType, error);
    } else {
      // Something happened in setting up the request
      return new ApiError(error.message || defaultMessage, 0, 'REQUEST_SETUP_ERROR', error);
    }
  }
}

/**
 * Execute an API request with retry logic
 * @private
 * @param {Function} apiCall - The API call function to execute
 * @param {string} errorContext - Context for error messages
 * @returns {Promise<any>} The API response
 */
async function executeWithRetry(apiCall, errorContext) {
  let lastError;
  for (let attempt = 0; attempt < API_MAX_RETRIES; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx) except for 429 (too many requests)
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        break;
      }
      
      // Don't retry for the last attempt
      if (attempt === API_MAX_RETRIES - 1) {
        break;
      }
      
      console.warn(`${errorContext} - Attempt ${attempt + 1}/${API_MAX_RETRIES} failed, retrying...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_RETRY_DELAY));
    }
  }
  
  // Convert to ApiError for better error handling
  if (lastError.name === 'ApiError') {
    throw lastError;
  } else {
    throw ApiError.fromError(lastError, errorContext);
  }
}

/**
 * Create a test user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
async function createUser(userData) {
  try {
    const apiCall = () => axios.post(`${USER_SERVICE_URL}/auth/register`, userData, {
      timeout: API_TIMEOUT
    });
    
    const response = await executeWithRetry(apiCall, 'Error creating user');
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.message);
    
    // Throw a more specific error based on the error type
    if (error.name === 'ApiError') {
      if (error.errorType === 'VALIDATION_ERROR') {
        throw new ApiError(
          `User registration failed: Invalid data - ${error.message}`,
          error.statusCode,
          'USER_REGISTRATION_FAILED',
          error
        );
      } else if (error.errorType === 'CONFLICT') {
        throw new ApiError(
          'User registration failed: User already exists',
          error.statusCode,
          'USER_ALREADY_EXISTS',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'User registration failed');
    }
  }
}

/**
 * Verify a user's email (simulated)
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Response data
 */
async function verifyUser(token) {
  try {
    const apiCall = () => axios.get(`${USER_SERVICE_URL}/auth/verify-email?token=${token}`, {
      timeout: API_TIMEOUT
    });
    
    const response = await executeWithRetry(apiCall, 'Error verifying user');
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Email verification failed: Invalid or expired token',
          error.statusCode,
          'INVALID_VERIFICATION_TOKEN',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Email verification failed');
    }
  }
}

/**
 * Login a user
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Login response with token
 */
async function loginUser(credentials) {
  try {
    const apiCall = () => axios.post(`${USER_SERVICE_URL}/auth/login`, credentials, {
      timeout: API_TIMEOUT
    });
    
    const response = await executeWithRetry(apiCall, 'Error logging in');
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'UNAUTHORIZED') {
        throw new ApiError(
          'Login failed: Invalid credentials',
          error.statusCode,
          'INVALID_CREDENTIALS',
          error
        );
      } else if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Login failed: User not found',
          error.statusCode,
          'USER_NOT_FOUND',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Login failed');
    }
  }
}

/**
 * Create or update a cart
 * @param {string} userId - User ID
 * @param {Array} items - Cart items
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Cart data
 */
async function addItemToCart(userId, item, token) {
  try {
    const apiCall = () => axios.post(
      `${ORDER_SERVICE_URL}/carts/${userId}/items`,
      item,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error adding item to cart');
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Cart operation failed: User or cart not found',
          error.statusCode,
          'CART_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'VALIDATION_ERROR') {
        throw new ApiError(
          'Cart operation failed: Invalid item data',
          error.statusCode,
          'INVALID_CART_ITEM',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'Cart operation failed: Unauthorized access',
          error.statusCode,
          'CART_ACCESS_DENIED',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Cart operation failed');
    }
  }
}

/**
 * Get a user's cart
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Cart data
 */
async function getCart(userId, token) {
  try {
    const apiCall = () => axios.get(
      `${ORDER_SERVICE_URL}/carts/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error getting cart');
    return response.data;
  } catch (error) {
    console.error('Error getting cart:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Cart retrieval failed: Cart not found',
          error.statusCode,
          'CART_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'Cart retrieval failed: Unauthorized access',
          error.statusCode,
          'CART_ACCESS_DENIED',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Cart retrieval failed');
    }
  }
}

/**
 * Create an order
 * @param {Object} orderData - Order data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Created order
 */
async function createOrder(orderData, token) {
  try {
    const apiCall = () => axios.post(
      `${ORDER_SERVICE_URL}/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error creating order');
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'VALIDATION_ERROR') {
        throw new ApiError(
          'Order creation failed: Invalid order data',
          error.statusCode,
          'INVALID_ORDER_DATA',
          error
        );
      } else if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Order creation failed: Referenced resources not found',
          error.statusCode,
          'ORDER_RESOURCES_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'Order creation failed: Unauthorized access',
          error.statusCode,
          'ORDER_ACCESS_DENIED',
          error
        );
      } else if (error.errorType === 'SERVER_ERROR') {
        throw new ApiError(
          'Order creation failed: Database error',
          error.statusCode,
          'ORDER_DATABASE_ERROR',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Order creation failed');
    }
  }
}

/**
 * Get an order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Order data
 */
async function getOrder(orderId, token) {
  try {
    const apiCall = () => axios.get(
      `${ORDER_SERVICE_URL}/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error getting order');
    return response.data;
  } catch (error) {
    console.error('Error getting order:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Order retrieval failed: Order not found',
          error.statusCode,
          'ORDER_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'Order retrieval failed: Unauthorized access',
          error.statusCode,
          'ORDER_ACCESS_DENIED',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Order retrieval failed');
    }
  }
}

/**
 * Delete an order
 * @param {string} orderId - Order ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response data
 */
async function deleteOrder(orderId, token) {
  try {
    const apiCall = () => axios.delete(
      `${ORDER_SERVICE_URL}/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error deleting order');
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'Order deletion failed: Order not found',
          error.statusCode,
          'ORDER_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'Order deletion failed: Unauthorized access',
          error.statusCode,
          'ORDER_ACCESS_DENIED',
          error
        );
      } else if (error.errorType === 'SERVER_ERROR') {
        throw new ApiError(
          'Order deletion failed: Database error',
          error.statusCode,
          'ORDER_DATABASE_ERROR',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'Order deletion failed');
    }
  }
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response data
 */
async function deleteUser(userId, token) {
  try {
    const apiCall = () => axios.delete(
      `${USER_SERVICE_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: API_TIMEOUT
      }
    );
    
    const response = await executeWithRetry(apiCall, 'Error deleting user');
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.message);
    
    if (error.name === 'ApiError') {
      if (error.errorType === 'NOT_FOUND') {
        throw new ApiError(
          'User deletion failed: User not found',
          error.statusCode,
          'USER_NOT_FOUND',
          error
        );
      } else if (error.errorType === 'UNAUTHORIZED' || error.errorType === 'FORBIDDEN') {
        throw new ApiError(
          'User deletion failed: Unauthorized access',
          error.statusCode,
          'USER_ACCESS_DENIED',
          error
        );
      } else if (error.errorType === 'SERVER_ERROR') {
        throw new ApiError(
          'User deletion failed: Database error',
          error.statusCode,
          'USER_DATABASE_ERROR',
          error
        );
      } else {
        throw error; // Re-throw the ApiError
      }
    } else {
      throw ApiError.fromError(error, 'User deletion failed');
    }
  }
}

module.exports = {
  createUser,
  verifyUser,
  loginUser,
  addItemToCart,
  getCart,
  createOrder,
  getOrder,
  deleteOrder,
  deleteUser
};
