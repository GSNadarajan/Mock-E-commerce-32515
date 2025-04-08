/**
 * Authentication controller
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const UserModel = require('../models/userModel');
const emailService = require('../services/emailService');
const authConfig = require('../config/auth');

class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with user data or error
   */
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Check if user with this email already exists
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);
      
      // Generate verification token
      const verificationToken = uuidv4();
      
      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        role: authConfig.roles.USER,
        isVerified: false,
        verificationToken,
        createdAt: new Date().toISOString()
      };
      
      const newUser = await UserModel.createUser(userData);
      
      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);
      
      // Remove sensitive data from response
      const userResponse = { ...newUser };
      delete userResponse.password;
      delete userResponse.verificationToken;
      
      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Verify user email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with success message or error
   */
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }
      
      // Find user with this verification token
      const user = await UserModel.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }
      
      // Update user verification status
      const updatedUser = await UserModel.updateUser(user.id, {
        isVerified: true,
        verificationToken: null
      });
      
      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with JWT token or error
   */
  static async login(req, res) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Authentication failed' });
      }
      
      if (!user) {
        return res.status(401).json({ error: info.message || 'Authentication failed' });
      }
      
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn
      });
      
      // Generate refresh token
      const refreshToken = jwt.sign({ id: user.id }, authConfig.jwtSecret, {
        expiresIn: authConfig.refreshTokenExpiresIn
      });
      
      // Update user's last login time
      UserModel.updateUser(user.id, { lastLogin: new Date().toISOString() });
      
      res.json({
        message: 'Login successful',
        token,
        refreshToken,
        user
      });
    })(req, res);
  }

  /**
   * Refresh JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with new JWT token or error
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }
      
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, authConfig.jwtSecret);
      
      // Find user
      const user = await UserModel.getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      
      // Generate new JWT token
      const token = jwt.sign({ id: user.id }, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresIn
      });
      
      res.json({
        token
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with success message or error
   */
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await UserModel.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that the user doesn't exist
        return res.json({ message: 'If your email is registered, you will receive a password reset link.' });
      }
      
      // Generate password reset token
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
      
      // Update user with reset token
      await UserModel.updateUser(user.id, {
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      });
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(email, resetToken);
      
      res.json({ message: 'If your email is registered, you will receive a password reset link.' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  /**
   * Reset password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with success message or error
   */
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      
      // Find user with this reset token
      const user = await UserModel.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Check if token is expired
      const tokenExpiry = new Date(user.resetTokenExpiry);
      if (tokenExpiry < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);
      
      // Update user password and clear reset token
      await UserModel.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });
      
      res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with user profile or error
   */
  static async getProfile(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  }

  /**
   * Update current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with updated user profile or error
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, password } = req.body;
      
      const updateData = {};
      
      // Only update fields that are provided
      if (username) updateData.username = username;
      
      // If email is changed, require verification
      if (email && email !== req.user.email) {
        // Check if email is already in use
        const existingUser = await UserModel.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        
        // Generate new verification token
        const verificationToken = uuidv4();
        
        updateData.email = email;
        updateData.isVerified = false;
        updateData.verificationToken = verificationToken;
        
        // Send verification email
        await emailService.sendVerificationEmail(email, verificationToken);
      }
      
      // If password is provided, hash it
      if (password) {
        updateData.password = await bcrypt.hash(password, authConfig.saltRounds);
      }
      
      // Update user
      const updatedUser = await UserModel.updateUser(userId, updateData);
      
      // Remove sensitive data from response
      const userResponse = { ...updatedUser };
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.resetToken;
      delete userResponse.resetTokenExpiry;
      
      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Logout user (client-side only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with success message
   */
  static async logout(req, res) {
    // JWT is stateless, so logout is handled on the client side
    // This endpoint is just for consistency
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = AuthController;