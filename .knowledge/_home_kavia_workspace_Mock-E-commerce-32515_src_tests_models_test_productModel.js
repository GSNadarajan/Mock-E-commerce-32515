{"is_source_file": true, "format": "JavaScript", "description": "This file contains unit tests for the ProductModel class, testing various functionalities like initialization, data reading/writing, product management (creating, updating, deleting), and searching products.", "external_files": ["../../products/models/productModel", "fs", "fs-extra"], "external_methods": ["fs.promises.readFile", "fs.promises.writeFile", "fs.promises.access", "fs.rename", "fsExtra.ensureDir", "uuid.v4"], "published": ["ProductModel", "ProductModel.initialize", "ProductModel._readData", "ProductModel._writeData", "ProductModel.getAllProducts", "ProductModel.getProductById", "ProductModel.createProduct", "ProductModel.updateProduct", "ProductModel.deleteProduct", "ProductModel.searchProducts", "ProductModel.findProductsByCategory", "ProductModel.countProducts"], "classes": [], "methods": [], "calls": ["fs.access", "fs.readFile", "fs.writeFile", "fs.rename", "fsExtra.ensureDir", "uuid.v4"], "search-terms": ["ProductModel", "initialize", "getAllProducts", "getProductById", "createProduct", "updateProduct", "deleteProduct", "searchProducts", "findProductsByCategory", "countProducts"], "state": 2, "file_id": 83, "knowledge_revision": 219, "git_revision": "", "ctags": [{"_type": "tag", "name": "fs", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/tests/models/test_productModel.js", "pattern": "/^const fs = require('fs').promises;\\\\nconst fsExtra = require('fs-extra');\\\\nconst path = require/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/src/tests/models/test_productModel.js", "hash": "19469f08a165b0c39bcd9de80bbf5602", "format-version": 4, "code-base-name": "default", "revision_history": [{"219": ""}]}