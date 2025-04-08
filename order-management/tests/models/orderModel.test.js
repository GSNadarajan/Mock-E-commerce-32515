const fs = require('fs-extra');
const path = require('path');
const OrderModel = require('../../src/models/orderModel');

// Mock fs-extra
jest.mock('fs-extra');

describe('OrderModel', () => {
  const mockOrders = [
    {
      id: '1',
      userId: 'user1',
      items: [
        { productId: 'prod1', name: 'Product 1', price: 10, quantity: 2 }
      ],
      shippingAddress: { street: '123 Main St', city: 'Anytown' },
      status: 'pending',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fs.readJSON to return mock orders
    fs.readJSON.mockResolvedValue(mockOrders);
    
    // Mock fs.writeJSON to do nothing
    fs.writeJSON.mockResolvedValue();
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = await OrderModel.getAllOrders();
      expect(orders).toEqual(mockOrders);
      expect(fs.readJSON).toHaveBeenCalled();
    });

    it('should create empty file if not exists', async () => {
      // Mock file not found error
      fs.readJSON.mockRejectedValueOnce({ code: 'ENOENT' });
      
      const orders = await OrderModel.getAllOrders();
      expect(orders).toEqual([]);
      expect(fs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const order = await OrderModel.getOrderById('1');
      expect(order).toEqual(mockOrders[0]);
    });

    it('should return null if order not found', async () => {
      const order = await OrderModel.getOrderById('999');
      expect(order).toBeNull();
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 'user2',
        items: [{ productId: 'prod2', name: 'Product 2', price: 20, quantity: 1 }],
        shippingAddress: { street: '456 Elm St', city: 'Othertown' }
      };
      
      const newOrder = await OrderModel.createOrder(orderData);
      
      expect(newOrder).toHaveProperty('id');
      expect(newOrder.userId).toBe('user2');
      expect(newOrder.status).toBe('pending');
      expect(fs.writeJSON).toHaveBeenCalled();
    });
  });

  // Add more tests for other methods
});
