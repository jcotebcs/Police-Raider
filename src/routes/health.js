const express = require('express')
const HealthController = require('../controllers/healthController')

const router = express.Router()

// Health check endpoint
router.get('/health', HealthController.health)

// Readiness check endpoint
router.get('/readiness', HealthController.readiness)

module.exports = router
