const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const userService = require('../services/userService');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  try {
    // Verify the token with the JWT secret
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
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
    const userId = req.params.userId || req.body.userId;
    const token = req.headers['authorization'].split(' ')[1];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === authConfig.roles.ADMIN) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin role required.' });
};

/**
 * Middleware to check if user is authorized for the resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isResourceOwner = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!resourceUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  // Admin can access any resource
  if (req.user.role === authConfig.roles.ADMIN) {
    return next();
  }
  
  // Users can only access their own resources
  if (req.user.id === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
};

module.exports = {
  authenticateToken,
  userExists,
  isAdmin,
  isResourceOwner
};
