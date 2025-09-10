const logger = require('../utils/logger')

class RapidApiClientMock {
  constructor () {
    this.mockData = {
      crimeData: [
        {
          id: 'INC-001',
          type: 'Theft',
          location: 'Downtown Area',
          date: '2025-09-10',
          severity: 'Medium',
          status: 'Under Investigation',
          description: 'Reported theft of personal property'
        },
        {
          id: 'INC-002',
          type: 'Vandalism',
          location: 'Park District',
          date: '2025-09-09',
          severity: 'Low',
          status: 'Closed',
          description: 'Graffiti on public property'
        },
        {
          id: 'INC-003',
          type: 'Assault',
          location: 'Commercial District',
          date: '2025-09-08',
          severity: 'High',
          status: 'Active',
          description: 'Physical altercation between individuals'
        }
      ],
      incidentDetails: {
        'INC-001': {
          id: 'INC-001',
          type: 'Theft',
          location: 'Downtown Area',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          date: '2025-09-10',
          time: '14:30',
          severity: 'Medium',
          status: 'Under Investigation',
          description: 'Reported theft of personal property from parked vehicle',
          officerBadge: 'BADGE-456',
          caseNumber: 'CASE-2025-001234',
          witnesses: 2,
          evidence: ['Security camera footage', 'Witness statements']
        },
        'INC-002': {
          id: 'INC-002',
          type: 'Vandalism',
          location: 'Park District',
          coordinates: { lat: 40.7589, lng: -73.9851 },
          date: '2025-09-09',
          time: '22:15',
          severity: 'Low',
          status: 'Closed',
          description: 'Graffiti on public property - park restroom facility',
          officerBadge: 'BADGE-789',
          caseNumber: 'CASE-2025-001233',
          witnesses: 0,
          evidence: ['Photographs', 'Damage assessment']
        }
      }
    }
  }

  async searchCrimeData (location, crimeType = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    logger.info('Mock crime data search', { location, crimeType })

    let results = [...this.mockData.crimeData]

    // Filter by location (case-insensitive partial match)
    if (location) {
      results = results.filter(item =>
        item.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Filter by crime type if specified
    if (crimeType) {
      results = results.filter(item =>
        item.type.toLowerCase().includes(crimeType.toLowerCase())
      )
    }

    return {
      success: true,
      results,
      total: results.length,
      mock: true
    }
  }

  async getIncidentDetails (incidentId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100))

    logger.info('Mock incident details request', { incidentId })

    const details = this.mockData.incidentDetails[incidentId]

    if (!details) {
      throw new Error(`Incident ${incidentId} not found`)
    }

    return {
      success: true,
      data: details,
      mock: true
    }
  }
}

module.exports = RapidApiClientMock
