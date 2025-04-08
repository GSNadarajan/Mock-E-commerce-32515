const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const cartsFilePath = path.join(__dirname, '../data/carts.json');

/**
 * Cart Model - Handles all operations related to shopping carts
 */
class CartModel {
  /**
   * Get all carts
   * @returns {Promise<Array>} Array of all carts
   */
  static async getAllCarts() {
    try {
      const carts = await fs.readJSON(cartsFilePath);
      return carts;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty array
        await fs.writeJSON(cartsFilePath, []);
        return [];
      }
      throw error;
    }
  }

  /**
   * Get cart by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object|null>} The cart object or null if not found
   */
  static async getCartByUserId(userId) {
    const carts = await this.getAllCarts();
    return carts.find(cart => cart.userId === userId) || null;
  }

  /**
   * Create or update a cart
   * @param {string} userId - The ID of the user
   * @param {Array} items - The cart items
   * @returns {Promise<Object>} The created or updated cart
   */
  static async createOrUpdateCart(userId, items) {
    const carts = await this.getAllCarts();
    const existingCartIndex = carts.findIndex(cart => cart.userId === userId);
    
    const cartData = {
      userId,
      items,
      updatedAt: new Date().toISOString()
    };
    
    if (existingCartIndex === -1) {
      // Create new cart
      const newCart = {
        id: uuidv4(),
        ...cartData,
        createdAt: new Date().toISOString()
      };
      
      carts.push(newCart);
      await fs.writeJSON(cartsFilePath, carts);
      
      return newCart;
    } else {
      // Update existing cart
      carts[existingCartIndex] = {
        ...carts[existingCartIndex],
        ...cartData
      };
      
      await fs.writeJSON(cartsFilePath, carts);
      
      return carts[existingCartIndex];
    }
  }

  /**
   * Add item to cart
   * @param {string} userId - The ID of the user
   * @param {Object} item - The item to add
   * @returns {Promise<Object>} The updated cart
   */
  static async addItemToCart(userId, item) {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      // Create new cart with item
      return this.createOrUpdateCart(userId, [item]);
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item to cart
      cart.items.push(item);
    }
    
    return this.createOrUpdateCart(userId, cart.items);
  }

  /**
   * Remove item from cart
   * @param {string} userId - The ID of the user
   * @param {string} productId - The ID of the product to remove
   * @returns {Promise<Object|null>} The updated cart or null if cart not found
   */
  static async removeItemFromCart(userId, productId) {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) return null;
    
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    
    return this.createOrUpdateCart(userId, updatedItems);
  }

  /**
   * Clear cart
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object|null>} The updated cart or null if cart not found
   */
  static async clearCart(userId) {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) return null;
    
    return this.createOrUpdateCart(userId, []);
  }

  /**
   * Delete cart
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteCart(userId) {
    const carts = await this.getAllCarts();
    const initialLength = carts.length;
    
    const filteredCarts = carts.filter(cart => cart.userId !== userId);
    
    if (filteredCarts.length === initialLength) return false;
    
    await fs.writeJSON(cartsFilePath, filteredCarts);
    
    return true;
  }
}

module.exports = CartModel;
