/**
 * User Model
 * Handles JSON file-based storage for user data using Node.js fs module
 */

const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the users JSON file and directory
const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'users.json');

// File lock status
let isWriting = false;

/**
 * UserModel class for handling user data operations
 */
class UserModel {
  /**
   * Initialize the users.json file if it doesn't exist
   * Ensures the data directory exists and creates the file with proper structure
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      try {
        // Check if the file exists
        await fs.access(dbPath);
        
        // Validate file structure
        try {
          const data = await fs.readFile(dbPath, 'utf8');
          const parsedData = JSON.parse(data);
          
          // Check if the file has the correct structure
          if (!parsedData.users || !Array.isArray(parsedData.users)) {
            console.warn('users.json has invalid structure. Recreating with proper structure.');
            await this._writeData({ 
              schemaVersion: '1.0',
              users: [] 
            });
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing users.json:', parseError.message);
          console.warn('Recreating users.json with proper structure.');
          await this._writeData({ 
            schemaVersion: '1.0',
            users: [] 
          });
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty users array and schema version
        await this._writeData({ 
          schemaVersion: '1.0',
          users: [] 
        });
      }
    } catch (error) {
      console.error('Failed to initialize users database:', error);
      throw new Error(`Failed to initialize users database: ${error.message}`);
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
      try {
        const parsedData = JSON.parse(data);
        // Ensure the data has the expected structure
        if (!parsedData.users || !Array.isArray(parsedData.users)) {
          console.warn('users.json has invalid structure. Returning empty users array.');
          return { schemaVersion: '1.0', users: [] };
        }
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing users.json:', parseError.message);
        throw new Error(`Error parsing user data: ${parseError.message}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, initialize it
        await this.initialize();
        return { schemaVersion: '1.0', users: [] };
      }
      throw new Error(`Error reading user data: ${error.message}`);
    }
  }

  /**
   * Write users data to JSON file with improved error handling and file locking
   * @param {Object} data - The data to write
   * @returns {Promise<void>}
   * @private
   */
  static async _writeData(data) {
    // Simple file locking mechanism to prevent race conditions
    if (isWriting) {
      // Wait a bit and retry if another write operation is in progress
      await new Promise(resolve => setTimeout(resolve, 100));
      return this._writeData(data);
    }
    
    isWriting = true;
    
    try {
      // Validate data structure before writing
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Invalid data structure: users array is required');
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      // Write to a temporary file first to ensure atomic operation
      const tempPath = `${dbPath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename the temporary file to the actual file (atomic operation)
      await fs.rename(tempPath, dbPath);
    } catch (error) {
      console.error('Error writing user data:', error);
      throw new Error(`Error writing user data: ${error.message}`);
    } finally {
      // Release the lock
      isWriting = false;
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
   * Get user by email (case-insensitive)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserByEmail(email) {
    if (!email) return null;
    
    const data = await this._readData();
    return data.users.find(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    ) || null;
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
   * Create a new user with validation
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  static async createUser(userData) {
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }
    
    // Check if email is already in use
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email is already in use');
    }
    
    const data = await this._readData();
    
    const newUser = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email.toLowerCase(), // Store email in lowercase for case-insensitive comparisons
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
UserModel.initialize().catch(err => {
  console.error('Failed to initialize users database:', err);
  // In a production environment, you might want to exit the process or implement a retry mechanism
});

module.exports = UserModel;
