{"is_source_file": true, "format": "JavaScript", "description": "Order Controller - Handles business logic for order operations in an e-commerce application, allowing operations such as creating, updating, deleting, and retrieving orders.", "external_files": ["../models/orderModel", "../services/userService"], "external_methods": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus", "userService.validateUser"], "published": ["OrderController"], "classes": [{"name": "OrderController", "description": "Handles all order-related operations including retrieval, creation, updating, deletion, and searching of orders."}], "methods": [{"name": "getAllOrders(req, res)", "description": "Retrieves all orders from the database.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrderById(req, res)", "description": "Retrieves a single order by its ID, checking user authorization.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrdersByUserId(req, res)", "description": "Retrieves orders associated with a specific user ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "createOrder(req, res)", "description": "Creates a new order with validation checks for user authorization.", "scope": "OrderController", "scopeKind": "class"}, {"name": "updateOrder(req, res)", "description": "Updates an existing order based on its ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "deleteOrder(req, res)", "description": "Deletes an order given its ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "updateOrderStatus(req, res)", "description": "Updates the status of an order.", "scope": "OrderController", "scopeKind": "class"}, {"name": "searchOrders(req, res)", "description": "Searches for orders based on various criteria provided in the request.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrderCounts(req, res)", "description": "Retrieves counts of orders based on their status.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrdersByStatus(req, res)", "description": "Retrieves orders based on the specified status.", "scope": "OrderController", "scopeKind": "class"}], "calls": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus", "userService.validateUser"], "search-terms": ["order", "OrderController", "order operations", "e-commerce"], "state": 2, "file_id": 45, "knowledge_revision": 119, "git_revision": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0", "revision_history": [{"101": "afef8557091f4665925a3c7c75720cebc364fbe9"}, {"109": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0"}, {"119": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0"}], "ctags": [{"_type": "tag", "name": "OrderController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class OrderController {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "OrderModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^const OrderModel = require('..\\/models\\/orderModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "createOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async createOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "deleteOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async deleteOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getAllOrders", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getAllOrders(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrderById", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrderById(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrderCounts", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrderCounts(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrdersByStatus", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrdersByStatus(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrdersByUserId", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrdersByUserId(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "searchOrders", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async searchOrders(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "updateOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async updateOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "updateOrderStatus", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async updateOrderStatus(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "userService", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^const userService = require('..\\/services\\/userService');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "hash": "3aaa36bf9f58f9ced483bd7b8e358613", "format-version": 4, "code-base-name": "default"}