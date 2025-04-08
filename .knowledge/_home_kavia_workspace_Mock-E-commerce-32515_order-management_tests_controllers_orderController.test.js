{"is_source_file": true, "format": "JavaScript", "description": "Unit tests for the OrderController using Jest, covering various methods to manage orders in an e-commerce application.", "external_files": ["../../src/controllers/orderController", "../../src/models/orderModel", "../../src/services/userService"], "external_methods": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus", "userService.validateUser"], "published": ["OrderController.getAllOrders", "OrderController.getOrderById", "OrderController.getOrdersByUserId", "OrderController.createOrder", "OrderController.updateOrder", "OrderController.deleteOrder", "OrderController.updateOrderStatus", "OrderController.searchOrders", "OrderController.getOrderCounts", "OrderController.getOrdersByStatus"], "classes": [], "methods": [], "calls": ["OrderModel.getAllOrders", "OrderModel.getOrderById", "OrderModel.getOrdersByUserId", "OrderModel.createOrder", "OrderModel.updateOrder", "OrderModel.deleteOrder", "OrderModel.updateOrderStatus", "OrderModel.searchOrders", "OrderModel.countOrdersByStatus", "OrderModel.getOrdersByStatus", "userService.validateUser"], "search-terms": ["OrderController", "order management", "e-commerce testing"], "state": 2, "file_id": 52, "knowledge_revision": 128, "git_revision": "", "ctags": [{"_type": "tag", "name": "OrderController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/controllers/orderController.test.js", "pattern": "/^const OrderController = require('..\\/..\\/src\\/controllers\\/orderController');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "OrderModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/controllers/orderController.test.js", "pattern": "/^const OrderModel = require('..\\/..\\/src\\/models\\/orderModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "userService", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/controllers/orderController.test.js", "pattern": "/^const userService = require('..\\/..\\/src\\/services\\/userService');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/tests/controllers/orderController.test.js", "hash": "1ae17b17bb987aaaa6c6d8f7b69d6d19", "format-version": 4, "code-base-name": "default", "revision_history": [{"128": ""}]}