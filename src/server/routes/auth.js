const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const router = express.Router();

const { runQuery, getRow } = require('../database/init');
const { logger, logAuth, logSecurityEvent } = require('../utils/logger');
const { asyncHandler, ValidationError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');
const { sanitizeInput, strictRateLimit } = require('../middleware/security');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    })
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

/**
 * Register new user
 */
router.post('/register', sanitizeInput, strictRateLimit, asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { username, email, password } = value;

  // Check if user already exists
  const existingUser = await getRow(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existingUser) {
    logSecurityEvent('registration_attempt_duplicate', {
      username,
      email,
      ip: req.ip
    });
    throw new ConflictError('Username or email already exists');
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const result = await runQuery(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, 'player']
  );

  logAuth('user_registered', result.id, {
    username,
    email,
    ip: req.ip
  });

  logger.info('New user registered', {
    userId: result.id,
    username,
    email
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: result.id,
      username,
      email,
      role: 'player'
    }
  });
}));

/**
 * User login
 */
router.post('/login', sanitizeInput, strictRateLimit, asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { username, password } = value;

  // Find user
  const user = await getRow(
    'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ? OR email = ?',
    [username, username]
  );

  if (!user || !user.is_active) {
    logSecurityEvent('login_attempt_invalid_user', {
      username,
      ip: req.ip
    });
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    logSecurityEvent('login_attempt_invalid_password', {
      userId: user.id,
      username: user.username,
      ip: req.ip
    });
    throw new UnauthorizedError('Invalid credentials');
  }

  // Update last login
  await runQuery(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [user.id]
  );

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  logAuth('user_logged_in', user.id, {
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * Refresh token
 */
router.post('/refresh', sanitizeInput, asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Refresh token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await getRow(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logAuth('token_refreshed', user.id, {
      ip: req.ip
    });

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logSecurityEvent('token_refresh_failed', {
      error: error.message,
      ip: req.ip
    });
    throw new UnauthorizedError('Invalid or expired token');
  }
}));

/**
 * Logout (client-side token invalidation)
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // In a production system, you might want to maintain a blacklist of tokens
  // For now, we'll just log the logout event
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logAuth('user_logged_out', decoded.id, {
        ip: req.ip
      });
    } catch (error) {
      // Token invalid, but we'll still process the logout
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * Get current user profile
 */
const { authenticateToken } = require('../middleware/security');

router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await getRow(
    'SELECT id, username, email, role, created_at, last_login, profile_data FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      profile: user.profile_data ? JSON.parse(user.profile_data) : {}
    }
  });
}));

module.exports = router;