const CartModel = require('../models/cartModel');

/**
 * Cart Controller - Handles business logic for cart operations
 */
class CartController {
  /**
   * Get cart by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCartByUserId(req, res) {
    try {
      const cart = await CartModel.getCartByUserId(req.params.userId);
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      res.status(200).json(cart);
    } catch (error) {
      console.error(`Error getting cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve cart' });
    }
  }

  /**
   * Add item to cart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async addItemToCart(req, res) {
    try {
      const { userId } = req.params;
      const item = req.body;
      
      const updatedCart = await CartModel.addItemToCart(userId, item);
      res.status(200).json(updatedCart);
    } catch (error) {
      console.error(`Error adding item to cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  /**
   * Remove item from cart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async removeItemFromCart(req, res) {
    try {
      const { userId, productId } = req.params;
      
      const updatedCart = await CartModel.removeItemFromCart(userId, productId);
      
      if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      res.status(200).json(updatedCart);
    } catch (error) {
      console.error(`Error removing item from cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  }

  /**
   * Clear cart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async clearCart(req, res) {
    try {
      const { userId } = req.params;
      
      const updatedCart = await CartModel.clearCart(userId);
      
      if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
      console.error(`Error clearing cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  }

  /**
   * Update item quantity in cart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateItemQuantity(req, res) {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }
      
      const updatedCart = await CartModel.updateItemQuantity(userId, productId, quantity);
      
      if (!updatedCart) {
        return res.status(404).json({ error: 'Cart or item not found' });
      }
      
      res.status(200).json(updatedCart);
    } catch (error) {
      console.error(`Error updating item quantity in cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to update item quantity' });
    }
  }

  /**
   * Calculate cart total
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async calculateCartTotal(req, res) {
    try {
      const { userId } = req.params;
      
      const total = await CartModel.calculateCartTotal(userId);
      res.status(200).json(total);
    } catch (error) {
      console.error(`Error calculating cart total for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to calculate cart total' });
    }
  }

  /**
   * Delete cart
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteCart(req, res) {
    try {
      const { userId } = req.params;
      
      const deleted = await CartModel.deleteCart(userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (error) {
      console.error(`Error deleting cart for user ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to delete cart' });
    }
  }
}

module.exports = CartController;
