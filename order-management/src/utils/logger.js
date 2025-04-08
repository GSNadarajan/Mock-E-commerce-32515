/**
 * Logger utility for consistent logging across the application
 */
class Logger {
  /**
   * Log info message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }

  /**
   * Log error message
   * @param {string} message - The message to log
   * @param {Error|Object} error - The error object or additional data
   */
  static error(message, error = {}) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  /**
   * Log warning message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }

  /**
   * Log debug message (only in development)
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static debug(message, data = {}) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
}

module.exports = Logger;
