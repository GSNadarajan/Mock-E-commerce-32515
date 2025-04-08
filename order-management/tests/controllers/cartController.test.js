const CartController = require('../../src/controllers/cartController');
const CartModel = require('../../src/models/cartModel');
const userService = require('../../src/services/userService');

// Mock the CartModel and userService
jest.mock('../../src/models/cartModel');
jest.mock('../../src/services/userService');

describe('CartController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      body: {},
      headers: { 'authorization': 'Bearer test-token' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [
      { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  describe('getCartByUserId', () => {
    it('should return cart by user ID with status 200', async () => {
      req.params.userId = 'user-1';
      CartModel.getCartByUserId.mockResolvedValue(mockCart);
      
      await CartController.getCartByUserId(req, res);
      
      expect(CartModel.getCartByUserId).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });
    
    it('should return 404 if cart not found', async () => {
      req.params.userId = 'non-existent';
      CartModel.getCartByUserId.mockResolvedValue(null);
      
      await CartController.getCartByUserId(req, res);
      
      expect(CartModel.getCartByUserId).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      CartModel.getCartByUserId.mockRejectedValue(new Error('Database error'));
      
      await CartController.getCartByUserId(req, res);
      
      expect(CartModel.getCartByUserId).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve cart' });
    });
  });

  describe('addItemToCart', () => {
    it('should add item to cart with status 200', async () => {
      req.params.userId = 'user-1';
      req.body = { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 };
      userService.validateUser.mockResolvedValue(true);
      CartModel.addItemToCart.mockResolvedValue({
        ...mockCart,
        items: [
          ...mockCart.items,
          { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 }
        ]
      });
      
      await CartController.addItemToCart(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'test-token');
      expect(CartModel.addItemToCart).toHaveBeenCalledWith('user-1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...mockCart,
        items: [
          ...mockCart.items,
          { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 }
        ]
      });
    });
    
    it('should return 404 if user not found', async () => {
      req.params.userId = 'non-existent';
      req.body = { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 };
      userService.validateUser.mockResolvedValue(false);
      
      await CartController.addItemToCart(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('non-existent', 'test-token');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      req.body = { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 };
      userService.validateUser.mockResolvedValue(true);
      CartModel.addItemToCart.mockRejectedValue(new Error('Database error'));
      
      await CartController.addItemToCart(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'test-token');
      expect(CartModel.addItemToCart).toHaveBeenCalledWith('user-1', req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add item to cart' });
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart with status 200', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'product-1';
      CartModel.removeItemFromCart.mockResolvedValue({
        ...mockCart,
        items: []
      });
      
      await CartController.removeItemFromCart(req, res);
      
      expect(CartModel.removeItemFromCart).toHaveBeenCalledWith('user-1', 'product-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...mockCart,
        items: []
      });
    });
    
    it('should return 404 if cart not found', async () => {
      req.params.userId = 'non-existent';
      req.params.productId = 'product-1';
      CartModel.removeItemFromCart.mockResolvedValue(null);
      
      await CartController.removeItemFromCart(req, res);
      
      expect(CartModel.removeItemFromCart).toHaveBeenCalledWith('non-existent', 'product-1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'product-1';
      CartModel.removeItemFromCart.mockRejectedValue(new Error('Database error'));
      
      await CartController.removeItemFromCart(req, res);
      
      expect(CartModel.removeItemFromCart).toHaveBeenCalledWith('user-1', 'product-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to remove item from cart' });
    });
  });

  describe('clearCart', () => {
    it('should clear cart with status 200', async () => {
      req.params.userId = 'user-1';
      CartModel.clearCart.mockResolvedValue({
        ...mockCart,
        items: []
      });
      
      await CartController.clearCart(req, res);
      
      expect(CartModel.clearCart).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart cleared successfully' });
    });
    
    it('should return 404 if cart not found', async () => {
      req.params.userId = 'non-existent';
      CartModel.clearCart.mockResolvedValue(null);
      
      await CartController.clearCart(req, res);
      
      expect(CartModel.clearCart).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      CartModel.clearCart.mockRejectedValue(new Error('Database error'));
      
      await CartController.clearCart(req, res);
      
      expect(CartModel.clearCart).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to clear cart' });
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity with status 200', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'product-1';
      req.body = { quantity: 5 };
      CartModel.updateItemQuantity.mockResolvedValue({
        ...mockCart,
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 5 }
        ]
      });
      
      await CartController.updateItemQuantity(req, res);
      
      expect(CartModel.updateItemQuantity).toHaveBeenCalledWith('user-1', 'product-1', 5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...mockCart,
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 5 }
        ]
      });
    });
    
    it('should return 400 for invalid quantity', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'product-1';
      req.body = { quantity: 0 };
      
      await CartController.updateItemQuantity(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Valid quantity is required' });
    });
    
    it('should return 404 if cart or item not found', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'non-existent';
      req.body = { quantity: 5 };
      CartModel.updateItemQuantity.mockResolvedValue(null);
      
      await CartController.updateItemQuantity(req, res);
      
      expect(CartModel.updateItemQuantity).toHaveBeenCalledWith('user-1', 'non-existent', 5);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart or item not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      req.params.productId = 'product-1';
      req.body = { quantity: 5 };
      CartModel.updateItemQuantity.mockRejectedValue(new Error('Database error'));
      
      await CartController.updateItemQuantity(req, res);
      
      expect(CartModel.updateItemQuantity).toHaveBeenCalledWith('user-1', 'product-1', 5);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update item quantity' });
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate cart total with status 200', async () => {
      req.params.userId = 'user-1';
      CartModel.calculateCartTotal.mockResolvedValue({ total: 20, itemCount: 2 });
      
      await CartController.calculateCartTotal(req, res);
      
      expect(CartModel.calculateCartTotal).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ total: 20, itemCount: 2 });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      CartModel.calculateCartTotal.mockRejectedValue(new Error('Database error'));
      
      await CartController.calculateCartTotal(req, res);
      
      expect(CartModel.calculateCartTotal).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to calculate cart total' });
    });
  });

  describe('deleteCart', () => {
    it('should delete cart with status 200', async () => {
      req.params.userId = 'user-1';
      CartModel.deleteCart.mockResolvedValue(true);
      
      await CartController.deleteCart(req, res);
      
      expect(CartModel.deleteCart).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart deleted successfully' });
    });
    
    it('should return 404 if cart not found', async () => {
      req.params.userId = 'non-existent';
      CartModel.deleteCart.mockResolvedValue(false);
      
      await CartController.deleteCart(req, res);
      
      expect(CartModel.deleteCart).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cart not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      CartModel.deleteCart.mockRejectedValue(new Error('Database error'));
      
      await CartController.deleteCart(req, res);
      
      expect(CartModel.deleteCart).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete cart' });
    });
  });
});