const winston = require('winston')
const config = require('../config')

// PII fields to redact from logs
const PII_FIELDS = ['ssn', 'social_security', 'email', 'phone', 'address', 'name', 'birth_date']

// Custom format to redact PII
const redactPII = winston.format((info) => {
  if (typeof info.message === 'object') {
    PII_FIELDS.forEach(field => {
      if (info.message[field]) {
        info.message[field] = '***REDACTED***'
      }
    })
  }

  // Also check stringified content
  if (typeof info.message === 'string') {
    PII_FIELDS.forEach(field => {
      const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi')
      info.message = info.message.replace(regex, `"${field}":"***REDACTED***"`)
    })
  }

  return info
})

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    redactPII(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'police-raider' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

// In development, also log to console
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

module.exports = logger
