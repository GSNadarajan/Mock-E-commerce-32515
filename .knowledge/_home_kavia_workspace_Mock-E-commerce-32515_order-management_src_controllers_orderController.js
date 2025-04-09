{"is_source_file": true, "format": "JavaScript", "description": "This file contains the OrderController class that handles the business logic for order operations, including creating, retrieving, updating, and deleting orders, along with error handling using custom error classes.", "external_files": ["../models/orderModel", "../services/userService", "../utils/logger"], "external_methods": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus"], "published": ["OrderController"], "classes": [{"name": "OrderError", "description": "Custom error class for handling order-related errors."}, {"name": "ValidationError", "description": "Error class for validation-related errors."}, {"name": "NotFoundError", "description": "Error class for handling not found errors."}, {"name": "DatabaseError", "description": "Error class for handling database-related errors."}, {"name": "AuthorizationError", "description": "Error class for handling authorization-related errors."}, {"name": "OrderController", "description": "Controller class for handling order operations and business logic."}], "methods": [{"name": "handleError(error, res, defaultMessage, context = {})", "description": "Static method to handle errors uniformly in API responses.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getAllOrders(req, res)", "description": "Static method to retrieve all orders from the database.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrderById(req, res)", "description": "Static method to retrieve a specific order by its ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrdersByUserId(req, res)", "description": "Static method to retrieve orders associated with a specific user ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "createOrder(req, res)", "description": "Static method to create a new order and validate the input.", "scope": "OrderController", "scopeKind": "class"}, {"name": "updateOrder(req, res)", "description": "Static method to update the details of an existing order.", "scope": "OrderController", "scopeKind": "class"}, {"name": "deleteOrder(req, res)", "description": "Static method to delete an order based on its ID.", "scope": "OrderController", "scopeKind": "class"}, {"name": "updateOrderStatus(req, res)", "description": "Static method to update the status of an existing order.", "scope": "OrderController", "scopeKind": "class"}, {"name": "searchOrders(req, res)", "description": "Static method to search for orders based on provided criteria.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrderCounts(req, res)", "description": "Static method to retrieve counts of orders grouped by their status.", "scope": "OrderController", "scopeKind": "class"}, {"name": "getOrdersByStatus(req, res)", "description": "Static method to retrieve orders based on their status.", "scope": "OrderController", "scopeKind": "class"}, {"name": "constructor(message)", "scope": "ValidationError", "scopeKind": "class", "description": "unavailable"}, {"name": "constructor(message, originalError = null)", "scope": "DatabaseError", "scopeKind": "class", "description": "unavailable"}, {"name": "constructor(message, statusCode = 500, errorType = 'INTERNAL_ERROR')", "scope": "OrderError", "scopeKind": "class", "description": "unavailable"}], "calls": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus"], "search-terms": ["OrderController", "handleError", "getAllOrders", "createOrder"], "state": 2, "file_id": 45, "knowledge_revision": 171, "git_revision": "2be80b5b56c5155e3a8d44295d7b1a2acc43de9f", "revision_history": [{"101": "afef8557091f4665925a3c7c75720cebc364fbe9"}, {"109": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0"}, {"119": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0"}, {"120": "69a514964ce5aea190e7c2b6ed9c87ef2f95e4a8"}, {"121": "69a514964ce5aea190e7c2b6ed9c87ef2f95e4a8"}, {"150": "69a514964ce5aea190e7c2b6ed9c87ef2f95e4a8"}, {"171": "2be80b5b56c5155e3a8d44295d7b1a2acc43de9f"}], "ctags": [{"_type": "tag", "name": "AuthorizationError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class AuthorizationError extends OrderError {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "DatabaseError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class DatabaseError extends OrderError {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "Logger", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^const Logger = require('..\\/utils\\/logger');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "NotFoundError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class NotFoundError extends OrderError {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "OrderController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class OrderController {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "OrderError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class OrderError extends Error {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "OrderModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^const OrderModel = require('..\\/models\\/orderModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "ValidationError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^class ValidationError extends OrderError {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "constructor", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  constructor(message) {$/", "language": "JavaScript", "kind": "method", "signature": "(message)", "scope": "AuthorizationError", "scopeKind": "class"}, {"_type": "tag", "name": "constructor", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  constructor(message) {$/", "language": "JavaScript", "kind": "method", "signature": "(message)", "scope": "NotFoundError", "scopeKind": "class"}, {"_type": "tag", "name": "constructor", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  constructor(message) {$/", "language": "JavaScript", "kind": "method", "signature": "(message)", "scope": "ValidationError", "scopeKind": "class"}, {"_type": "tag", "name": "constructor", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  constructor(message, originalError = null) {$/", "language": "JavaScript", "kind": "method", "signature": "(message, originalError = null)", "scope": "DatabaseError", "scopeKind": "class"}, {"_type": "tag", "name": "constructor", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  constructor(message, statusCode = 500, errorType = 'INTERNAL_ERROR') {$/", "language": "JavaScript", "kind": "method", "signature": "(message, statusCode = 500, errorType = 'INTERNAL_ERROR')", "scope": "OrderError", "scopeKind": "class"}, {"_type": "tag", "name": "createOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async createOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "deleteOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async deleteOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getAllOrders", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getAllOrders(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrderById", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrderById(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrderCounts", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrderCounts(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrdersByStatus", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrdersByStatus(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "getOrdersByUserId", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async getOrdersByUserId(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "handleError", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static handleError(error, res, defaultMessage, context = {}) {$/", "language": "JavaScript", "kind": "method", "signature": "(error, res, defaultMessage, context = {})", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "searchOrders", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async searchOrders(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "updateOrder", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async updateOrder(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "updateOrderStatus", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^  static async updateOrderStatus(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "OrderController", "scopeKind": "class"}, {"_type": "tag", "name": "userService", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "pattern": "/^const userService = require('..\\/services\\/userService');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/orderController.js", "hash": "93751aba17aac9f3a3405f4b4b4de9ec", "format-version": 4, "code-base-name": "default"}