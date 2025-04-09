/**
 * Logging Service
 * Provides centralized logging functionality for the application
 * using winston for advanced logging capabilities
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logDir);

/**
 * Custom error class for logging service
 */
class LoggingError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Define log levels
 */
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Add colors to Winston
winston.addColors(logLevels.colors);

/**
 * Create custom format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

/**
 * Create custom format for file output (without colors)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

/**
 * Create environment-specific logger configurations
 */
const getLoggerConfig = (env = process.env.NODE_ENV || 'development') => {
  // Default configuration
  const config = {
    level: 'info',
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ],
    exitOnError: false,
  };

  // Environment-specific configurations
  switch (env) {
    case 'production':
      config.level = 'info';
      config.transports = [
        new winston.transports.Console({
          format: consoleFormat,
          level: 'info',
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ];
      break;

    case 'test':
      config.level = 'error'; // Only log errors in test environment
      config.transports = [
        new winston.transports.Console({
          format: consoleFormat,
          level: 'error',
        }),
      ];
      break;

    case 'development':
    default:
      config.level = 'debug';
      config.transports = [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'development.log'),
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 2,
        }),
      ];
      break;
  }

  return config;
};

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
  levels: logLevels.levels,
  ...getLoggerConfig(),
});

/**
 * Logging Service - Provides centralized logging functionality
 */
class LogService {
  constructor() {
    this.logger = logger;
    
    // Log service initialization
    this.info('Logging service initialized', { 
      environment: process.env.NODE_ENV || 'development',
      logLevel: this.logger.level
    });
  }

  /**
   * Reconfigure the logger (useful when environment changes)
   * @param {string} env - The environment to configure for
   */
  configure(env) {
    try {
      // Remove all transports
      this.logger.clear();
      
      // Apply new configuration
      const config = getLoggerConfig(env);
      this.logger.level = config.level;
      
      // Add all transports from the configuration
      config.transports.forEach(transport => {
        this.logger.add(transport);
      });
      
      this.info('Logging service reconfigured', { environment: env, logLevel: this.logger.level });
      return true;
    } catch (error) {
      console.error('Failed to reconfigure logger:', error);
      return false;
    }
  }

  /**
   * Format metadata to ensure it's serializable
   * @param {Object} meta - The metadata to format
   * @returns {Object} Formatted metadata
   * @private
   */
  _formatMeta(meta) {
    if (!meta || typeof meta !== 'object') {
      return {};
    }

    // Handle Error objects specially
    if (meta instanceof Error) {
      return {
        error: {
          message: meta.message,
          name: meta.name,
          stack: meta.stack,
          ...(meta.code && { code: meta.code }),
        },
      };
    }

    // Process each property to ensure it's serializable
    const formattedMeta = {};
    Object.entries(meta).forEach(([key, value]) => {
      if (value instanceof Error) {
        formattedMeta[key] = {
          message: value.message,
          name: value.name,
          stack: value.stack,
          ...(value.code && { code: value.code }),
        };
      } else if (typeof value === 'function') {
        formattedMeta[key] = '[Function]';
      } else if (typeof value === 'symbol') {
        formattedMeta[key] = value.toString();
      } else if (typeof value === 'bigint') {
        formattedMeta[key] = value.toString();
      } else if (value === undefined) {
        formattedMeta[key] = 'undefined';
      } else if (value === null) {
        formattedMeta[key] = null;
      } else if (typeof value === 'object') {
        try {
          // Test if the object is serializable
          JSON.stringify(value);
          formattedMeta[key] = value;
        } catch (err) {
          formattedMeta[key] = '[Unserializable Object]';
        }
      } else {
        formattedMeta[key] = value;
      }
    });

    return formattedMeta;
  }

  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {Object} [meta={}] - Additional metadata to log
   * @public
   */
  // PUBLIC_INTERFACE
  info(message, meta = {}) {
    this.logger.info(message, this._formatMeta(meta));
  }

  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {Object} [meta={}] - Additional metadata to log
   * @public
   */
  // PUBLIC_INTERFACE
  warn(message, meta = {}) {
    this.logger.warn(message, this._formatMeta(meta));
  }

  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Error|Object} [error={}] - The error object or additional metadata
   * @public
   */
  // PUBLIC_INTERFACE
  error(message, error = {}) {
    this.logger.error(message, this._formatMeta(error));
  }

  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {Object} [meta={}] - Additional metadata to log
   * @public
   */
  // PUBLIC_INTERFACE
  debug(message, meta = {}) {
    this.logger.debug(message, this._formatMeta(meta));
  }

  /**
   * Log an HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Object} [additionalInfo={}] - Additional information to log
   * @public
   */
  // PUBLIC_INTERFACE
  logRequest(req, res, additionalInfo = {}) {
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      responseTime: res.responseTime,
      userAgent: req.headers['user-agent'],
      ...additionalInfo,
    };

    // Don't log sensitive information
    if (req.user) {
      meta.userId = req.user.id;
    }

    this.http(`HTTP ${req.method} ${req.originalUrl || req.url}`, meta);
  }

  /**
   * Log an HTTP message (custom level between info and debug)
   * @param {string} message - The message to log
   * @param {Object} [meta={}] - Additional metadata to log
   * @public
   */
  // PUBLIC_INTERFACE
  http(message, meta = {}) {
    this.logger.http(message, this._formatMeta(meta));
  }

  /**
   * Create a child logger with additional default metadata
   * @param {Object} defaultMeta - Default metadata to include in all logs
   * @returns {Object} Child logger instance
   * @public
   */
  // PUBLIC_INTERFACE
  child(defaultMeta) {
    const childLogger = this.logger.child(this._formatMeta(defaultMeta));
    
    // Create a wrapper with the same interface
    return {
      info: (message, meta = {}) => childLogger.info(message, this._formatMeta(meta)),
      warn: (message, meta = {}) => childLogger.warn(message, this._formatMeta(meta)),
      error: (message, meta = {}) => childLogger.error(message, this._formatMeta(meta)),
      debug: (message, meta = {}) => childLogger.debug(message, this._formatMeta(meta)),
      http: (message, meta = {}) => childLogger.http(message, this._formatMeta(meta)),
    };
  }

  /**
   * Get the current log level
   * @returns {string} Current log level
   * @public
   */
  // PUBLIC_INTERFACE
  getLevel() {
    return this.logger.level;
  }

  /**
   * Set the log level
   * @param {string} level - The log level to set
   * @returns {boolean} True if successful
   * @public
   */
  // PUBLIC_INTERFACE
  setLevel(level) {
    try {
      if (!logLevels.levels[level]) {
        throw new LoggingError(`Invalid log level: ${level}`);
      }
      
      this.logger.level = level;
      this.info(`Log level changed to ${level}`);
      return true;
    } catch (error) {
      console.error('Failed to set log level:', error);
      return false;
    }
  }
}

module.exports = new LogService();
