class PublicServiceSearchApp {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.serviceType = document.getElementById('serviceType');
        this.searchBtn = document.getElementById('searchBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsCount = document.getElementById('resultsCount');
        this.results = document.getElementById('results');
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');

        this.deferredPrompt = null;
        this.searchAPIs = {
            police: 'https://jsonplaceholder.typicode.com/users',
            emergency: 'https://jsonplaceholder.typicode.com/posts',
            public: 'https://jsonplaceholder.typicode.com/albums',
            people: 'https://jsonplaceholder.typicode.com/users',
            all: 'https://jsonplaceholder.typicode.com/users'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPWAInstall();
        this.loadSampleData();
    }

    setupEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Service type change
        this.serviceType.addEventListener('change', () => {
            if (this.searchInput.value.trim()) {
                this.performSearch();
            }
        });

        // Install app
        this.installBtn.addEventListener('click', () => this.installApp());
    }

    setupPWAInstall() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.installPrompt.style.display = 'block';
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            this.installPrompt.style.display = 'none';
            this.showMessage('App installed successfully!', 'success');
        });
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showMessage('App installation not available', 'error');
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted PWA install');
        } else {
            console.log('User dismissed PWA install');
        }
        
        this.deferredPrompt = null;
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        const serviceType = this.serviceType.value;

        if (!query) {
            this.showMessage('Please enter a search term', 'error');
            return;
        }

        this.showLoading(true);
        this.hideError();
        this.hideResults();

        try {
            const results = await this.searchServices(query, serviceType);
            this.displayResults(results, query, serviceType);
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Search failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async searchServices(query, serviceType) {
        const apiUrl = this.searchAPIs[serviceType] || this.searchAPIs.all;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processSearchResults(data, query, serviceType);
        } catch (error) {
            // Fallback to mock data if API fails
            console.warn('API request failed, using mock data:', error);
            return this.getMockResults(query, serviceType);
        }
    }

    processSearchResults(data, query, serviceType) {
        const processedResults = data.slice(0, 10).map(item => {
            return this.transformToServiceResult(item, serviceType);
        });

        // Filter results based on query
        return processedResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    transformToServiceResult(item, serviceType) {
        const serviceTypes = {
            police: {
                title: `${item.name || item.title} Police Station`,
                type: 'Police Station',
                description: `Police services for ${item.name || 'Local Area'}. Contact for non-emergency assistance and inquiries.`,
                phone: this.generatePhoneNumber(),
                address: item.address ? `${item.address.street}, ${item.address.city}` : '123 Main St, City',
                email: item.email || `${(item.name || 'station').toLowerCase().replace(/\s/g, '')}@police.gov`
            },
            emergency: {
                title: `${item.title || item.name} Emergency Services`,
                type: 'Emergency Service',
                description: `Emergency response services. Available 24/7 for urgent situations.`,
                phone: '911',
                address: 'Multiple locations',
                email: 'emergency@services.gov'
            },
            public: {
                title: `${item.title || item.name} Public Office`,
                type: 'Public Office',
                description: `Public services and administrative support. Office hours Monday-Friday 9AM-5PM.`,
                phone: this.generatePhoneNumber(),
                address: '456 Government St, City',
                email: item.email || 'info@publicservices.gov'
            },
            people: {
                title: `${item.name || item.title}`,
                type: 'Personnel',
                description: `Public service personnel. ${item.company?.name || 'Department'} staff member.`,
                phone: item.phone || this.generatePhoneNumber(),
                address: item.address ? `${item.address.street}, ${item.address.city}` : 'Office Location',
                email: item.email || `${(item.name || 'staff').toLowerCase().replace(/\s/g, '')}@services.gov`
            }
        };

        return serviceTypes[serviceType] || serviceTypes.people;
    }

    generatePhoneNumber() {
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `(${areaCode}) ${exchange}-${number}`;
    }

    getMockResults(query, serviceType) {
        const mockData = {
            police: [
                {
                    title: 'Downtown Police Station',
                    type: 'Police Station',
                    description: 'Main police station serving the downtown area. 24/7 service available.',
                    phone: '(555) 123-4567',
                    address: '123 Main St, Downtown',
                    email: 'downtown@police.gov'
                },
                {
                    title: 'Community Police Office',
                    type: 'Police Station',
                    description: 'Community outreach office for non-emergency services.',
                    phone: '(555) 234-5678',
                    address: '456 Community Dr, Suburb',
                    email: 'community@police.gov'
                }
            ],
            emergency: [
                {
                    title: 'Fire & Rescue Services',
                    type: 'Emergency Service',
                    description: 'Emergency fire and rescue services. Call 911 for emergencies.',
                    phone: '911',
                    address: 'Multiple stations',
                    email: 'fire@emergency.gov'
                },
                {
                    title: 'Emergency Medical Services',
                    type: 'Emergency Service',
                    description: 'Emergency medical response and ambulance services.',
                    phone: '911',
                    address: 'Regional coverage',
                    email: 'ems@emergency.gov'
                }
            ],
            public: [
                {
                    title: 'City Hall',
                    type: 'Public Office',
                    description: 'Main administrative office for city services and permits.',
                    phone: '(555) 345-6789',
                    address: '789 Government Plaza',
                    email: 'info@cityhall.gov'
                },
                {
                    title: 'Public Works Department',
                    type: 'Public Office',
                    description: 'Infrastructure maintenance and public utilities.',
                    phone: '(555) 456-7890',
                    address: '101 Works Ave',
                    email: 'works@city.gov'
                }
            ],
            people: [
                {
                    title: 'Chief of Police John Smith',
                    type: 'Personnel',
                    description: 'Police department leadership and administrative oversight.',
                    phone: '(555) 567-8901',
                    address: 'Police Headquarters',
                    email: 'chief@police.gov'
                },
                {
                    title: 'Fire Chief Maria Garcia',
                    type: 'Personnel',
                    description: 'Fire department operations and emergency response coordination.',
                    phone: '(555) 678-9012',
                    address: 'Fire Department HQ',
                    email: 'firechief@emergency.gov'
                }
            ]
        };

        const results = mockData[serviceType] || mockData.police;
        return results.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    displayResults(results, query, serviceType) {
        if (results.length === 0) {
            this.showMessage(`No results found for "${query}" in ${serviceType} services.`, 'info');
            return;
        }

        this.resultsCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
        this.resultsCount.classList.remove('hidden');

        this.results.innerHTML = results.map(result => this.createResultHTML(result)).join('');
        this.resultsContainer.classList.remove('hidden');
    }

    createResultHTML(result) {
        return `
            <div class="result-item">
                <div class="result-title">${result.title}</div>
                <div class="result-type">${result.type}</div>
                <div class="result-description">${result.description}</div>
                <div class="result-contact">
                    <div class="contact-item">
                        <strong>📞</strong> ${result.phone}
                    </div>
                    <div class="contact-item">
                        <strong>📍</strong> ${result.address}
                    </div>
                    <div class="contact-item">
                        <strong>✉️</strong> ${result.email}
                    </div>
                </div>
            </div>
        `;
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('hidden');
        } else {
            this.loadingIndicator.classList.add('hidden');
        }
    }

    showMessage(message, type = 'error') {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.className = `error-message ${type === 'success' ? 'success-message' : type === 'info' ? 'info-message' : 'error-message'}`;
        this.errorMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    hideResults() {
        this.resultsContainer.classList.add('hidden');
        this.resultsCount.classList.add('hidden');
    }

    loadSampleData() {
        // Show some sample data on page load
        this.showMessage('Welcome! Try searching for "police", "fire", or "city hall"', 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicServiceSearchApp();
});

// Add additional CSS for success and info messages
const additionalStyles = `
.success-message {
    background: #e8f5e8 !important;
    color: #2e7d32 !important;
    border-left-color: #2e7d32 !important;
}

.info-message {
    background: #e3f2fd !important;
    color: #1976d2 !important;
    border-left-color: #1976d2 !important;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);