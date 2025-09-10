const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  policeRaiderMode: process.env.POLICE_RAIDER_MODE || 'mock',

  // API Configuration
  apis: {
    rapidApiKey: process.env.RAPIDAPI_KEY,
    crimeDataApiKey: process.env.CRIME_DATA_API_KEY
  },

  // Security
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-prod'
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}
