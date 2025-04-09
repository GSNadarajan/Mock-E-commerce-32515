/**
 * Payment management routes
 */

const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { isAuthenticated, isAdmin } = require('../../middleware/auth');
const { paymentIdValidation, paymentCreateValidation } = require('../../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - user_id
 *         - order_id
 *         - payment_method
 *         - amount
 *       properties:
 *         user_id:
 *           type: string
 *           description: The ID of the user making the payment
 *         order_id:
 *           type: string
 *           description: The ID of the order being paid for
 *         payment_method:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, bank_transfer, crypto]
 *           description: The payment method used
 *         amount:
 *           type: number
 *           description: The payment amount
 *         currency:
 *           type: string
 *           default: USD
 *           description: The currency of the payment
 *         description:
 *           type: string
 *           description: Optional description for the payment
 *         metadata:
 *           type: object
 *           description: Additional metadata for the payment
 *       example:
 *         user_id: "12345"
 *         order_id: "5003"
 *         payment_method: "credit_card"
 *         amount: 1200.99
 *         currency: "USD"
 *         description: "Payment for order #5003"
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         transaction_id:
 *           type: string
 *           description: The unique transaction ID for the payment
 *       example:
 *         message: "Payment processed successfully"
 *         transaction_id: "txn_987654321"
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', isAuthenticated, paymentCreateValidation, PaymentController.processPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   transactionId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   orderId:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', isAuthenticated, isAdmin, PaymentController.getAllPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 orderId:
 *                   type: string
 *                 paymentMethod:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', isAuthenticated, paymentIdValidation, PaymentController.getPaymentById);

/**
 * @swagger
 * /api/payments/user/{userId}:
 *   get:
 *     summary: Get payments by user ID
 *     tags: [Payments]
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
 *         description: List of payments for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   transactionId:
 *                     type: string
 *                   orderId:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', isAuthenticated, PaymentController.getPaymentsByUserId);

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: List of payments for the order
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   transactionId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/order/:orderId', isAuthenticated, PaymentController.getPaymentsByOrderId);

module.exports = router;
