const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');
const authConfig = require('../../src/config/auth');
const userService = require('../../src/services/userService');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth', () => ({
  jwtSecret: 'test-secret',
  roles: {
    USER: 'user',
    ADMIN: 'admin'
  }
}));
jest.mock('../../src/services/userService');

describe('Auth Middleware', () => {
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

  describe('authenticateToken', () => {
    it('should call next() if token is valid', () => {
      req.headers['authorization'] = 'Bearer valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        return { id: 'user-1', role: 'user' };
      });
      
      authMiddleware.authenticateToken(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', authConfig.jwtSecret, expect.any(Function));
      expect(req.user).toEqual({ id: 'user-1', role: 'user' });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 if no token is provided', () => {
      authMiddleware.authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication token required' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if token is invalid', () => {
      req.headers['authorization'] = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      authMiddleware.authenticateToken(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', authConfig.jwtSecret, expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if token verification returns null', () => {
      req.headers['authorization'] = 'Bearer null-token';
      jwt.verify.mockReturnValue(null);
      
      authMiddleware.authenticateToken(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('null-token', authConfig.jwtSecret, expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('userExists', () => {
    it('should call next() if user exists in params', async () => {
      req.params.userId = 'user-1';
      req.headers['authorization'] = 'Bearer valid-token';
      userService.validateUser.mockResolvedValue(true);
      
      await authMiddleware.userExists(req, res, next);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'valid-token');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next() if user exists in body', async () => {
      req.body.userId = 'user-1';
      req.headers['authorization'] = 'Bearer valid-token';
      userService.validateUser.mockResolvedValue(true);
      
      await authMiddleware.userExists(req, res, next);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'valid-token');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 if no user ID is provided', async () => {
      await authMiddleware.userExists(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 404 if user does not exist', async () => {
      req.params.userId = 'non-existent';
      req.headers['authorization'] = 'Bearer valid-token';
      userService.validateUser.mockResolvedValue(false);
      
      await authMiddleware.userExists(req, res, next);
      
      expect(userService.validateUser).toHaveBeenCalledWith('non-existent', 'valid-token');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should handle errors and return status 500', async () => {
      req.params.userId = 'user-1';
      req.headers['authorization'] = 'Bearer valid-token';
      userService.validateUser.mockRejectedValue(new Error('Service error'));
      
      await authMiddleware.userExists(req, res, next);
      
      expect(userService.validateUser).toHaveBeenCalledWith('user-1', 'valid-token');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to validate user' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should call next() if user is admin', () => {
      req.user = { id: 'admin-1', role: 'admin' };
      
      authMiddleware.isAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not admin', () => {
      req.user = { id: 'user-1', role: 'user' };
      
      authMiddleware.isAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin role required.' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not defined', () => {
      authMiddleware.isAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin role required.' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isResourceOwner', () => {
    it('should call next() if user is the resource owner (params)', () => {
      req.user = { id: 'user-1', role: 'user' };
      req.params.userId = 'user-1';
      
      authMiddleware.isResourceOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next() if user is the resource owner (body)', () => {
      req.user = { id: 'user-1', role: 'user' };
      req.body.userId = 'user-1';
      
      authMiddleware.isResourceOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next() if user is admin', () => {
      req.user = { id: 'admin-1', role: 'admin' };
      req.params.userId = 'user-1';
      
      authMiddleware.isResourceOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 400 if no user ID is provided', () => {
      req.user = { id: 'user-1', role: 'user' };
      
      authMiddleware.isResourceOwner(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not the resource owner', () => {
      req.user = { id: 'user-1', role: 'user' };
      req.params.userId = 'user-2';
      
      authMiddleware.isResourceOwner(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. You can only access your own resources.' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});