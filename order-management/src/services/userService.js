const axios = require('axios');

/**
 * User Service - Handles integration with user-management component
 */
class UserService {
  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000/api/users';
  }

  /**
   * Get user by ID
   * @param {string} userId - The ID of the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId, token) {
    try {
      const response = await axios.get(`${this.baseUrl}/${userId}`, {
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
}

module.exports = new UserService();
