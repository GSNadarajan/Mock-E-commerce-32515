const UserModel = require('../models/userModel');

/**
 * UserController class for handling user-related HTTP requests
 */
class UserController {
  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      // Return sanitized user data (remove sensitive information)
      const sanitizedUsers = users.map(user => {
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        return userInfo;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ error: 'Failed to retrieve users', message: error.message });
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserById(req, res) {
    try {
      const user = await UserModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return sanitized user data (remove sensitive information)
      const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ error: 'Failed to retrieve user', message: error.message });
    }
  }

  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createUser(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Check if email already exists
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const newUser = await UserModel.createUser({ username, email, password });
      
      // Return sanitized user data (remove sensitive information)
      const { password: pwd, ...userInfo } = newUser;
      res.status(201).json(userInfo);
    } catch (error) {
      console.error('Error in createUser:', error);
      if (error.message.includes('required')) {
        return res.status(400).json({ error: 'Validation error', message: error.message });
      }
      res.status(500).json({ error: 'Failed to create user', message: error.message });
    }
  }

  /**
   * Update an existing user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateUser(req, res) {
    try {
      // Check if user exists
      const existingUser = await UserModel.getUserById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if email is being changed and if it's already in use
      if (req.body.email && req.body.email !== existingUser.email) {
        const userWithEmail = await UserModel.getUserByEmail(req.body.email);
        if (userWithEmail) {
          return res.status(409).json({ error: 'Email already in use' });
        }
      }

      const updatedUser = await UserModel.updateUser(req.params.id, req.body);
      
      // Return sanitized user data (remove sensitive information)
      const { password, resetToken, resetTokenExpiry, ...userInfo } = updatedUser;
      res.json(userInfo);
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({ error: 'Failed to update user', message: error.message });
    }
  }

  /**
   * Delete a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteUser(req, res) {
    try {
      // Check if user exists before attempting to delete
      const existingUser = await UserModel.getUserById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const success = await UserModel.deleteUser(req.params.id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ error: 'Failed to delete user', message: error.message });
    }
  }
  
  /**
   * Search users by username or email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchUsers(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const users = await UserModel.searchUsers(query);
      
      // Return sanitized user data (remove sensitive information)
      const sanitizedUsers = users.map(user => {
        const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
        return userInfo;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      res.status(500).json({ error: 'Failed to search users', message: error.message });
    }
  }
}

module.exports = UserController;
