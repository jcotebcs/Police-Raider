const config = require('../config')
const ApiClientFactory = require('../adapters')

class HealthController {
  static async health (req, res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      mode: config.policeRaiderMode,
      services: {
        api: {
          status: 'operational',
          type: ApiClientFactory.getClientInfo().clientType
        }
      }
    }

    res.json(health)
  }

  static async readiness (req, res) {
    // Check if all required services are available
    try {
      const clientInfo = ApiClientFactory.getClientInfo()

      const readiness = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          configuration: {
            status: 'pass',
            details: `Mode: ${clientInfo.mode}, Environment: ${clientInfo.environment}`
          },
          apiClient: {
            status: 'pass',
            details: `Client type: ${clientInfo.clientType}`
          }
        }
      }

      res.json(readiness)
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message
      })
    }
  }
}

module.exports = HealthController
