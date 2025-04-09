/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

const PaymentModel = require('../models/paymentModel');

/**
 * PaymentController class for handling payment-related HTTP requests
 */
class PaymentController {
  /**
   * Process a payment for an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async processPayment(req, res) {
    try {
      const paymentData = req.body;
      
      // Input validation
      if (!paymentData.user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!paymentData.order_id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      
      if (!paymentData.payment_method) {
        return res.status(400).json({ error: 'Payment method is required' });
      }
      
      if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      
      // Transform the request data to match our model's expected format
      const transformedData = {
        userId: paymentData.user_id,
        orderId: paymentData.order_id,
        paymentMethod: paymentData.payment_method,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        description: paymentData.description || '',
        metadata: paymentData.metadata || {}
      };
      
      const payment = await PaymentModel.createPayment(transformedData);
      
      // Return a simplified response with just the necessary information
      res.status(201).json({
        message: 'Payment processed successfully',
        transaction_id: payment.transactionId
      });
    } catch (error) {
      console.error('Error in processPayment:', error);
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json({ error: 'Validation error', message: error.message });
      }
      res.status(500).json({ error: 'Failed to process payment', message: error.message });
    }
  }

  /**
   * Get all payments (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllPayments(req, res) {
    try {
      const payments = await PaymentModel.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      res.status(500).json({ error: 'Failed to retrieve payments', message: error.message });
    }
  }

  /**
   * Get payment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentById(req, res) {
    try {
      const payment = await PaymentModel.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      console.error('Error in getPaymentById:', error);
      res.status(500).json({ error: 'Failed to retrieve payment', message: error.message });
    }
  }

  /**
   * Get payments by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentsByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const payments = await PaymentModel.getPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      console.error('Error in getPaymentsByUserId:', error);
      res.status(500).json({ error: 'Failed to retrieve payments', message: error.message });
    }
  }

  /**
   * Get payments by order ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPaymentsByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }
      
      const payments = await PaymentModel.getPaymentsByOrderId(orderId);
      res.json(payments);
    } catch (error) {
      console.error('Error in getPaymentsByOrderId:', error);
      res.status(500).json({ error: 'Failed to retrieve payments', message: error.message });
    }
  }
}

module.exports = PaymentController;
