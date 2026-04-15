const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'campus_events.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
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
`);

// Seed admin account if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    'INSERT INTO users (username, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)'
  ).run('admin', 'admin@campusevents.ac.nz', hash, 'System Admin', 'admin');
}

// Seed events if empty
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (eventCount.count === 0) {
  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  const adminId = adminUser.id;

  const insert = db.prepare(
    'INSERT INTO events (title, description, date, time, location, category, capacity, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const seed = db.transaction(() => {
    insert.run('Web Dev Workshop', 'Learn modern web development with React and Express', '2026-05-10', '14:00', 'Engineering Building Room 401', 'Tech', 40, adminId);
    insert.run('AI Hackathon', '24-hour hackathon focused on AI/ML projects', '2026-05-15', '09:00', 'Science Centre Atrium', 'Tech', 100, adminId);
    insert.run('Campus Soccer Tournament', 'Annual inter-faculty soccer championship', '2026-05-12', '10:00', 'Main Sports Field', 'Sports', 200, adminId);
    insert.run('Basketball Finals', 'Season finale of the campus basketball league', '2026-05-20', '18:00', 'Recreation Centre Court A', 'Sports', 150, adminId);
    insert.run('Open Source Meetup', 'Monthly meetup for open source contributors', '2026-05-22', '17:30', 'Library Seminar Room 2', 'Tech', 30, adminId);
    insert.run('Study Group Meetup', 'Collaborative study session for midterm prep', '2026-06-01', '10:00', 'Kate Edger Room 3B', 'Academic', 25, adminId);
    insert.run('Cultural Night', 'Celebrate campus diversity with food, music, and performances', '2026-06-05', '18:00', 'Quad Lawn Stage', 'Social', 300, adminId);
    insert.run('Debate Competition', 'Inter-university debate on AI ethics in education', '2026-06-08', '13:00', 'Arts Building Lecture Hall', 'Academic', 60, adminId);
    insert.run('Yoga in the Park', 'Beginner-friendly outdoor yoga session', '2026-05-18', '07:30', 'Albert Park Fountain Area', 'Sports', 40, adminId);
    insert.run('Startup Pitch Day', 'Student startups pitch to local investors', '2026-06-10', '09:00', 'Owen Glenn Building WG404', 'Career', 80, adminId);
    insert.run('Photography Walk', 'Guided photo walk around campus landmarks', '2026-05-25', '15:00', 'Clock Tower Meeting Point', 'Social', 20, adminId);
    insert.run('Charity Fun Run', '5K fun run supporting local food banks', '2026-06-15', '08:00', 'Domain Loop Track', 'Sports', 500, adminId);
    insert.run('Machine Learning Workshop', 'Hands-on workshop building ML models with Python', '2026-06-12', '14:00', 'Engineering Building Room 302', 'Tech', 35, adminId);
    insert.run('Career Fair 2026', 'Connect with top employers across industries', '2026-06-20', '10:00', 'Recreation Centre Main Hall', 'Career', 400, adminId);
    insert.run('Jazz Night', 'Live jazz performances by student musicians', '2026-05-28', '19:30', 'Shadows Bar Stage', 'Music', 80, adminId);
    insert.run('Resume Writing Clinic', 'Get expert feedback on your resume', '2026-06-02', '11:00', 'Student Commons Room 4', 'Career', 30, adminId);
    insert.run('Spring Dance', 'End-of-semester dance party', '2026-06-22', '20:00', 'Old Government House Ballroom', 'Social', 200, adminId);
    insert.run('Research Symposium', 'Postgrad research presentations and networking', '2026-06-18', '09:00', 'Conference Centre Level 1', 'Academic', 120, adminId);
    insert.run('Acoustic Open Mic', 'Open mic night for singers and instrumentalists', '2026-06-08', '18:30', 'Quad Lawn Stage', 'Music', 100, adminId);
    insert.run('Swimming Gala', 'Inter-faculty swimming competition', '2026-06-25', '14:00', 'Aquatic Centre', 'Sports', 150, adminId);
  });
  seed();
}

module.exports = db;
