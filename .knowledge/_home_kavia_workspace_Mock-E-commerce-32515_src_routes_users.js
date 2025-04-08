{"is_source_file": true, "format": "JavaScript", "description": "This file defines the user-related routes for an Express application, including user registration, search, retrieval, updating, and deletion of users along with Swagger documentation for API endpoints.", "external_files": ["../controllers/userController", "../middleware/validation"], "external_methods": ["UserController.searchUsers", "UserController.getUsers", "UserController.getUserById", "UserController.createUser", "UserController.updateUser", "UserController.deleteUser", "userIdValidation", "registerValidation", "profileUpdateValidation"], "published": [], "classes": [], "methods": [], "calls": ["router.get", "router.post", "router.put", "router.delete"], "search-terms": ["user routes", "user registrations", "user search", "user updates", "user deletions"], "state": 2, "file_id": 7, "knowledge_revision": 46, "git_revision": "06998c19ce1b294bad93b9c99c75fc90a8596b5b", "revision_history": [{"17": ""}, {"45": "1477536bd6848a78d3965eb612f48e84ef3eabfa"}, {"46": "06998c19ce1b294bad93b9c99c75fc90a8596b5b"}], "ctags": [{"_type": "tag", "name": "UserController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/routes/users.js", "pattern": "/^const UserController = require('..\\/controllers\\/userController');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "express", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/routes/users.js", "pattern": "/^const express = require('express');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "router", "path": "/home/kavia/workspace/Mock-E-commerce-32515/src/routes/users.js", "pattern": "/^const router = express.Router();$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/src/routes/users.js", "hash": "c266b2995d7ed39e7ded2af8988264d7", "format-version": 4, "code-base-name": "default"}