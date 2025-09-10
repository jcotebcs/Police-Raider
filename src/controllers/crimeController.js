const ApiClientFactory = require('../adapters')
const logger = require('../utils/logger')

class CrimeController {
  static async search (req, res, next) {
    try {
      const { location, crimeType } = req.query

      if (!location) {
        return res.status(400).json({
          error: 'Location parameter is required'
        })
      }

      logger.info('Crime search initiated', { location, crimeType, ip: req.ip })

      const apiClient = ApiClientFactory.createRapidApiClient()
      const results = await apiClient.searchCrimeData(location, crimeType)

      res.json({
        success: true,
        data: results,
        meta: {
          location,
          crimeType,
          timestamp: new Date().toISOString(),
          clientInfo: ApiClientFactory.getClientInfo()
        }
      })
    } catch (error) {
      logger.error('Crime search failed', {
        location: req.query.location,
        error: error.message,
        ip: req.ip
      })
      next(error)
    }
  }

  static async getIncidentDetails (req, res, next) {
    try {
      const { incidentId } = req.params

      logger.info('Incident details requested', { incidentId, ip: req.ip })

      const apiClient = ApiClientFactory.createRapidApiClient()
      const details = await apiClient.getIncidentDetails(incidentId)

      res.json({
        success: true,
        data: details,
        meta: {
          incidentId,
          timestamp: new Date().toISOString(),
          clientInfo: ApiClientFactory.getClientInfo()
        }
      })
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Incident not found',
          incidentId: req.params.incidentId
        })
      }

      logger.error('Failed to get incident details', {
        incidentId: req.params.incidentId,
        error: error.message,
        ip: req.ip
      })
      next(error)
    }
  }
}

module.exports = CrimeController
