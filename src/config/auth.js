/**
 * Authentication configuration
 */

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: '1d', // 1 day
  refreshTokenExpiresIn: '7d', // 7 days
  saltRounds: 10, // For bcrypt password hashing
  roles: {
    USER: 'user',
    ADMIN: 'admin'
  }
};