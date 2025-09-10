const { logger, logSecurityEvent } = require('../utils/logger');

/**
 * Global error handler middleware
 * Handles all errors that occur in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Log security-related errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    logSecurityEvent('unauthorized_access_attempt', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error response
  let status = err.status || err.statusCode || 500;
  let message = 'Internal Server Error';
  let details = {};

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      status = 400;
      message = 'Validation Error';
      if (isDevelopment) {
        details = { errors: err.details || err.message };
      }
      break;

    case 'UnauthorizedError':
    case 'JsonWebTokenError':
      status = 401;
      message = err.message || 'Unauthorized';
      break;

    case 'ForbiddenError':
      status = 403;
      message = 'Forbidden';
      break;

    case 'NotFoundError':
      status = 404;
      message = 'Resource Not Found';
      break;

    case 'ConflictError':
      status = 409;
      message = 'Resource Conflict';
      break;

    case 'RateLimitError':
      status = 429;
      message = 'Too Many Requests';
      break;

    case 'DatabaseError':
      status = 500;
      message = 'Database Error';
      if (isDevelopment) {
        details = { query: err.query, parameters: err.parameters };
      }
      break;

    default:
      if (isDevelopment && err.message) {
        message = err.message;
      }
      if (isDevelopment && err.stack) {
        details.stack = err.stack;
      }
  }

  // Send error response
  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
      ...(Object.keys(details).length > 0 && { details })
    }
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  logger.warn('Route Not Found', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, name = 'AppError') {
    super(message);
    this.name = name;
    this.status = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'ValidationError');
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UnauthorizedError');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'ForbiddenError');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NotFoundError');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'ConflictError');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RateLimitError');
  }
}

class DatabaseError extends AppError {
  constructor(message, query = null, parameters = null) {
    super(message, 500, 'DatabaseError');
    this.query = query;
    this.parameters = parameters;
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  // Error classes
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError
};