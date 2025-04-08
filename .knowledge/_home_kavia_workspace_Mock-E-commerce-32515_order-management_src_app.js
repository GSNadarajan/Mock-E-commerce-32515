{"is_source_file": true, "format": "JavaScript", "description": "This file sets up an Express application for order management, including middleware for CORS, JSON parsing, logging, and error handling, as well as a health check endpoint and Swagger documentation.", "external_files": ["./config/swagger", "./routes/orders", "./routes/carts"], "external_methods": ["require('./routes/orders')", "require('./routes/carts')"], "published": ["app"], "classes": [], "methods": [{"name": "get /health", "description": "Handles the health check endpoint that responds with the status of the service."}, {"name": "error handling middleware", "description": "Middleware that logs errors and responds with a 500 status code."}], "calls": ["express()", "cors()", "express.json()", "morgan('dev')", "swaggerUi.serve", "swaggerUi.setup(swaggerSpec)"], "search-terms": ["express", "cors", "swagger", "order management"], "state": 2, "file_id": 35, "knowledge_revision": 84, "git_revision": "", "ctags": [{"_type": "tag", "name": "app", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const app = express();$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "cors", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const cors = require('cors');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "express", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const express = require('express');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "morgan", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const morgan = require('morgan');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "swaggerSpec", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const swaggerSpec = require('.\\/config\\/swagger');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "swaggerUi", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "pattern": "/^const swaggerUi = require('swagger-ui-express');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/app.js", "hash": "54f1d08a515112f79b3776b7e50c253e", "format-version": 4, "code-base-name": "default", "revision_history": [{"84": ""}]}