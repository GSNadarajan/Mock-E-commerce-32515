const OrderController = require('../../src/controllers/orderController');
const OrderModel = require('../../src/models/orderModel');
const userService = require('../../src/services/userService');

// Mock the OrderModel and userService
jest.mock('../../src/models/orderModel');
jest.mock('../../src/services/userService');

describe('OrderController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: 'user-1', role: 'user' },
      headers: { 'authorization': 'Bearer test-token' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
    shippingAddress: { street: '123 Main St', city: 'Test City' },
    status: 'pending',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };
  
  const mockOrders = [
    mockOrder,
    {
      id: 'order-2',
      userId: 'user-2',
      items: [{ productId: 'product-2', name: 'Product 2', price: 20, quantity: 1 }],
      shippingAddress: { street: '456 Oak St', city: 'Test City' },
      status: 'shipped',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  describe('getAllOrders', () => {
    it('should return all orders with status 200', async () => {
      OrderModel.getAllOrders.mockResolvedValue(mockOrders);
      
      await OrderController.getAllOrders(req, res);
      
      expect(OrderModel.getAllOrders).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
    
    it('should handle errors and return status 500', async () => {
      OrderModel.getAllOrders.mockRejectedValue(new Error('Database error'));
      
      await OrderController.getAllOrders(req, res);
      
      expect(OrderModel.getAllOrders).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve orders' });
    });
  });

  describe('getOrderById', () => {
    it('should return order by ID with status 200', async () => {
      req.params.id = 'order-1';
      OrderModel.getOrderById.mockResolvedValue(mockOrder);
      
      await OrderController.getOrderById(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });
    
    it('should return 404 if order not found', async () => {
      req.params.id = 'non-existent';
      OrderModel.getOrderById.mockResolvedValue(null);
      
      await OrderController.getOrderById(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
    
    it('should return 403 if user is not authorized to view the order', async () => {
      req.params.id = 'order-2';
      req.user = { id: 'user-1', role: 'user' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      
      await OrderController.getOrderById(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only view your own orders.' });
    });
    
    it('should allow admin to view any order', async () => {
      req.params.id = 'order-2';
      req.user = { id: 'admin-1', role: 'admin' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      
      await OrderController.getOrderById(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockOrder, id: 'order-2', userId: 'user-2' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.id = 'order-1';
      OrderModel.getOrderById.mockRejectedValue(new Error('Database error'));
      
      await OrderController.getOrderById(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve order' });
    });
  });

  describe('getOrdersByUserId', () => {
    it('should return orders by user ID with status 200', async () => {
      req.params.userId = 'user-1';
      OrderModel.getOrdersByUserId.mockResolvedValue([mockOrder]);
      
      await OrderController.getOrdersByUserId(req, res);
      
      expect(OrderModel.getOrdersByUserId).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockOrder]);
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      OrderModel.getOrdersByUserId.mockRejectedValue(new Error('Database error'));
      
      await OrderController.getOrdersByUserId(req, res);
      
      expect(OrderModel.getOrdersByUserId).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve orders' });
    });
  });

  describe('createOrder', () => {
    it('should create a new order with status 201', async () => {
      req.body = {
        userId: 'user-1',
        items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' }
      };
      userService.validateUser.mockResolvedValue(true);
      OrderModel.createOrder.mockResolvedValue(mockOrder);
      
      await OrderController.createOrder(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'test-token');
      expect(OrderModel.createOrder).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });
    
    it('should return 403 if user is not authorized to create order for another user', async () => {
      req.body = {
        userId: 'user-2',
        items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' }
      };
      req.user = { id: 'user-1', role: 'user' };
      
      await OrderController.createOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only create orders for yourself.' });
    });
    
    it('should allow admin to create order for any user', async () => {
      req.body = {
        userId: 'user-2',
        items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' }
      };
      req.user = { id: 'admin-1', role: 'admin' };
      userService.validateUser.mockResolvedValue(true);
      OrderModel.createOrder.mockResolvedValue({ ...mockOrder, userId: 'user-2' });
      
      await OrderController.createOrder(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-2', 'test-token');
      expect(OrderModel.createOrder).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ ...mockOrder, userId: 'user-2' });
    });
    
    it('should return 404 if user does not exist', async () => {
      req.body = {
        userId: 'user-1',
        items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' }
      };
      userService.validateUser.mockResolvedValue(false);
      
      await OrderController.createOrder(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'test-token');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.body = {
        userId: 'user-1',
        items: [{ productId: 'product-1', name: 'Product 1', price: 10, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Test City' }
      };
      userService.validateUser.mockResolvedValue(true);
      OrderModel.createOrder.mockRejectedValue(new Error('Database error'));
      
      await OrderController.createOrder(req, res);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'test-token');
      expect(OrderModel.createOrder).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create order' });
    });
  });

  describe('updateOrder', () => {
    it('should update an order with status 200', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'shipped' };
      OrderModel.getOrderById.mockResolvedValue(mockOrder);
      OrderModel.updateOrder.mockResolvedValue({ ...mockOrder, status: 'shipped' });
      
      await OrderController.updateOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(OrderModel.updateOrder).toHaveBeenCalledWith('order-1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockOrder, status: 'shipped' });
    });
    
    it('should return 404 if order not found', async () => {
      req.params.id = 'non-existent';
      req.body = { status: 'shipped' };
      OrderModel.getOrderById.mockResolvedValue(null);
      
      await OrderController.updateOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
    
    it('should return 403 if user is not authorized to update the order', async () => {
      req.params.id = 'order-2';
      req.body = { status: 'shipped' };
      req.user = { id: 'user-1', role: 'user' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      
      await OrderController.updateOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only update your own orders.' });
    });
    
    it('should allow admin to update any order', async () => {
      req.params.id = 'order-2';
      req.body = { status: 'shipped' };
      req.user = { id: 'admin-1', role: 'admin' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      OrderModel.updateOrder.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2', status: 'shipped' });
      
      await OrderController.updateOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(OrderModel.updateOrder).toHaveBeenCalledWith('order-2', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockOrder, id: 'order-2', userId: 'user-2', status: 'shipped' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'shipped' };
      OrderModel.getOrderById.mockResolvedValue(mockOrder);
      OrderModel.updateOrder.mockRejectedValue(new Error('Database error'));
      
      await OrderController.updateOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(OrderModel.updateOrder).toHaveBeenCalledWith('order-1', req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update order' });
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order with status 200', async () => {
      req.params.id = 'order-1';
      OrderModel.getOrderById.mockResolvedValue(mockOrder);
      OrderModel.deleteOrder.mockResolvedValue(true);
      
      await OrderController.deleteOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(OrderModel.deleteOrder).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
    });
    
    it('should return 404 if order not found', async () => {
      req.params.id = 'non-existent';
      OrderModel.getOrderById.mockResolvedValue(null);
      
      await OrderController.deleteOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('non-existent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
    
    it('should return 403 if user is not authorized to delete the order', async () => {
      req.params.id = 'order-2';
      req.user = { id: 'user-1', role: 'user' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      
      await OrderController.deleteOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only delete your own orders.' });
    });
    
    it('should allow admin to delete any order', async () => {
      req.params.id = 'order-2';
      req.user = { id: 'admin-1', role: 'admin' };
      OrderModel.getOrderById.mockResolvedValue({ ...mockOrder, id: 'order-2', userId: 'user-2' });
      OrderModel.deleteOrder.mockResolvedValue(true);
      
      await OrderController.deleteOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-2');
      expect(OrderModel.deleteOrder).toHaveBeenCalledWith('order-2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.id = 'order-1';
      OrderModel.getOrderById.mockResolvedValue(mockOrder);
      OrderModel.deleteOrder.mockRejectedValue(new Error('Database error'));
      
      await OrderController.deleteOrder(req, res);
      
      expect(OrderModel.getOrderById).toHaveBeenCalledWith('order-1');
      expect(OrderModel.deleteOrder).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete order' });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with status 200', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'shipped' };
      OrderModel.updateOrderStatus.mockResolvedValue({ ...mockOrder, status: 'shipped' });
      
      await OrderController.updateOrderStatus(req, res);
      
      expect(OrderModel.updateOrderStatus).toHaveBeenCalledWith('order-1', 'shipped');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...mockOrder, status: 'shipped' });
    });
    
    it('should return 400 if status is missing', async () => {
      req.params.id = 'order-1';
      req.body = {};
      
      await OrderController.updateOrderStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Status is required' });
    });
    
    it('should return 404 if order not found', async () => {
      req.params.id = 'non-existent';
      req.body = { status: 'shipped' };
      OrderModel.updateOrderStatus.mockResolvedValue(null);
      
      await OrderController.updateOrderStatus(req, res);
      
      expect(OrderModel.updateOrderStatus).toHaveBeenCalledWith('non-existent', 'shipped');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
    
    it('should return 400 for invalid status', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'invalid-status' };
      OrderModel.updateOrderStatus.mockRejectedValue(new Error('Invalid order status'));
      
      await OrderController.updateOrderStatus(req, res);
      
      expect(OrderModel.updateOrderStatus).toHaveBeenCalledWith('order-1', 'invalid-status');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid order status' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.id = 'order-1';
      req.body = { status: 'shipped' };
      OrderModel.updateOrderStatus.mockRejectedValue(new Error('Database error'));
      
      await OrderController.updateOrderStatus(req, res);
      
      expect(OrderModel.updateOrderStatus).toHaveBeenCalledWith('order-1', 'shipped');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update order status' });
    });
  });

  describe('searchOrders', () => {
    it('should search orders with status 200', async () => {
      req.query = { userId: 'user-1', status: 'pending' };
      OrderModel.searchOrders.mockResolvedValue([mockOrder]);
      
      await OrderController.searchOrders(req, res);
      
      expect(OrderModel.searchOrders).toHaveBeenCalledWith({ userId: 'user-1', status: 'pending' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockOrder]);
    });
    
    it('should handle date range search', async () => {
      req.query = { startDate: '2023-01-01', endDate: '2023-01-31' };
      OrderModel.searchOrders.mockResolvedValue([mockOrder]);
      
      await OrderController.searchOrders(req, res);
      
      expect(OrderModel.searchOrders).toHaveBeenCalledWith({ startDate: '2023-01-01', endDate: '2023-01-31' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockOrder]);
    });
    
    it('should handle errors and return status 500', async () => {
      req.query = { userId: 'user-1' };
      OrderModel.searchOrders.mockRejectedValue(new Error('Database error'));
      
      await OrderController.searchOrders(req, res);
      
      expect(OrderModel.searchOrders).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to search orders' });
    });
  });

  describe('getOrderCounts', () => {
    it('should get order counts with status 200', async () => {
      const mockCounts = {
        pending: 1,
        processing: 0,
        shipped: 1,
        delivered: 0,
        cancelled: 0
      };
      OrderModel.countOrdersByStatus.mockResolvedValue(mockCounts);
      
      await OrderController.getOrderCounts(req, res);
      
      expect(OrderModel.countOrdersByStatus).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCounts);
    });
    
    it('should handle errors and return status 500', async () => {
      OrderModel.countOrdersByStatus.mockRejectedValue(new Error('Database error'));
      
      await OrderController.getOrderCounts(req, res);
      
      expect(OrderModel.countOrdersByStatus).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get order counts' });
    });
  });

  describe('getOrdersByStatus', () => {
    it('should get orders by status with status 200', async () => {
      req.params.status = 'pending';
      OrderModel.getOrdersByStatus.mockResolvedValue([mockOrder]);
      
      await OrderController.getOrdersByStatus(req, res);
      
      expect(OrderModel.getOrdersByStatus).toHaveBeenCalledWith('pending');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockOrder]);
    });
    
    it('should return 400 for invalid status', async () => {
      req.params.status = 'invalid-status';
      
      await OrderController.getOrdersByStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid order status' });
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.status = 'pending';
      OrderModel.getOrdersByStatus.mockRejectedValue(new Error('Database error'));
      
      await OrderController.getOrdersByStatus(req, res);
      
      expect(OrderModel.getOrdersByStatus).toHaveBeenCalledWith('pending');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve orders' });
    });
  });
});