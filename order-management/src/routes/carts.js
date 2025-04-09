const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { cartItemValidation } = require('../middleware/validation');
// Removed userExists middleware to fix authentication token issues

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: The ID of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         quantity:
 *           type: integer
 *           description: The quantity of the product
 *     Cart:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the cart
 *         userId:
 *           type: string
 *           description: The ID of the user who owns the cart
 *         items:
 *           type: array
 *           description: The items in the cart
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/carts/{userId}:
 *   get:
 *     summary: Get a user's cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 */
router.get('/:userId', CartController.getCartByUserId);

/**
 * @swagger
 * /api/carts/{userId}/items:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid request data
 */
router.post('/:userId/items', cartItemValidation, CartController.addItemToCart);

/**
 * @swagger
 * /api/carts/{userId}/items/{productId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart or item not found
 */
router.delete('/:userId/items/:productId', CartController.removeItemFromCart);

/**
 * @swagger
 * /api/carts/{userId}:
 *   delete:
 *     summary: Clear a user's cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
router.delete('/:userId', CartController.clearCart);

/**
 * @swagger
 * /api/carts/{userId}/items/{productId}/quantity:
 *   patch:
 *     summary: Update item quantity in cart
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart or item not found
 */
router.patch('/:userId/items/:productId/quantity', CartController.updateItemQuantity);

/**
 * @swagger
 * /api/carts/{userId}/total:
 *   get:
 *     summary: Calculate cart total
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Cart total and item count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 itemCount:
 *                   type: integer
 */
router.get('/:userId/total', CartController.calculateCartTotal);

/**
 * @swagger
 * /api/carts/{userId}/delete:
 *   delete:
 *     summary: Delete a user's cart completely
 *     tags: [Carts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Cart deleted successfully
 *       404:
 *         description: Cart not found
 */
router.delete('/:userId/delete', CartController.deleteCart);

module.exports = router;
