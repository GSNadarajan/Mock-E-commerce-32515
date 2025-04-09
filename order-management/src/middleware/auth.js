const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const userService = require('../services/userService');
const Logger = require('../utils/logger');

/**
 * Error response helper function
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} errorCode - Error code for client
 * @returns {Object} Response object
 */
const errorResponse = (res, statusCode, message, errorCode) => {
  return res.status(statusCode).json({
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString()
  });
};

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
    Logger.warn('Authentication attempt without token', { 
      path: req.path, 
      method: req.method,
      ip: req.ip
    });
    return errorResponse(res, 401, 'Authentication token required', 'AUTH_TOKEN_MISSING');
  }
  
  try {
    // First try to verify the token locally
    let decoded;
    try {
      decoded = jwt.verify(token, authConfig.jwtSecret);
    } catch (jwtError) {
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        Logger.warn('Expired token used', { 
          path: req.path, 
          method: req.method,
          expiredAt: jwtError.expiredAt
        });
        return errorResponse(res, 401, 'Token has expired', 'TOKEN_EXPIRED');
      } else if (jwtError.name === 'JsonWebTokenError') {
        Logger.warn('Malformed token used', { 
          path: req.path, 
          method: req.method,
          errorMessage: jwtError.message
        });
        return errorResponse(res, 403, 'Invalid token format', 'TOKEN_MALFORMED');
      } else if (jwtError.name === 'NotBeforeError') {
        Logger.warn('Token used before valid date', { 
          path: req.path, 
          method: req.method,
          date: jwtError.date
        });
        return errorResponse(res, 403, 'Token not yet valid', 'TOKEN_NOT_ACTIVE');
      } else {
        Logger.error('Unknown JWT verification error', { 
          path: req.path, 
          method: req.method,
          errorName: jwtError.name,
          errorMessage: jwtError.message
        });
        return errorResponse(res, 403, 'Token verification failed', 'TOKEN_INVALID');
      }
    }
    
    if (!decoded || !decoded.id) {
      Logger.warn('Token missing required claims', { 
        path: req.path, 
        method: req.method
      });
      return errorResponse(res, 403, 'Invalid token: missing required claims', 'TOKEN_INVALID_CLAIMS');
    }
    
    // Then verify with the user-management service
    try {
      const userData = await userService.verifyToken(token);
      req.user = userData.user || decoded;
      
      // Add token verification source for debugging
      req.tokenVerifiedBy = 'user-service';
      
      Logger.debug('Token verified by user service', {
        userId: req.user.id,
        path: req.path
      });
      
      next();
    } catch (serviceError) {
      // Categorize service errors for better handling
      if (serviceError.name === 'AuthenticationError') {
        // If user service explicitly rejects the token, don't fall back
        Logger.warn('Token rejected by user service', { 
          path: req.path, 
          method: req.method,
          errorMessage: serviceError.message,
          statusCode: serviceError.statusCode
        });
        return errorResponse(res, serviceError.statusCode || 401, 
          'Authentication failed: ' + serviceError.message, 'AUTH_SERVICE_REJECTED');
      }
      
      // For other errors (network, timeout, etc.), fall back to local verification
      Logger.warn('User service unavailable, falling back to local verification', { 
        path: req.path, 
        method: req.method,
        errorType: serviceError.name,
        errorMessage: serviceError.message
      });
      
      // Add token verification source for debugging
      req.tokenVerifiedBy = 'local-fallback';
      req.user = decoded;
      next();
    }
  } catch (error) {
    // This should rarely happen as JWT errors are caught above
    Logger.error('Unexpected token verification error', { 
      path: req.path, 
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    return errorResponse(res, 500, 'Internal authentication error', 'AUTH_INTERNAL_ERROR');
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
      Logger.warn('User validation attempted without user ID', { 
        path: req.path, 
        method: req.method 
      });
      return errorResponse(res, 400, 'User ID is required', 'USER_ID_MISSING');
    }
    
    if (!token) {
      Logger.warn('User validation attempted without token', { 
        path: req.path, 
        method: req.method,
        userId
      });
      return errorResponse(res, 401, 'Authentication token required', 'AUTH_TOKEN_MISSING');
    }
    
    try {
      const userExists = await userService.validateUser(userId, token);
      
      if (!userExists) {
        Logger.warn('User not found during validation', { 
          userId,
          path: req.path, 
          method: req.method 
        });
        return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
      }
      
      // Store the validated user ID for later use
      req.validatedUserId = userId;
      
      Logger.debug('User validated successfully', { 
        userId,
        path: req.path
      });
      
      next();
    } catch (serviceError) {
      // Handle specific service errors
      if (serviceError.name === 'AuthenticationError') {
        Logger.warn('Authentication error during user validation', { 
          userId,
          path: req.path,
          errorMessage: serviceError.message,
          statusCode: serviceError.statusCode
        });
        return errorResponse(res, serviceError.statusCode || 401, 
          'Authentication failed: ' + serviceError.message, 'USER_AUTH_FAILED');
      }
      
      if (serviceError.name === 'ValidationError') {
        Logger.warn('Validation error during user check', { 
          userId,
          path: req.path,
          errorMessage: serviceError.message
        });
        return errorResponse(res, serviceError.statusCode || 400, 
          'Validation failed: ' + serviceError.message, 'USER_VALIDATION_FAILED');
      }
      
      // For service unavailability, check if we have the user in the request already
      if (serviceError.name === 'ServiceUnavailableError' || 
          serviceError.name === 'NetworkError' || 
          serviceError.name === 'TimeoutError') {
        
        Logger.warn('User service unavailable during validation, attempting fallback', { 
          userId,
          path: req.path,
          errorType: serviceError.name
        });
        
        // If we already have the user from token verification, we can proceed
        if (req.user && req.user.id === userId) {
          Logger.info('Using locally verified user as fallback', { 
            userId,
            path: req.path,
            tokenVerifiedBy: req.tokenVerifiedBy || 'unknown'
          });
          
          // Mark that we're using fallback validation
          req.userValidatedBy = 'local-fallback';
          req.validatedUserId = userId;
          
          return next();
        }
        
        // Otherwise we can't validate the user
        Logger.warn('Cannot validate user with service unavailable', { 
          userId,
          path: req.path
        });
        return errorResponse(res, 503, 
          'User validation service unavailable', 'USER_SERVICE_UNAVAILABLE');
      }
      
      // For other errors
      throw serviceError;
    }
  } catch (error) {
    Logger.error('User validation error', { 
      path: req.path, 
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    return errorResponse(res, 500, 'Failed to validate user', 'USER_VALIDATION_ERROR');
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
    Logger.warn('Admin check attempted without authenticated user', { 
      path: req.path, 
      method: req.method 
    });
    return errorResponse(res, 401, 'Authentication required', 'AUTH_REQUIRED');
  }
  
  try {
    // First check the role from the token payload
    if (req.user.role === authConfig.roles.ADMIN) {
      Logger.debug('Admin access granted via token payload', { 
        userId: req.user.id,
        path: req.path
      });
      
      // Mark the admin verification source
      req.adminVerifiedBy = 'token-payload';
      
      return next();
    }
    
    // If not admin in token, verify with user service
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      Logger.warn('Admin check attempted without token', { 
        userId: req.user.id,
        path: req.path, 
        method: req.method 
      });
      return errorResponse(res, 401, 'Authentication token required', 'AUTH_TOKEN_MISSING');
    }
    
    try {
      const isUserAdmin = await userService.isAdmin(req.user.id, token);
      
      if (isUserAdmin) {
        Logger.debug('Admin access granted via user service', { 
          userId: req.user.id,
          path: req.path
        });
        
        // Mark the admin verification source
        req.adminVerifiedBy = 'user-service';
        
        return next();
      }
      
      Logger.warn('Non-admin user attempted admin action', { 
        userId: req.user.id,
        path: req.path, 
        method: req.method 
      });
      return errorResponse(res, 403, 'Access denied. Admin role required.', 'ADMIN_REQUIRED');
    } catch (serviceError) {
      // Handle service unavailability
      if (serviceError.name === 'ServiceUnavailableError' || 
          serviceError.name === 'NetworkError' || 
          serviceError.name === 'TimeoutError') {
        
        Logger.warn('User service unavailable during admin check, using strict fallback', { 
          userId: req.user.id,
          path: req.path,
          errorType: serviceError.name
        });
        
        // For admin checks, we use a strict fallback - only grant admin if token has admin role
        // This is more secure than allowing access when we can't verify
        if (req.user.role === authConfig.roles.ADMIN) {
          Logger.info('Using locally verified admin role as fallback', { 
            userId: req.user.id,
            path: req.path,
            tokenVerifiedBy: req.tokenVerifiedBy || 'unknown'
          });
          
          // Mark that we're using fallback validation
          req.adminVerifiedBy = 'local-fallback';
          
          return next();
        }
        
        // If not admin in token, deny access when service is unavailable
        Logger.warn('Cannot verify admin status with service unavailable', { 
          userId: req.user.id,
          path: req.path
        });
        return errorResponse(res, 503, 
          'Admin verification service unavailable', 'ADMIN_SERVICE_UNAVAILABLE');
      }
      
      // For other errors
      throw serviceError;
    }
  } catch (error) {
    Logger.error('Admin verification error', { 
      userId: req.user?.id,
      path: req.path, 
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    return errorResponse(res, 500, 'Failed to verify admin status', 'ADMIN_VERIFICATION_ERROR');
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
    Logger.warn('Resource authorization attempted without resource user ID', { 
      path: req.path, 
      method: req.method 
    });
    return errorResponse(res, 400, 'User ID is required', 'RESOURCE_USER_ID_MISSING');
  }
  
  if (!req.user || !req.user.id) {
    Logger.warn('Resource authorization attempted without authenticated user', { 
      path: req.path, 
      method: req.method,
      resourceUserId
    });
    return errorResponse(res, 401, 'Authentication required', 'AUTH_REQUIRED');
  }
  
  try {
    // Admin can access any resource - first check from token
    if (req.user.role === authConfig.roles.ADMIN) {
      Logger.debug('Resource access granted via admin role in token', { 
        userId: req.user.id,
        resourceUserId,
        path: req.path
      });
      
      // Mark the authorization source
      req.authorizationSource = 'admin-token';
      
      return next();
    }
    
    // If role not in token, check with user service
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      Logger.warn('Resource authorization attempted without token', { 
        userId: req.user.id,
        resourceUserId,
        path: req.path
      });
      return errorResponse(res, 401, 'Authentication token required', 'AUTH_TOKEN_MISSING');
    }
    
    try {
      const isUserAdmin = await userService.isAdmin(req.user.id, token);
      
      if (isUserAdmin) {
        Logger.debug('Resource access granted via admin role from user service', { 
          userId: req.user.id,
          resourceUserId,
          path: req.path
        });
        
        // Mark the authorization source
        req.authorizationSource = 'admin-service';
        
        return next();
      }
      
      // Users can only access their own resources
      if (req.user.id === resourceUserId) {
        Logger.debug('Resource access granted to resource owner', { 
          userId: req.user.id,
          resourceUserId,
          path: req.path
        });
        
        // Mark the authorization source
        req.authorizationSource = 'resource-owner';
        
        return next();
      }
      
      Logger.warn('Unauthorized resource access attempt', { 
        userId: req.user.id,
        resourceUserId,
        path: req.path,
        method: req.method
      });
      return errorResponse(res, 403, 
        'Access denied. You can only access your own resources.', 'RESOURCE_ACCESS_DENIED');
    } catch (serviceError) {
      // Handle service unavailability
      if (serviceError.name === 'ServiceUnavailableError' || 
          serviceError.name === 'NetworkError' || 
          serviceError.name === 'TimeoutError') {
        
        Logger.warn('User service unavailable during resource authorization, using fallback', { 
          userId: req.user.id,
          resourceUserId,
          path: req.path,
          errorType: serviceError.name
        });
        
        // For resource authorization, we can use a fallback:
        // 1. If token says user is admin, grant access
        if (req.user.role === authConfig.roles.ADMIN) {
          Logger.info('Using locally verified admin role as fallback for resource access', { 
            userId: req.user.id,
            resourceUserId,
            path: req.path
          });
          
          // Mark that we're using fallback authorization
          req.authorizationSource = 'admin-fallback';
          
          return next();
        }
        
        // 2. If user is accessing their own resource based on token ID, grant access
        if (req.user.id === resourceUserId) {
          Logger.info('Using token user ID as fallback for resource owner check', { 
            userId: req.user.id,
            resourceUserId,
            path: req.path
          });
          
          // Mark that we're using fallback authorization
          req.authorizationSource = 'owner-fallback';
          
          return next();
        }
        
        // Otherwise deny access when service is unavailable
        Logger.warn('Cannot verify resource authorization with service unavailable', { 
          userId: req.user.id,
          resourceUserId,
          path: req.path
        });
        return errorResponse(res, 503, 
          'Resource authorization service unavailable', 'AUTH_SERVICE_UNAVAILABLE');
      }
      
      // For other errors
      throw serviceError;
    }
  } catch (error) {
    Logger.error('Resource authorization error', { 
      userId: req.user?.id,
      resourceUserId,
      path: req.path,
      method: req.method,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    return errorResponse(res, 500, 
      'Failed to verify resource authorization', 'RESOURCE_AUTH_ERROR');
  }
};

module.exports = {
  authenticateToken,
  userExists,
  isAdmin,
  isResourceOwner
};
