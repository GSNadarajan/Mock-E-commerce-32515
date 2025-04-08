const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const CartModel = require('../../src/models/cartModel');

// Mock fs and fs-extra modules
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    rename: jest.fn()
  }
}));

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('CartModel', () => {
  const mockCartsData = {
    schemaVersion: '1.0',
    carts: [
      {
        id: 'cart-1',
        userId: 'user-1',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      {
        id: 'cart-2',
        userId: 'user-2',
        items: [
          { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 }
        ],
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful file read
    fs.readFile.mockResolvedValue(JSON.stringify(mockCartsData));
    // Mock successful directory creation
    fsExtra.ensureDir.mockResolvedValue();
    // Mock successful file write
    fs.writeFile.mockResolvedValue();
    // Mock successful file rename
    fs.rename.mockResolvedValue();
    // Mock successful file access
    fs.access.mockResolvedValue();
  });

  describe('initialize', () => {
    it('should initialize carts.json if it does not exist', async () => {
      fs.access.mockRejectedValueOnce(new Error('ENOENT'));
      
      await CartModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should handle invalid JSON structure', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json');
      
      await CartModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle missing carts array', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ schemaVersion: '1.0' }));
      
      await CartModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should add schema version if missing', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ carts: [] }));
      
      await CartModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('_readData', () => {
    it('should read and parse carts data', async () => {
      const result = await CartModel._readData();
      
      expect(fs.readFile).toHaveBeenCalled();
      expect(result).toEqual(mockCartsData);
    });

    it('should handle file not found error', async () => {
      fs.readFile.mockRejectedValueOnce({ code: 'ENOENT' });
      
      const result = await CartModel._readData();
      
      expect(result).toEqual({ schemaVersion: '1.0', carts: [] });
    });

    it('should handle JSON parse error', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json');
      
      await expect(CartModel._readData()).rejects.toThrow('Error parsing cart data');
    });
  });

  describe('_writeData', () => {
    it('should write data to file', async () => {
      await CartModel._writeData(mockCartsData);
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for invalid data structure', async () => {
      await expect(CartModel._writeData({ invalid: 'data' })).rejects.toThrow('Invalid data structure');
    });
  });

  describe('getAllCarts', () => {
    it('should return all carts', async () => {
      const carts = await CartModel.getAllCarts();
      
      expect(carts).toEqual(mockCartsData.carts);
    });
  });

  describe('getCartByUserId', () => {
    it('should return cart by user ID', async () => {
      const cart = await CartModel.getCartByUserId('user-1');
      
      expect(cart).toEqual(mockCartsData.carts[0]);
    });

    it('should return null for non-existent cart', async () => {
      const cart = await CartModel.getCartByUserId('non-existent');
      
      expect(cart).toBeNull();
    });
  });

  describe('createOrUpdateCart', () => {
    it('should create a new cart', async () => {
      const items = [{ productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 }];
      
      const newCart = await CartModel.createOrUpdateCart('user-3', items);
      
      expect(newCart).toHaveProperty('id', 'test-uuid');
      expect(newCart).toHaveProperty('userId', 'user-3');
      expect(newCart).toHaveProperty('items', items);
      expect(newCart).toHaveProperty('createdAt');
      expect(newCart).toHaveProperty('updatedAt');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should update an existing cart', async () => {
      const items = [{ productId: 'product-1-updated', name: 'Updated Product 1', price: 15, quantity: 3 }];
      
      const updatedCart = await CartModel.createOrUpdateCart('user-1', items);
      
      expect(updatedCart).toHaveProperty('id', 'cart-1');
      expect(updatedCart).toHaveProperty('userId', 'user-1');
      expect(updatedCart).toHaveProperty('items', items);
      expect(updatedCart).toHaveProperty('updatedAt');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for missing user ID', async () => {
      const items = [{ productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 }];
      
      await expect(CartModel.createOrUpdateCart(null, items)).rejects.toThrow('User ID is required');
    });

    it('should throw error for invalid items', async () => {
      await expect(CartModel.createOrUpdateCart('user-3', 'not-an-array')).rejects.toThrow('Items must be an array');
    });
  });

  describe('addItemToCart', () => {
    it('should add a new item to an existing cart', async () => {
      const item = { productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 };
      
      const updatedCart = await CartModel.addItemToCart('user-1', item);
      
      expect(updatedCart.items).toHaveLength(2);
      expect(updatedCart.items[1]).toEqual(item);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should update quantity of existing item in cart', async () => {
      const item = { productId: 'product-1', name: 'Product 1', price: 10, quantity: 3 };
      
      const updatedCart = await CartModel.addItemToCart('user-1', item);
      
      expect(updatedCart.items).toHaveLength(1);
      expect(updatedCart.items[0].quantity).toBe(5); // 2 (original) + 3 (added)
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should create a new cart if user does not have one', async () => {
      const item = { productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 };
      
      const newCart = await CartModel.addItemToCart('user-3', item);
      
      expect(newCart).toHaveProperty('id', 'test-uuid');
      expect(newCart).toHaveProperty('userId', 'user-3');
      expect(newCart.items).toHaveLength(1);
      expect(newCart.items[0]).toEqual(item);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for missing user ID', async () => {
      const item = { productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 };
      
      await expect(CartModel.addItemToCart(null, item)).rejects.toThrow('User ID is required');
    });

    it('should throw error for missing product ID', async () => {
      const item = { name: 'Product 3', price: 30, quantity: 3 };
      
      await expect(CartModel.addItemToCart('user-1', item)).rejects.toThrow('Valid item with productId is required');
    });

    it('should throw error for missing required item properties', async () => {
      const item = { productId: 'product-3' };
      
      await expect(CartModel.addItemToCart('user-1', item)).rejects.toThrow('Item must have name, price, and quantity');
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove an item from cart', async () => {
      const updatedCart = await CartModel.removeItemFromCart('user-1', 'product-1');
      
      expect(updatedCart.items).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return null if cart does not exist', async () => {
      const result = await CartModel.removeItemFromCart('non-existent', 'product-1');
      
      expect(result).toBeNull();
    });

    it('should throw error for missing user ID', async () => {
      await expect(CartModel.removeItemFromCart(null, 'product-1')).rejects.toThrow('User ID is required');
    });

    it('should throw error for missing product ID', async () => {
      await expect(CartModel.removeItemFromCart('user-1', null)).rejects.toThrow('Product ID is required');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const updatedCart = await CartModel.clearCart('user-1');
      
      expect(updatedCart.items).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return null if cart does not exist', async () => {
      const result = await CartModel.clearCart('non-existent');
      
      expect(result).toBeNull();
    });

    it('should throw error for missing user ID', async () => {
      await expect(CartModel.clearCart(null)).rejects.toThrow('User ID is required');
    });
  });

  describe('deleteCart', () => {
    it('should delete a cart', async () => {
      const result = await CartModel.deleteCart('user-1');
      
      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return false if cart does not exist', async () => {
      const result = await CartModel.deleteCart('non-existent');
      
      expect(result).toBe(false);
    });

    it('should throw error for missing user ID', async () => {
      await expect(CartModel.deleteCart(null)).rejects.toThrow('User ID is required');
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity in cart', async () => {
      const updatedCart = await CartModel.updateItemQuantity('user-1', 'product-1', 5);
      
      expect(updatedCart.items[0].quantity).toBe(5);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return null if cart does not exist', async () => {
      const result = await CartModel.updateItemQuantity('non-existent', 'product-1', 5);
      
      expect(result).toBeNull();
    });

    it('should return null if item does not exist in cart', async () => {
      const result = await CartModel.updateItemQuantity('user-1', 'non-existent', 5);
      
      expect(result).toBeNull();
    });

    it('should throw error for missing user ID', async () => {
      await expect(CartModel.updateItemQuantity(null, 'product-1', 5)).rejects.toThrow('User ID is required');
    });

    it('should throw error for missing product ID', async () => {
      await expect(CartModel.updateItemQuantity('user-1', null, 5)).rejects.toThrow('Product ID is required');
    });

    it('should throw error for invalid quantity', async () => {
      await expect(CartModel.updateItemQuantity('user-1', 'product-1', 0)).rejects.toThrow('Quantity must be a positive number');
      await expect(CartModel.updateItemQuantity('user-1', 'product-1', -1)).rejects.toThrow('Quantity must be a positive number');
      await expect(CartModel.updateItemQuantity('user-1', 'product-1', 'not-a-number')).rejects.toThrow('Quantity must be a positive number');
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate cart total and item count', async () => {
      const result = await CartModel.calculateCartTotal('user-1');
      
      expect(result).toEqual({ total: 20, itemCount: 2 }); // 10 * 2 = 20, quantity = 2
    });

    it('should return zero total for non-existent cart', async () => {
      const result = await CartModel.calculateCartTotal('non-existent');
      
      expect(result).toEqual({ total: 0, itemCount: 0 });
    });

    it('should throw error for missing user ID', async () => {
      await expect(CartModel.calculateCartTotal(null)).rejects.toThrow('User ID is required');
    });
  });
});