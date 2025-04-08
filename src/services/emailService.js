/**
 * Email service for sending notifications
 */

const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

class EmailService {
  constructor() {
    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
  }

  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content
   * @returns {Promise} - Nodemailer send mail promise
   */
  async sendEmail(to, subject, text, html) {
    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      text,
      html
    };

    try {
      // In development, log email instead of sending
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email would be sent in production:');
        console.log(mailOptions);
        return Promise.resolve({ messageId: 'dev-mode' });
      }

      // Send email in production
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   * @param {string} to - Recipient email
   * @param {string} token - Verification token
   * @returns {Promise} - Email send promise
   */
  async sendVerificationEmail(to, token) {
    const verificationLink = `${emailConfig.baseUrl}/api/auth/verify-email?token=${token}`;
    const template = emailConfig.templates.verification;

    const text = template.text.replace('{{verificationLink}}', verificationLink);
    const html = template.html.replace('{{verificationLink}}', verificationLink);

    return this.sendEmail(to, template.subject, text, html);
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} token - Password reset token
   * @returns {Promise} - Email send promise
   */
  async sendPasswordResetEmail(to, token) {
    const resetLink = `${emailConfig.baseUrl}/api/auth/reset-password?token=${token}`;
    const template = emailConfig.templates.passwordReset;

    const text = template.text.replace('{{resetLink}}', resetLink);
    const html = template.html.replace('{{resetLink}}', resetLink);

    return this.sendEmail(to, template.subject, text, html);
  }
}

module.exports = new EmailService();