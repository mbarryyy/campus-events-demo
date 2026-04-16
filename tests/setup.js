import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { beforeEach } from 'vitest';
import { createApp } from '../server/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-events-dev-secret-2026';

let app;
let db;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    UNIQUE NOT NULL,
      email         TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      display_name  TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'user',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT,
      date        TEXT    NOT NULL,
      time        TEXT    NOT NULL,
      location    TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      capacity    INTEGER NOT NULL,
      image_url   TEXT,
      created_by  INTEGER REFERENCES users(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      registered_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT    NOT NULL,
      title      TEXT    NOT NULL,
      message    TEXT    NOT NULL,
      read       INTEGER NOT NULL DEFAULT 0,
      event_id   INTEGER REFERENCES events(id) ON DELETE SET NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed admin
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)'
  ).run('admin', 'admin@campusevents.ac.nz', adminHash, 'System Admin', 'admin');

  // Seed test users
  const userHash = bcrypt.hashSync('password123', 10);
  db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
  ).run('alice', 'alice@uni.ac.nz', userHash, 'Alice Wang');
  db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
  ).run('bob', 'bob@uni.ac.nz', userHash, 'Bob Smith');

  // Seed events (5 events across multiple categories)
  const adminId = db.prepare('SELECT id FROM users WHERE username = ?').get('admin').id;
  const insertEvent = db.prepare(
    'INSERT INTO events (title, description, date, time, location, category, capacity, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertEvent.run('Web Dev Workshop', 'Learn modern web development with React and Express', '2026-05-10', '14:00', 'Engineering Building Room 401', 'Tech', 40, adminId);
  insertEvent.run('AI Hackathon', '24-hour hackathon focused on AI/ML projects', '2026-05-15', '09:00', 'Science Centre Atrium', 'Tech', 100, adminId);
  insertEvent.run('Campus Soccer Tournament', 'Annual inter-faculty soccer championship', '2026-05-12', '10:00', 'Main Sports Field', 'Sports', 200, adminId);
  insertEvent.run('Basketball Finals', 'Season finale of the campus basketball league', '2026-05-20', '18:00', 'Recreation Centre Court A', 'Sports', 150, adminId);
  insertEvent.run('Open Source Meetup', 'Monthly meetup for open source contributors', '2026-05-22', '17:30', 'Library Seminar Room 2', 'Tech', 30, adminId);

  app = createApp(db);
});

export function getApp() {
  return app;
}

export function getDb() {
  return db;
}

/**
 * Get a JWT token for a given user by email/password.
 */
export function getAuthToken(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new Error(`Test user not found: ${email}`);
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) throw new Error(`Invalid password for: ${email}`);
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}
