const axios = require('axios');
const Logger = require('../utils/logger');

/**
 * Custom error classes for better error handling
 */
class ServiceError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NetworkError extends ServiceError {
  constructor(message, originalError = null) {
    super(message, null, originalError);
    this.isRetryable = true;
  }
}

class TimeoutError extends NetworkError {
  constructor(message, originalError = null) {
    super(message, null, originalError);
    this.isRetryable = true;
  }
}

class ServiceUnavailableError extends NetworkError {
  constructor(message, originalError = null) {
    super(message, 503, originalError);
    this.isRetryable = true;
  }
}

class AuthenticationError extends ServiceError {
  constructor(message, statusCode = 401, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

class ValidationError extends ServiceError {
  constructor(message, statusCode = 400, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

/**
 * Circuit breaker states
 */
const CircuitState = {
  CLOSED: 'CLOSED',      // Normal operation, requests pass through
  OPEN: 'OPEN',          // Service considered down, requests fail fast
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back up
};

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
      retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'), // 1 second delay between retries
      retryMultiplier: parseFloat(process.env.API_RETRY_MULTIPLIER || '1.5') // Exponential backoff multiplier
    };
    
    // Circuit breaker configuration
    this.circuitBreaker = {
      state: CircuitState.CLOSED,
      failureThreshold: parseInt(process.env.CIRCUIT_FAILURE_THRESHOLD || '5'),
      resetTimeout: parseInt(process.env.CIRCUIT_RESET_TIMEOUT || '30000'), // 30 seconds
      failureCount: 0,
      lastFailureTime: null,
      services: {}
    };
  }

  /**
   * Check circuit breaker state for a specific service
   * @private
   * @param {string} serviceName - Name of the service to check
   * @returns {boolean} True if the circuit is closed (requests allowed)
   */
  _checkCircuitBreaker(serviceName) {
    // Initialize service circuit if it doesn't exist
    if (!this.circuitBreaker.services[serviceName]) {
      this.circuitBreaker.services[serviceName] = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        lastFailureTime: null
      };
    }
    
    const circuit = this.circuitBreaker.services[serviceName];
    
    // If circuit is OPEN, check if reset timeout has elapsed
    if (circuit.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - circuit.lastFailureTime > this.circuitBreaker.resetTimeout) {
        // Transition to HALF_OPEN to test if service is back
        Logger.info(`Circuit for ${serviceName} transitioning from OPEN to HALF_OPEN`, {
          serviceName,
          previousState: CircuitState.OPEN,
          newState: CircuitState.HALF_OPEN
        });
        circuit.state = CircuitState.HALF_OPEN;
        return true; // Allow a test request
      }
      return false; // Circuit still OPEN, fail fast
    }
    
