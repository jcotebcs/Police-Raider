const RequestUtils = require('../utils/request')
const logger = require('../utils/logger')
const config = require('../config')

class RapidApiClient {
  constructor () {
    this.baseURL = 'https://api.rapidapi.com'
    this.apiKey = config.apis.rapidApiKey
    this.headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'crime-data-api.rapidapi.com'
    }
  }

  async searchCrimeData (location, crimeType = null) {
    if (!RequestUtils.validateApiKey(this.apiKey)) {
      logger.warn('Invalid or missing RapidAPI key, operation not available in production mode')
      throw new Error('API key required for production mode')
    }

    const sanitizedLocation = RequestUtils.sanitizeInput(location)
    const sanitizedCrimeType = crimeType ? RequestUtils.sanitizeInput(crimeType) : null

    const params = {
      location: sanitizedLocation
    }

    if (sanitizedCrimeType) {
      params.crime_type = sanitizedCrimeType
    }

    try {
      const response = await RequestUtils.requestWithRetry(
        `${this.baseURL}/crime-data/search`,
        {
          method: 'GET',
          headers: this.headers,
          params
        }
      )

      logger.info('Crime data search completed', {
        location: sanitizedLocation,
        resultsCount: response.data?.length || 0
      })

      return response.data
    } catch (error) {
      logger.error('Crime data search failed', {
        location: sanitizedLocation,
        error: error.message
      })
      throw error
    }
  }

  async getIncidentDetails (incidentId) {
    if (!RequestUtils.validateApiKey(this.apiKey)) {
      logger.warn('Invalid or missing RapidAPI key, operation not available in production mode')
      throw new Error('API key required for production mode')
    }

    const sanitizedId = RequestUtils.sanitizeInput(incidentId)

    try {
      const response = await RequestUtils.requestWithRetry(
        `${this.baseURL}/crime-data/incident/${sanitizedId}`,
        {
          method: 'GET',
          headers: this.headers
        }
      )

      logger.info('Incident details retrieved', { incidentId: sanitizedId })
      return response.data
    } catch (error) {
      logger.error('Failed to get incident details', {
        incidentId: sanitizedId,
        error: error.message
      })
      throw error
    }
  }
}

module.exports = RapidApiClient
