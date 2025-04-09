/**
 * Product Service
 * Handles integration with product management component
 */

const ProductModel = require('../products/models/productModel');
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

class ValidationError extends ServiceError {
  constructor(message, statusCode = 400, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

class NotFoundError extends ServiceError {
  constructor(message, statusCode = 404, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

class StockError extends ServiceError {
  constructor(message, statusCode = 400, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

/**
 * Product Service - Handles product-related operations
 */
class ProductService {
  /**
   * Get product by ID
   * @param {string} productId - The ID of the product
   * @returns {Promise<Object>} Product data
   * @throws {NotFoundError} If product not found
   * @throws {ServiceError} If the operation fails
   */
  async getProductById(productId) {
    try {
      const product = await ProductModel.getProductById(productId);
      
      if (!product) {
        throw new NotFoundError(`Product with ID ${productId} not found`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting product ${productId}`, {
        productId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get product: ${error.message}`, 500, error);
    }
  }

  /**
   * Validate product exists
   * @param {string} productId - The ID of the product
   * @returns {Promise<boolean>} True if product exists
   */
  async validateProduct(productId) {
    try {
      await this.getProductById(productId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      
      Logger.warn(`Product validation failed for product ${productId}`, {
        productId,
        errorType: error.name,
        errorMessage: error.message
      });
      
      return false;
    }
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} Array of products in the specified category
   * @throws {ServiceError} If the operation fails
   */
  async getProductsByCategory(category) {
    try {
      return await ProductModel.findProductsByCategory(category);
    } catch (error) {
      Logger.error(`Error getting products by category ${category}`, {
        category,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get products by category: ${error.message}`, 500, error);
    }
  }

  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   * @throws {ServiceError} If the operation fails
   */
  async searchProducts(query) {
    try {
      return await ProductModel.searchProducts(query);
    } catch (error) {
      Logger.error(`Error searching products with query ${query}`, {
        query,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to search products: ${error.message}`, 500, error);
    }
  }

  /**
   * Check if a product is in stock
   * @param {string} productId - The ID of the product
   * @param {number} quantity - The quantity needed
   * @returns {Promise<boolean>} True if product is in stock
   * @throws {NotFoundError} If product not found
   * @throws {ServiceError} If the operation fails
   */
  async checkProductStock(productId, quantity) {
    try {
      const product = await this.getProductById(productId);
      return product.stock >= quantity;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      Logger.error(`Error checking stock for product ${productId}`, {
        productId,
        quantity,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to check product stock: ${error.message}`, 500, error);
    }
  }

  /**
   * Update product stock
   * @param {string} productId - The ID of the product
   * @param {number} quantity - The quantity to add (positive) or remove (negative)
   * @returns {Promise<Object>} Updated product
   * @throws {NotFoundError} If product not found
   * @throws {StockError} If there's not enough stock
   * @throws {ServiceError} If the operation fails
   */
  async updateProductStock(productId, quantity) {
    try {
      const product = await this.getProductById(productId);
      
      // Check if there's enough stock when removing items
      if (quantity < 0 && product.stock + quantity < 0) {
        throw new StockError(`Not enough stock for product ${productId}. Available: ${product.stock}, Requested: ${Math.abs(quantity)}`);
      }
      
      const newStock = product.stock + quantity;
      
      return await ProductModel.updateProduct(productId, { stock: newStock });
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error updating stock for product ${productId}`, {
        productId,
        quantity,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to update product stock: ${error.message}`, 500, error);
    }
  }

  /**
   * Get all products
   * @returns {Promise<Array>} Array of all products
   * @throws {ServiceError} If the operation fails
   */
  async getAllProducts() {
    try {
      return await ProductModel.getAllProducts();
    } catch (error) {
      Logger.error('Error getting all products', {
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get all products: ${error.message}`, 500, error);
    }
  }

  /**
   * Count total products
   * @returns {Promise<number>} Total number of products
   * @throws {ServiceError} If the operation fails
   */
  async countProducts() {
    try {
      return await ProductModel.countProducts();
    } catch (error) {
      Logger.error('Error counting products', {
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to count products: ${error.message}`, 500, error);
    }
  }
}

module.exports = new ProductService();
