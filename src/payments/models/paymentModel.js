/**
 * Payment Model
 * Handles JSON file-based storage for payment data using Node.js fs module
 */

const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the payments JSON file and directory
const dataDir = path.join(__dirname, '../../../data');
const dbPath = path.join(dataDir, 'payments.json');

// Valid payment methods
const VALID_PAYMENT_METHODS = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'];

// Valid payment statuses
const VALID_PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

// Default data structure
const DEFAULT_DATA = {
  schemaVersion: '1.0',
  payments: []
};

// File lock status
let isWriting = false;

/**
 * PaymentModel class for handling payment data operations
 */
class PaymentModel {
  /**
   * Initialize the payments.json file if it doesn't exist
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
          if (!data || data.trim() === '') {
            console.warn('payments.json is empty. Creating with proper structure.');
            await this._writeData(DEFAULT_DATA);
            return;
          }
          
          const parsedData = JSON.parse(data);
          
          // Check if the file has the correct structure
          if (!parsedData || typeof parsedData !== 'object') {
            console.warn('payments.json has invalid JSON. Recreating with proper structure.');
            await this._writeData(DEFAULT_DATA);
          } else if (!parsedData.payments || !Array.isArray(parsedData.payments)) {
            console.warn('payments.json has invalid structure. Recreating with proper structure.');
            await this._writeData(DEFAULT_DATA);
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing payments.json:', parseError.message);
          console.warn('Recreating payments.json with proper structure.');
          await this._writeData(DEFAULT_DATA);
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty payments array and schema version
        console.log('Creating new payments.json file with default structure');
        await this._writeData(DEFAULT_DATA);
      }
    } catch (error) {
      console.error('Failed to initialize payments database:', error);
      throw new Error(`Failed to initialize payments database: ${error.message}`);
    }
  }

  /**
   * Read payments data from JSON file
   * @returns {Promise<Object>} The parsed JSON data
   * @private
   */
  static async _readData() {
    try {
      // Check if file exists first
      try {
        await fs.access(dbPath);
      } catch (accessError) {
        // File doesn't exist, initialize it
        await this.initialize();
        return DEFAULT_DATA;
      }
      
      // Read the file
      const data = await fs.readFile(dbPath, 'utf8');
      
      // Handle empty file
      if (!data || data.trim() === '') {
        console.warn('payments.json is empty. Returning default structure.');
        await this._writeData(DEFAULT_DATA);
        return DEFAULT_DATA;
      }
      
      try {
        const parsedData = JSON.parse(data);
        
        // Validate the parsed data
        if (!parsedData || typeof parsedData !== 'object') {
          console.warn('payments.json contains invalid JSON. Returning default structure.');
          await this._writeData(DEFAULT_DATA);
          return DEFAULT_DATA;
        }
        
        // Ensure the data has the expected structure
        if (!parsedData.payments || !Array.isArray(parsedData.payments)) {
          console.warn('payments.json has invalid structure. Returning default structure.');
          await this._writeData(DEFAULT_DATA);
          return DEFAULT_DATA;
        }
        
        // Ensure schema version exists
        if (!parsedData.schemaVersion) {
          parsedData.schemaVersion = '1.0';
          await this._writeData(parsedData);
        }
        
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing payments.json:', parseError.message);
        await this._writeData(DEFAULT_DATA);
        return DEFAULT_DATA;
      }
    } catch (error) {
      console.error(`Error reading payment data: ${error.message}`);
      return DEFAULT_DATA;
    }
  }

