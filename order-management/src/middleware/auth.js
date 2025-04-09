const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const userService = require('../services/userService');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  try {
    // First try to verify the token locally
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    if (!decoded || !decoded.id) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // Then verify with the user-management service
    try {
      const userData = await userService.verifyToken(token);
      req.user = userData.user || decoded;
      next();
    } catch (serviceError) {
      console.error('User service token verification error:', serviceError.message);
      // If user service is unavailable, fall back to local verification
      req.user = decoded;
      next();
    }
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const userExists = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId || (req.user && req.user.id);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const userExists = await userService.validateUser(userId, token);
    
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('User validation error:', error.message);
    return res.status(500).json({ error: 'Failed to validate user' });
  }
};

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // First check the role from the token payload
    if (req.user.role === authConfig.roles.ADMIN) {
      return next();
    }
    
    // If not admin in token, verify with user service
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const isUserAdmin = await userService.isAdmin(req.user.id, token);
    
    if (isUserAdmin) {
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  } catch (error) {
    console.error('Admin verification error:', error.message);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

/**
 * Middleware to check if user is authorized for the resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isResourceOwner = async (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!resourceUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Admin can access any resource
    if (req.user.role === authConfig.roles.ADMIN) {
      return next();
    }
    
    // If role not in token, check with user service
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const isUserAdmin = await userService.isAdmin(req.user.id, token);
    
    if (isUserAdmin) {
      return next();
    }
    
    // Users can only access their own resources
    if (req.user.id === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
  } catch (error) {
    console.error('Resource authorization error:', error.message);
    return res.status(500).json({ error: 'Failed to verify resource authorization' });
  }
};

module.exports = {
  authenticateToken,
  userExists,
  isAdmin,
  isResourceOwner
};
