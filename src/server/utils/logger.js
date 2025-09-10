const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'police-raider',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Log rotation for production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'audit.log'),
    level: 'warn',
    maxsize: 5242880,
    maxFiles: 10,
  }));
}

// Security audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { type: 'security_audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security-audit.log'),
      maxsize: 5242880,
      maxFiles: 10,
    })
  ]
});

// Performance logger
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { type: 'performance' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  ]
});

// Helper functions
const loggers = {
  // Main application logger
  logger,

  // Security events
  auditLogger,

  // Performance metrics
  performanceLogger,

  // Log security event
  logSecurityEvent: (event, details = {}) => {
    auditLogger.warn('Security Event', {
      event,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // Log performance metric
  logPerformance: (metric, value, details = {}) => {
    performanceLogger.info('Performance Metric', {
      metric,
      value,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // Log request details
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  // Log database operations
  logDatabase: (operation, table, details = {}) => {
    logger.info('Database Operation', {
      operation,
      table,
      timestamp: new Date().toISOString(),
      ...details
    });
  },

  // Log authentication events
  logAuth: (event, userId, details = {}) => {
    auditLogger.info('Authentication Event', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

module.exports = loggers;