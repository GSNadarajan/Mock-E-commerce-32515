const axios = require('axios');

/**
 * User Service - Handles integration with user-management component
 */
class UserService {
  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000/api';
    this.usersEndpoint = `${this.baseUrl}/users`;
    this.authEndpoint = `${this.baseUrl}/auth`;
  }

  /**
   * Get user by ID
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId, token) {
    try {
      const response = await axios.get(`${this.usersEndpoint}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error.message);
      throw new Error('Failed to retrieve user data');
    }
  }

  /**
   * Validate user exists
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<boolean>} True if user exists
   */
  async validateUser(userId, token) {
    try {
      await this.getUserById(userId, token);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has admin role
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<boolean>} True if user is admin
   */
  async isAdmin(userId, token) {
    try {
      const user = await this.getUserById(userId, token);
      return user.role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify user token
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Decoded token payload if valid
   */
  async verifyToken(token) {
    try {
      const response = await axios.post(`${this.authEndpoint}/verify-token`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user profile
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(token) {
    try {
      const response = await axios.get(`${this.authEndpoint}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error.message);
      throw new Error('Failed to retrieve user profile');
    }
  }
}

module.exports = new UserService();
