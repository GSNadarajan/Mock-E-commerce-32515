const OrderModel = require('../../orders/models/orderModel');

/**
 * OrderController class for handling order-related HTTP requests
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
      res.json(orders);
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      res.status(500).json({ error: 'Failed to retrieve orders', message: error.message });
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
      
      res.json(order);
    } catch (error) {
      console.error('Error in getOrderById:', error);
      res.status(500).json({ error: 'Failed to retrieve order', message: error.message });
    }
  }

  /**
   * Get orders by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrdersByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const orders = await OrderModel.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error in getOrdersByUserId:', error);
      res.status(500).json({ error: 'Failed to retrieve orders', message: error.message });
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
      
      // Input validation
      if (!orderData.userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }
      
      // Validate each item has required fields
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        if (!item.productId) {
          return res.status(400).json({ error: `Item at index ${i} is missing productId` });
        }
        if (!item.quantity || item.quantity < 1) {
          return res.status(400).json({ error: `Item at index ${i} has invalid quantity` });
        }
      }
      
      if (!orderData.shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }
      
      const newOrder = await OrderModel.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error in createOrder:', error);
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json({ error: 'Validation error', message: error.message });
      }
      res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
  }

  /**
   * Update an existing order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateOrder(req, res) {
    try {
      // Check if order exists
      const existingOrder = await OrderModel.getOrderById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const updatedOrder = await OrderModel.updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updateOrder:', error);
      if (error.message.includes('Invalid order status')) {
        return res.status(400).json({ error: 'Invalid order status', message: error.message });
      }
      res.status(500).json({ error: 'Failed to update order', message: error.message });
    }
  }

  /**
   * Update order status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Check if order exists
      const existingOrder = await OrderModel.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const updatedOrder = await OrderModel.updateOrderStatus(id, status, note);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      if (error.message.includes('Invalid order status')) {
        return res.status(400).json({ error: 'Invalid order status', message: error.message });
      }
      res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
  }

  /**
   * Delete an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteOrder(req, res) {
    try {
      // Check if order exists before attempting to delete
      const existingOrder = await OrderModel.getOrderById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const success = await OrderModel.deleteOrder(req.params.id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete order' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      res.status(500).json({ error: 'Failed to delete order', message: error.message });
    }
  }
  
  /**
   * Search orders by criteria
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchOrders(req, res) {
    try {
      const criteria = {};
      
      // Extract search criteria from query parameters
      if (req.query.userId) criteria.userId = req.query.userId;
      if (req.query.status) criteria.status = req.query.status;
      if (req.query.startDate) criteria.startDate = req.query.startDate;
      if (req.query.endDate) criteria.endDate = req.query.endDate;
      if (req.query.productId) criteria.productId = req.query.productId;
      
      const orders = await OrderModel.searchOrders(criteria);
      res.json(orders);
    } catch (error) {
      console.error('Error in searchOrders:', error);
      res.status(500).json({ error: 'Failed to search orders', message: error.message });
    }
  }

  /**
   * Get orders by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrdersByStatus(req, res) {
    try {
      const { status } = req.params;
      
      if (!status) {
        return res.status(400).json({ error: 'Status parameter is required' });
      }
      
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: `Invalid order status: ${status}` });
      }
      
      const orders = await OrderModel.getOrdersByStatus(status);
      res.json(orders);
    } catch (error) {
      console.error('Error in getOrdersByStatus:', error);
      res.status(500).json({ error: 'Failed to retrieve orders by status', message: error.message });
    }
  }

  /**
   * Get order counts by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrderCounts(req, res) {
    try {
      const counts = await OrderModel.countOrdersByStatus();
      res.json(counts);
    } catch (error) {
      console.error('Error in getOrderCounts:', error);
      res.status(500).json({ error: 'Failed to get order counts', message: error.message });
    }
  }
}

module.exports = OrderController;
