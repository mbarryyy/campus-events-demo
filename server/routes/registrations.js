const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateEventId } = require('../middleware/validate');

function createRegistrationsRouter(db) {
  const router = express.Router({ mergeParams: true });

  // POST /api/events/:id/register — register for event
  router.post('/', validateEventId, authenticate, (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = db.prepare('SELECT id, capacity FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (existing) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Check capacity
    const { count } = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?').get(eventId);
    if (count >= event.capacity) {
      return res.status(409).json({ error: 'Event is at full capacity' });
    }

    const result = db.prepare(
      'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)'
    ).run(userId, eventId);

    const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Successfully registered',
      registration: {
        id: registration.id,
        eventId: registration.event_id,
        userId: registration.user_id,
        registeredAt: registration.registered_at
      }
    });
  });

  // DELETE /api/events/:id/register — cancel registration
  router.delete('/', validateEventId, authenticate, (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (!existing) {
      return res.status(404).json({ error: 'Not registered for this event' });
    }

    db.prepare('DELETE FROM registrations WHERE user_id = ? AND event_id = ?').run(userId, eventId);
    res.json({ message: 'Registration cancelled' });
  });

  return router;
}

module.exports = createRegistrationsRouter;
