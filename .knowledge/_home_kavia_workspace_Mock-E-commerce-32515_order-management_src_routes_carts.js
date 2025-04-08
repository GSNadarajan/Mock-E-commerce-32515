{"is_source_file": true, "format": "JavaScript (Node.js)", "description": "This file defines routes for managing a user's shopping cart in an e-commerce application using Express.js. It includes Swagger documentation for API endpoints related to cart management.", "external_files": ["../middleware/auth", "../middleware/validation"], "external_methods": ["authenticateToken", "cartItemValidation"], "published": [], "classes": [], "methods": [{"name": "get('/:userId')", "description": "Handles GET requests to retrieve a user's cart based on their user ID."}, {"name": "post('/:userId/items')", "description": "Handles POST requests to add an item to the user's cart."}, {"name": "delete('/:userId/items/:productId')", "description": "Handles DELETE requests to remove a specific item from the user's cart."}, {"name": "delete('/:userId')", "description": "Handles DELETE requests to clear the user's entire cart."}], "calls": ["express.Router().get", "express.Router().post", "express.Router().delete"], "search-terms": ["carts", "cart management", "Express routes"], "state": 2, "file_id": 44, "knowledge_revision": 96, "git_revision": "afef8557091f4665925a3c7c75720cebc364fbe9", "ctags": [{"_type": "tag", "name": "express", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/routes/carts.js", "pattern": "/^const express = require('express');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "router", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/routes/carts.js", "pattern": "/^const router = express.Router();$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/routes/carts.js", "hash": "11dcc6d5f7d7156b264f483d971bbc73", "format-version": 4, "code-base-name": "default", "revision_history": [{"96": "afef8557091f4665925a3c7c75720cebc364fbe9"}]}