/**
 * Order Model
 * Handles JSON file-based storage for order data using Node.js fs module
 */

const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the orders JSON file and directory
const dataDir = path.join(__dirname, '../../../data');
const dbPath = path.join(dataDir, 'orders.json');

// Valid order statuses
const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Default data structure
const DEFAULT_DATA = {
  schemaVersion: '1.0',
  orders: []
};

// File lock status
let isWriting = false;

/**
 * OrderModel class for handling order data operations
 */
class OrderModel {
  /**
   * Initialize the orders.json file if it doesn't exist
   * Ensures the data directory exists and creates the file with proper structure
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      try {
        // Check if the file exists
        await fs.access(dbPath);
        
        // Validate file structure
        try {
          const data = await fs.readFile(dbPath, 'utf8');
          if (!data || data.trim() === '') {
            console.warn('orders.json is empty. Creating with proper structure.');
            await this._writeData(DEFAULT_DATA);
            return;
          }
          
          const parsedData = JSON.parse(data);
          
          // Check if the file has the correct structure
          if (!parsedData || typeof parsedData !== 'object') {
            console.warn('orders.json has invalid JSON. Recreating with proper structure.');
            await this._writeData(DEFAULT_DATA);
          } else if (!parsedData.orders || !Array.isArray(parsedData.orders)) {
            console.warn('orders.json has invalid structure. Recreating with proper structure.');
            await this._writeData(DEFAULT_DATA);
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing orders.json:', parseError.message);
          console.warn('Recreating orders.json with proper structure.');
          await this._writeData(DEFAULT_DATA);
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty orders array and schema version
        console.log('Creating new orders.json file with default structure');
        await this._writeData(DEFAULT_DATA);
      }
    } catch (error) {
      console.error('Failed to initialize orders database:', error);
      throw new Error(`Failed to initialize orders database: ${error.message}`);
    }
  }

  /**
   * Read orders data from JSON file
   * @returns {Promise<Object>} The parsed JSON data
   * @private
   */
  static async _readData() {
    try {
      // Check if file exists first
      try {
        await fs.access(dbPath);
      } catch (accessError) {
        // File doesn't exist, initialize it
        await this.initialize();
        return DEFAULT_DATA;
      }
      
      // Read the file
      const data = await fs.readFile(dbPath, 'utf8');
      
      // Handle empty file
      if (!data || data.trim() === '') {
        console.warn('orders.json is empty. Returning default structure.');
        await this._writeData(DEFAULT_DATA);
        return DEFAULT_DATA;
      }
      
      try {
        const parsedData = JSON.parse(data);
        
        // Validate the parsed data
        if (!parsedData || typeof parsedData !== 'object') {
          console.warn('orders.json contains invalid JSON. Returning default structure.');
          await this._writeData(DEFAULT_DATA);
          return DEFAULT_DATA;
        }
        
        // Ensure the data has the expected structure
        if (!parsedData.orders || !Array.isArray(parsedData.orders)) {
          console.warn('orders.json has invalid structure. Returning default structure.');
          await this._writeData(DEFAULT_DATA);
          return DEFAULT_DATA;
        }
        
        // Ensure schema version exists
        if (!parsedData.schemaVersion) {
          parsedData.schemaVersion = '1.0';
          await this._writeData(parsedData);
        }
        
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing orders.json:', parseError.message);
        await this._writeData(DEFAULT_DATA);
        return DEFAULT_DATA;
      }
    } catch (error) {
      console.error(`Error reading order data: ${error.message}`);
      return DEFAULT_DATA;
    }
  }

