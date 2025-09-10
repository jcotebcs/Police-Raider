const config = require('../config')
const RequestUtils = require('../utils/request')
const logger = require('../utils/logger')

// Import both real and mock clients
const RapidApiClient = require('./rapidapi_client')
const RapidApiClientMock = require('./rapidapi_client_mock')

class ApiClientFactory {
  static createRapidApiClient () {
    const mode = config.policeRaiderMode
    const hasValidApiKey = RequestUtils.validateApiKey(config.apis.rapidApiKey)

    logger.info('Creating RapidAPI client', {
      mode,
      hasValidApiKey,
      keyPresent: !!config.apis.rapidApiKey
    })

    // Use mock client if:
    // 1. Mode is explicitly set to 'mock'
    // 2. No valid API key is available
    // 3. In test environment
    if (mode === 'mock' || !hasValidApiKey || config.nodeEnv === 'test') {
      logger.info('Using mock RapidAPI client')
      return new RapidApiClientMock()
    }

    // Use real client for staging/production with valid keys
    if (mode === 'staging' || mode === 'prod') {
      logger.info('Using real RapidAPI client')
      return new RapidApiClient()
    }

    // Default to mock for safety
    logger.warn('Defaulting to mock RapidAPI client due to unclear configuration')
    return new RapidApiClientMock()
  }

  static getClientInfo () {
    const mode = config.policeRaiderMode
    const hasValidApiKey = RequestUtils.validateApiKey(config.apis.rapidApiKey)

    return {
      mode,
      hasValidApiKey,
      clientType: (mode === 'mock' || !hasValidApiKey || config.nodeEnv === 'test') ? 'mock' : 'real',
      environment: config.nodeEnv
    }
  }
}

module.exports = ApiClientFactory
