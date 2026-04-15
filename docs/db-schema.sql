-- CampusEvents Database Schema
-- SQLite (better-sqlite3)

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  date       TEXT    NOT NULL,   -- YYYY-MM-DD format
  category   TEXT    NOT NULL,   -- 'Tech' or 'Sports'
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Seed data (5 events across 2 categories)
INSERT INTO events (title, date, category) VALUES
  ('Web Dev Workshop',         '2026-05-10', 'Tech'),
  ('AI Hackathon',             '2026-05-15', 'Tech'),
  ('Campus Soccer Tournament', '2026-05-12', 'Sports'),
  ('Basketball Finals',        '2026-05-20', 'Sports'),
  ('Open Source Meetup',       '2026-05-22', 'Tech');
