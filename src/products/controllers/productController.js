const ProductModel = require('../models/productModel');

/**
 * ProductController class for handling product-related HTTP requests
 */
class ProductController {
  /**
   * Get all products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error in getProducts:', error);
      res.status(500).json({ error: 'Failed to retrieve products', message: error.message });
    }
  }

  /**
   * Get product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProductById(req, res) {
    try {
      const product = await ProductModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error in getProductById:', error);
      res.status(500).json({ error: 'Failed to retrieve product', message: error.message });
    }
  }

  /**
   * Create a new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createProduct(req, res) {
    try {
      const { name, description, price, category, imageUrl, stock } = req.body;
      
      const newProduct = await ProductModel.createProduct({ 
        name, 
        description, 
        price, 
        category, 
        imageUrl, 
        stock 
      });
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error.message.includes('required')) {
        return res.status(400).json({ error: 'Validation error', message: error.message });
      }
      res.status(500).json({ error: 'Failed to create product', message: error.message });
    }
  }

  /**
   * Update an existing product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProduct(req, res) {
    try {
      // Check if product exists
      const existingProduct = await ProductModel.getProductById(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updatedProduct = await ProductModel.updateProduct(req.params.id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      res.status(500).json({ error: 'Failed to update product', message: error.message });
    }
  }

  /**
   * Delete a product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteProduct(req, res) {
    try {
      // Check if product exists before attempting to delete
      const existingProduct = await ProductModel.getProductById(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const success = await ProductModel.deleteProduct(req.params.id);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      res.status(500).json({ error: 'Failed to delete product', message: error.message });
    }
  }
  
  /**
   * Search products by name or description
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchProducts(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const products = await ProductModel.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error('Error in searchProducts:', error);
      res.status(500).json({ error: 'Failed to search products', message: error.message });
    }
  }

  /**
   * Get products by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({ error: 'Category is required' });
      }
      
      const products = await ProductModel.findProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      res.status(500).json({ error: 'Failed to retrieve products by category', message: error.message });
    }
  }
}

module.exports = ProductController;
