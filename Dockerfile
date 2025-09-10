# Multi-stage build for security and efficiency
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/
COPY public/ ./public/

# Create logs directory
RUN mkdir -p logs

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R appuser:appgroup logs

# Switch to non-root user
USER appuser

# Expose port (non-privileged)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { \
        hostname: 'localhost', \
        port: 3000, \
        path: '/health', \
        timeout: 3000 \
    }; \
    const req = http.request(options, (res) => { \
        if (res.statusCode === 200) process.exit(0); \
        else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Set environment variables
ENV NODE_ENV=production
ENV POLICE_RAIDER_MODE=staging

# Start the application
CMD ["node", "src/server.js"]