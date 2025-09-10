# Police Raider

A secure, production-ready crime data search application with comprehensive API integration and security hardening.

## 🚀 Features

- **Secure API Integration**: Mock adapters with fallback to real crime data APIs
- **Production Security**: Rate limiting, input validation, XSS protection, security headers
- **Comprehensive Testing**: Unit tests, integration tests, security validation
- **CI/CD Ready**: GitHub Actions with automated testing and security scanning
- **Container Support**: Multi-stage Docker builds with security best practices
- **Structured Logging**: Winston with automatic PII redaction
- **Modern Frontend**: Responsive design with security-first JavaScript

## 🛡️ Security Features

- ✅ **API Key Management**: Secure environment variable handling with validation
- ✅ **Rate Limiting**: Tiered protection against abuse (100/50/25 requests per 15min)
- ✅ **Input Validation**: Express-validator with XSS protection
- ✅ **Security Headers**: Helmet.js with CSP, HSTS, and frame protection
- ✅ **CORS Configuration**: Origin validation and secure defaults
- ✅ **Error Handling**: Environment-aware error disclosure
- ✅ **PII Protection**: Automatic redaction in logs
- ✅ **Container Security**: Non-root user, minimal attack surface

## 🏗️ Architecture

```
Frontend (React-style JS) 
    ↓
Express.js API Server
    ↓  
API Client Factory
    ↓
Mock/Real API Adapters
    ↓
External Crime Data APIs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd Police-Raider
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API keys (optional - works with mock data)
```

3. **Start in development mode**:
```bash
npm run dev
```

4. **Visit the application**:
Open http://localhost:3000 in your browser

### Production Deployment

1. **Build Docker container**:
```bash
docker build -t police-raider .
```

2. **Run with production settings**:
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e POLICE_RAIDER_MODE=staging \
  -e RAPIDAPI_KEY=your_key_here \
  police-raider
```

## 📖 API Documentation

### Endpoints

#### Health Checks
- `GET /health` - System health status
- `GET /readiness` - Application readiness check

#### Crime Data
- `GET /api/crime/search?location={location}&crimeType={type}` - Search crime data
- `GET /api/crime/incident/{incidentId}` - Get incident details

#### API Information
- `GET /api` - API information and available endpoints

### Example Requests

```bash
# Search for crime in downtown area
curl "http://localhost:3000/api/crime/search?location=downtown"

# Get specific incident details  
curl "http://localhost:3000/api/crime/incident/INC-001"

# Check system health
curl "http://localhost:3000/health"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Runtime environment | `development` | No |
| `PORT` | Server port | `3000` | No |
| `POLICE_RAIDER_MODE` | API mode (mock/staging/prod) | `mock` | No |
| `RAPIDAPI_KEY` | RapidAPI authentication key | - | Prod only |
| `CRIME_DATA_API_KEY` | Crime data API key | - | Prod only |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Operating Modes

- **`mock`**: Uses simulated data, no API keys required (default)
- **`staging`**: Uses real APIs with staging configuration  
- **`prod`**: Full production mode with all security enabled

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Security audit
npm audit
```

## 🐳 Docker

### Development
```bash
docker build -t police-raider:dev .
docker run -p 3000:3000 -e POLICE_RAIDER_MODE=mock police-raider:dev
```

### Production
```bash
docker build -t police-raider:prod .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e POLICE_RAIDER_MODE=prod \
  -e RAPIDAPI_KEY=$RAPIDAPI_KEY \
  police-raider:prod
```

## 🔄 CI/CD

The project includes a complete GitHub Actions workflow:

- ✅ **Automated Testing**: Unit and integration tests
- ✅ **Code Quality**: ESLint and security auditing  
- ✅ **Security Scanning**: Trivy vulnerability scanning
- ✅ **Container Builds**: Multi-stage Docker builds
- ✅ **Smoke Testing**: Automated endpoint validation
- ✅ **Deployment**: Staging and production pipelines

## 📊 Monitoring & Logging

### Health Checks
- `/health` - Basic health status
- `/readiness` - Dependency readiness  

### Logging
- **Structured JSON logs** with Winston
- **Automatic PII redaction** (SSN, email, phone, etc.)
- **Request correlation IDs** for tracing
- **Configurable log levels** and rotation

### Metrics (Available)
- Request rates and response times
- Error rates by endpoint
- API client health (mock vs real)
- Rate limit violations

## 🔒 Security Considerations

### Production Checklist
- [ ] Configure real API keys in secure environment variables
- [ ] Update CORS origins for production domain
- [ ] Set up log aggregation and monitoring
- [ ] Configure SSL/TLS certificates  
- [ ] Review API rate limits with providers
- [ ] Set up security incident response procedures
- [ ] Conduct penetration testing
- [ ] Review compliance requirements (GDPR, etc.)

### Known Security Measures
- **No secrets in codebase** - All sensitive data via environment variables
- **Rate limiting** - Protects against abuse and DoS
- **Input validation** - All user inputs sanitized and validated
- **Security headers** - Comprehensive HTTP security headers  
- **Error handling** - No sensitive information in error responses
- **PII protection** - Automatic redaction in logs and responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`  
4. Run linting: `npm run lint:fix`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📋 Project Structure

```
Police-Raider/
├── src/
│   ├── adapters/           # API client abstractions
│   ├── config/             # Configuration management
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   └── server.js           # Main application entry
├── public/                 # Frontend static files
├── tests/                  # Test suites
├── .github/workflows/      # CI/CD configuration
├── audit-report.md         # Security audit results
├── findings.json           # Machine-readable findings
├── architecture.mmd        # System architecture diagram
├── bibliography.md         # Security standards reference
└── Dockerfile              # Container configuration
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See audit-report.md for comprehensive security details
- **Issues**: Please use GitHub Issues for bug reports
- **Security**: Report security issues via private disclosure

---

**⚡ Built with security-first principles and production-ready from day one.**