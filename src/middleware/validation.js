const { validationResult } = require('express-validator')
const logger = require('../utils/logger')

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      ip: req.ip
    })

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    })
  }

  next()
}

module.exports = validationMiddleware
