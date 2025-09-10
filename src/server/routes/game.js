const express = require('express');
const Joi = require('joi');
const router = express.Router();

const { runQuery, getRow, getRows } = require('../database/init');
const { logger, logDatabase } = require('../utils/logger');
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');
const { authenticateToken, sanitizeInput, optionalAuth } = require('../middleware/security');

// Validation schemas
const createSessionSchema = Joi.object({
  sessionName: Joi.string().min(1).max(100).required(),
  difficulty: Joi.string().valid('easy', 'normal', 'hard', 'expert').default('normal')
});

const updateSessionSchema = Joi.object({
  sessionName: Joi.string().min(1).max(100).optional(),
  difficulty: Joi.string().valid('easy', 'normal', 'hard', 'expert').optional(),
  score: Joi.number().integer().min(0).optional(),
  level: Joi.number().integer().min(1).optional(),
  gameData: Joi.object().optional()
});

const createUnitSchema = Joi.object({
  unitType: Joi.string().valid('patrol', 'swat', 'detective', 'k9', 'helicopter').required(),
  unitName: Joi.string().min(1).max(100).required(),
  positionX: Joi.number().integer().default(0),
  positionY: Joi.number().integer().default(0)
});

/**
 * Get all game sessions for the authenticated user
 */
router.get('/sessions', authenticateToken, asyncHandler(async (req, res) => {
  const sessions = await getRows(
    `SELECT id, session_name, difficulty, status, score, level, 
            started_at, last_played, completed_at 
     FROM game_sessions 
     WHERE user_id = ? 
     ORDER BY last_played DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    sessions: sessions.map(session => ({
      id: session.id,
      sessionName: session.session_name,
      difficulty: session.difficulty,
      status: session.status,
      score: session.score,
      level: session.level,
      startedAt: session.started_at,
      lastPlayed: session.last_played,
      completedAt: session.completed_at
    }))
  });
}));

/**
 * Create a new game session
 */
router.post('/sessions', authenticateToken, sanitizeInput, asyncHandler(async (req, res) => {
  const { error, value } = createSessionSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  const { sessionName, difficulty } = value;

  const result = await runQuery(
    'INSERT INTO game_sessions (user_id, session_name, difficulty) VALUES (?, ?, ?)',
    [req.user.id, sessionName, difficulty]
  );

  logDatabase('create', 'game_sessions', {
    sessionId: result.id,
    userId: req.user.id,
    sessionName,
    difficulty
  });

  logger.info('New game session created', {
    sessionId: result.id,
    userId: req.user.id,
    sessionName,
    difficulty
  });

  res.status(201).json({
    success: true,
    message: 'Game session created successfully',
    session: {
      id: result.id,
      sessionName,
      difficulty,
      status: 'active',
      score: 0,
      level: 1
    }
  });
}));

/**
 * Get specific game session details
 */
router.get('/sessions/:sessionId', authenticateToken, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.sessionId);
  
  const session = await getRow(
    `SELECT * FROM game_sessions WHERE id = ? AND user_id = ?`,
    [sessionId, req.user.id]
  );

  if (!session) {
    throw new NotFoundError('Game session not found');
  }

  // Get police units for this session
  const units = await getRows(
    `SELECT id, unit_type, unit_name, level, experience, health, 
            equipment, position_x, position_y, status, created_at
     FROM police_units 
     WHERE session_id = ?`,
    [sessionId]
  );

  // Get missions for this session
  const missions = await getRows(
    `SELECT id, mission_type, title, description, difficulty, reward, 
            status, requirements, location_x, location_y, 
            started_at, completed_at, created_at
     FROM missions 
     WHERE session_id = ?`,
    [sessionId]
  );

  res.json({
    success: true,
    session: {
      id: session.id,
      sessionName: session.session_name,
      difficulty: session.difficulty,
      status: session.status,
      score: session.score,
      level: session.level,
      gameData: session.game_data ? JSON.parse(session.game_data) : {},
      startedAt: session.started_at,
      lastPlayed: session.last_played,
      completedAt: session.completed_at,
      units: units.map(unit => ({
        id: unit.id,
        unitType: unit.unit_type,
        unitName: unit.unit_name,
        level: unit.level,
        experience: unit.experience,
        health: unit.health,
        equipment: unit.equipment ? JSON.parse(unit.equipment) : {},
        position: { x: unit.position_x, y: unit.position_y },
        status: unit.status,
        createdAt: unit.created_at
      })),
      missions: missions.map(mission => ({
        id: mission.id,
        missionType: mission.mission_type,
        title: mission.title,
        description: mission.description,
        difficulty: mission.difficulty,
        reward: mission.reward,
        status: mission.status,
        requirements: mission.requirements ? JSON.parse(mission.requirements) : {},
        location: { x: mission.location_x, y: mission.location_y },
        startedAt: mission.started_at,
        completedAt: mission.completed_at,
        createdAt: mission.created_at
      }))
    }
  });
}));

/**
 * Update game session
 */
router.put('/sessions/:sessionId', authenticateToken, sanitizeInput, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.sessionId);
  
  const { error, value } = updateSessionSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Verify session ownership
  const session = await getRow(
    'SELECT id FROM game_sessions WHERE id = ? AND user_id = ?',
    [sessionId, req.user.id]
  );

  if (!session) {
    throw new NotFoundError('Game session not found');
  }

  const updates = [];
  const values = [];

  Object.entries(value).forEach(([key, val]) => {
    if (val !== undefined) {
      switch (key) {
        case 'sessionName':
          updates.push('session_name = ?');
          values.push(val);
          break;
        case 'difficulty':
          updates.push('difficulty = ?');
          values.push(val);
          break;
        case 'score':
          updates.push('score = ?');
          values.push(val);
          break;
        case 'level':
          updates.push('level = ?');
          values.push(val);
          break;
        case 'gameData':
          updates.push('game_data = ?');
          values.push(JSON.stringify(val));
          break;
      }
    }
  });

  if (updates.length > 0) {
    values.push(sessionId);
    await runQuery(
      `UPDATE game_sessions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    logDatabase('update', 'game_sessions', {
      sessionId,
      userId: req.user.id,
      updates: Object.keys(value)
    });
  }

  res.json({
    success: true,
    message: 'Game session updated successfully'
  });
}));