  /**
   * Write orders data to JSON file with improved error handling and file locking
   * @param {Object} data - The data to write
   * @returns {Promise<void>}
   * @private
   */
  static async _writeData(data) {
    // Simple file locking mechanism to prevent race conditions
    if (isWriting) {
      // Wait a bit and retry if another write operation is in progress
      await new Promise(resolve => setTimeout(resolve, 100));
      return this._writeData(data);
    }
    
    isWriting = true;
    
    try {
      // Validate data structure before writing
      if (!data || typeof data !== 'object') {
        data = DEFAULT_DATA;
      } else if (!data.orders || !Array.isArray(data.orders)) {
        data = {
          ...data,
          orders: Array.isArray(data.orders) ? data.orders : []
        };
      }
      
      // Ensure schema version exists
      if (!data.schemaVersion) {
        data.schemaVersion = '1.0';
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      try {
        // Write to a temporary file first to ensure atomic operation
        const tempPath = `${dbPath}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
        
        // Rename the temporary file to the actual file (atomic operation)
        await fs.rename(tempPath, dbPath);
      } catch (writeError) {
        console.error('Error during file write operation:', writeError);
        // Try direct write as fallback
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Error writing order data:', error);
      throw new Error(`Error writing order data: ${error.message}`);
    } finally {
      // Release the lock
      isWriting = false;
    }
  }

  /**
   * Get all orders
   * @returns {Promise<Array>} Array of all orders
   */
  static async getAllOrders() {
    const data = await this._readData();
    return data.orders;
  }

  /**
   * Get order by ID
   * @param {string} orderId - The ID of the order to retrieve
   * @returns {Promise<Object|null>} The order object or null if not found
   */
  static async getOrderById(orderId) {
    const orders = await this.getAllOrders();
    return orders.find(order => order.id === orderId) || null;
  }

  /**
   * Get orders by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of orders for the user
   */
  static async getOrdersByUserId(userId) {
    const orders = await this.getAllOrders();
    return orders.filter(order => order.userId === userId);
  }
  
  /**
   * Get orders by status
   * @param {string} status - The order status to filter by
   * @returns {Promise<Array>} Array of orders with the specified status
   */
  static async getOrdersByStatus(status) {
    const orders = await this.getAllOrders();
    return orders.filter(order => order.status === status);
  }

  /**
   * Create a new order
   * @param {Object} orderData - The order data
   * @param {string} orderData.userId - The ID of the user placing the order
   * @param {Array} orderData.items - Array of order items
   * @param {Object} orderData.shippingAddress - The shipping address
   * @param {string} [orderData.status='pending'] - The order status
   * @returns {Promise<Object>} The created order
   */
  static async createOrder(orderData) {
    // Validate required fields
    if (!orderData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    
    if (!orderData.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    
    // Validate status if provided
    if (orderData.status && !VALID_STATUSES.includes(orderData.status)) {
      throw new Error(`Invalid order status. Valid statuses are: ${VALID_STATUSES.join(', ')}`);
    }
    
    const data = await this._readData();
    
    const newOrder = {
      id: uuidv4(),
      userId: orderData.userId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      status: orderData.status || 'pending',
      totalAmount: orderData.totalAmount || this._calculateTotalAmount(orderData.items),
      paymentMethod: orderData.paymentMethod || null,
      paymentStatus: orderData.paymentStatus || 'pending',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: orderData.status || 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order created'
        }
      ]
    };
    
    data.orders.push(newOrder);
    await this._writeData(data);
    
    return newOrder;
  }

  /**
   * Calculate the total amount of an order based on items
   * @param {Array} items - Array of order items
   * @returns {number} The total amount
   * @private
   */
  static _calculateTotalAmount(items) {
    return items.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (itemPrice * quantity);
    }, 0);
  }

  /**
   * Update an order
   * @param {string} orderId - The ID of the order to update
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async updateOrder(orderId, updateData) {
    const data = await this._readData();
    
    const orderIndex = data.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return null;
    
    // Validate status if it's being updated
    if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
      throw new Error(`Invalid order status. Valid statuses are: ${VALID_STATUSES.join(', ')}`);
    }
    
    // Add to status history if status is changing
    if (updateData.status && updateData.status !== data.orders[orderIndex].status) {
      if (!data.orders[orderIndex].statusHistory) {
        data.orders[orderIndex].statusHistory = [];
      }
      
      data.orders[orderIndex].statusHistory.push({
        status: updateData.status,
        timestamp: new Date().toISOString(),
        note: updateData.statusNote || `Status changed to ${updateData.status}`
      });
    }
    
    // Recalculate total amount if items are updated
    if (updateData.items && Array.isArray(updateData.items) && updateData.items.length > 0) {
      updateData.totalAmount = this._calculateTotalAmount(updateData.items);
    }
    
    data.orders[orderIndex] = {
      ...data.orders[orderIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this._writeData(data);
    
    return data.orders[orderIndex];
  }
  
  /**
   * Update order status
   * @param {string} orderId - The ID of the order to update
   * @param {string} status - The new status
   * @param {string} [note] - Optional note about the status change
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async updateOrderStatus(orderId, status, note) {
    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid order status. Valid statuses are: ${VALID_STATUSES.join(', ')}`);
    }
    
    return this.updateOrder(orderId, { 
      status, 
      statusNote: note || `Status changed to ${status}` 
    });
  }

  /**
   * Add an item to an order
   * @param {string} orderId - The ID of the order
   * @param {Object} item - The item to add
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async addOrderItem(orderId, item) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    
    // Don't allow adding items to completed or cancelled orders
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot add items to ${order.status} orders`);
    }
    
    // Validate item
    if (!item.productId || !item.name || !item.price) {
      throw new Error('Item must have productId, name, and price');
    }
    
    const updatedItems = [...order.items, {
      ...item,
      quantity: item.quantity || 1
    }];
    
    return this.updateOrder(orderId, { items: updatedItems });
  }

  /**
   * Remove an item from an order
   * @param {string} orderId - The ID of the order
   * @param {string} productId - The ID of the product to remove
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async removeOrderItem(orderId, productId) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    
    // Don't allow removing items from completed or cancelled orders
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot remove items from ${order.status} orders`);
    }
    
    const updatedItems = order.items.filter(item => item.productId !== productId);
    
    // Ensure there's at least one item left
    if (updatedItems.length === 0) {
      throw new Error('Cannot remove the last item from an order. Consider cancelling the order instead.');
    }
    
    return this.updateOrder(orderId, { items: updatedItems });
  }

  /**
   * Update an item in an order
   * @param {string} orderId - The ID of the order
   * @param {string} productId - The ID of the product to update
   * @param {Object} updates - The updates to apply to the item
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async updateOrderItem(orderId, productId, updates) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    
    // Don't allow updating items in completed or cancelled orders
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot update items in ${order.status} orders`);
    }
    
    const itemIndex = order.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw new Error(`Item with productId ${productId} not found in order`);
    }
    
    const updatedItems = [...order.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      ...updates
    };
    
    return this.updateOrder(orderId, { items: updatedItems });
  }

  /**
   * Delete an order
   * @param {string} orderId - The ID of the order to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteOrder(orderId) {
    const data = await this._readData();
    const initialLength = data.orders.length;
    
    data.orders = data.orders.filter(order => order.id !== orderId);
    
    if (data.orders.length === initialLength) return false;
    
    await this._writeData(data);
    
    return true;
  }
  
  /**
   * Search orders by various criteria
   * @param {Object} criteria - Search criteria
   * @param {string} [criteria.userId] - Filter by user ID
   * @param {string} [criteria.status] - Filter by status
   * @param {Date|string} [criteria.startDate] - Filter by orders created after this date
   * @param {Date|string} [criteria.endDate] - Filter by orders created before this date
   * @param {string} [criteria.productId] - Filter by orders containing this product
   * @returns {Promise<Array>} Array of matching orders
   */
  static async searchOrders(criteria = {}) {
    const orders = await this.getAllOrders();
    
    return orders.filter(order => {
      // Filter by user ID if specified
      if (criteria.userId && order.userId !== criteria.userId) {
        return false;
      }
      
      // Filter by status if specified
      if (criteria.status && order.status !== criteria.status) {
        return false;
      }
      
      // Filter by date range if specified
      if (criteria.startDate) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(criteria.startDate);
        if (orderDate < startDate) return false;
      }
      
      if (criteria.endDate) {
        const orderDate = new Date(order.createdAt);
        const endDate = new Date(criteria.endDate);
        if (orderDate > endDate) return false;
      }
      
      // Filter by product ID if specified
      if (criteria.productId) {
        const hasProduct = order.items.some(item => item.productId === criteria.productId);
        if (!hasProduct) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Count orders by status
   * @returns {Promise<Object>} Object with counts for each status
   */
  static async countOrdersByStatus() {
    const orders = await this.getAllOrders();
    
    const counts = {};
    
    // Initialize counts for all valid statuses
    VALID_STATUSES.forEach(status => {
      counts[status] = 0;
    });
    
    // Count orders by status
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    return counts;
  }
  
  /**
   * Get order history for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of orders for the user, sorted by date
   */
  static async getUserOrderHistory(userId) {
    const orders = await this.getOrdersByUserId(userId);
    
    // Sort by date, newest first
    return orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }
  
  /**
   * Get recent orders
   * @param {number} limit - Maximum number of orders to return
   * @returns {Promise<Array>} Array of recent orders
   */
  static async getRecentOrders(limit = 10) {
    const orders = await this.getAllOrders();
    
    // Sort by date, newest first
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

// Initialize the orders.json file when the module is loaded
OrderModel.initialize().catch(err => {
  console.error('Failed to initialize orders database:', err);
});

module.exports = OrderModel;
