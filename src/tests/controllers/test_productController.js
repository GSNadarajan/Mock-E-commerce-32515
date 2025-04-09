const ProductController = require('../../products/controllers/productController');\nconst ProductModel = require('../../products/models/productModel');\n\n// Mock the ProductModel\njest.mock('../../products/models/productModel');\n\ndescribe('ProductController', () => {\n  let req, res;\n  \n  beforeEach(() => {\n    // Reset mocks\n    jest.clearAllMocks();\n    \n    // Mock request and response objects\n    req = {\n      params: {},\n      body: {},\n      query: {}\n    };\n    \n    res = {\n      status: jest.fn().mockReturnThis(),\n      json: jest.fn(),\n      send: jest.fn()\n    };\n  });\n  \n  const mockProduct = {\n    id: 'product-1',\n    name: 'Test Product 1',\n    description: 'This is test product 1',\n    price: 19.99,\n    category: 'electronics',\n    imageUrl: 'http://example.com/image1.jpg',\n    stock: 10,\n    createdAt: '2023-01-01T00:00:00.000Z',\n    updatedAt: '2023-01-01T00:00:00.000Z'\n  };\n  \n  const mockProducts = [\n    mockProduct,\n    {\n      id: 'product-2',\n      name: 'Test Product 2',\n      description: 'This is test product 2',\n      price: 29.99,\n      category: 'clothing',\n      imageUrl: 'http://example.com/image2.jpg',\n      stock: 20,\n      createdAt: '2023-01-02T00:00:00.000Z',\n      updatedAt: '2023-01-02T00:00:00.000Z'\n    }\n  ];\n\n  describe('getProducts', () => {\n    it('should return all products with status 200', async () => {\n      ProductModel.getAllProducts.mockResolvedValue(mockProducts);\n      \n      await ProductController.getProducts(req, res);\n      \n      expect(ProductModel.getAllProducts).toHaveBeenCalled();\n      expect(res.json).toHaveBeenCalledWith(mockProducts);\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      ProductModel.getAllProducts.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.getProducts(req, res);\n      \n      expect(ProductModel.getAllProducts).toHaveBeenCalled();\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to retrieve products'\n      }));\n    });\n  });\n\n  describe('getProductById', () => {\n    it('should return product by ID with status 200', async () => {\n      req.params.id = 'product-1';\n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      \n      await ProductController.getProductById(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(res.json).toHaveBeenCalledWith(mockProduct);\n    });\n    \n    it('should return 404 if product not found', async () => {\n      req.params.id = 'non-existent';\n      ProductModel.getProductById.mockResolvedValue(null);\n      \n      await ProductController.getProductById(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('non-existent');\n      expect(res.status).toHaveBeenCalledWith(404);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.params.id = 'product-1';\n      ProductModel.getProductById.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.getProductById(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to retrieve product'\n      }));\n    });\n  });\n\n  describe('createProduct', () => {\n    it('should create a new product with status 201', async () => {\n      req.body = {\n        name: 'New Product',\n        description: 'This is a new product',\n        price: 39.99,\n        category: 'books',\n        imageUrl: 'http://example.com/image3.jpg',\n        stock: 30\n      };\n      \n      const newProduct = { ...req.body, id: 'product-3' };\n      ProductModel.createProduct.mockResolvedValue(newProduct);\n      \n      await ProductController.createProduct(req, res);\n      \n      expect(ProductModel.createProduct).toHaveBeenCalledWith(req.body);\n      expect(res.status).toHaveBeenCalledWith(201);\n      expect(res.json).toHaveBeenCalledWith(newProduct);\n    });\n    \n    it('should return 400 for validation error', async () => {\n      req.body = {\n        description: 'This is a new product',\n        category: 'books'\n      };\n      \n      ProductModel.createProduct.mockRejectedValue(new Error('Product name and price are required'));\n      \n      await ProductController.createProduct(req, res);\n      \n      expect(ProductModel.createProduct).toHaveBeenCalledWith(req.body);\n      expect(res.status).toHaveBeenCalledWith(400);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Validation error'\n      }));\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.body = {\n        name: 'New Product',\n        description: 'This is a new product',\n        price: 39.99\n      };\n      \n      ProductModel.createProduct.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.createProduct(req, res);\n      \n      expect(ProductModel.createProduct).toHaveBeenCalledWith(req.body);\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to create product'\n      }));\n    });\n  });\n\n  describe('updateProduct', () => {\n    it('should update an existing product with status 200', async () => {\n      req.params.id = 'product-1';\n      req.body = {\n        name: 'Updated Product',\n        price: 49.99\n      };\n      \n      const updatedProduct = { ...mockProduct, ...req.body };\n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      ProductModel.updateProduct.mockResolvedValue(updatedProduct);\n      \n      await ProductController.updateProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(ProductModel.updateProduct).toHaveBeenCalledWith('product-1', req.body);\n      expect(res.json).toHaveBeenCalledWith(updatedProduct);\n    });\n    \n    it('should return 404 if product not found', async () => {\n      req.params.id = 'non-existent';\n      req.body = {\n        name: 'Updated Product',\n        price: 49.99\n      };\n      \n      ProductModel.getProductById.mockResolvedValue(null);\n      \n      await ProductController.updateProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('non-existent');\n      expect(res.status).toHaveBeenCalledWith(404);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.params.id = 'product-1';\n      req.body = {\n        name: 'Updated Product',\n        price: 49.99\n      };\n      \n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      ProductModel.updateProduct.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.updateProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(ProductModel.updateProduct).toHaveBeenCalledWith('product-1', req.body);\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to update product'\n      }));\n    });\n  });\n\n  describe('deleteProduct', () => {\n    it('should delete an existing product with status 204', async () => {\n      req.params.id = 'product-1';\n      \n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      ProductModel.deleteProduct.mockResolvedValue(true);\n      \n      await ProductController.deleteProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(ProductModel.deleteProduct).toHaveBeenCalledWith('product-1');\n      expect(res.status).toHaveBeenCalledWith(204);\n      expect(res.send).toHaveBeenCalled();\n    });\n    \n    it('should return 404 if product not found', async () => {\n      req.params.id = 'non-existent';\n      \n      ProductModel.getProductById.mockResolvedValue(null);\n      \n      await ProductController.deleteProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('non-existent');\n      expect(res.status).toHaveBeenCalledWith(404);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });\n    });\n    \n    it('should handle deletion failure and return status 500', async () => {\n      req.params.id = 'product-1';\n      \n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      ProductModel.deleteProduct.mockResolvedValue(false);\n      \n      await ProductController.deleteProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(ProductModel.deleteProduct).toHaveBeenCalledWith('product-1');\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete product' });\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.params.id = 'product-1';\n      \n      ProductModel.getProductById.mockResolvedValue(mockProduct);\n      ProductModel.deleteProduct.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.deleteProduct(req, res);\n      \n      expect(ProductModel.getProductById).toHaveBeenCalledWith('product-1');\n      expect(ProductModel.deleteProduct).toHaveBeenCalledWith('product-1');\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to delete product'\n      }));\n    });\n  });\n\n  describe('searchProducts', () => {\n    it('should search products with status 200', async () => {\n      req.query.query = 'test';\n      \n      ProductModel.searchProducts.mockResolvedValue([mockProduct]);\n      \n      await ProductController.searchProducts(req, res);\n      \n      expect(ProductModel.searchProducts).toHaveBeenCalledWith('test');\n      expect(res.json).toHaveBeenCalledWith([mockProduct]);\n    });\n    \n    it('should return 400 if search query is missing', async () => {\n      req.query = {};\n      \n      await ProductController.searchProducts(req, res);\n      \n      expect(res.status).toHaveBeenCalledWith(400);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Search query is required' });\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.query.query = 'test';\n      \n      ProductModel.searchProducts.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.searchProducts(req, res);\n      \n      expect(ProductModel.searchProducts).toHaveBeenCalledWith('test');\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to search products'\n      }));\n    });\n  });\n\n  describe('getProductsByCategory', () => {\n    it('should get products by category with status 200', async () => {\n      req.params.category = 'electronics';\n      \n      ProductModel.findProductsByCategory.mockResolvedValue([mockProduct]);\n      \n      await ProductController.getProductsByCategory(req, res);\n      \n      expect(ProductModel.findProductsByCategory).toHaveBeenCalledWith('electronics');\n      expect(res.json).toHaveBeenCalledWith([mockProduct]);\n    });\n    \n    it('should return 400 if category is missing', async () => {\n      req.params = {};\n      \n      await ProductController.getProductsByCategory(req, res);\n      \n      expect(res.status).toHaveBeenCalledWith(400);\n      expect(res.json).toHaveBeenCalledWith({ error: 'Category is required' });\n    });\n    \n    it('should handle errors and return status 500', async () => {\n      req.params.category = 'electronics';\n      \n      ProductModel.findProductsByCategory.mockRejectedValue(new Error('Database error'));\n      \n      await ProductController.getProductsByCategory(req, res);\n      \n      expect(ProductModel.findProductsByCategory).toHaveBeenCalledWith('electronics');\n      expect(res.status).toHaveBeenCalledWith(500);\n      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({\n        error: 'Failed to retrieve products by category'\n      }));\n    });\n  });\n});