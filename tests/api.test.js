const request = require('supertest')
const app = require('../src/server')

describe('Police Raider API', () => {
  describe('Health Checks', () => {
    test('GET /health should return system status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body.environment).toBeDefined()
      expect(response.body.mode).toBeDefined()
    })

    test('GET /readiness should return readiness status', async () => {
      const response = await request(app)
        .get('/readiness')
        .expect(200)

      expect(response.body.status).toBe('ready')
      expect(response.body.checks).toBeDefined()
    })
  })

  describe('API Info', () => {
    test('GET /api should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200)

      expect(response.body.name).toBe('Police Raider API')
      expect(response.body.endpoints).toBeDefined()
    })
  })

  describe('Crime Search', () => {
    test('GET /api/crime/search should require location parameter', async () => {
      const response = await request(app)
        .get('/api/crime/search')
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    test('GET /api/crime/search should validate location parameter', async () => {
      const response = await request(app)
        .get('/api/crime/search?location=x')
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    test('GET /api/crime/search should return results for valid location', async () => {
      const response = await request(app)
        .get('/api/crime/search?location=downtown')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.meta).toBeDefined()
      expect(response.body.meta.location).toBe('downtown')
    })

    test('GET /api/crime/search should filter by crime type', async () => {
      const response = await request(app)
        .get('/api/crime/search?location=downtown&crimeType=theft')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.meta.crimeType).toBe('theft')
    })

    test('GET /api/crime/search should reject invalid characters', async () => {
      const response = await request(app)
        .get('/api/crime/search?location=<script>alert(1)</script>')
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('Incident Details', () => {
    test('GET /api/crime/incident/:id should validate incident ID', async () => {
      const response = await request(app)
        .get('/api/crime/incident/x')
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })

    test('GET /api/crime/incident/:id should return incident details for valid ID', async () => {
      const response = await request(app)
        .get('/api/crime/incident/INC-001')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.meta.incidentId).toBe('INC-001')
    })

    test('GET /api/crime/incident/:id should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .get('/api/crime/incident/INC-999')
        .expect(404)

      expect(response.body.error).toBe('Incident not found')
    })

    test('GET /api/crime/incident/:id should reject invalid characters', async () => {
      const response = await request(app)
        .get('/api/crime/incident/INC<script>')
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('Error Handling', () => {
    test('Should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404)

      expect(response.body.error).toBe('Route not found')
    })

    test('Should handle large payloads gracefully', async () => {
      const largeLocation = 'a'.repeat(200)
      
      const response = await request(app)
        .get(`/api/crime/search?location=${largeLocation}`)
        .expect(400)

      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('Security Headers', () => {
    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['x-xss-protection']).toBe('0')
    })
  })
})