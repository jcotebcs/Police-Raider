const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { initializeDatabase } = require('./database/init');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupSecurity } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const healthRoutes = require('./routes/health');

class PoliceRaiderServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || 'localhost';
  }

  async initialize() {
    try {
      // Initialize database
      await initializeDatabase();
      logger.info('Database initialized successfully');

      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();

      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      credentials: true,
      optionsSuccessStatus: 200
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // Additional security setup
    setupSecurity(this.app);
  }

  setupRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/game', gameRoutes);
    this.app.use('/api/health', healthRoutes);

    // Static files (for production)
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static('dist/client'));
      
      // Serve React app for all non-API routes
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
      });
    }

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Police Raider API',
        version: '1.0.0',
        description: 'RESTful API for Police Raider tactical simulation game',
        endpoints: {
          auth: '/api/auth',
          game: '/api/game',
          health: '/api/health'
        },
        documentation: '/api/docs'
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    await this.initialize();
    
    const server = this.app.listen(this.port, this.host, () => {
      logger.info(`Police Raider server running on http://${this.host}:${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    return server;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new PoliceRaiderServer();
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = PoliceRaiderServer;