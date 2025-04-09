/**
 * Cache Service
 * Provides caching functionality for products, users, and orders data
 * using node-cache for improved API performance
 */

const NodeCache = require('node-cache');
const Logger = require('../utils/logger') || console;

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

class CacheError extends ServiceError {
  constructor(message, statusCode = 500, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = true;
  }
}

/**
 * Cache Service - Provides caching functionality for improved API performance
 */
class CacheService {
  constructor() {
    // Default TTL values in seconds
    this.ttl = {
      products: 3600, // 1 hour
      users: 1800,    // 30 minutes
      orders: 900     // 15 minutes
    };

    // Initialize cache with checkperiod (seconds to check for expired keys)
    this.cache = new NodeCache({ 
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false // For better performance, don't clone objects
    });

    Logger.info('Cache service initialized', { 
      ttl: this.ttl,
      stats: this.getStats() 
    });
  }

  /**
   * Generate a namespaced key
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The original key
   * @returns {string} Namespaced key
   * @private
   */
  _getNamespacedKey(namespace, key) {
    return `${namespace}:${key}`;
  }

  /**
   * Set a value in the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The key to store the value under
   * @param {*} value - The value to store
   * @param {number} [ttl] - Time to live in seconds (optional, uses default if not provided)
   * @returns {boolean} True if successful
   * @throws {CacheError} If the operation fails
   */
  set(namespace, key, value, ttl) {
    try {
      if (!namespace || !key) {
        throw new CacheError('Namespace and key are required');
      }

      const namespacedKey = this._getNamespacedKey(namespace, key);
      const ttlValue = ttl || this.ttl[namespace] || 3600; // Default to 1 hour if namespace not found

      const success = this.cache.set(namespacedKey, value, ttlValue);
      
      Logger.debug(`Cache set: ${namespacedKey}`, { 
        namespace, 
        key, 
        ttl: ttlValue,
        success 
      });
      
      return success;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error setting cache for ${namespace}:${key}`, {
        namespace,
        key,
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to set cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Get a value from the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The key to retrieve
   * @returns {*} The cached value or undefined if not found
   * @throws {CacheError} If the operation fails
   */
  get(namespace, key) {
    try {
      if (!namespace || !key) {
        throw new CacheError('Namespace and key are required');
      }

      const namespacedKey = this._getNamespacedKey(namespace, key);
      const value = this.cache.get(namespacedKey);
      
      const found = value !== undefined;
      Logger.debug(`Cache ${found ? 'hit' : 'miss'}: ${namespacedKey}`, { 
        namespace, 
        key, 
        found 
      });
      
      return value;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting cache for ${namespace}:${key}`, {
        namespace,
        key,
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to get cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The key to delete
   * @returns {boolean} True if successful, false if key not found
   * @throws {CacheError} If the operation fails
   */
  delete(namespace, key) {
    try {
      if (!namespace || !key) {
        throw new CacheError('Namespace and key are required');
      }

      const namespacedKey = this._getNamespacedKey(namespace, key);
      const deleted = this.cache.del(namespacedKey);
      
      Logger.debug(`Cache delete: ${namespacedKey}`, { 
        namespace, 
        key, 
        deleted: deleted > 0 
      });
      
      return deleted > 0;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error deleting cache for ${namespace}:${key}`, {
        namespace,
        key,
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to delete cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Set multiple values in the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {Object} keyValueMap - Object with key-value pairs to cache
   * @param {number} [ttl] - Time to live in seconds (optional, uses default if not provided)
   * @returns {boolean} True if successful
   * @throws {CacheError} If the operation fails
   */
  mset(namespace, keyValueMap, ttl) {
    try {
      if (!namespace || !keyValueMap || typeof keyValueMap !== 'object') {
        throw new CacheError('Namespace and key-value map are required');
      }

      const namespacedMap = {};
      const ttlValue = ttl || this.ttl[namespace] || 3600; // Default to 1 hour if namespace not found

      // Create namespaced keys
      Object.keys(keyValueMap).forEach(key => {
        const namespacedKey = this._getNamespacedKey(namespace, key);
        namespacedMap[namespacedKey] = keyValueMap[key];
      });

      const success = this.cache.mset(Object.keys(namespacedMap).map(key => {
        return { key, val: namespacedMap[key], ttl: ttlValue };
      }));
      
      Logger.debug(`Cache bulk set for ${namespace}`, { 
        namespace, 
        keys: Object.keys(keyValueMap), 
        ttl: ttlValue,
        success 
      });
      
      return success;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error bulk setting cache for ${namespace}`, {
        namespace,
        keys: Object.keys(keyValueMap || {}),
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to bulk set cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Get multiple values from the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string[]} keys - Array of keys to retrieve
   * @returns {Object} Object with key-value pairs of found items
   * @throws {CacheError} If the operation fails
   */
  mget(namespace, keys) {
    try {
      if (!namespace || !keys || !Array.isArray(keys)) {
        throw new CacheError('Namespace and keys array are required');
      }

      // Create namespaced keys
      const namespacedKeys = keys.map(key => this._getNamespacedKey(namespace, key));
      
      // Get values from cache
      const namespacedValues = this.cache.mget(namespacedKeys);
      
      // Convert back to original keys
      const result = {};
      Object.keys(namespacedValues).forEach(namespacedKey => {
        const key = namespacedKey.substring(namespace.length + 1); // Remove namespace prefix
        result[key] = namespacedValues[namespacedKey];
      });
      
      const hitCount = Object.keys(result).length;
      Logger.debug(`Cache bulk get for ${namespace}`, { 
        namespace, 
        requestedKeys: keys.length, 
        hits: hitCount,
        hitRate: keys.length > 0 ? (hitCount / keys.length) : 0
      });
      
      return result;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error bulk getting cache for ${namespace}`, {
        namespace,
        keys: keys || [],
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to bulk get cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Delete multiple values from the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string[]} keys - Array of keys to delete
   * @returns {number} Number of deleted items
   * @throws {CacheError} If the operation fails
   */
  mdelete(namespace, keys) {
    try {
      if (!namespace || !keys || !Array.isArray(keys)) {
        throw new CacheError('Namespace and keys array are required');
      }

      // Create namespaced keys
      const namespacedKeys = keys.map(key => this._getNamespacedKey(namespace, key));
      
      // Delete values from cache
      const deleted = this.cache.del(namespacedKeys);
      
      Logger.debug(`Cache bulk delete for ${namespace}`, { 
        namespace, 
        requestedKeys: keys.length, 
        deleted 
      });
      
      return deleted;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error bulk deleting cache for ${namespace}`, {
        namespace,
        keys: keys || [],
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to bulk delete cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Flush all keys in a namespace
   * @param {string} namespace - The namespace to flush (products, users, orders)
   * @returns {number} Number of deleted items
   * @throws {CacheError} If the operation fails
   */
  flushNamespace(namespace) {
    try {
      if (!namespace) {
        throw new CacheError('Namespace is required');
      }

      const allKeys = this.cache.keys();
      const namespacePrefix = `${namespace}:`;
      const namespacedKeys = allKeys.filter(key => key.startsWith(namespacePrefix));
      
      const deleted = this.cache.del(namespacedKeys);
      
      Logger.info(`Cache namespace flushed: ${namespace}`, { 
        namespace, 
        keysDeleted: deleted 
      });
      
      return deleted;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error flushing cache namespace ${namespace}`, {
        namespace,
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to flush cache namespace: ${error.message}`, 500, error);
    }
  }

  /**
   * Flush the entire cache
   * @returns {boolean} True if successful
   * @throws {CacheError} If the operation fails
   */
  flushAll() {
    try {
      this.cache.flushAll();
      
      Logger.info('Cache completely flushed', { 
        stats: this.getStats() 
      });
      
      return true;
    } catch (error) {
      Logger.error('Error flushing entire cache', {
        errorMessage: error.message
      });
      
      throw new CacheError(`Failed to flush entire cache: ${error.message}`, 500, error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    try {
      const stats = this.cache.getStats();
      const keys = this.cache.keys();
      
      // Count keys by namespace
      const namespaceCounts = {};
      Object.keys(this.ttl).forEach(namespace => {
        const namespacePrefix = `${namespace}:`;
        namespaceCounts[namespace] = keys.filter(key => key.startsWith(namespacePrefix)).length;
      });
      
      return {
        ...stats,
        namespaces: namespaceCounts,
        totalKeys: keys.length
      };
    } catch (error) {
      Logger.error('Error getting cache statistics', {
        errorMessage: error.message
      });
      
      return { error: error.message };
    }
  }

  /**
   * Get all keys in the cache, optionally filtered by namespace
   * @param {string} [namespace] - Optional namespace to filter keys
   * @returns {string[]} Array of keys
   */
  getKeys(namespace) {
    try {
      const allKeys = this.cache.keys();
      
      if (namespace) {
        const namespacePrefix = `${namespace}:`;
        const filteredKeys = allKeys.filter(key => key.startsWith(namespacePrefix));
        
        // Remove namespace prefix from keys
        return filteredKeys.map(key => key.substring(namespacePrefix.length));
      }
      
      return allKeys;
    } catch (error) {
      Logger.error('Error getting cache keys', {
        namespace: namespace || 'all',
        errorMessage: error.message
      });
      
      return [];
    }
  }

  /**
   * Check if a key exists in the cache
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The key to check
   * @returns {boolean} True if the key exists
   */
  has(namespace, key) {
    try {
      if (!namespace || !key) {
        return false;
      }

      const namespacedKey = this._getNamespacedKey(namespace, key);
      return this.cache.has(namespacedKey);
    } catch (error) {
      Logger.error(`Error checking cache key existence for ${namespace}:${key}`, {
        namespace,
        key,
        errorMessage: error.message
      });
      
      return false;
    }
  }

  /**
   * Get the remaining TTL for a key
   * @param {string} namespace - The namespace (products, users, orders)
   * @param {string} key - The key to check
   * @returns {number} Remaining TTL in seconds, 0 if expired, -1 if not found or error
   */
  getTtl(namespace, key) {
    try {
      if (!namespace || !key) {
        return -1;
      }

      const namespacedKey = this._getNamespacedKey(namespace, key);
      return this.cache.getTtl(namespacedKey);
    } catch (error) {
      Logger.error(`Error getting TTL for ${namespace}:${key}`, {
        namespace,
        key,
        errorMessage: error.message
      });
      
      return -1;
    }
  }

  /**
   * Set a product in the cache
   * @param {string} productId - The product ID
   * @param {Object} product - The product data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setProduct(productId, product, ttl) {
    return this.set('products', productId, product, ttl);
  }

  /**
   * Get a product from the cache
   * @param {string} productId - The product ID
   * @returns {Object|undefined} The product data or undefined if not found
   */
  getProduct(productId) {
    return this.get('products', productId);
  }

  /**
   * Delete a product from the cache
   * @param {string} productId - The product ID
   * @returns {boolean} True if successful
   */
  deleteProduct(productId) {
    return this.delete('products', productId);
  }

  /**
   * Set multiple products in the cache
   * @param {Object} productsMap - Map of product IDs to product data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setProducts(productsMap, ttl) {
    return this.mset('products', productsMap, ttl);
  }

  /**
   * Get multiple products from the cache
   * @param {string[]} productIds - Array of product IDs
   * @returns {Object} Map of product IDs to product data
   */
  getProducts(productIds) {
    return this.mget('products', productIds);
  }

  /**
   * Flush all product cache
   * @returns {number} Number of items deleted
   */
  flushProducts() {
    return this.flushNamespace('products');
  }

  /**
   * Set a user in the cache
   * @param {string} userId - The user ID
   * @param {Object} user - The user data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setUser(userId, user, ttl) {
    return this.set('users', userId, user, ttl);
  }

  /**
   * Get a user from the cache
   * @param {string} userId - The user ID
   * @returns {Object|undefined} The user data or undefined if not found
   */
  getUser(userId) {
    return this.get('users', userId);
  }

  /**
   * Delete a user from the cache
   * @param {string} userId - The user ID
   * @returns {boolean} True if successful
   */
  deleteUser(userId) {
    return this.delete('users', userId);
  }

  /**
   * Set multiple users in the cache
   * @param {Object} usersMap - Map of user IDs to user data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setUsers(usersMap, ttl) {
    return this.mset('users', usersMap, ttl);
  }

  /**
   * Get multiple users from the cache
   * @param {string[]} userIds - Array of user IDs
   * @returns {Object} Map of user IDs to user data
   */
  getUsers(userIds) {
    return this.mget('users', userIds);
  }

  /**
   * Flush all user cache
   * @returns {number} Number of items deleted
   */
  flushUsers() {
    return this.flushNamespace('users');
  }

  /**
   * Set an order in the cache
   * @param {string} orderId - The order ID
   * @param {Object} order - The order data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setOrder(orderId, order, ttl) {
    return this.set('orders', orderId, order, ttl);
  }

  /**
   * Get an order from the cache
   * @param {string} orderId - The order ID
   * @returns {Object|undefined} The order data or undefined if not found
   */
  getOrder(orderId) {
    return this.get('orders', orderId);
  }

  /**
   * Delete an order from the cache
   * @param {string} orderId - The order ID
   * @returns {boolean} True if successful
   */
  deleteOrder(orderId) {
    return this.delete('orders', orderId);
  }

  /**
   * Set multiple orders in the cache
   * @param {Object} ordersMap - Map of order IDs to order data
   * @param {number} [ttl] - Optional TTL override
   * @returns {boolean} True if successful
   */
  setOrders(ordersMap, ttl) {
    return this.mset('orders', ordersMap, ttl);
  }

  /**
   * Get multiple orders from the cache
   * @param {string[]} orderIds - Array of order IDs
   * @returns {Object} Map of order IDs to order data
   */
  getOrders(orderIds) {
    return this.mget('orders', orderIds);
  }

  /**
   * Flush all order cache
   * @returns {number} Number of items deleted
   */
  flushOrders() {
    return this.flushNamespace('orders');
  }
}

module.exports = new CacheService();