/**
 * Create a police unit
 */
router.post('/sessions/:sessionId/units', authenticateToken, sanitizeInput, asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.sessionId);
  
  const { error, value } = createUnitSchema.validate(req.body);
  if (error) {
    throw new ValidationError('Validation failed', error.details);
  }

  // Verify session ownership
  const session = await getRow(
    'SELECT id FROM game_sessions WHERE id = ? AND user_id = ?',
    [sessionId, req.user.id]
  );

  if (!session) {
    throw new NotFoundError('Game session not found');
  }

  const { unitType, unitName, positionX, positionY } = value;

  const result = await runQuery(
    `INSERT INTO police_units (session_id, unit_type, unit_name, position_x, position_y) 
     VALUES (?, ?, ?, ?, ?)`,
    [sessionId, unitType, unitName, positionX, positionY]
  );

  logDatabase('create', 'police_units', {
    unitId: result.id,
    sessionId,
    userId: req.user.id,
    unitType,
    unitName
  });

  res.status(201).json({
    success: true,
    message: 'Police unit created successfully',
    unit: {
      id: result.id,
      unitType,
      unitName,
      level: 1,
      experience: 0,
      health: 100,
      position: { x: positionX, y: positionY },
      status: 'available'
    }
  });
}));

/**
 * Get leaderboard
 */
router.get('/leaderboard', optionalAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const difficulty = req.query.difficulty;

  let sql = `
    SELECT u.username, gs.difficulty, gs.score, gs.level, gs.completed_at
    FROM game_sessions gs
    JOIN users u ON gs.user_id = u.id
    WHERE gs.status = 'completed'
  `;
  
  const params = [];
  
  if (difficulty && ['easy', 'normal', 'hard', 'expert'].includes(difficulty)) {
    sql += ' AND gs.difficulty = ?';
    params.push(difficulty);
  }
  
  sql += ' ORDER BY gs.score DESC, gs.completed_at ASC LIMIT ?';
  params.push(limit);

  const leaderboard = await getRows(sql, params);

  res.json({
    success: true,
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      difficulty: entry.difficulty,
      score: entry.score,
      level: entry.level,
      completedAt: entry.completed_at
    }))
  });
}));

module.exports = router;