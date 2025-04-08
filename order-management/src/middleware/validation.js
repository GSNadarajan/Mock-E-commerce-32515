const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validation rules for order creation
 */
const orderCreateValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each item'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  validate
];

/**
 * Validation rules for order update
 */
const orderUpdateValidation = [
  param('id').notEmpty().withMessage('Order ID is required'),
  body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validate
];

/**
 * Validation rules for cart operations
 */
const cartItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('name').notEmpty().withMessage('Product name is required'),
  validate
];

module.exports = {
  validate,
  orderCreateValidation,
  orderUpdateValidation,
  cartItemValidation
};
