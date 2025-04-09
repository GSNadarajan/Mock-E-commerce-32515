/**
 * Integration tests for order creation with user validation
 */

const axios = require('axios');
const OrderController = require('../../src/controllers/orderController');
const OrderModel = require('../../src/models/orderModel');
const userService = require('../../src/services/userService');

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/models/orderModel');
jest.mock('../../src/services/userService');

describe('Order Creation with User Validation Integration Tests', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: 'user-123', role: 'user' },
      headers: { 'authorization': 'Bearer mock-token' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  const mockOrder = {
    id: 'order-123',
    userId: 'user-123',
    items: [
      { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country'
    },
    status: 'pending',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  describe('Order Creation Flow', () => {
    test('should create order when user exists and is authenticated', async () => {
      // Setup request body
      req.body = {
        userId: 'user-123',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Mock user validation to return true (user exists)
      userService.validateUser.mockResolvedValue(true);
      
      // Mock order creation
      OrderModel.createOrder.mockResolvedValue(mockOrder);
      
      // Call the controller method
      await OrderController.createOrder(req, res);
      
      // Verify user validation was called with correct parameters
      expect(userService.validateUser).toHaveBeenCalledWith('user-123', 'mock-token');
      
      // Verify order creation was called with correct parameters
      expect(OrderModel.createOrder).toHaveBeenCalledWith(req.body);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    test('should reject order creation when user does not exist', async () => {
      // Setup request body
      req.body = {
        userId: 'non-existent-user',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Mock user validation to return false (user doesn't exist)
      userService.validateUser.mockResolvedValue(false);
      
      // Call the controller method
      await OrderController.createOrder(req, res);
      
      // Verify user validation was called with correct parameters
      expect(userService.validateUser).toHaveBeenCalledWith('non-existent-user', 'mock-token');
      
      // Verify order creation was not called
      expect(OrderModel.createOrder).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should allow admin to create order for any user', async () => {
      // Setup request with admin role
      req.user = { id: 'admin-1', role: 'admin' };
      
      // Setup request body for a different user
      req.body = {
        userId: 'user-456',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Mock user validation to return true (user exists)
      userService.validateUser.mockResolvedValue(true);
      
      // Mock order creation
      const adminCreatedOrder = { ...mockOrder, id: 'order-456', userId: 'user-456' };
      OrderModel.createOrder.mockResolvedValue(adminCreatedOrder);
      
      // Call the controller method
      await OrderController.createOrder(req, res);
      
      // Verify user validation was called with correct parameters
      expect(userService.validateUser).toHaveBeenCalledWith('user-456', 'mock-token');
      
      // Verify order creation was called with correct parameters
      expect(OrderModel.createOrder).toHaveBeenCalledWith(req.body);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(adminCreatedOrder);
    });

    test('should reject order creation when user is not authorized to create order for another user', async () => {
      // Setup request body for a different user
      req.body = {
        userId: 'user-456',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Call the controller method
      await OrderController.createOrder(req, res);
      
      // Verify user validation was not called
      expect(userService.validateUser).not.toHaveBeenCalled();
      
      // Verify order creation was not called
      expect(OrderModel.createOrder).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only create orders for yourself.' });
    });

    test('should handle user service errors gracefully', async () => {
      // Setup request body
      req.body = {
        userId: 'user-123',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      // Mock user validation to throw an error
      userService.validateUser.mockRejectedValue(new Error('User service unavailable'));
      
      // Call the controller method
      await OrderController.createOrder(req, res);
      
      // Verify user validation was called with correct parameters
      expect(userService.validateUser).toHaveBeenCalledWith('user-123', 'mock-token');
      
      // Verify order creation was not called
      expect(OrderModel.createOrder).not.toHaveBeenCalled();
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create order' });
    });
  });

  describe('Order Retrieval with User Authorization', () => {
    test('should allow user to retrieve their own orders', async () => {
      // Setup request parameters
      req.params.userId = 'user-123';
      
      // Mock order retrieval
      OrderModel.getOrdersByUserId.mockResolvedValue([mockOrder]);
      
      // Call the controller method
      await OrderController.getOrdersByUserId(req, res);
      
      // Verify order retrieval was called with correct parameters
      expect(OrderModel.getOrdersByUserId).toHaveBeenCalledWith('user-123');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockOrder]);
    });

    test('should allow admin to retrieve any user\'s orders', async () => {
      // Setup request with admin role
      req.user = { id: 'admin-1', role: 'admin' };
      
      // Setup request parameters for a different user
      req.params.userId = 'user-456';
      
      // Mock order retrieval
      const userOrders = [{ ...mockOrder, id: 'order-456', userId: 'user-456' }];
      OrderModel.getOrdersByUserId.mockResolvedValue(userOrders);
      
      // Call the controller method
      await OrderController.getOrdersByUserId(req, res);
      
      // Verify order retrieval was called with correct parameters
      expect(OrderModel.getOrdersByUserId).toHaveBeenCalledWith('user-456');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userOrders);
    });

    test('should handle database errors gracefully', async () => {
      // Setup request parameters
      req.params.userId = 'user-123';
      
      // Mock order retrieval to throw an error
      OrderModel.getOrdersByUserId.mockRejectedValue(new Error('Database error'));
      
      // Call the controller method
      await OrderController.getOrdersByUserId(req, res);
      
      // Verify order retrieval was called with correct parameters
      expect(OrderModel.getOrdersByUserId).toHaveBeenCalledWith('user-123');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve orders' });
    });
  });
});