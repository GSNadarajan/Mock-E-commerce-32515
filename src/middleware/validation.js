/**
 * Validation middleware
 */

const { body, param, validationResult } = require('express-validator');

// Middleware to validate request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for user registration
const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  validate
];

// Validation rules for user login
const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Validation rules for password reset request
const passwordResetRequestValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  validate
];

// Validation rules for password reset
const passwordResetValidation = [
  body('token')
    .notEmpty().withMessage('Token is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  validate
];

// Validation rules for user profile update
const profileUpdateValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  validate
];

// Validation rules for user ID parameter
const userIdValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required'),
  validate
];

// Validation rules for product ID parameter
const productIdValidation = [
  param('id')
    .notEmpty().withMessage('Product ID is required'),
  validate
];

// Validation rules for product creation
const productCreateValidation = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .notEmpty().withMessage('Product price is required')
    .isFloat({ min: 0 }).withMessage('Product price must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Product description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('imageUrl')
    .optional()
    .isURL().withMessage('Image URL must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validate
];

// Validation rules for product update
const productUpdateValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Product price must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Product description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('imageUrl')
    .optional()
    .isURL().withMessage('Image URL must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  profileUpdateValidation,
  userIdValidation,
  productIdValidation,
  productCreateValidation,
  productUpdateValidation
};
