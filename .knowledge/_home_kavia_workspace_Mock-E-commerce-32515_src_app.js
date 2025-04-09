{"is_source_file": true, "format": "JavaScript", "description": "This file sets up an Express.js application with middleware for CORS, logging, and Swagger documentation. It defines routes for users, authentication, and products, and includes error handling middleware.", "external_files": ["./config/swagger", "./routes/users", "./routes/authRoutes", "./products/routes/productRoutes"], "external_methods": [], "published": ["app"], "classes": [], "methods": [], "calls": ["express", "cors", "morgan", "swagger-ui-express", "swaggerSpec", "userRoutes", "authRoutes", "productRoutes"], "search-terms": ["Express setup", "API routes", "Error handling"], "state": 2, "file_id": 8, "knowledge_revision": 190, "git_revision": "a6d0569e630a75bef4d147d81e5e2c230f8c1511", "revision_history": [{"18": ""}, {"139": "1477536bd6848a78d3965eb612f48e84ef3eabfa"}, {"190": "a6d0569e630a75bef4d147d81e5e2c230f8c1511"}], "ctags": [{"_type": "tag", "name": "app", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const app = express();$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "authRoutes", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const authRoutes = require('.\\/routes\\/authRoutes');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "cors", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const cors = require('cors');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "express", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const express = require('express');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "morgan", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const morgan = require('morgan');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "productRoutes", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const productRoutes = require('.\\/products\\/routes\\/productRoutes');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "swaggerSpec", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const swaggerSpec = require('.\\/config\\/swagger');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "swaggerUi", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const swaggerUi = require('swagger-ui-express');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "userRoutes", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "pattern": "/^const userRoutes = require('.\\/routes\\/users');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/src/app.js", "hash": "217df453175abcc5687d41977317367b", "format-version": 4, "code-base-name": "default"}