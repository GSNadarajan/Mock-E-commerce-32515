/**
 * Authentication configuration for order-management component
 */

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: '1d', // 1 day
  roles: {
    USER: 'user',
    ADMIN: 'admin'
  }
};