/**
 * Email configuration
 */

module.exports = {
  // SMTP configuration for nodemailer
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password'
    }
  },
  // Email sender details
  from: process.env.EMAIL_FROM || 'User Management <noreply@example.com>',
  // Base URL for email links
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  // Email templates
  templates: {
    verification: {
      subject: 'Email Verification',
      text: 'Please verify your email by clicking on the following link: {{verificationLink}}',
      html: '<p>Please verify your email by clicking on the following link: <a href="{{verificationLink}}">Verify Email</a></p>'
    },
    passwordReset: {
      subject: 'Password Reset',
      text: 'You requested a password reset. Please click on the following link to reset your password: {{resetLink}}',
      html: '<p>You requested a password reset. Please click on the following link to reset your password: <a href="{{resetLink}}">Reset Password</a></p>'
    }
  }
};