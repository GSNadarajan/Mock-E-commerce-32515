/**
 * Order Service
 * Handles integration between order management, user management, and product management components
 */

const OrderModel = require('../orders/models/orderModel');
const userService = require('./userService');
const productService = require('./productService');
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
 * Order Service - Handles order-related operations and integrates with user and product services
 */
class OrderService {
  /**
   * Get order by ID
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Object>} Order data
   * @throws {NotFoundError} If order not found
   * @throws {ServiceError} If the operation fails
   */
  async getOrderById(orderId) {
    try {
      const order = await OrderModel.getOrderById(orderId);
      
      if (!order) {
        throw new NotFoundError(`Order with ID ${orderId} not found`);
      }
      
      return order;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting order ${orderId}`, {
        orderId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get order: ${error.message}`, 500, error);
    }
  }

  /**
   * Get orders by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of orders for the user
   * @throws {ServiceError} If the operation fails
   */
  async getOrdersByUserId(userId) {
    try {
      // Validate user exists
      const userExists = await userService.validateUser(userId);
      if (!userExists) {
        throw new ValidationError(`User with ID ${userId} not found`);
      }
      
      return await OrderModel.getOrdersByUserId(userId);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting orders for user ${userId}`, {
        userId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get orders for user: ${error.message}`, 500, error);
    }
  }

  /**
   * Validate order items
   * @param {Array} items - Array of order items with productId and quantity
   * @returns {Promise<Array>} Array of validated items with product details
   * @throws {ValidationError} If any item is invalid
   * @throws {ServiceError} If the operation fails
   */
  async validateOrderItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }
    
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.productId) {
        throw new ValidationError('Each item must have a productId');
      }
      
      if (!item.quantity || item.quantity < 1) {
        throw new ValidationError(`Invalid quantity for product ${item.productId}`);
      }
      
      try {
        // Get product details and check stock
        const product = await productService.getProductById(item.productId);
        
        if (product.stock < item.quantity) {
          throw new StockError(`Not enough stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        
        validatedItems.push({
          ...item,
          productDetails: {
            name: product.name,
            price: product.price,
            category: product.category
          }
        });
      } catch (error) {
        if (error instanceof ServiceError) {
          throw error;
        }
        
        throw new ValidationError(`Failed to validate item with productId ${item.productId}: ${error.message}`);
      }
    }
    
    return validatedItems;
  }

  /**
   * Create a new order with validation
   * @param {Object} orderData - Order data including userId, items, and shippingAddress
   * @returns {Promise<Object>} Created order
   * @throws {ValidationError} If order data is invalid
   * @throws {ServiceError} If the operation fails
   */
  async createOrder(orderData) {
    try {
      // Validate required fields
      if (!orderData.userId) {
        throw new ValidationError('User ID is required');
      }
      
      if (!orderData.shippingAddress) {
        throw new ValidationError('Shipping address is required');
      }
      
      // Validate user exists
      const userExists = await userService.validateUser(orderData.userId);
      if (!userExists) {
        throw new ValidationError(`User with ID ${orderData.userId} not found`);
      }
      
      // Validate order items
      const validatedItems = await this.validateOrderItems(orderData.items);
      
      // Calculate order total
      let total = 0;
      for (const item of validatedItems) {
        total += item.quantity * item.productDetails.price;
      }
      
      // Create the order
      const newOrder = await OrderModel.createOrder({
        ...orderData,
        items: validatedItems,
        total,
        status: 'pending'
      });
      
      // Update product stock
      for (const item of validatedItems) {
        await productService.updateProductStock(item.productId, -item.quantity);
      }
      
      return newOrder;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error('Error creating order', {
        userId: orderData.userId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to create order: ${error.message}`, 500, error);
    }
  }

  /**
   * Update order status
   * @param {string} orderId - The ID of the order
   * @param {string} status - The new status
   * @param {string} [note] - Optional note about the status change
   * @returns {Promise<Object>} Updated order
   * @throws {NotFoundError} If order not found
   * @throws {ValidationError} If status is invalid
   * @throws {ServiceError} If the operation fails
   */
  async updateOrderStatus(orderId, status, note) {
    try {
      // Validate status
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        throw new ValidationError(`Invalid order status: ${status}`);
      }
      
      // Get the order
      const order = await this.getOrderById(orderId);
      
      // Handle cancellation - return items to stock if order was not delivered
      if (status === 'cancelled' && order.status !== 'delivered') {
        for (const item of order.items) {
          await productService.updateProductStock(item.productId, item.quantity);
        }
      }
      
      // Update the order status
      const updateData = { status };
      if (note) {
        updateData.statusNote = note;
      }
      
      return await OrderModel.updateOrder(orderId, updateData);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error updating order status for order ${orderId}`, {
        orderId,
        status,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to update order status: ${error.message}`, 500, error);
    }
  }

  /**
   * Process an order (update status to processing)
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Object>} Updated order
   * @throws {NotFoundError} If order not found
   * @throws {ValidationError} If order cannot be processed
   * @throws {ServiceError} If the operation fails
   */
  async processOrder(orderId) {
    try {
      const order = await this.getOrderById(orderId);
      
      if (order.status !== 'pending') {
        throw new ValidationError(`Cannot process order with status ${order.status}`);
      }
      
      return await this.updateOrderStatus(orderId, 'processing', 'Order is being processed');
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error processing order ${orderId}`, {
        orderId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to process order: ${error.message}`, 500, error);
    }
  }

  /**
   * Search orders by criteria
   * @param {Object} criteria - Search criteria
   * @param {string} [criteria.userId] - Filter by user ID
   * @param {string} [criteria.status] - Filter by status
   * @param {Date} [criteria.startDate] - Filter by orders created after this date
   * @param {Date} [criteria.endDate] - Filter by orders created before this date
   * @returns {Promise<Array>} Array of matching orders
   * @throws {ServiceError} If the operation fails
   */
  async searchOrders(criteria = {}) {
    try {
      return await OrderModel.searchOrders(criteria);
    } catch (error) {
      Logger.error('Error searching orders', {
        criteria,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to search orders: ${error.message}`, 500, error);
    }
  }

  /**
   * Get orders by status
   * @param {string} status - The order status to filter by
   * @returns {Promise<Array>} Array of orders with the specified status
   * @throws {ValidationError} If status is invalid
   * @throws {ServiceError} If the operation fails
   */
  async getOrdersByStatus(status) {
    try {
      // Validate status
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        throw new ValidationError(`Invalid order status: ${status}`);
      }
      
      return await OrderModel.getOrdersByStatus(status);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting orders by status ${status}`, {
        status,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get orders by status: ${error.message}`, 500, error);
    }
  }

  /**
   * Count orders by status
   * @returns {Promise<Object>} Object with counts for each status
   * @throws {ServiceError} If the operation fails
   */
  async countOrdersByStatus() {
    try {
      return await OrderModel.countOrdersByStatus();
    } catch (error) {
      Logger.error('Error counting orders by status', {
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to count orders by status: ${error.message}`, 500, error);
    }
  }
}

module.exports = new OrderService();
