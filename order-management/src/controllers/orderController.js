const OrderModel = require('../models/orderModel');

/**
 * Order Controller - Handles business logic for order operations
 */
class OrderController {
  /**
   * Get all orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllOrders(req, res) {
    try {
      const orders = await OrderModel.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error getting all orders:', error);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  }

  /**
   * Get order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrderById(req, res) {
    try {
      const order = await OrderModel.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json(order);
    } catch (error) {
      console.error(`Error getting order ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  }

  /**
   * Get orders by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrdersByUserId(req, res) {
    try {
      const orders = await OrderModel.getOrdersByUserId(req.params.userId);
      res.status(200).json(orders);
    } catch (error) {
      console.error(`Error getting orders for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  }

  /**
   * Create a new order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createOrder(req, res) {
    try {
      const orderData = req.body;
      const newOrder = await OrderModel.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  /**
   * Update an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateOrder(req, res) {
    try {
      const updatedOrder = await OrderModel.updateOrder(req.params.id, req.body);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(`Error updating order ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

  /**
   * Delete an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteOrder(req, res) {
    try {
      const deleted = await OrderModel.deleteOrder(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error(`Error deleting order ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  }
}

module.exports = OrderController;
