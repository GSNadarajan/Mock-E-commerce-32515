const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the orders JSON file and directory
const dataDir = path.join(__dirname, '../data');
const ordersFilePath = path.join(dataDir, 'orders.json');

// File lock status
let isWriting = false;

/**
 * Order Model - Handles all operations related to orders
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
        await fs.access(ordersFilePath);
        
        // Validate file structure
        try {
          const data = await fs.readFile(ordersFilePath, 'utf8');
          const parsedData = JSON.parse(data);
          
          // Check if the file has the correct structure
          if (!parsedData.orders || !Array.isArray(parsedData.orders)) {
            console.warn('orders.json has invalid structure. Recreating with proper structure.');
            await this._writeData({ 
              schemaVersion: '1.0',
              orders: [] 
            });
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing orders.json:', parseError.message);
          console.warn('Recreating orders.json with proper structure.');
          await this._writeData({ 
            schemaVersion: '1.0',
            orders: [] 
          });
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty orders array and schema version
        await this._writeData({ 
          schemaVersion: '1.0',
          orders: [] 
        });
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
      const data = await fs.readFile(ordersFilePath, 'utf8');
      try {
        const parsedData = JSON.parse(data);
        // Ensure the data has the expected structure
        if (!parsedData.orders || !Array.isArray(parsedData.orders)) {
          console.warn('orders.json has invalid structure. Returning empty orders array.');
          return { schemaVersion: '1.0', orders: [] };
        }
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing orders.json:', parseError.message);
        throw new Error(`Error parsing order data: ${parseError.message}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, initialize it
        await this.initialize();
        return { schemaVersion: '1.0', orders: [] };
      }
      throw new Error(`Error reading order data: ${error.message}`);
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
      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error('Invalid data structure: orders array is required');
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      // Write to a temporary file first to ensure atomic operation
      const tempPath = `${ordersFilePath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename the temporary file to the actual file (atomic operation)
      await fs.rename(tempPath, ordersFilePath);
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
    
    const data = await this._readData();
    
    const newOrder = {
      id: uuidv4(),
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.orders.push(newOrder);
    await this._writeData(data);
    
    return newOrder;
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
    if (updateData.status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(updateData.status)) {
      throw new Error('Invalid order status');
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
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async updateOrderStatus(orderId, status) {
    // Validate status
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      throw new Error('Invalid order status');
    }
    
    return this.updateOrder(orderId, { status });
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
   * @param {Date} [criteria.startDate] - Filter by orders created after this date
   * @param {Date} [criteria.endDate] - Filter by orders created before this date
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
      
      return true;
    });
  }
  
  /**
   * Count orders by status
   * @returns {Promise<Object>} Object with counts for each status
   */
  static async countOrdersByStatus() {
    const orders = await this.getAllOrders();
    
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    return counts;
  }
}

// Initialize the orders.json file when the module is loaded
OrderModel.initialize().catch(err => {
  console.error('Failed to initialize orders database:', err);
});

module.exports = OrderModel;
