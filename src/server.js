const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const path = require('path')

const config = require('./config')
const logger = require('./utils/logger')
const routes = require('./routes')
const rateLimiters = require('./middleware/rateLimiter')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const app = express()

// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// CORS configuration
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? ['https://yourdomain.com'] // Replace with actual domain
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// General rate limiting
app.use(rateLimiters.general)

// Request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  next()
})

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

// Routes
app.use('/', routes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

// Start server
const port = config.port
const server = app.listen(port, () => {
  logger.info('Police Raider server started', {
    port,
    environment: config.nodeEnv,
    mode: config.policeRaiderMode
  })
})

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...')
  server.close(() => {
    logger.info('Server closed successfully')
    process.exit(0)
  })
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

module.exports = app
