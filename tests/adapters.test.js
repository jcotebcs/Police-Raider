const ApiClientFactory = require('../src/adapters')
const RapidApiClientMock = require('../src/adapters/rapidapi_client_mock')

// Set environment to test
process.env.NODE_ENV = 'test'
process.env.POLICE_RAIDER_MODE = 'mock'

describe('API Client Factory', () => {
  beforeEach(() => {
    // Reset environment for each test
    delete process.env.RAPIDAPI_KEY
  })

  test('should create mock client in test environment', () => {
    const client = ApiClientFactory.createRapidApiClient()
    expect(client).toBeInstanceOf(RapidApiClientMock)
  })

  test('should create mock client when mode is mock', () => {
    process.env.POLICE_RAIDER_MODE = 'mock'
    process.env.RAPIDAPI_KEY = 'valid-key-123456789'
    
    const client = ApiClientFactory.createRapidApiClient()
    expect(client).toBeInstanceOf(RapidApiClientMock)
  })

  test('should create mock client when API key is invalid', () => {
    process.env.POLICE_RAIDER_MODE = 'prod'
    process.env.RAPIDAPI_KEY = 'your_api_key_here'
    
    const client = ApiClientFactory.createRapidApiClient()
    expect(client).toBeInstanceOf(RapidApiClientMock)
  })

  test('should provide client info', () => {
    const info = ApiClientFactory.getClientInfo()
    
    expect(info).toHaveProperty('mode')
    expect(info).toHaveProperty('hasValidApiKey')
    expect(info).toHaveProperty('clientType')
    expect(info).toHaveProperty('environment')
  })
})

describe('Mock RapidAPI Client', () => {
  let client

  beforeEach(() => {
    client = new RapidApiClientMock()
  })

  test('should search crime data by location', async () => {
    const results = await client.searchCrimeData('downtown')
    
    expect(results.success).toBe(true)
    expect(results.results).toBeInstanceOf(Array)
    expect(results.mock).toBe(true)
  })

  test('should filter crime data by type', async () => {
    const results = await client.searchCrimeData('downtown', 'theft')
    
    expect(results.success).toBe(true)
    expect(results.results.every(item => 
      item.type.toLowerCase().includes('theft')
    )).toBe(true)
  })

  test('should return empty results for non-matching location', async () => {
    const results = await client.searchCrimeData('nonexistent-location')
    
    expect(results.success).toBe(true)
    expect(results.results).toHaveLength(0)
  })

  test('should get incident details by ID', async () => {
    const details = await client.getIncidentDetails('INC-001')
    
    expect(details.success).toBe(true)
    expect(details.data.id).toBe('INC-001')
    expect(details.mock).toBe(true)
  })

  test('should throw error for non-existent incident', async () => {
    await expect(client.getIncidentDetails('INC-999'))
      .rejects.toThrow('Incident INC-999 not found')
  })

  test('should simulate API delays', async () => {
    const startTime = Date.now()
    await client.searchCrimeData('downtown')
    const endTime = Date.now()
    
    expect(endTime - startTime).toBeGreaterThan(50)
  })
})