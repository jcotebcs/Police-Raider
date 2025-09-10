const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logger, logDatabase } = require('../utils/logger');

let db = null;

/**
 * Initialize database connection and create tables
 */
async function initializeDatabase() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = process.env.DB_PATH || path.join(dataDir, 'police-raider.db');
    
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Database connection failed:', err);
          reject(err);
        } else {
          logger.info(`Database connected: ${dbPath}`);
          createTables()
            .then(() => {
              logDatabase('initialize', 'database', { path: dbPath });
              resolve(db);
            })
            .catch(reject);
        }
      });
    });
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Create database tables
 */
async function createTables() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'player',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1,
      profile_data TEXT -- JSON data for user profile
    )`,

    // Game sessions table
    `CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_name VARCHAR(100) NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'normal',
      status VARCHAR(20) DEFAULT 'active',
      score INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      game_data TEXT, -- JSON data for game state
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // Police units table
    `CREATE TABLE IF NOT EXISTS police_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      unit_type VARCHAR(50) NOT NULL,
      unit_name VARCHAR(100) NOT NULL,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      health INTEGER DEFAULT 100,
      equipment TEXT, -- JSON data for equipment
      position_x INTEGER DEFAULT 0,
      position_y INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES game_sessions (id) ON DELETE CASCADE
    )`,

    // Missions table
    `CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      mission_type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      difficulty INTEGER DEFAULT 1,
      reward INTEGER DEFAULT 100,
      status VARCHAR(20) DEFAULT 'available',
      requirements TEXT, -- JSON data for mission requirements
      location_x INTEGER DEFAULT 0,
      location_y INTEGER DEFAULT 0,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES game_sessions (id) ON DELETE CASCADE
    )`,

    // Game statistics table
    `CREATE TABLE IF NOT EXISTS game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stat_type VARCHAR(50) NOT NULL,
      stat_value INTEGER DEFAULT 0,
      date_recorded DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // Audit log table for security
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100),
      details TEXT, -- JSON data
      ip_address VARCHAR(45),
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )`
  ];

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_police_units_session_id ON police_units(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_missions_session_id ON missions(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)'
  ];

  try {
    // Create tables
    for (const table of tables) {
      await runQuery(table);
      logger.info('Table created successfully');
    }

    // Create indexes
    for (const index of indexes) {
      await runQuery(index);
    }

    // Create triggers for updated_at
    const triggers = [
      `CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
       AFTER UPDATE ON users 
       BEGIN 
         UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`,
      
      `CREATE TRIGGER IF NOT EXISTS update_game_sessions_timestamp 
       AFTER UPDATE ON game_sessions 
       BEGIN 
         UPDATE game_sessions SET last_played = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`
    ];

    for (const trigger of triggers) {
      await runQuery(trigger);
    }

    logger.info('Database tables and indexes created successfully');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
}

/**
 * Execute a database query
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.run(sql, params, function(err) {
      if (err) {
        logger.error('Database query error:', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Get a single row from database
 */
function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        logger.error('Database query error:', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get multiple rows from database
 */
function getRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('Database query error:', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get database instance
 */
function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  createTables,
  runQuery,
  getRow,
  getRows,
  closeDatabase,
  getDatabase
};