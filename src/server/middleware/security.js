const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { logger, logSecurityEvent } = require('../utils/logger');
const { UnauthorizedError, RateLimitError } = require('./errorHandler');

/**
 * Setup additional security middleware
 */
const setupSecurity = (app) => {
  // Add request ID for tracking
  app.use((req, res, next) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // IP whitelist for admin endpoints (if configured)
  if (process.env.ADMIN_IP_WHITELIST) {
    const allowedIPs = process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim());
    app.use('/api/admin', (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      if (!allowedIPs.includes(clientIP)) {
        logSecurityEvent('admin_access_denied', {
          ip: clientIP,
          url: req.url,
          method: req.method
        });
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    });
  }
};

/**
 * JWT Authentication middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logSecurityEvent('missing_auth_token', {
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    return next(new UnauthorizedError('Access token required'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logSecurityEvent('invalid_auth_token', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        error: err.message
      });
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware
 * Sets user if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

/**
 * Role-based authorization middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      logSecurityEvent('insufficient_permissions', {
        userId: req.user.id,
        requiredRoles: roles,
        userRoles: userRoles,
        url: req.url,
        method: req.method
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return sanitizeValue(obj);
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    logger.info('Request Completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      requestId: req.id,
      timestamp: new Date().toISOString()
    });

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Rate limiting for sensitive endpoints
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logSecurityEvent('rate_limit_exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      limit: options.max,
      window: options.windowMs
    });
    next(new RateLimitError(options.message.error));
  }
});

/**
 * Content Security Policy middleware
 */
const cspMiddleware = (req, res, next) => {
  const nonce = uuidv4();
  res.locals.nonce = nonce;
  
  res.setHeader('Content-Security-Policy', 
    `default-src 'self'; ` +
    `script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `img-src 'self' data: https:; ` +
    `font-src 'self'; ` +
    `connect-src 'self'; ` +
    `frame-ancestors 'none';`
  );
  
  next();
};

module.exports = {
  setupSecurity,
  authenticateToken,
  optionalAuth,
  requireRole,
  sanitizeInput,
  requestLogger,
  strictRateLimit,
  cspMiddleware
};