/**
 * User Service
 * Handles integration with user management component
 */

const UserModel = require('../models/userModel');
const Logger = require('../utils/logger') || console;

/**
 * Custom error classes for better error handling
 */
class ServiceError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ServiceError {
  constructor(message, statusCode = 400, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

class NotFoundError extends ServiceError {
  constructor(message, statusCode = 404, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

class AuthenticationError extends ServiceError {
  constructor(message, statusCode = 401, originalError = null) {
    super(message, statusCode, originalError);
    this.isRetryable = false;
  }
}

/**
 * User Service - Handles user-related operations
 */
class UserService {
  /**
   * Get user by ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} User data (sanitized)
   * @throws {NotFoundError} If user not found
   * @throws {ServiceError} If the operation fails
   */
  async getUserById(userId) {
    try {
      const user = await UserModel.getUserById(userId);
      
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }
      
      // Return sanitized user data (remove sensitive information)
      const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
      return userInfo;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting user ${userId}`, {
        userId,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get user: ${error.message}`, 500, error);
    }
  }

  /**
   * Validate user exists
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} True if user exists
   */
  async validateUser(userId) {
    try {
      await this.getUserById(userId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return false;
      }
      
      Logger.warn(`User validation failed for user ${userId}`, {
        userId,
        errorType: error.name,
        errorMessage: error.message
      });
      
      return false;
    }
  }

  /**
   * Check if user has admin role
   * @param {string} userId - The ID of the user
   * @returns {Promise<boolean>} True if user is admin
   */
  async isAdmin(userId) {
    try {
      const user = await UserModel.getUserById(userId);
      return user && user.role === 'admin';
    } catch (error) {
      Logger.warn(`Admin check failed for user ${userId}`, {
        userId,
        errorMessage: error.message
      });
      
      return false;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data (sanitized)
   * @throws {NotFoundError} If user not found
   * @throws {ServiceError} If the operation fails
   */
  async getUserByEmail(email) {
    try {
      const user = await UserModel.getUserByEmail(email);
      
      if (!user) {
        throw new NotFoundError(`User with email ${email} not found`);
      }
      
      // Return sanitized user data (remove sensitive information)
      const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
      return userInfo;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      Logger.error(`Error getting user by email ${email}`, {
        email,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to get user by email: ${error.message}`, 500, error);
    }
  }

  /**
   * Search users by username or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching users (sanitized)
   * @throws {ServiceError} If the operation fails
   */
  async searchUsers(query) {
    try {
      const users = await UserModel.searchUsers(query);
      
      // Return sanitized user data (remove sensitive information)
      return users.map(user => {
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        return userInfo;
      });
    } catch (error) {
      Logger.error(`Error searching users with query ${query}`, {
        query,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to search users: ${error.message}`, 500, error);
    }
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of users with the specified role (sanitized)
   * @throws {ServiceError} If the operation fails
   */
  async findUsersByRole(role) {
    try {
      const users = await UserModel.findUsersByRole(role);
      
      // Return sanitized user data (remove sensitive information)
      return users.map(user => {
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        return userInfo;
      });
    } catch (error) {
      Logger.error(`Error finding users with role ${role}`, {
        role,
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to find users by role: ${error.message}`, 500, error);
    }
  }

  /**
   * Count total users
   * @returns {Promise<number>} Total number of users
   * @throws {ServiceError} If the operation fails
   */
  async countUsers() {
    try {
      return await UserModel.countUsers();
    } catch (error) {
      Logger.error('Error counting users', {
        errorMessage: error.message
      });
      
      throw new ServiceError(`Failed to count users: ${error.message}`, 500, error);
    }
  }
}

module.exports = new UserService();
