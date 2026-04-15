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

  return router;
}

module.exports = createAuthRouter;
