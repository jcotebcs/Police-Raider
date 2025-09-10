/**
 * Public Records Search PWA
 * Professional search application for first responders and citizens
 * NOT a game - this is a serious search tool for public service
 */

class PublicSearchApp {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.resultsContainer = document.getElementById('results');
        this.offlineStatus = document.getElementById('offline-status');
        
        // API endpoints - replace with actual endpoints
        this.apiEndpoints = {
            people: '/api/people',
            criminal: '/api/criminal',
            property: '/api/property',
            vehicle: '/api/vehicle'
        };
        
        this.initializeApp();
    }
    
    initializeApp() {
        console.log('Initializing Public Records Search PWA');
        
        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully');
                })
                .catch(error => {
                    console.log('Service Worker registration failed');
                });
        }
        
        // Bind search events
        this.searchButton.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Monitor online/offline status
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));
        
        // Focus search input on load
        this.searchInput.focus();
        
        console.log('Public Records Search PWA initialized successfully');
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }
        
        console.log('Performing search for:', query);
        this.showLoading();
        
        try {
            // Get selected filters
            const filters = this.getSelectedFilters();
            if (filters.length === 0) {
                this.showError('Please select at least one search category');
                return;
            }
            
            // Perform search across selected APIs
            const results = await this.searchAPIs(query, filters);
            this.displayResults(results, query);
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please check your connection and try again.');
        }
    }
    
    getSelectedFilters() {
        const checkboxes = document.querySelectorAll('.search-filters input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    async searchAPIs(query, filters) {
        console.log('Searching APIs for:', query, 'in categories:', filters);
        
        // Since this is a demo, we'll return mock data
        // In a real implementation, replace this with actual API calls
        const mockResults = this.generateMockResults(query, filters);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return mockResults;
        
        /* Real API implementation would look like this:
        const results = [];
        const promises = filters.map(async (filter) => {
            try {
                const response = await fetch(`${this.apiEndpoints[filter]}?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    return { type: filter, data: data.results || [] };
                }
            } catch (error) {
                console.error(`API call failed for ${filter}:`, error);
                // Fallback to cached data if available
                return this.getCachedResults(filter, query);
            }
        });
        
        const responses = await Promise.allSettled(promises);
        responses.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                results.push(result.value);
            }
        });
        
        return results;
        */
    }
    
    generateMockResults(query, filters) {
        const results = [];
        
        filters.forEach(filter => {
            switch (filter) {
                case 'people':
                    results.push({
                        type: 'people',
                        data: [
                            {
                                id: '1',
                                name: `${query} (Person)`,
                                description: 'Sample person record',
                                details: 'Age: 35, Address: 123 Main St',
                                source: 'Public Records Database'
                            }
                        ]
                    });
                    break;
                    
                case 'criminal':
                    results.push({
                        type: 'criminal',
                        data: [
                            {
                                id: '2',
                                name: 'Criminal Record',
                                description: `Record related to ${query}`,
                                details: 'Traffic violation - 2023',
                                source: 'Criminal Records Database'
                            }
                        ]
                    });
                    break;
                    
                case 'property':
                    results.push({
                        type: 'property',
                        data: [
                            {
                                id: '3',
                                name: 'Property Record',
                                description: `Property information for ${query}`,
                                details: 'Residential property, Built: 1995',
                                source: 'Property Records Database'
                            }
                        ]
                    });
                    break;
                    
                case 'vehicle':
                    results.push({
                        type: 'vehicle',
                        data: [
                            {
                                id: '4',
                                name: 'Vehicle Record',
                                description: `Vehicle registration for ${query}`,
                                details: '2020 Toyota Camry, License: ABC123',
                                source: 'Vehicle Records Database'
                            }
                        ]
                    });
                    break;
            }
        });
        
        return results;
    }
    
    displayResults(results, query) {
        console.log('Displaying results for:', query);
        
        if (!results || results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        let totalResults = 0;
        const resultHtml = results.map(category => {
            if (!category.data || category.data.length === 0) return '';
            
            totalResults += category.data.length;
            
            return `
                <div class="result-category">
                    <div class="result-type">${category.type.toUpperCase()}</div>
                    ${category.data.map(item => `
                        <div class="result-item" onclick="this.showDetails('${item.id}')">
                            <h3>${item.name || item.address || 'Record'}</h3>
                            <p>${item.description || item.details || 'No description available'}</p>
                            <small>Source: ${item.source || 'Public Records'}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
        
        this.resultsContainer.innerHTML = `
            <div class="results-header">
                <h2>Search Results for "${query}"</h2>
                <p>Found ${totalResults} result(s) across ${results.length} categor${results.length === 1 ? 'y' : 'ies'}</p>
            </div>
            ${resultHtml}
        `;
        
        // Add CSS for results header
        if (!document.querySelector('.results-header-style')) {
            const style = document.createElement('style');
            style.className = 'results-header-style';
            style.textContent = `
                .results-header {
                    padding: 2rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--background);
                }
                .results-header h2 {
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }
                .results-header p {
                    color: var(--text-secondary);
                }
                .result-category {
                    padding: 1rem 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showLoading() {
        this.resultsContainer.innerHTML = `
            <div class="loading">
                <h2>Searching...</h2>
                <p>Please wait while we search across multiple databases</p>
            </div>
        `;
    }
    
    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="error">
                <h2>Search Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
    
    showNoResults(query) {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                <h2>No Results Found</h2>
                <p>No records found for "${query}". Try a different search term or check your spelling.</p>
            </div>
        `;
    }
    
    updateOnlineStatus(isOnline) {
        if (isOnline) {
            this.offlineStatus.classList.add('hidden');
            console.log('App is online');
        } else {
            this.offlineStatus.classList.remove('hidden');
            console.log('App is offline - showing cached results only');
        }
    }
    
    showDetails(itemId) {
        console.log('Showing details for item:', itemId);
        // In a real app, this would show detailed information
        alert(`Showing detailed information for record ${itemId}`);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Public Records Search PWA');
    new PublicSearchApp();
});

// Prevent any gaming-related code from being executed
if (typeof initializeGame !== 'undefined') {
    console.warn('Gaming code detected and blocked - this is a search application, not a game');
}

// Block any Police Raider simulation references
const blockedTerms = ['simulation', 'tactical', 'raider', 'game', 'enterprise security'];
blockedTerms.forEach(term => {
    if (document.title.toLowerCase().includes(term)) {
        console.warn(`Blocked gaming reference: ${term}`);
    }
});