    return true; // Circuit is CLOSED or HALF_OPEN, allow request
  }
  
  /**
   * Update circuit breaker state based on request result
   * @private
   * @param {string} serviceName - Name of the service
   * @param {boolean} success - Whether the request was successful
   */
  _updateCircuitBreaker(serviceName, success) {
    const circuit = this.circuitBreaker.services[serviceName];
    
    if (success) {
      // On success, reset failure count and close circuit if it was HALF_OPEN
      if (circuit.state === CircuitState.HALF_OPEN) {
        Logger.info(`Circuit for ${serviceName} transitioning from HALF_OPEN to CLOSED`, {
          serviceName,
          previousState: CircuitState.HALF_OPEN,
          newState: CircuitState.CLOSED
        });
        circuit.state = CircuitState.CLOSED;
      }
      circuit.failureCount = 0;
    } else {
      // On failure, increment failure count
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();
      
      // If threshold reached, open the circuit
      if (circuit.failureCount >= this.circuitBreaker.failureThreshold) {
        if (circuit.state !== CircuitState.OPEN) {
          Logger.warn(`Circuit for ${serviceName} transitioning to OPEN after ${circuit.failureCount} failures`, {
            serviceName,
            previousState: circuit.state,
            newState: CircuitState.OPEN,
            failureCount: circuit.failureCount,
            resetTimeout: this.circuitBreaker.resetTimeout
          });
          circuit.state = CircuitState.OPEN;
        }
      }
    }
  }
  
  /**
   * Create appropriate error object based on axios error
   * @private
   * @param {Error} error - The original error
   * @param {string} context - Context information about the request
   * @returns {ServiceError} Categorized error
   */
  _categorizeError(error, context) {
    // Network or connection errors
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError(`Connection to ${context} timed out`, error);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new ServiceUnavailableError(`${context} is unavailable`, error);
    }
    
    // HTTP response errors
    if (error.response) {
      const { status } = error.response;
      
      // Authentication errors
      if (status === 401 || status === 403) {
        return new AuthenticationError(
          `${context} authentication failed: ${status} ${error.response.statusText}`,
          status,
          error
        );
      }
      
      // Validation errors
      if (status === 400 || status === 422) {
        return new ValidationError(
          `${context} validation failed: ${status} ${error.response.statusText}`,
          status,
          error
        );
      }
      
      // Server errors
      if (status >= 500) {
        return new ServiceUnavailableError(
          `${context} server error: ${status} ${error.response.statusText}`,
          status,
          error
        );
      }
      
      // Other HTTP errors
      return new ServiceError(
        `${context} request failed: ${status} ${error.response.statusText}`,
        status,
        error
      );
    }
    
    // Unknown errors
    return new ServiceError(`${context} request failed: ${error.message}`, null, error);
  }

  /**
   * Execute an API request with retry logic and circuit breaker
   * @private
   * @param {Function} apiCall - The API call function to execute
   * @param {string} serviceName - Name of the service being called
   * @param {string} operationName - Name of the operation being performed
   * @returns {Promise<any>} The API response
   */
  async _executeWithRetry(apiCall, serviceName, operationName) {
    // Check if circuit is closed before attempting request
    if (!this._checkCircuitBreaker(serviceName)) {
      const error = new ServiceUnavailableError(`${serviceName} circuit is OPEN - service considered unavailable`);
      Logger.warn(`Circuit breaker prevented request to ${serviceName}`, {
        serviceName,
        operationName,
        circuitState: this.circuitBreaker.services[serviceName].state
      });
      throw error;
    }
    
    let lastError;
    let delay = this.axiosConfig.retryDelay;
    
    for (let attempt = 0; attempt < this.axiosConfig.maxRetries; attempt++) {
      try {
        const response = await apiCall();
        
        // Update circuit breaker on success
        this._updateCircuitBreaker(serviceName, true);
        
        return response;
      } catch (error) {
        // Categorize the error
        const categorizedError = this._categorizeError(error, `${serviceName}.${operationName}`);
        lastError = categorizedError;
        
        // Log the error with attempt information
        Logger.error(`Request to ${serviceName}.${operationName} failed (attempt ${attempt + 1}/${this.axiosConfig.maxRetries})`, {
          serviceName,
          operationName,
          attempt: attempt + 1,
          maxRetries: this.axiosConfig.maxRetries,
          errorType: categorizedError.name,
          errorMessage: categorizedError.message,
          statusCode: categorizedError.statusCode
        });
        
        // Update circuit breaker on failure
        this._updateCircuitBreaker(serviceName, false);
        
        // Don't retry if error is not retryable
        if (categorizedError.isRetryable === false) {
          break;
        }
        
        // Don't retry for client errors (4xx) except for 429 (too many requests)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          break;
        }
        
        // Don't retry for the last attempt
        if (attempt === this.axiosConfig.maxRetries - 1) {
          break;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * this.axiosConfig.retryMultiplier, 10000); // Cap at 10 seconds
      }
    }
    
    throw lastError;
  }

  /**
   * Get user by ID
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User data
   * @throws {ServiceError} If the request fails
   */
  async getUserById(userId, token) {
    try {
      const apiCall = () => axios.get(`${this.usersEndpoint}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall, 'userService', 'getUserById');
      return response.data;
    } catch (error) {
      // If error is already categorized, just log and rethrow
      if (error instanceof ServiceError) {
        Logger.error(`Error getting user ${userId}`, {
          userId,
          errorType: error.name,
          errorMessage: error.message,
          statusCode: error.statusCode
        });
        throw error;
      }
      
      // Otherwise categorize and throw
      const categorizedError = this._categorizeError(error, `getUserById(${userId})`);
      Logger.error(`Error getting user ${userId}`, {
        userId,
        errorType: categorizedError.name,
        errorMessage: categorizedError.message,
        statusCode: categorizedError.statusCode
      });
      throw categorizedError;
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
      Logger.warn(`User validation failed for user ${userId}`, {
        userId,
        errorType: error.name,
        errorMessage: error.message,
        statusCode: error.statusCode
      });
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
      Logger.warn(`Admin check failed for user ${userId}`, {
        userId,
        errorType: error.name,
        errorMessage: error.message,
        statusCode: error.statusCode
      });
      return false;
    }
  }

  /**
   * Verify user token
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Decoded token payload if valid
   * @throws {AuthenticationError} If token is invalid or expired
   * @throws {ServiceError} If verification fails for other reasons
   */
  async verifyToken(token) {
    try {
      // Check if token is missing or malformed
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new AuthenticationError('Missing or malformed token');
      }
      
      const apiCall = () => axios.post(`${this.authEndpoint}/verify-token`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall, 'authService', 'verifyToken');
      
      // Ensure the response contains the expected data structure
      if (!response.data || !response.data.valid) {
        throw new AuthenticationError('Invalid token response format');
      }
      
      return response.data;
    } catch (error) {
      // If error is already categorized, just log and rethrow
      if (error instanceof ServiceError) {
        Logger.error('Token verification error', {
          errorType: error.name,
          errorMessage: error.message,
          statusCode: error.statusCode
        });
        throw error;
      }
      
      // JWT-specific errors
      if (error.name === 'JsonWebTokenError') {
        const authError = new AuthenticationError('Malformed token', 401, error);
        Logger.error('Token verification error - malformed token', {
          errorType: authError.name,
          errorMessage: authError.message
        });
        throw authError;
      }
      
      if (error.name === 'TokenExpiredError') {
        const authError = new AuthenticationError('Token expired', 401, error);
        Logger.error('Token verification error - expired token', {
          errorType: authError.name,
          errorMessage: authError.message,
          expiredAt: error.expiredAt
        });
        throw authError;
      }
      
      // Otherwise categorize and throw
      const categorizedError = this._categorizeError(error, 'verifyToken');
      Logger.error('Token verification error', {
        errorType: categorizedError.name,
        errorMessage: categorizedError.message,
        statusCode: categorizedError.statusCode
      });
      throw categorizedError;
    }
  }

  /**
   * Get user profile
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User profile data
   * @throws {ServiceError} If the request fails
   */
  async getUserProfile(token) {
    try {
      const apiCall = () => axios.get(`${this.authEndpoint}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.axiosConfig.timeout
      });
      
      const response = await this._executeWithRetry(apiCall, 'authService', 'getUserProfile');
      return response.data;
    } catch (error) {
      // If error is already categorized, just log and rethrow
      if (error instanceof ServiceError) {
        Logger.error('Error getting user profile', {
          errorType: error.name,
          errorMessage: error.message,
          statusCode: error.statusCode
        });
        throw error;
      }
      
      // Otherwise categorize and throw
      const categorizedError = this._categorizeError(error, 'getUserProfile');
      Logger.error('Error getting user profile', {
        errorType: categorizedError.name,
        errorMessage: categorizedError.message,
        statusCode: categorizedError.statusCode
      });
      throw categorizedError;
    }
  }
  
  /**
   * Get circuit breaker status for all services
   * @returns {Object} Current circuit breaker status
   */
  getCircuitStatus() {
    const status = {};
    
    for (const [serviceName, circuit] of Object.entries(this.circuitBreaker.services)) {
      status[serviceName] = {
        state: circuit.state,
        failureCount: circuit.failureCount,
        lastFailureTime: circuit.lastFailureTime
      };
    }
    
    return status;
  }
  
  /**
   * Reset circuit breaker for a specific service
   * @param {string} serviceName - Name of the service to reset
   * @returns {boolean} True if reset was successful
   */
  resetCircuitBreaker(serviceName) {
    if (this.circuitBreaker.services[serviceName]) {
      this.circuitBreaker.services[serviceName] = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        lastFailureTime: null
      };
      Logger.info(`Circuit breaker for ${serviceName} has been manually reset`, {
        serviceName,
        newState: CircuitState.CLOSED
      });
      return true;
    }
    return false;
  }
}

module.exports = new UserService();
