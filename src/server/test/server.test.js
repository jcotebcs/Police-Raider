const request = require('supertest');
const PoliceRaiderServer = require('../index');
const { closeDatabase } = require('../database/init');
const fs = require('fs').promises;

describe('Police Raider Server', () => {
  let server;
  let app;
  const testDbPath = './data/test-police-raider.db';

  beforeAll(async () => {
    // Use test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_PATH = testDbPath;
    process.env.JWT_SECRET = 'test-secret';
    
    server = new PoliceRaiderServer();
    app = await server.start();
  });

  afterAll(async () => {
    if (app) {
      app.close();
    }
    await closeDatabase();
    
    // Clean up test database
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // File might not exist
    }
  });

  describe('Health Endpoints', () => {
    test('GET /api/health should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    test('GET /api/health/detailed should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
    });

    test('GET /api/health/ready should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
    });

    test('GET /api/health/live should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
    });
  });

  describe('API Root', () => {
    test('GET /api should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Police Raider API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('game');
      expect(response.body.endpoints).toHaveProperty('health');
    });
  });

  describe('Authentication Endpoints', () => {
    const testUser = {
      username: 'testuser' + Date.now(), // Make unique
      email: 'test' + Date.now() + '@example.com',
      password: 'TestPassword123!'
    };

    test('POST /api/auth/register should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('role', 'player');
    });

    test('POST /api/auth/register should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'a', // too short
          email: 'invalid-email',
          password: '123' // too weak
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Validation Error');
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', testUser.username);
    });

    test('POST /api/auth/login should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('Game Endpoints', () => {
    let authToken;
    let sessionId;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });
      
      authToken = loginResponse.body.token;
    });

    test('GET /api/game/sessions should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/game/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.sessions).toEqual([]);
    });

    test('POST /api/game/sessions should create new game session', async () => {
      const response = await request(app)
        .post('/api/game/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionName: 'Test Session',
          difficulty: 'normal'
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.session).toHaveProperty('sessionName', 'Test Session');
      expect(response.body.session).toHaveProperty('difficulty', 'normal');
      
      sessionId = response.body.session.id;
    });

    test('GET /api/game/sessions/:id should return session details', async () => {
      const response = await request(app)
        .get(`/api/game/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.session).toHaveProperty('id', sessionId);
      expect(response.body.session).toHaveProperty('units');
      expect(response.body.session).toHaveProperty('missions');
    });

    test('POST /api/game/sessions/:id/units should create police unit', async () => {
      const response = await request(app)
        .post(`/api/game/sessions/${sessionId}/units`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          unitType: 'patrol',
          unitName: 'Patrol Unit 1',
          positionX: 10,
          positionY: 20
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.unit).toHaveProperty('unitType', 'patrol');
      expect(response.body.unit).toHaveProperty('unitName', 'Patrol Unit 1');
    });

    test('GET /api/game/leaderboard should return leaderboard', async () => {
      const response = await request(app)
        .get('/api/game/leaderboard')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('leaderboard');
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Route not found');
    });

    test('Unauthorized requests should return 401', async () => {
      const response = await request(app)
        .get('/api/game/sessions')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Access token required');
    });
  });
});