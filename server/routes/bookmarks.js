const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateEventId } = require('../middleware/validate');

function createBookmarksRouter(db) {
  const router = express.Router();

  // GET /api/bookmarks — list user's bookmarked events
  router.get('/', authenticate, (req, res) => {
    const userId = req.user.id;

    const bookmarks = db.prepare(`
      SELECT e.*, b.created_at as bookmarkedAt,
        COALESCE(rc.cnt, 0) as registrationCount,
        u.id as creatorId, u.display_name as creatorDisplayName
      FROM bookmarks b
      JOIN events e ON e.id = b.event_id
      LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM registrations GROUP BY event_id) rc ON rc.event_id = e.id
      LEFT JOIN users u ON u.id = e.created_by
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      time: row.time,
      location: row.location,
      category: row.category,
      capacity: row.capacity,
      imageUrl: row.image_url,
      registrationCount: row.registrationCount,
      createdBy: row.creatorId ? { id: row.creatorId, displayName: row.creatorDisplayName } : null,
      createdAt: row.created_at,
      bookmarkedAt: row.bookmarkedAt
    }));

    res.json({ bookmarks });
  });

  return router;
}

function createEventBookmarkRouter(db) {
  const router = express.Router({ mergeParams: true });

  // POST /api/events/:id/bookmark — add bookmark
  router.post('/', validateEventId, authenticate, (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (existing) {
      return res.status(409).json({ error: 'Event is already bookmarked' });
    }

    db.prepare('INSERT INTO bookmarks (user_id, event_id) VALUES (?, ?)').run(userId, eventId);
    res.status(201).json({ message: 'Event bookmarked' });
  });

  // DELETE /api/events/:id/bookmark — remove bookmark
  router.delete('/', validateEventId, authenticate, (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND event_id = ?').get(userId, eventId);
    if (!existing) {
      return res.status(404).json({ error: 'Event is not bookmarked' });
    }

    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND event_id = ?').run(userId, eventId);
    res.json({ message: 'Bookmark removed' });
  });

  return router;
}

module.exports = { createBookmarksRouter, createEventBookmarkRouter };
