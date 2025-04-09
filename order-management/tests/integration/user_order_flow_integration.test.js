/**
 * End-to-end integration test for the complete user-order flow
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const testHelpers = require('../../../utils/test-helpers');

// Mock axios for testing
jest.mock('axios');

// Configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001/api';

describe('User-Order Flow Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test data
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  const testProduct = {
    productId: uuidv4(),
    name: 'Test Product',
    price: 19.99,
    quantity: 2
  };

  const shippingAddress = {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'Test Country'
  };

  describe('Complete User-Order Flow', () => {
    test('should complete the full user registration, login, cart, and order flow', async () => {
      // Step 1: Register a new user
      const mockUserId = uuidv4();
      const mockUser = {
        id: mockUserId,
        username: testUser.username,
        email: testUser.email,
        role: 'user',
        isVerified: true
      };
      
      axios.post.mockResolvedValueOnce({
        data: {
          message: 'User registered successfully',
          user: mockUser
        }
      });
      
      const registerResponse = await testHelpers.createUser(testUser);
      
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/register`,
        testUser
      );
      
      expect(registerResponse).toEqual({
        message: 'User registered successfully',
        user: mockUser
      });
      
      // Step 2: Login with the user credentials
      const mockToken = 'mock-jwt-token';
      
      axios.post.mockResolvedValueOnce({
        data: {
          token: mockToken,
          user: mockUser
        }
      });
      
      const loginResponse = await testHelpers.loginUser({
        email: testUser.email,
        password: testUser.password
      });
      
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/login`,
        {
          email: testUser.email,
          password: testUser.password
        }
      );
      
      expect(loginResponse).toEqual({
        token: mockToken,
        user: mockUser
      });
      
      // Step 3: Add items to the cart
      const mockCart = {
        id: uuidv4(),
        userId: mockUserId,
        items: [testProduct],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      axios.post.mockResolvedValueOnce({
        data: mockCart
      });
      
      const cartResponse = await testHelpers.addItemToCart(mockUserId, testProduct, mockToken);
      
      expect(axios.post).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/carts/${mockUserId}/items`,
        testProduct,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(cartResponse).toEqual(mockCart);
      
      // Step 4: Get the cart
      axios.get.mockResolvedValueOnce({
        data: mockCart
      });
      
      const cart = await testHelpers.getCart(mockUserId, mockToken);
      
      expect(axios.get).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/carts/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(cart).toEqual(mockCart);
      
      // Step 5: Create an order
      const mockOrderId = uuidv4();
      const mockOrder = {
        id: mockOrderId,
        userId: mockUserId,
        items: mockCart.items,
        shippingAddress: shippingAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const orderData = {
        userId: mockUserId,
        items: mockCart.items,
        shippingAddress: shippingAddress
      };
      
      axios.post.mockResolvedValueOnce({
        data: mockOrder
      });
      
      const order = await testHelpers.createOrder(orderData, mockToken);
      
      expect(axios.post).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(order).toEqual(mockOrder);
      
      // Step 6: Get the order
      axios.get.mockResolvedValueOnce({
        data: mockOrder
      });
      
      const retrievedOrder = await testHelpers.getOrder(mockOrderId, mockToken);
      
      expect(axios.get).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders/${mockOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(retrievedOrder).toEqual(mockOrder);
      
      // Step 7: Clean up (delete order)
      axios.delete.mockResolvedValueOnce({
        data: { message: 'Order deleted successfully' }
      });
      
      const deleteOrderResponse = await testHelpers.deleteOrder(mockOrderId, mockToken);
      
      expect(axios.delete).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders/${mockOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(deleteOrderResponse).toEqual({ message: 'Order deleted successfully' });
      
      // Step 8: Clean up (delete user)
      axios.delete.mockResolvedValueOnce({
        data: { message: 'User deleted successfully' }
      });
      
      const deleteUserResponse = await testHelpers.deleteUser(mockUserId, mockToken);
      
      expect(axios.delete).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/users/${mockUserId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      
      expect(deleteUserResponse).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('Error Scenarios in User-Order Flow', () => {
    test('should handle user registration failure', async () => {
      // Mock registration failure
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Email already in use' }
        }
      });
      
      await expect(testHelpers.createUser(testUser)).rejects.toThrow();
      
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/register`,
        testUser
      );
    });

    test('should handle login failure', async () => {
      // Mock login failure
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Invalid credentials' }
        }
      });
      
      await expect(testHelpers.loginUser({
        email: testUser.email,
        password: 'WrongPassword'
      })).rejects.toThrow();
      
      expect(axios.post).toHaveBeenCalledWith(
        `${USER_SERVICE_URL}/auth/login`,
        {
          email: testUser.email,
          password: 'WrongPassword'
        }
      );
    });

    test('should handle cart operation failure', async () => {
      const mockUserId = uuidv4();
      const mockToken = 'mock-jwt-token';
      
      // Mock cart operation failure
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Invalid product data' }
        }
      });
      
      await expect(testHelpers.addItemToCart(mockUserId, {
        // Missing required fields
        productId: uuidv4()
      }, mockToken)).rejects.toThrow();
      
      expect(axios.post).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/carts/${mockUserId}/items`,
        { productId: expect.any(String) },
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
    });

    test('should handle order creation failure', async () => {
      const mockUserId = uuidv4();
      const mockToken = 'mock-jwt-token';
      
      // Mock order creation failure
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'Missing required fields' }
        }
      });
      
      await expect(testHelpers.createOrder({
        // Missing items
        userId: mockUserId,
        shippingAddress: shippingAddress
      }, mockToken)).rejects.toThrow();
      
      expect(axios.post).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders`,
        {
          userId: mockUserId,
          shippingAddress: shippingAddress
        },
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
    });

    test('should handle unauthorized access', async () => {
      const mockUserId = uuidv4();
      const mockOrderId = uuidv4();
      const invalidToken = 'invalid-token';
      
      // Mock unauthorized access
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Authentication token required' }
        }
      });
      
      await expect(testHelpers.getOrder(mockOrderId, invalidToken)).rejects.toThrow();
      
      expect(axios.get).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders/${mockOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${invalidToken}`
          }
        }
      );
    });

    test('should handle resource not found', async () => {
      const nonExistentOrderId = uuidv4();
      const mockToken = 'mock-jwt-token';
      
      // Mock resource not found
      axios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'Order not found' }
        }
      });
      
      await expect(testHelpers.getOrder(nonExistentOrderId, mockToken)).rejects.toThrow();
      
      expect(axios.get).toHaveBeenCalledWith(
        `${ORDER_SERVICE_URL}/orders/${nonExistentOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
    });
  });
});