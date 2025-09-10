const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Default error
  let statusCode = 500
  let message = 'Internal server error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation error'
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403
    message = 'Forbidden'
  } else if (err.message.includes('not found')) {
    statusCode = 404
    message = 'Resource not found'
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503
    message = 'Service temporarily unavailable'
  }

  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  }

  // Include stack trace in development
  if (isDevelopment) {
    errorResponse.details = err.message
    errorResponse.stack = err.stack
  }

  res.status(statusCode).json(errorResponse)
}

const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  })

  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  })
}

module.exports = {
  errorHandler,
  notFoundHandler
}
