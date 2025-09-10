# Police Raider

A comprehensive tactical police simulation game with strategic resource management, built with Node.js, Express, and modern security practices.

## 🎮 About Police Raider

Police Raider is a web-based tactical simulation game where players manage police operations, allocate resources, and make strategic decisions in law enforcement scenarios. The game features:

- **Tactical Unit Management**: Deploy different types of police units (patrol cars, SWAT teams, K-9 units, helicopters)
- **Mission System**: Complete various missions with different difficulty levels and rewards
- **Resource Management**: Manage unit health, equipment, and experience points
- **Progression System**: Level up units and unlock new capabilities
- **Multiplayer Leaderboards**: Compete with other players for high scores

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API** with comprehensive authentication and authorization
- **SQLite Database** for development, PostgreSQL support for production
- **JWT Authentication** with secure token management
- **Input Validation & Sanitization** using Joi
- **Rate Limiting** and security headers
- **Comprehensive Logging** with Winston
- **Health Checks** and monitoring endpoints

### Security Features
- **Multi-layer Security**: Helmet.js, CORS, rate limiting, input sanitization
- **Authentication & Authorization**: JWT-based with role-based access control
- **Audit Logging**: Security events and user actions tracking
- **Secret Management**: Environment-based configuration
- **Automated Security Scanning**: Dependency audits and code analysis

### DevOps & Deployment
- **Docker Support**: Multi-stage builds with security best practices
- **CI/CD Pipeline**: GitHub Actions with automated testing and security scanning
- **Health Monitoring**: Kubernetes-ready health checks
- **Performance Monitoring**: Built-in metrics and logging

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Docker (optional)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jcotebcs/Police-Raider.git
   cd Police-Raider
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the application**
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t police-raider .
docker run -p 3000:3000 police-raider
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "SecurePassword123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "SecurePassword123!"
}
```

### Game Endpoints

#### Get Game Sessions
```http
GET /api/game/sessions
Authorization: Bearer <jwt_token>
```

#### Create Game Session
```http
POST /api/game/sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "sessionName": "My Mission",
  "difficulty": "normal"
}
```

#### Create Police Unit
```http
POST /api/game/sessions/:sessionId/units
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "unitType": "patrol",
  "unitName": "Patrol Unit 1",
  "positionX": 10,
  "positionY": 20
}
```

#### Get Leaderboard
```http
GET /api/game/leaderboard?difficulty=normal&limit=10
```

### Health & Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe
- `GET /api/health/metrics` - Performance metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run tests in watch mode
npm run test:watch

# Run security scan
npm run security:scan
```

## 🔧 Development

### Project Structure
```
Police-Raider/
├── src/
│   └── server/
│       ├── controllers/     # Request handlers
│       ├── database/        # Database configuration
│       ├── middleware/      # Express middleware
│       ├── models/          # Data models
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       ├── test/           # Test files
│       └── utils/          # Utility functions
├── scripts/                # Build and deployment scripts
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Docker services
├── Dockerfile             # Container definition
└── package.json           # Dependencies and scripts
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Security audit
npm run security:audit
```

## 🔒 Security

### Security Features Implemented

1. **Authentication & Authorization**
   - JWT-based authentication with secure token management
   - Role-based access control (RBAC)
   - Password hashing with bcrypt
   - Session management

2. **Input Validation & Sanitization**
   - Joi schema validation for all inputs
   - XSS protection through sanitization
   - SQL injection prevention with parameterized queries

3. **API Security**
   - Rate limiting on all endpoints
   - Strict rate limiting on authentication endpoints
   - CORS configuration
   - Security headers (Helmet.js)
   - Content Security Policy (CSP)

4. **Data Protection**
   - Environment-based secret management
   - Secure database connections
   - Audit logging for security events
   - Request/response logging

5. **Infrastructure Security**
   - Docker containers run as non-root user
   - Health checks and monitoring
   - Automated security scanning
   - Dependency vulnerability checking

### Security Scanning

The application includes comprehensive security scanning:

```bash
# Run security scan
npm run security:scan

# Check for vulnerable dependencies
npm audit

# Manual security review
node scripts/security-scan.js
```

## 📊 Monitoring

### Health Checks

The application provides multiple health check endpoints:

- **Basic Health**: `/api/health` - Simple status check
- **Detailed Health**: `/api/health/detailed` - Comprehensive system status
- **Readiness**: `/api/health/ready` - Kubernetes readiness probe
- **Liveness**: `/api/health/live` - Kubernetes liveness probe

### Logging

Structured logging with multiple levels:
- **Application Logs**: General application events
- **Security Logs**: Authentication and security events
- **Performance Logs**: Performance metrics and timing
- **Audit Logs**: User actions and data changes

### Metrics

Built-in metrics collection for:
- Response times
- Request counts
- Error rates
- Database query performance
- Memory usage
- CPU utilization

## 🚢 Deployment

### Production Deployment

1. **Environment Configuration**
   ```bash
   # Production environment variables
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   DB_TYPE=postgresql
   DB_HOST=your-db-host
   ```

2. **Database Setup**
   ```bash
   # For PostgreSQL production deployment
   docker-compose --profile postgres up -d
   ```

3. **Container Deployment**
   ```bash
   # Build and deploy
   docker-compose up -d police-raider
   ```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: police-raider
spec:
  replicas: 3
  selector:
    matchLabels:
      app: police-raider
  template:
    metadata:
      labels:
        app: police-raider
    spec:
      containers:
      - name: police-raider
        image: ghcr.io/jcotebcs/police-raider:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: police-raider-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation for API changes
- Run security scans before submitting
- Follow semantic versioning for releases

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [API Documentation](http://localhost:3000/api)
- [Health Status](http://localhost:3000/api/health)
- [Security Reports](./security-reports/)
- [CI/CD Pipeline](.github/workflows/ci-cd.yml)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Police Raider** - Built with ❤️ by the Autonomous Development Agent