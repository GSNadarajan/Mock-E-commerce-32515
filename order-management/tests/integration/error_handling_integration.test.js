/**
 * Integration tests for error handling scenarios between user-management and order-management
 */

const axios = require('axios');
const userService = require('../../src/services/userService');
const authMiddleware = require('../../src/middleware/auth');

// Mock dependencies
jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth', () => ({
  jwtSecret: 'test-secret',
  roles: {
    USER: 'user',
    ADMIN: 'admin'
  }
}));

describe('Error Handling Integration Tests', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next function
    req = {
      headers: {},
      params: {},
      body: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('User Service Connection Errors', () => {
    test('should handle user service connection timeout', async () => {
      // Setup request
      req.headers['authorization'] = 'Bearer mock-token';
      req.params.userId = 'user-123';
      
      // Mock axios to simulate a timeout
      const timeoutError = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      axios.get.mockRejectedValueOnce(timeoutError);
      
      // Call the userService method
      const result = await userService.validateUser('user-123', 'mock-token');
      
      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users/user-123'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-token'
          }
        })
      );
      
      // Verify the result is false (user validation failed)
      expect(result).toBe(false);
    });

    test('should handle user service being unavailable', async () => {
      // Setup request
      req.headers['authorization'] = 'Bearer mock-token';
      req.params.userId = 'user-123';
      
      // Mock axios to simulate a connection refused error
      const connectionError = new Error('connect ECONNREFUSED');
      connectionError.code = 'ECONNREFUSED';
      axios.get.mockRejectedValueOnce(connectionError);
      
      // Call the userService method
      const result = await userService.validateUser('user-123', 'mock-token');
      
      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users/user-123'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-token'
          }
        })
      );
      
      // Verify the result is false (user validation failed)
      expect(result).toBe(false);
    });

    test('should handle user service returning unexpected response format', async () => {
      // Setup request
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock axios to return an unexpected response format
      axios.post.mockResolvedValueOnce({
        data: {
          // Missing 'valid' field
          user: {
            id: 'user-123',
            username: 'testuser'
          }
        }
      });
      
      // Call the userService method and expect it to throw
      await expect(userService.verifyToken('mock-token')).rejects.toThrow('Invalid token response format');
      
      // Verify axios was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/verify-token'),
        {},
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mock-token'
          }
        })
      );
    });
  });

  describe('Authentication Middleware Error Handling', () => {
    test('should handle missing token', async () => {
      // Call the middleware
      await authMiddleware.authenticateToken(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle invalid token format', async () => {
      // Setup request with invalid token format
      req.headers['authorization'] = 'InvalidFormat';
      
      // Call the middleware
      await authMiddleware.authenticateToken(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user service errors during token verification', async () => {
      // Setup request
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock jwt.verify to return a valid decoded token
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ id: 'user-123', role: 'user' });
      
      // Mock userService.verifyToken to throw an error
      userService.verifyToken.mockRejectedValueOnce(new Error('User service unavailable'));
      
      // Call the middleware
      await authMiddleware.authenticateToken(req, res, next);
      
      // Verify jwt.verify was called
      expect(jwt.verify).toHaveBeenCalled();
      
      // Verify userService.verifyToken was called
      expect(userService.verifyToken).toHaveBeenCalledWith('mock-token');
      
      // Verify next was called (fallback to local verification)
      expect(next).toHaveBeenCalled();
      
      // Verify req.user was set from local verification
      expect(req.user).toEqual({ id: 'user-123', role: 'user' });
    });
  });

  describe('User Validation Middleware Error Handling', () => {
    test('should handle missing user ID', async () => {
      // Call the middleware
      await authMiddleware.userExists(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing token during user validation', async () => {
      // Setup request with user ID but no token
      req.params.userId = 'user-123';
      
      // Call the middleware
      await authMiddleware.userExists(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user not found during validation', async () => {
      // Setup request
      req.params.userId = 'non-existent-user';
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock userService.validateUser to return false
      userService.validateUser.mockResolvedValueOnce(false);
      
      // Call the middleware
      await authMiddleware.userExists(req, res, next);
      
      // Verify userService.validateUser was called
      expect(userService.validateUser).toHaveBeenCalledWith('non-existent-user', 'mock-token');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user service errors during user validation', async () => {
      // Setup request
      req.params.userId = 'user-123';
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock userService.validateUser to throw an error
      userService.validateUser.mockRejectedValueOnce(new Error('User service unavailable'));
      
      // Call the middleware
      await authMiddleware.userExists(req, res, next);
      
      // Verify userService.validateUser was called
      expect(userService.validateUser).toHaveBeenCalledWith('user-123', 'mock-token');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to validate user' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Admin Verification Error Handling', () => {
    test('should handle missing user during admin check', async () => {
      // Call the middleware
      await authMiddleware.isAdmin(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin role required.' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user service errors during admin check', async () => {
      // Setup request with user but no admin role
      req.user = { id: 'user-123', role: 'user' };
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock userService.isAdmin to throw an error
      userService.isAdmin.mockRejectedValueOnce(new Error('User service unavailable'));
      
      // Call the middleware
      await authMiddleware.isAdmin(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin role required.' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Resource Owner Verification Error Handling', () => {
    test('should handle missing user ID during resource owner check', async () => {
      // Setup request with user but no resource ID
      req.user = { id: 'user-123', role: 'user' };
      
      // Call the middleware
      await authMiddleware.isResourceOwner(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing user during resource owner check', async () => {
      // Setup request with resource ID but no user
      req.params.userId = 'user-123';
      
      // Call the middleware
      await authMiddleware.isResourceOwner(req, res, next);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user service errors during admin check in resource owner verification', async () => {
      // Setup request with different user and resource IDs
      req.user = { id: 'user-123', role: 'user' };
      req.params.userId = 'user-456';
      req.headers['authorization'] = 'Bearer mock-token';
      
      // Mock userService.isAdmin to throw an error
      userService.isAdmin.mockRejectedValueOnce(new Error('User service unavailable'));
      
      // Call the middleware
      await authMiddleware.isResourceOwner(req, res, next);
      
      // Verify userService.isAdmin was called
      expect(userService.isAdmin).toHaveBeenCalledWith('user-123', 'mock-token');
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to verify resource authorization' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Retry Mechanism', () => {
    test('should retry API calls on temporary failures', async () => {
      // Setup request
      const mockToken = 'mock-token';
      
      // Mock axios to fail twice and succeed on third attempt
      axios.post
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockRejectedValueOnce({ response: { status: 429 } }) // Too many requests
        .mockResolvedValueOnce({
          data: {
            valid: true,
            user: { id: 'user-123', role: 'user' }
          }
        });
      
      // Call the userService method
      const result = await userService.verifyToken(mockToken);
      
      // Verify axios was called three times
      expect(axios.post).toHaveBeenCalledTimes(3);
      
      // Verify the result contains the expected data
      expect(result).toEqual({
        valid: true,
        user: { id: 'user-123', role: 'user' }
      });
    });

    test('should not retry on client errors (4xx except 429)', async () => {
      // Setup request
      const mockToken = 'mock-token';
      
      // Mock axios to fail with a 400 error
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { error: 'Invalid request' }
        }
      });
      
      // Call the userService method and expect it to throw
      await expect(userService.verifyToken(mockToken)).rejects.toThrow();
      
      // Verify axios was called only once
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});