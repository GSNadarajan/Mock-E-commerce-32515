{"is_source_file": true, "format": "JavaScript", "description": "Cart Controller - Handles business logic for cart operations in an e-commerce application.", "external_files": ["../models/cartModel", "../services/userService"], "external_methods": ["CartModel.getCartByUserId", "CartModel.addItemToCart", "CartModel.removeItemFromCart", "CartModel.clearCart", "CartModel.updateItemQuantity", "CartModel.calculateCartTotal", "CartModel.deleteCart", "userService.validateUser"], "published": [], "classes": [{"name": "CartController", "description": "Class that contains methods to handle cart operations such as getting, adding, removing items, and calculating the total."}], "methods": [{"name": "getCartByUserId(req, res)", "description": "Retrieves the cart associated with a specific user ID.", "scope": "CartController", "scopeKind": "class"}, {"name": "addItemToCart(req, res)", "description": "Adds an item to the user's cart after validating the user.", "scope": "CartController", "scopeKind": "class"}, {"name": "removeItemFromCart(req, res)", "description": "Removes an item from the user's cart.", "scope": "CartController", "scopeKind": "class"}, {"name": "clearCart(req, res)", "description": "Clears all items from the user's cart.", "scope": "CartController", "scopeKind": "class"}, {"name": "updateItemQuantity(req, res)", "description": "Updates the quantity of a specific item in the user's cart.", "scope": "CartController", "scopeKind": "class"}, {"name": "calculateCartTotal(req, res)", "description": "Calculates the total cost of all items in the user's cart.", "scope": "CartController", "scopeKind": "class"}, {"name": "deleteCart(req, res)", "description": "Deletes the cart for a specific user.", "scope": "CartController", "scopeKind": "class"}], "calls": ["CartModel.getCartByUserId", "CartModel.addItemToCart", "CartModel.removeItemFromCart", "CartModel.clearCart", "CartModel.updateItemQuantity", "CartModel.calculateCartTotal", "CartModel.deleteCart", "userService.validateUser"], "search-terms": ["CartController", "cart operations", "e-commerce cart"], "state": 2, "file_id": 46, "knowledge_revision": 122, "git_revision": "69a514964ce5aea190e7c2b6ed9c87ef2f95e4a8", "revision_history": [{"102": "afef8557091f4665925a3c7c75720cebc364fbe9"}, {"110": "e78515d1ba7ec427be7c8d337bd2e0424d6fb7e0"}, {"122": "69a514964ce5aea190e7c2b6ed9c87ef2f95e4a8"}], "ctags": [{"_type": "tag", "name": "CartController", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^class CartController {$/", "language": "JavaScript", "kind": "class"}, {"_type": "tag", "name": "CartModel", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^const CartModel = require('..\\/models\\/cartModel');$/", "language": "JavaScript", "kind": "constant"}, {"_type": "tag", "name": "addItemToCart", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async addItemToCart(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "calculateCartTotal", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async calculateCartTotal(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "clearCart", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async clearCart(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "deleteCart", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async deleteCart(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "getCartByUserId", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async getCartByUserId(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "removeItemFromCart", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async removeItemFromCart(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "updateItemQuantity", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^  static async updateItemQuantity(req, res) {$/", "language": "JavaScript", "kind": "method", "signature": "(req, res)", "scope": "CartController", "scopeKind": "class"}, {"_type": "tag", "name": "userService", "path": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "pattern": "/^const userService = require('..\\/services\\/userService');$/", "language": "JavaScript", "kind": "constant"}], "filename": "/home/kavia/workspace/Mock-E-commerce-32515/order-management/src/controllers/cartController.js", "hash": "3c99389f5af2ff2b482147efec293831", "format-version": 4, "code-base-name": "default"}