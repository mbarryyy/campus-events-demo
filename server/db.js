const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'campus_events.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    date       TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (count.count === 0) {
  const insert = db.prepare(
    'INSERT INTO events (title, date, category) VALUES (?, ?, ?)'
  );
  const seed = db.transaction(() => {
    insert.run('Web Dev Workshop', '2026-05-10', 'Tech');
    insert.run('AI Hackathon', '2026-05-15', 'Tech');
    insert.run('Campus Soccer Tournament', '2026-05-12', 'Sports');
    insert.run('Basketball Finals', '2026-05-20', 'Sports');
    insert.run('Open Source Meetup', '2026-05-22', 'Tech');
  });
  seed();
}

module.exports = db;
