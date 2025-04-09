/**
 * Authentication configuration for order-management component
 * Aligned with user-management component settings
 */

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: '1d', // 1 day
  refreshTokenExpiresIn: '7d', // 7 days
  roles: {
    USER: 'user',
    ADMIN: 'admin'
  }
};
