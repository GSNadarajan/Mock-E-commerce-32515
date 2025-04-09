/**
 * Product Model
 * Handles JSON file-based storage for product data using Node.js fs module
 */

const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the products JSON file and directory
const dataDir = path.join(__dirname, '../../../data');
const dbPath = path.join(dataDir, 'products.json');

// File lock status
let isWriting = false;

/**
 * ProductModel class for handling product data operations
 */
class ProductModel {
  /**
   * Initialize the products.json file if it doesn't exist
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
          if (!parsedData.products || !Array.isArray(parsedData.products)) {
            console.warn('products.json has invalid structure. Recreating with proper structure.');
            await this._writeData({ 
              schemaVersion: '1.0',
              products: [] 
            });
          } else if (!parsedData.schemaVersion) {
            // Add schema version if it doesn't exist
            parsedData.schemaVersion = '1.0';
            await this._writeData(parsedData);
          }
        } catch (parseError) {
          console.error('Error parsing products.json:', parseError.message);
          console.warn('Recreating products.json with proper structure.');
          await this._writeData({ 
            schemaVersion: '1.0',
            products: [] 
          });
        }
      } catch (accessError) {
        // File doesn't exist, create it with empty products array and schema version
        await this._writeData({ 
          schemaVersion: '1.0',
          products: [] 
        });
      }
    } catch (error) {
      console.error('Failed to initialize products database:', error);
      throw new Error(`Failed to initialize products database: ${error.message}`);
    }
  }

  /**
   * Read products data from JSON file
   * @returns {Promise<Object>} The parsed JSON data
   * @private
   */
  static async _readData() {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      try {
        const parsedData = JSON.parse(data);
        // Ensure the data has the expected structure
        if (!parsedData.products || !Array.isArray(parsedData.products)) {
          console.warn('products.json has invalid structure. Returning empty products array.');
          return { schemaVersion: '1.0', products: [] };
        }
        return parsedData;
      } catch (parseError) {
        console.error('Error parsing products.json:', parseError.message);
        throw new Error(`Error parsing product data: ${parseError.message}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, initialize it
        await this.initialize();
        return { schemaVersion: '1.0', products: [] };
      }
      throw new Error(`Error reading product data: ${error.message}`);
    }
  }

  /**
   * Write products data to JSON file with improved error handling and file locking
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
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Invalid data structure: products array is required');
      }
      
      // Ensure the data directory exists
      await fsExtra.ensureDir(dataDir);
      
      // Write to a temporary file first to ensure atomic operation
      const tempPath = `${dbPath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename the temporary file to the actual file (atomic operation)
      await fs.rename(tempPath, dbPath);
    } catch (error) {
      console.error('Error writing product data:', error);
      throw new Error(`Error writing product data: ${error.message}`);
    } finally {
      // Release the lock
      isWriting = false;
    }
  }

  /**
   * Get all products
   * @returns {Promise<Array>} Array of all products
   */
  static async getAllProducts() {
    const data = await this._readData();
    return data.products;
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  static async getProductById(id) {
    const data = await this._readData();
    return data.products.find(product => product.id === id) || null;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product object
   */
  static async createProduct(productData) {
    // Validate required fields
    if (!productData.name || !productData.price) {
      throw new Error('Product name and price are required');
    }
    
    const data = await this._readData();
    
    const newProduct = {
      id: uuidv4(),
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      category: productData.category || 'uncategorized',
      imageUrl: productData.imageUrl || null,
      stock: productData.stock !== undefined ? productData.stock : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    await this._writeData(data);
    return newProduct;
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} productData - Product data to update
   * @returns {Promise<Object|null>} Updated product object or null if not found
   */
  static async updateProduct(id, productData) {
    const data = await this._readData();
    
    const index = data.products.findIndex(product => product.id === id);
    if (index === -1) return null;
    
    const updatedProduct = {
      ...data.products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    data.products[index] = updatedProduct;
    await this._writeData(data);
    return updatedProduct;
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteProduct(id) {
    const data = await this._readData();
    
    const index = data.products.findIndex(product => product.id === id);
    if (index === -1) return false;
    
    data.products.splice(index, 1);
    await this._writeData(data);
    return true;
  }

  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   */
  static async searchProducts(query) {
    const data = await this._readData();
    const lowercaseQuery = query.toLowerCase();
    
    return data.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      (product.description && product.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Find products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} Array of products in the specified category
   */
  static async findProductsByCategory(category) {
    const data = await this._readData();
    return data.products.filter(product => product.category === category);
  }

  /**
   * Count total products
   * @returns {Promise<number>} Total number of products
   */
  static async countProducts() {
    const data = await this._readData();
    return data.products.length;
  }
}

// Initialize the products.json file when the module is loaded
ProductModel.initialize().catch(err => {
  console.error('Failed to initialize products database:', err);
  // In a production environment, you might want to exit the process or implement a retry mechanism
});

module.exports = ProductModel;
