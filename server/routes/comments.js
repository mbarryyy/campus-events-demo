const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateEventId } = require('../middleware/validate');

function createCommentsRouter(db) {
  const router = express.Router({ mergeParams: true });

  // GET /api/events/:id/comments — public, paginated, newest-first
  router.get('/', validateEventId, (req, res) => {
    const eventId = req.params.id;

    const event = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { total } = db.prepare(
      'SELECT COUNT(*) as total FROM comments WHERE event_id = ?'
    ).get(eventId);

    const rows = db.prepare(`
      SELECT c.id, c.body, c.created_at, c.user_id,
        u.display_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.event_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `).all(eventId, limit, offset);

    const comments = rows.map(row => ({
      id: row.id,
      body: row.body,
      author: { id: row.user_id, displayName: row.display_name },
      createdAt: row.created_at,
    }));

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // POST /api/events/:id/comments — authenticated
  router.post('/', validateEventId, authenticate, (req, res) => {
    const eventId = req.params.id;

    const event = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const raw = req.body.body;
    if (raw === undefined || raw === null) {
      return res.status(400).json({ error: 'Comment body is required and must be 1-500 characters' });
    }

    const body = String(raw).trim();
    if (body.length < 1 || body.length > 500) {
      return res.status(400).json({ error: 'Comment body is required and must be 1-500 characters' });
    }

    const result = db.prepare(
      'INSERT INTO comments (event_id, user_id, body) VALUES (?, ?, ?)'
    ).run(eventId, req.user.id, body);

    const comment = db.prepare(`
      SELECT c.id, c.body, c.created_at, c.user_id,
        u.display_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      id: comment.id,
      body: comment.body,
      author: { id: comment.user_id, displayName: comment.display_name },
      createdAt: comment.created_at,
    });
  });

  // DELETE /api/events/:id/comments/:commentId — owner or admin
  router.delete('/:commentId', validateEventId, authenticate, (req, res) => {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId) || commentId < 1) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const comment = db.prepare(
      'SELECT id, user_id FROM comments WHERE id = ? AND event_id = ?'
    ).get(commentId, req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
    res.json({ message: 'Comment deleted successfully' });
  });

  return router;
}

module.exports = createCommentsRouter;