  /**
   * Write payments data to JSON file with improved error handling and file locking
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
      if (!data || typeof data !== 'object') {
        data = DEFAULT_DATA;
      } else if (!data.payments || !Array.isArray(data.payments)) {
        data = {
          ...data,
          payments: Array.isArray(data.payments) ? data.payments : []
        };
      }
      
      // Ensure schema version exists
      if (!data.schemaVersion) {
        data.schemaVersion = '1.0';
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      try {
        // Write to a temporary file first to ensure atomic operation
        const tempPath = `${dbPath}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
        
        // Rename the temporary file to the actual file (atomic operation)
        await fs.rename(tempPath, dbPath);
      } catch (writeError) {
        console.error('Error during file write operation:', writeError);
        // Try direct write as fallback
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Error writing payment data:', error);
      throw new Error(`Error writing payment data: ${error.message}`);
    } finally {
      // Release the lock
      isWriting = false;
    }
  }

  /**
   * Get all payments
   * @returns {Promise<Array>} Array of all payments
   */
  static async getAllPayments() {
    const data = await this._readData();
    return data.payments;
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - The ID of the payment to retrieve
   * @returns {Promise<Object|null>} The payment object or null if not found
   */
  static async getPaymentById(paymentId) {
    const payments = await this.getAllPayments();
    return payments.find(payment => payment.id === paymentId) || null;
  }

  /**
   * Get payments by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of payments for the user
   */
  static async getPaymentsByUserId(userId) {
    const payments = await this.getAllPayments();
    return payments.filter(payment => payment.userId === userId);
  }
  
  /**
   * Get payments by order ID
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Array>} Array of payments for the order
   */
  static async getPaymentsByOrderId(orderId) {
    const payments = await this.getAllPayments();
    return payments.filter(payment => payment.orderId === orderId);
  }

  /**
   * Create a new payment
   * @param {Object} paymentData - The payment data
   * @param {string} paymentData.userId - The ID of the user making the payment
   * @param {string} paymentData.orderId - The ID of the order being paid for
   * @param {string} paymentData.paymentMethod - The payment method used
   * @param {number} paymentData.amount - The payment amount
   * @returns {Promise<Object>} The created payment with transaction ID
   */
  static async createPayment(paymentData) {
    // Validate required fields
    if (!paymentData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!paymentData.orderId) {
      throw new Error('Order ID is required');
    }
    
    if (!paymentData.paymentMethod) {
      throw new Error('Payment method is required');
    }
    
    if (!VALID_PAYMENT_METHODS.includes(paymentData.paymentMethod)) {
      throw new Error(`Invalid payment method. Valid methods are: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }
    
    if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    
    const data = await this._readData();
    
    // Generate a unique transaction ID
    const transactionId = `txn_${Math.floor(Math.random() * 1000000000)}`;
    
    const newPayment = {
      id: uuidv4(),
      transactionId,
      userId: paymentData.userId,
      orderId: paymentData.orderId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      status: 'completed', // Default to completed for this mock implementation
      currency: paymentData.currency || 'USD',
      description: paymentData.description || '',
      metadata: paymentData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.payments.push(newPayment);
    await this._writeData(data);
    
    return newPayment;
  }

  /**
   * Update a payment
   * @param {string} paymentId - The ID of the payment to update
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object|null>} The updated payment or null if not found
   */
  static async updatePayment(paymentId, updateData) {
    const data = await this._readData();
    
    const paymentIndex = data.payments.findIndex(payment => payment.id === paymentId);
    if (paymentIndex === -1) return null;
    
    // Validate payment method if it's being updated
    if (updateData.paymentMethod && !VALID_PAYMENT_METHODS.includes(updateData.paymentMethod)) {
      throw new Error(`Invalid payment method. Valid methods are: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }
    
    // Validate status if it's being updated
    if (updateData.status && !VALID_PAYMENT_STATUSES.includes(updateData.status)) {
      throw new Error(`Invalid payment status. Valid statuses are: ${VALID_PAYMENT_STATUSES.join(', ')}`);
    }
    
    data.payments[paymentIndex] = {
      ...data.payments[paymentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this._writeData(data);
    
    return data.payments[paymentIndex];
  }

  /**
   * Delete a payment
   * @param {string} paymentId - The ID of the payment to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deletePayment(paymentId) {
    const data = await this._readData();
    const initialLength = data.payments.length;
    
    data.payments = data.payments.filter(payment => payment.id !== paymentId);
    
    if (data.payments.length === initialLength) return false;
    
    await this._writeData(data);
    
    return true;
  }
  
  /**
   * Search payments by various criteria
   * @param {Object} criteria - Search criteria
   * @param {string} [criteria.userId] - Filter by user ID
   * @param {string} [criteria.orderId] - Filter by order ID
   * @param {string} [criteria.paymentMethod] - Filter by payment method
   * @param {string} [criteria.status] - Filter by status
   * @param {Date|string} [criteria.startDate] - Filter by payments created after this date
   * @param {Date|string} [criteria.endDate] - Filter by payments created before this date
   * @returns {Promise<Array>} Array of matching payments
   */
  static async searchPayments(criteria = {}) {
    const payments = await this.getAllPayments();
    
    return payments.filter(payment => {
      // Filter by user ID if specified
      if (criteria.userId && payment.userId !== criteria.userId) {
        return false;
      }
      
      // Filter by order ID if specified
      if (criteria.orderId && payment.orderId !== criteria.orderId) {
        return false;
      }
      
      // Filter by payment method if specified
      if (criteria.paymentMethod && payment.paymentMethod !== criteria.paymentMethod) {
        return false;
      }
      
      // Filter by status if specified
      if (criteria.status && payment.status !== criteria.status) {
        return false;
      }
      
      // Filter by date range if specified
      if (criteria.startDate) {
        const paymentDate = new Date(payment.createdAt);
        const startDate = new Date(criteria.startDate);
        if (paymentDate < startDate) return false;
      }
      
      if (criteria.endDate) {
        const paymentDate = new Date(payment.createdAt);
        const endDate = new Date(criteria.endDate);
        if (paymentDate > endDate) return false;
      }
      
      return true;
    });
  }
}

// Initialize the payments.json file when the module is loaded
PaymentModel.initialize().catch(err => {
  console.error('Failed to initialize payments database:', err);
});

module.exports = PaymentModel;
