const axios = require('axios')
const logger = require('../utils/logger')

class RequestUtils {
  static async requestWithRetry (url, options = {}, maxRetries = 3, baseDelay = 200) {
    const maxDelay = 3000

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout if not specified
        const requestOptions = {
          timeout: 8000,
          ...options
        }

        const response = await axios(url, requestOptions)
        return response
      } catch (error) {
        if (attempt === maxRetries) {
          logger.error('Request failed after all retries', {
            url,
            attempts: attempt + 1,
            error: error.message
          })
          throw error
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 100,
          maxDelay
        )

        logger.warn('Request failed, retrying', {
          url,
          attempt: attempt + 1,
          delay,
          error: error.message
        })

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  static sanitizeInput (input) {
    if (typeof input !== 'string') return input

    // Basic XSS protection
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  static validateApiKey (key) {
    if (!key) return false
    return key && key.length > 10 && !key.includes('your_') && !key.includes('example')
  }
}

module.exports = RequestUtils
