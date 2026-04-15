const express = require('express');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

function createAdminRouter(db) {
  const router = express.Router();

  router.use(authenticate, requireAdmin);

  // GET /api/admin/stats
  router.get('/stats', (req, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
    const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE date >= date('now')").get().count;

    const recentRegistrations = db.prepare(`
      SELECT r.id, r.registered_at,
        u.display_name as userDisplayName,
        e.title as eventTitle
      FROM registrations r
      JOIN users u ON u.id = r.user_id
      JOIN events e ON e.id = r.event_id
      ORDER BY r.registered_at DESC
      LIMIT 10
    `).all().map(row => ({
      id: row.id,
      user: { displayName: row.userDisplayName },
      event: { title: row.eventTitle },
      registeredAt: row.registered_at
    }));

    const categoryRows = db.prepare('SELECT category, COUNT(*) as count FROM events GROUP BY category').all();
    const eventsByCategory = {};
    for (const row of categoryRows) {
      eventsByCategory[row.category] = row.count;
    }

    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      recentRegistrations,
      eventsByCategory,
      upcomingEvents
    });
  });

  // GET /api/admin/users
  router.get('/users', (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { total } = db.prepare(`SELECT COUNT(*) as total FROM users u ${whereClause}`).get(...params);

    const users = db.prepare(`
      SELECT u.id, u.username, u.email, u.display_name, u.role, u.created_at,
        COALESCE(rc.cnt, 0) as registrationCount
      FROM users u
      LEFT JOIN (SELECT user_id, COUNT(*) as cnt FROM registrations GROUP BY user_id) rc ON rc.user_id = u.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset).map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      registrationCount: row.registrationCount,
      createdAt: row.created_at
    }));

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  });

  // GET /api/admin/events/:id/attendees
  router.get('/events/:id/attendees', (req, res) => {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId) || eventId < 1) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = db.prepare('SELECT id, title FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendees = db.prepare(`
      SELECT u.id, u.username, u.display_name, r.registered_at
      FROM registrations r
      JOIN users u ON u.id = r.user_id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `).all(eventId).map(row => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      registeredAt: row.registered_at
    }));

    res.json({
      event: { id: event.id, title: event.title },
      attendees,
      total: attendees.length
    });
  });

  return router;
}

module.exports = createAdminRouter;
