const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { logger } = require('../utils/logger');

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(healthStatus);
});

/**
 * Detailed health check with database connectivity
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const db = getDatabase();
    const dbHealthy = db !== null;
    
    // Test database connectivity
    let dbStatus = 'unknown';
    let dbResponseTime = null;
    
    if (dbHealthy) {
      const dbStartTime = Date.now();
      try {
        await new Promise((resolve, reject) => {
          db.get('SELECT 1 as test', (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'healthy';
      } catch (error) {
        dbStatus = 'unhealthy';
        logger.error('Database health check failed:', error);
      }
    } else {
      dbStatus = 'disconnected';
    }

    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime ? `${dbResponseTime}ms` : null
        },
        memory: {
          status: 'healthy',
          usage: process.memoryUsage()
        },
        cpu: {
          status: 'healthy',
          usage: process.cpuUsage()
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Readiness probe for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected'
      });
    }

    // Test database connectivity
    await new Promise((resolve, reject) => {
      db.get('SELECT 1 as test', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      reason: 'Database connectivity failed'
    });
  }
});

/**
 * Liveness probe for Kubernetes
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Metrics endpoint for monitoring
 */
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    activeHandles: process._getActiveHandles().length,
    activeRequests: process._getActiveRequests().length,
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(metrics);
});

module.exports = router;