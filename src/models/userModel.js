/**
 * User Model
 * Handles JSON file-based storage for user data using Node.js fs module
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the users JSON file
const dbPath = path.join(__dirname, '../data/users.json');

/**
 * UserModel class for handling user data operations
 */
class UserModel {
  /**
   * Initialize the users.json file if it doesn't exist
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      await fs.access(dbPath);
    } catch (error) {
      // File doesn't exist, create it with empty users array
      await fs.writeFile(dbPath, JSON.stringify({ users: [] }, null, 2));
    }
  }

  /**
   * Read users data from JSON file
   * @returns {Promise<Object>} The parsed JSON data
   * @private
   */
  static async _readData() {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, initialize it
        await this.initialize();
        return { users: [] };
      }
      throw new Error(`Error reading user data: ${error.message}`);
    }
  }

  /**
   * Write users data to JSON file
   * @param {Object} data - The data to write
   * @returns {Promise<void>}
   * @private
   */
  static async _writeData(data) {
    try {
      // Write to a temporary file first to ensure atomic operation
      const tempPath = `${dbPath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename the temporary file to the actual file (atomic operation)
      await fs.rename(tempPath, dbPath);
    } catch (error) {
      throw new Error(`Error writing user data: ${error.message}`);
    }
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of all users
   */
  static async getAllUsers() {
    const data = await this._readData();
    return data.users;
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserById(id) {
    const data = await this._readData();
    return data.users.find(user => user.id === id) || null;
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserByEmail(email) {
    const data = await this._readData();
    return data.users.find(user => user.email === email) || null;
  }

  /**
   * Get user by verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserByVerificationToken(token) {
    const data = await this._readData();
    return data.users.find(user => user.verificationToken === token) || null;
  }

  /**
   * Get user by reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserByResetToken(token) {
    const data = await this._readData();
    return data.users.find(user => user.resetToken === token) || null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  static async createUser(userData) {
    const data = await this._readData();
    
    const newUser = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // Should be pre-hashed
      role: userData.role || 'user',
      isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
      verificationToken: userData.verificationToken || null,
      resetToken: userData.resetToken || null,
      resetTokenExpiry: userData.resetTokenExpiry || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    data.users.push(newUser);
    await this._writeData(data);
    return newUser;
  }

  /**
   * Update an existing user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  static async updateUser(id, userData) {
    const data = await this._readData();
    
    const index = data.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = {
      ...data.users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    data.users[index] = updatedUser;
    await this._writeData(data);
    return updatedUser;
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteUser(id) {
    const data = await this._readData();
    
    const index = data.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    data.users.splice(index, 1);
    await this._writeData(data);
    return true;
  }

  /**
   * Verify a user's email
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  static async verifyUser(token) {
    const user = await this.getUserByVerificationToken(token);
    if (!user) return null;
    
    return this.updateUser(user.id, {
      isVerified: true,
      verificationToken: null
    });
  }

  /**
   * Set a password reset token for a user
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {Date} expiry - Token expiry date
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  static async setPasswordResetToken(email, token, expiry) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    return this.updateUser(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry.toISOString()
    });
  }

  /**
   * Reset a user's password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password (should be pre-hashed)
   * @returns {Promise<Object|null>} Updated user object or null if not found or token expired
   */
  static async resetPassword(token, newPassword) {
    const user = await this.getUserByResetToken(token);
    if (!user) return null;
    
    // Check if token is expired
    const tokenExpiry = new Date(user.resetTokenExpiry);
    if (tokenExpiry < new Date()) return null;
    
    return this.updateUser(user.id, {
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null
    });
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of users with the specified role
   */
  static async findUsersByRole(role) {
    const data = await this._readData();
    return data.users.filter(user => user.role === role);
  }

  /**
   * Search users by username or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching users
   */
  static async searchUsers(query) {
    const data = await this._readData();
    const lowercaseQuery = query.toLowerCase();
    
    return data.users.filter(user => 
      user.username.toLowerCase().includes(lowercaseQuery) || 
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Count total users
   * @returns {Promise<number>} Total number of users
   */
  static async countUsers() {
    const data = await this._readData();
    return data.users.length;
  }
}

// Initialize the users.json file when the module is loaded
UserModel.initialize().catch(err => console.error('Failed to initialize users database:', err));

module.exports = UserModel;