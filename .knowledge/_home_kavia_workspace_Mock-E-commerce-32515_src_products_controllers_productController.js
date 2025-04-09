{"is_source_file": true, "format": "JavaScript", "description": "ProductController class for handling product-related HTTP requests in a web application.", "external_files": ["../models/productModel"], "external_methods": ["ProductModel.getAllProducts", "ProductModel.getProductById", "ProductModel.createProduct", "ProductModel.updateProduct", "ProductModel.deleteProduct", "ProductModel.searchProducts", "ProductModel.findProductsByCategory"], "published": ["ProductController"], "classes": [{"name": "ProductController", "description": "A class that handles product-related HTTP requests, including fetching, creating, updating, and deleting products."}], "methods": [{"name": "getProducts(req, res)", "description": "Fetches all products and responds with the list.", "scope": "ProductController", "scopeKind": "class"}, {"name": "getProductById(req, res)", "description": "Fetches a product by its ID and responds with the product or a 404 error if not found.", "scope": "ProductController", "scopeKind": "class"}, {"name": "createProduct(req, res)", "description": "Creates a new product based on the request body and responds with the created product or an error.", "scope": "ProductController", "scopeKind": "class"}, {"name": "updateProduct(req, res)", "description": "Updates an existing product based on the request body and responds with the updated product or a 404 error if not found.", "scope": "ProductController", "scopeKind": "class"}, {"name": "deleteProduct(req, res)", "description": "Deletes a product by its ID and responds with a success status or a 404 error if not found.", "scope": "ProductController", "scopeKind": "class"}, {"name": "searchProducts(req, res)", "description": "Searches products by name or description based on the query provided and responds with the results.", "scope": "ProductController", "scopeKind": "class"}, {"name": "getProductsByCategory(req, res)", "description": "Fetches products by category based on the given category parameter and responds with the list.", "scope": "ProductController", "scopeKind": "class"}], "calls": ["ProductModel.getAllProducts", "ProductModel.getProductById", "ProductModel.createProduct", "ProductModel.updateProduct", "ProductModel.deleteProduct", "ProductModel.searchProducts", "ProductModel.findProductsByCategory"], "search-terms": ["ProductController", "product", "HTTP requests"], "state": 2, "file_id": 70, "knowledge_revision": 187, "git_revision": "", "ctags": [{"_type": "tag", "name": "ProductController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^class ProductController {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "ProductModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^const ProductModel = require('..\\/models\\/productModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "createProduct", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async createProduct(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "deleteProduct", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async deleteProduct(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "getProductById", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async getProductById(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "getProducts", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async getProducts(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "getProductsByCategory", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async getProductsByCategory(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "searchProducts", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async searchProducts(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}, {"_type": "tag", "name": "updateProduct", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "pattern": "/^  static async updateProduct(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "ProductController", "scopeKind": "class"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/src/products/controllers/productController.js", "hash": "7fd83b277ea9bec3c5d7c3558af8aefc", "format-version": 4, "code-base-name": "default", "revision_history": [{"187": ""}]}