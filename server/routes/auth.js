const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

function createAuthRouter(db) {
  const router = express.Router();

  function generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // POST /api/auth/register
  router.post('/register', (req, res) => {
    const { username, email, password, displayName } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const trimmedUsername = String(username).trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!displayName || !String(displayName).trim()) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Check uniqueness
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(trimmedUsername);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
    ).run(trimmedUsername, trimmedEmail, hash, String(displayName).trim());

    const user = {
      id: result.lastInsertRowid,
      username: trimmedUsername,
      email: trimmedEmail,
      displayName: String(displayName).trim(),
      role: 'user'
    };

    const token = generateToken({ ...user, id: Number(user.id) });
    res.status(201).json({ user, token });
  });

  // POST /api/auth/login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      token
    });
  });

  // GET /api/auth/me
  router.get('/me', authenticate, (req, res) => {
    const user = db.prepare('SELECT id, username, email, display_name, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at
    });
  });

  // PUT /api/auth/profile — update displayName and/or email
  router.put('/profile', authenticate, (req, res) => {
    const { displayName, email } = req.body;
    const userId = req.user.id;

    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!current) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};

    if (displayName !== undefined) {
      const trimmed = String(displayName).trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'Display name cannot be empty' });
      }
      updates.display_name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (trimmed !== current.email) {
        const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(trimmed, userId);
        if (existing) {
          return res.status(400).json({ error: 'Email is already registered' });
        }
      }
      updates.email = trimmed;
    }

    const sets = [];
    const values = [];
    for (const [col, val] of Object.entries(updates)) {
      sets.push(`${col} = ?`);
      values.push(val);
    }

    if (sets.length > 0) {
      values.push(userId);
      db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT id, username, email, display_name, role, created_at FROM users WHERE id = ?').get(userId);
    res.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      displayName: updated.display_name,
      role: updated.role,
      createdAt: updated.created_at
    });
  });

  // PUT /api/auth/password — change password
  router.put('/password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);

    res.json({ message: 'Password updated successfully' });
  });

  // GET /api/auth/activity — user's recent registrations
  router.get('/activity', authenticate, (req, res) => {
    const userId = req.user.id;

    const registrations = db.prepare(`
      SELECT r.id, r.registered_at,
        e.id as eventId, e.title as eventTitle, e.date as eventDate,
        e.time as eventTime, e.category as eventCategory, e.location as eventLocation
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.user_id = ?
      ORDER BY r.registered_at DESC
      LIMIT 50
    `).all(userId).map(row => ({
      id: row.id,
      registeredAt: row.registered_at,
      event: {
        id: row.eventId,
        title: row.eventTitle,
        date: row.eventDate,
        time: row.eventTime,
        category: row.eventCategory,
        location: row.eventLocation
      }
    }));

    res.json({ activity: registrations });
  });

  // GET /api/auth/dashboard — user stats
  router.get('/dashboard', authenticate, (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const eventsRegistered = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE user_id = ?').get(userId).count;
    const upcomingCount = db.prepare(`
      SELECT COUNT(*) as count FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.user_id = ? AND e.date >= ?
    `).get(userId, today).count;
    const pastCount = db.prepare(`
      SELECT COUNT(*) as count FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.user_id = ? AND e.date < ?
    `).get(userId, today).count;
    const bookmarkCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?').get(userId).count;

    // Next 3 upcoming registered events
    const upcomingEvents = db.prepare(`
      SELECT e.id, e.title, e.date, e.time, e.location, e.category
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.user_id = ? AND e.date >= ?
      ORDER BY e.date ASC, e.time ASC
      LIMIT 3
    `).all(userId, today);

    res.json({
      eventsRegistered,
      upcomingCount,
      pastCount,
      bookmarkCount,
      upcomingEvents
    });
  });

  return router;
}

module.exports = createAuthRouter;
