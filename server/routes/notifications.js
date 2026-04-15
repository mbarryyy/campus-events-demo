const express = require('express');
const { authenticate } = require('../middleware/auth');

function createNotificationsRouter(db) {
  const router = express.Router();

  router.use(authenticate);

  // GET /api/notifications — list user's notifications
  router.get('/', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { total } = db.prepare('SELECT COUNT(*) as total FROM notifications WHERE user_id = ?').get(req.user.id);

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset).map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      read: !!row.read,
      eventId: row.event_id,
      createdAt: row.created_at
    }));

    res.json({
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  });

  // GET /api/notifications/unread-count
  router.get('/unread-count', (req, res) => {
    const { count } = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(req.user.id);
    res.json({ count });
  });

  // PUT /api/notifications/read-all — mark all as read
  router.put('/read-all', (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  });

  // PUT /api/notifications/:id/read — mark single as read
  router.put('/:id/read', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notif = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
    res.json({ message: 'Notification marked as read' });
  });

  return router;
}

// Helper to create notifications from other routes
function createNotification(db, { userId, type, title, message, eventId }) {
  db.prepare(
    'INSERT INTO notifications (user_id, type, title, message, event_id) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, type, title, message, eventId || null);
}

// Notify all registered users of an event
function notifyEventRegistrants(db, { eventId, type, title, message, excludeUserId }) {
  const registrants = db.prepare('SELECT user_id FROM registrations WHERE event_id = ?').all(eventId);
  for (const { user_id } of registrants) {
    if (user_id !== excludeUserId) {
      createNotification(db, { userId: user_id, type, title, message, eventId });
    }
  }
}

module.exports = { createNotificationsRouter, createNotification, notifyEventRegistrants };
