const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the carts JSON file and directory
const dataDir = path.join(__dirname, '../data');
const cartsFilePath = path.join(dataDir, 'carts.json');

// File lock status
let isWriting = false;

/**
 * Cart Model - Handles all operations related to shopping carts
 */
class CartModel {
  /**
   * Initialize the carts.json file if it doesn't exist
   * Ensures the data directory exists and creates the file with proper structure
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      try {
        // Check if the file exists
        await fs.access(cartsFilePath);
        
        // Validate file structure
        try {
          const data = await fs.readFile(cartsFilePath, 'utf8');
          const parsedData = JSON.parse(data);
          
          // Check if the file has the correct structure
          if (!parsedData.carts || !Array.isArray(parsedData.carts)) {
            console.warn('carts.json has invalid structure. Recreating with proper structure.');
            await this._writeData({ 
              schemaVersion: '1.0',
              carts: [] 
            });
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing carts.json:', parseError.message);
          console.warn('Recreating carts.json with proper structure.');
          await this._writeData({ 
            schemaVersion: '1.0',
            carts: [] 
          });
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty carts array and schema version
        await this._writeData({ 
          schemaVersion: '1.0',
          carts: [] 
        });
      }
    } catch (error) {
      console.error('Failed to initialize carts database:', error);
      throw new Error(`Failed to initialize carts database: ${error.message}`);
    }
  }

  /**
   * Read carts data from JSON file
   * @returns {Promise<Object>} The parsed JSON data
   * @private
   */
  static async _readData() {
    try {
      const data = await fs.readFile(cartsFilePath, 'utf8');
      try {
        const parsedData = JSON.parse(data);
        // Ensure the data has the expected structure
        if (!parsedData.carts || !Array.isArray(parsedData.carts)) {
          console.warn('carts.json has invalid structure. Returning empty carts array.');
          return { schemaVersion: '1.0', carts: [] };
        }
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing carts.json:', parseError.message);
        throw new Error(`Error parsing cart data: ${parseError.message}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, initialize it
        await this.initialize();
        return { schemaVersion: '1.0', carts: [] };
      }
      throw new Error(`Error reading cart data: ${error.message}`);
    }
  }

  /**
   * Write carts data to JSON file with improved error handling and file locking
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
      if (!data.carts || !Array.isArray(data.carts)) {
        throw new Error('Invalid data structure: carts array is required');
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      // Write to a temporary file first to ensure atomic operation
      const tempPath = `${cartsFilePath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename the temporary file to the actual file (atomic operation)
      await fs.rename(tempPath, cartsFilePath);
    } catch (error) {
      console.error('Error writing cart data:', error);
      throw new Error(`Error writing cart data: ${error.message}`);
    } finally {
      // Release the lock
      isWriting = false;
    }
  }

  /**
   * Get all carts
   * @returns {Promise<Array>} Array of all carts
   */
  static async getAllCarts() {
    const data = await this._readData();
    return data.carts;
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!items || !Array.isArray(items)) {
      throw new Error('Items must be an array');
    }
    
    const data = await this._readData();
    const existingCartIndex = data.carts.findIndex(cart => cart.userId === userId);
    
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
      
      data.carts.push(newCart);
      await this._writeData(data);
      
      return newCart;
    } else {
      // Update existing cart
      data.carts[existingCartIndex] = {
        ...data.carts[existingCartIndex],
        ...cartData
      };
      
      await this._writeData(data);
      
      return data.carts[existingCartIndex];
    }
  }

  /**
   * Add item to cart
   * @param {string} userId - The ID of the user
   * @param {Object} item - The item to add
   * @returns {Promise<Object>} The updated cart
   */
  static async addItemToCart(userId, item) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!item || !item.productId) {
      throw new Error('Valid item with productId is required');
    }
    
    // Ensure item has all required properties
    if (!item.name || item.price === undefined || item.quantity === undefined) {
      throw new Error('Item must have name, price, and quantity');
    }
    
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
      // Update price if it has changed
      if (item.price !== undefined) {
        cart.items[existingItemIndex].price = item.price;
      }
      // Update name if it has changed
      if (item.name) {
        cart.items[existingItemIndex].name = item.name;
      }
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const data = await this._readData();
    const initialLength = data.carts.length;
    
    data.carts = data.carts.filter(cart => cart.userId !== userId);
    
    if (data.carts.length === initialLength) return false;
    
    await this._writeData(data);
    
    return true;
  }
  
  /**
   * Update item quantity in cart
   * @param {string} userId - The ID of the user
   * @param {string} productId - The ID of the product
   * @param {number} quantity - The new quantity
   * @returns {Promise<Object|null>} The updated cart or null if cart or item not found
   */
  static async updateItemQuantity(userId, productId, quantity) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    if (typeof quantity !== 'number' || quantity < 1) {
      throw new Error('Quantity must be a positive number');
    }
    
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) return null;
    
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) return null;
    
    cart.items[itemIndex].quantity = quantity;
    
    return this.createOrUpdateCart(userId, cart.items);
  }
  
  /**
   * Calculate cart total
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} Object containing total and itemCount
   */
  static async calculateCartTotal(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      return { total: 0, itemCount: 0 };
    }
    
    let total = 0;
    let itemCount = 0;
    
    cart.items.forEach(item => {
      total += item.price * item.quantity;
      itemCount += item.quantity;
    });
    
    return { total, itemCount };
  }
}

// Initialize the carts.json file when the module is loaded
CartModel.initialize().catch(err => {
  console.error('Failed to initialize carts database:', err);
});

module.exports = CartModel;
