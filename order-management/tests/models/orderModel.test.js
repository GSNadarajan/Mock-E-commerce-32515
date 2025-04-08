const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const OrderModel = require('../../src/models/orderModel');

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

describe('OrderModel', () => {
  const mockOrdersData = {
    schemaVersion: '1.0',
    orders: [
      {
        id: 'order-1',
        userId: 'user-1',
        items: [
          { productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }
        ],
        shippingAddress: { street: '123 Main St', city: 'Test City' },
        status: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      {
        id: 'order-2',
        userId: 'user-2',
        items: [
          { productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 }
        ],
        shippingAddress: { street: '456 Oak St', city: 'Test City' },
        status: 'shipped',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful file read
    fs.readFile.mockResolvedValue(JSON.stringify(mockOrdersData));
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
    it('should initialize orders.json if it does not exist', async () => {
      fs.access.mockRejectedValueOnce(new Error('ENOENT'));
      
      await OrderModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should handle invalid JSON structure', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json');
      
      await OrderModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle missing orders array', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ schemaVersion: '1.0' }));
      
      await OrderModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should add schema version if missing', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ orders: [] }));
      
      await OrderModel.initialize();
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('_readData', () => {
    it('should read and parse orders data', async () => {
      const result = await OrderModel._readData();
      
      expect(fs.readFile).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersData);
    });

    it('should handle file not found error', async () => {
      fs.readFile.mockRejectedValueOnce({ code: 'ENOENT' });
      
      const result = await OrderModel._readData();
      
      expect(result).toEqual({ schemaVersion: '1.0', orders: [] });
    });

    it('should handle JSON parse error', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json');
      
      await expect(OrderModel._readData()).rejects.toThrow('Error parsing order data');
    });
  });

  describe('_writeData', () => {
    it('should write data to file', async () => {
      await OrderModel._writeData(mockOrdersData);
      
      expect(fsExtra.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for invalid data structure', async () => {
      await expect(OrderModel._writeData({ invalid: 'data' })).rejects.toThrow('Invalid data structure');
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = await OrderModel.getAllOrders();
      
      expect(orders).toEqual(mockOrdersData.orders);
    });
  });

  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      const order = await OrderModel.getOrderById('order-1');
      
      expect(order).toEqual(mockOrdersData.orders[0]);
    });

    it('should return null for non-existent order', async () => {
      const order = await OrderModel.getOrderById('non-existent');
      
      expect(order).toBeNull();
    });
  });

  describe('getOrdersByUserId', () => {
    it('should return orders by user ID', async () => {
      const orders = await OrderModel.getOrdersByUserId('user-1');
      
      expect(orders).toEqual([mockOrdersData.orders[0]]);
    });

    it('should return empty array for non-existent user', async () => {
      const orders = await OrderModel.getOrdersByUserId('non-existent');
      
      expect(orders).toEqual([]);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return orders by status', async () => {
      const orders = await OrderModel.getOrdersByStatus('shipped');
      
      expect(orders).toEqual([mockOrdersData.orders[1]]);
    });

    it('should return empty array for non-existent status', async () => {
      const orders = await OrderModel.getOrdersByStatus('non-existent');
      
      expect(orders).toEqual([]);
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData = {
        userId: 'user-3',
        items: [{ productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 }],
        shippingAddress: { street: '789 Pine St', city: 'Test City' }
      };
      
      const newOrder = await OrderModel.createOrder(orderData);
      
      expect(newOrder).toHaveProperty('id', 'test-uuid');
      expect(newOrder).toHaveProperty('status', 'pending');
      expect(newOrder).toHaveProperty('createdAt');
      expect(newOrder).toHaveProperty('updatedAt');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for missing user ID', async () => {
      const orderData = {
        items: [{ productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 }],
        shippingAddress: { street: '789 Pine St', city: 'Test City' }
      };
      
      await expect(OrderModel.createOrder(orderData)).rejects.toThrow('User ID is required');
    });

    it('should throw error for missing items', async () => {
      const orderData = {
        userId: 'user-3',
        shippingAddress: { street: '789 Pine St', city: 'Test City' }
      };
      
      await expect(OrderModel.createOrder(orderData)).rejects.toThrow('Order must contain at least one item');
    });

    it('should throw error for empty items array', async () => {
      const orderData = {
        userId: 'user-3',
        items: [],
        shippingAddress: { street: '789 Pine St', city: 'Test City' }
      };
      
      await expect(OrderModel.createOrder(orderData)).rejects.toThrow('Order must contain at least one item');
    });

    it('should throw error for missing shipping address', async () => {
      const orderData = {
        userId: 'user-3',
        items: [{ productId: 'product-3', name: 'Product 3', price: 30, quantity: 3 }]
      };
      
      await expect(OrderModel.createOrder(orderData)).rejects.toThrow('Shipping address is required');
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      const updateData = {
        status: 'delivered'
      };
      
      const updatedOrder = await OrderModel.updateOrder('order-1', updateData);
      
      expect(updatedOrder).toHaveProperty('status', 'delivered');
      expect(updatedOrder).toHaveProperty('updatedAt');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return null for non-existent order', async () => {
      const updateData = {
        status: 'delivered'
      };
      
      const updatedOrder = await OrderModel.updateOrder('non-existent', updateData);
      
      expect(updatedOrder).toBeNull();
    });

    it('should throw error for invalid status', async () => {
      const updateData = {
        status: 'invalid-status'
      };
      
      await expect(OrderModel.updateOrder('order-1', updateData)).rejects.toThrow('Invalid order status');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = await OrderModel.updateOrderStatus('order-1', 'delivered');
      
      expect(updatedOrder).toHaveProperty('status', 'delivered');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should throw error for invalid status', async () => {
      await expect(OrderModel.updateOrderStatus('order-1', 'invalid-status')).rejects.toThrow('Invalid order status');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an existing order', async () => {
      const result = await OrderModel.deleteOrder('order-1');
      
      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.rename).toHaveBeenCalled();
    });

    it('should return false for non-existent order', async () => {
      const result = await OrderModel.deleteOrder('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('searchOrders', () => {
    it('should search orders by user ID', async () => {
      const orders = await OrderModel.searchOrders({ userId: 'user-1' });
      
      expect(orders).toEqual([mockOrdersData.orders[0]]);
    });

    it('should search orders by status', async () => {
      const orders = await OrderModel.searchOrders({ status: 'shipped' });
      
      expect(orders).toEqual([mockOrdersData.orders[1]]);
    });

    it('should search orders by date range', async () => {
      const orders = await OrderModel.searchOrders({
        startDate: '2023-01-02T00:00:00.000Z',
        endDate: '2023-01-03T00:00:00.000Z'
      });
      
      expect(orders).toEqual([mockOrdersData.orders[1]]);
    });

    it('should return empty array for no matches', async () => {
      const orders = await OrderModel.searchOrders({ userId: 'non-existent' });
      
      expect(orders).toEqual([]);
    });
  });

  describe('countOrdersByStatus', () => {
    it('should count orders by status', async () => {
      const counts = await OrderModel.countOrdersByStatus();
      
      expect(counts).toEqual({
        pending: 1,
        processing: 0,
        shipped: 1,
        delivered: 0,
        cancelled: 0
      });
    });
  });
});