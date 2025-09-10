const express = require('express')
const { query, param } = require('express-validator')
const CrimeController = require('../controllers/crimeController')
const validationMiddleware = require('../middleware/validation')
const rateLimiters = require('../middleware/rateLimiter')

const router = express.Router()

// Search for crime data
router.get('/search',
  rateLimiters.search,
  [
    query('location')
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s,.-]+$/)
      .withMessage('Location contains invalid characters'),
    query('crimeType')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Crime type must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s-]+$/)
      .withMessage('Crime type contains invalid characters')
  ],
  validationMiddleware,
  CrimeController.search
)

// Get incident details
router.get('/incident/:incidentId',
  rateLimiters.details,
  [
    param('incidentId')
      .isLength({ min: 3, max: 20 })
      .withMessage('Incident ID must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage('Incident ID contains invalid characters')
  ],
  validationMiddleware,
  CrimeController.getIncidentDetails
)

module.exports = router
