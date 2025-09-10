const rateLimit = require('express-rate-limit')
const config = require('../config')
const logger = require('../utils/logger')

// Create rate limiter
const createRateLimiter = (windowMs = config.rateLimit.windowMs, max = config.rateLimit.maxRequests) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      })

      res.status(429).json({
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
  })
}

// Different rate limits for different endpoints
const rateLimiters = {
  general: createRateLimiter(),

  // More restrictive for search endpoints
  search: createRateLimiter(config.rateLimit.windowMs, Math.floor(config.rateLimit.maxRequests / 2)),

  // Even more restrictive for detail endpoints
  details: createRateLimiter(config.rateLimit.windowMs, Math.floor(config.rateLimit.maxRequests / 4))
}

module.exports = rateLimiters
