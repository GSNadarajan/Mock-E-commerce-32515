const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ordersFilePath = path.join(__dirname, '../data/orders.json');

/**
 * Order Model - Handles all operations related to orders
 */
class OrderModel {
  /**
   * Get all orders
   * @returns {Promise<Array>} Array of all orders
   */
  static async getAllOrders() {
    try {
      const orders = await fs.readJSON(ordersFilePath);
      return orders;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty array
        await fs.writeJSON(ordersFilePath, []);
        return [];
      }
      throw error;
    }
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
   * Create a new order
   * @param {Object} orderData - The order data
   * @returns {Promise<Object>} The created order
   */
  static async createOrder(orderData) {
    const orders = await this.getAllOrders();
    
    const newOrder = {
      id: uuidv4(),
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await fs.writeJSON(ordersFilePath, orders);
    
    return newOrder;
  }

  /**
   * Update an order
   * @param {string} orderId - The ID of the order to update
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object|null>} The updated order or null if not found
   */
  static async updateOrder(orderId, updateData) {
    const orders = await this.getAllOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJSON(ordersFilePath, orders);
    
    return orders[orderIndex];
  }

  /**
   * Delete an order
   * @param {string} orderId - The ID of the order to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteOrder(orderId) {
    const orders = await this.getAllOrders();
    const initialLength = orders.length;
    
    const filteredOrders = orders.filter(order => order.id !== orderId);
    
    if (filteredOrders.length === initialLength) return false;
    
    await fs.writeJSON(ordersFilePath, filteredOrders);
    
    return true;
  }
}

module.exports = OrderModel;
