const express = require('express');
const db = require('../db');
const { validateEventBody, validateCategory, validateEventId } = require('../middleware/validate');

const router = express.Router();

// GET /api/events — list all, optionally filtered by category
router.get('/', validateCategory, (req, res) => {
  const { category } = req.query;

  let events;
  if (category) {
    events = db.prepare('SELECT * FROM events WHERE category = ?').all(category);
  } else {
    events = db.prepare('SELECT * FROM events').all();
  }

  res.json(events);
});

// GET /api/events/:id — get single event
router.get('/:id', validateEventId, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

// POST /api/events — create new event
router.post('/', validateEventBody, (req, res) => {
  const { title, date, category } = req.body;

  const result = db.prepare(
    'INSERT INTO events (title, date, category) VALUES (?, ?, ?)'
  ).run(title, date, category);

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

module.exports = router;
