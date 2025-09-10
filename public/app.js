class PoliceRaiderApp {
  constructor() {
    this.apiBaseUrl = '/api'
    this.currentResults = []
    this.init()
  }

  init() {
    this.bindEvents()
    this.loadSystemStatus()
  }

  bindEvents() {
    const searchForm = document.getElementById('searchForm')
    const closeDetailsBtn = document.getElementById('closeDetails')

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault()
      this.performSearch()
    })

    closeDetailsBtn.addEventListener('click', () => {
      this.hideIncidentDetails()
    })
  }

  async loadSystemStatus() {
    try {
      const response = await fetch('/health')
      const status = await response.json()
      
      const statusInfo = document.getElementById('statusInfo')
      statusInfo.innerHTML = `
        <strong>System Status:</strong> ${status.status} | 
        <strong>Mode:</strong> ${status.mode} | 
        <strong>API Type:</strong> ${status.services.api.type}
        ${status.services.api.type === 'mock' ? ' (Using demo data)' : ''}
      `
    } catch (error) {
      console.warn('Could not load system status:', error)
    }
  }

  async performSearch() {
    const location = document.getElementById('location').value.trim()
    const crimeType = document.getElementById('crimeType').value

    if (!location) {
      this.showError('Please enter a location')
      return
    }

    this.showLoading()
    this.hideError()
    this.hideResults()
    this.hideIncidentDetails()

    try {
      const params = new URLSearchParams({ location })
      if (crimeType) params.append('crimeType', crimeType)

      const response = await fetch(`${this.apiBaseUrl}/crime/search?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      this.currentResults = data.data.results || data.data || []
      
      this.hideLoading()
      this.displayResults(this.currentResults, data.meta)
    } catch (error) {
      this.hideLoading()
      this.showError(`Search failed: ${error.message}`)
    }
  }

  displayResults(results, meta) {
    const resultsContainer = document.getElementById('resultsContainer')
    const resultsSection = document.getElementById('results')

    if (!results || results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p>No crime data found for the specified location.</p>
          <p><small>Try searching for a different area or removing the crime type filter.</small></p>
        </div>
      `
    } else {
      resultsContainer.innerHTML = results.map(incident => `
        <div class="result-item severity-${incident.severity?.toLowerCase() || 'medium'}" 
             onclick="app.showIncidentDetails('${incident.id}')">
          <div class="result-header">
            <span class="incident-id">${this.escapeHtml(incident.id)}</span>
            <span class="crime-type">${this.escapeHtml(incident.type)}</span>
          </div>
          <div class="result-content">
            <p><strong>Location:</strong> ${this.escapeHtml(incident.location)}</p>
            <p><strong>Date:</strong> ${this.escapeHtml(incident.date)}</p>
            <p><strong>Status:</strong> ${this.escapeHtml(incident.status)}</p>
            <p><strong>Severity:</strong> ${this.escapeHtml(incident.severity)}</p>
            ${incident.description ? `<p><strong>Description:</strong> ${this.escapeHtml(incident.description)}</p>` : ''}
          </div>
        </div>
      `).join('')

      // Add summary information
      if (meta) {
        const summaryHtml = `
          <div class="search-summary">
            <p><strong>Search Results:</strong> ${results.length} incident(s) found</p>
            <p><strong>Location:</strong> ${this.escapeHtml(meta.location)}</p>
            ${meta.crimeType ? `<p><strong>Crime Type:</strong> ${this.escapeHtml(meta.crimeType)}</p>` : ''}
            <p><strong>Data Source:</strong> ${meta.clientInfo?.clientType === 'mock' ? 'Demo Data' : 'Live API'}</p>
          </div>
        `
        resultsContainer.insertAdjacentHTML('afterbegin', summaryHtml)
      }
    }

    this.showResults()
  }

  async showIncidentDetails(incidentId) {
    try {
      this.showLoading()
      
      const response = await fetch(`${this.apiBaseUrl}/crime/incident/${encodeURIComponent(incidentId)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const incident = data.data.data || data.data
      
      this.hideLoading()
      this.displayIncidentDetails(incident)
    } catch (error) {
      this.hideLoading()
      this.showError(`Failed to load incident details: ${error.message}`)
    }
  }

  displayIncidentDetails(incident) {
    const incidentContent = document.getElementById('incidentContent')
    
    incidentContent.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Incident ID:</span>
        <span class="detail-value">${this.escapeHtml(incident.id)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Type:</span>
        <span class="detail-value">${this.escapeHtml(incident.type)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${this.escapeHtml(incident.location)}</span>
      </div>
      ${incident.coordinates ? `
      <div class="detail-row">
        <span class="detail-label">Coordinates:</span>
        <span class="detail-value">${incident.coordinates.lat}, ${incident.coordinates.lng}</span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${this.escapeHtml(incident.date)}</span>
      </div>
      ${incident.time ? `
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${this.escapeHtml(incident.time)}</span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Severity:</span>
        <span class="detail-value">${this.escapeHtml(incident.severity)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">${this.escapeHtml(incident.status)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Description:</span>
        <span class="detail-value">${this.escapeHtml(incident.description)}</span>
      </div>
      ${incident.officerBadge ? `
      <div class="detail-row">
        <span class="detail-label">Officer Badge:</span>
        <span class="detail-value">${this.escapeHtml(incident.officerBadge)}</span>
      </div>
      ` : ''}
      ${incident.caseNumber ? `
      <div class="detail-row">
        <span class="detail-label">Case Number:</span>
        <span class="detail-value">${this.escapeHtml(incident.caseNumber)}</span>
      </div>
      ` : ''}
      ${incident.witnesses !== undefined ? `
      <div class="detail-row">
        <span class="detail-label">Witnesses:</span>
        <span class="detail-value">${incident.witnesses}</span>
      </div>
      ` : ''}
      ${incident.evidence && incident.evidence.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">Evidence:</span>
        <span class="detail-value">${incident.evidence.map(item => this.escapeHtml(item)).join(', ')}</span>
      </div>
      ` : ''}
    `

    this.showIncidentDetails()
  }

  showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden')
  }

  hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden')
  }

  showResults() {
    document.getElementById('results').classList.remove('hidden')
  }

  hideResults() {
    document.getElementById('results').classList.add('hidden')
  }

  showIncidentDetails() {
    document.getElementById('incidentDetails').classList.remove('hidden')
  }

  hideIncidentDetails() {
    document.getElementById('incidentDetails').classList.add('hidden')
  }

  showError(message) {
    const errorElement = document.getElementById('error')
    const errorMessage = document.getElementById('errorMessage')
    
    errorMessage.textContent = message
    errorElement.classList.remove('hidden')
  }

  hideError() {
    document.getElementById('error').classList.add('hidden')
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the application
const app = new PoliceRaiderApp()

// Handle page visibility for security
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('Page hidden - security check')
  }
})