const express = require('express')
const crimeRoutes = require('./crime')
const healthRoutes = require('./health')

const router = express.Router()

// API routes
router.use('/api/crime', crimeRoutes)
router.use('/', healthRoutes)

// API info endpoint
router.get('/api', (req, res) => {
  res.json({
    name: 'Police Raider API',
    version: '1.0.0',
    description: 'Crime data search and analysis API',
    endpoints: {
      health: '/health',
      readiness: '/readiness',
      crimeSearch: '/api/crime/search?location={location}&crimeType={type}',
      incidentDetails: '/api/crime/incident/{incidentId}'
    },
    documentation: 'See README.md for complete API documentation'
  })
})

module.exports = router
