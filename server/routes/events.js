const express = require('express');
const { validateEventBody, validateCategory, validateEventId } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { notifyEventRegistrants } = require('./notifications');

function createEventsRouter(db) {
  const router = express.Router();

  // GET /api/events — list with pagination, sort, filter, search
  router.get('/', validateCategory, (req, res) => {
    const { category, search, sort, dateFrom, dateTo, hasSpots, timeOfDay } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('e.category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    // Date range filters
    if (dateFrom) {
      conditions.push('e.date >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('e.date <= ?');
      params.push(dateTo);
    }

    // Has spots available filter
    if (hasSpots === 'true') {
      conditions.push('(e.capacity - COALESCE(rc_filter.cnt, 0)) > 0');
    }

    // Time of day filter
    if (timeOfDay === 'morning') {
      conditions.push("e.time >= '06:00' AND e.time < '12:00'");
    } else if (timeOfDay === 'afternoon') {
      conditions.push("e.time >= '12:00' AND e.time < '18:00'");
    } else if (timeOfDay === 'evening') {
      conditions.push("e.time >= '18:00'");
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Sort options
    let orderClause;
    switch (sort) {
      case 'date_desc':
        orderClause = 'ORDER BY e.date DESC, e.time DESC';
        break;
      case 'newest':
        orderClause = 'ORDER BY e.created_at DESC';
        break;
      case 'oldest':
        orderClause = 'ORDER BY e.created_at ASC';
        break;
      default: // date_asc
        orderClause = 'ORDER BY e.date ASC, e.time ASC';
    }

    // Need the registration count subquery in FROM for hasSpots filter
    const rcFilterJoin = hasSpots === 'true'
      ? 'LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM registrations GROUP BY event_id) rc_filter ON rc_filter.event_id = e.id'
      : '';

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM events e ${rcFilterJoin} ${whereClause}`;
    const { total } = db.prepare(countSql).get(...params);

    // Fetch events with registration count and creator info
    const today = new Date().toISOString().slice(0, 10);
    const sql = `
      SELECT e.*,
        COALESCE(rc.cnt, 0) as registrationCount,
        u.id as creatorId,
        u.display_name as creatorDisplayName
      FROM events e
      LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM registrations GROUP BY event_id) rc ON rc.event_id = e.id
      LEFT JOIN users u ON u.id = e.created_by
      ${rcFilterJoin}
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(sql).all(...params, limit, offset);

    const events = rows.map(row => ({
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
      spotsLeft: row.capacity - row.registrationCount,
      isPast: row.date < today,
      createdBy: row.creatorId ? { id: row.creatorId, displayName: row.creatorDisplayName } : null,
      createdAt: row.created_at
    }));

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  });

  // GET /api/events/:id — single event with registration info
  router.get('/:id', validateEventId, optionalAuth, (req, res) => {
    const row = db.prepare(`
      SELECT e.*,
        COALESCE(rc.cnt, 0) as registrationCount,
        u.id as creatorId,
        u.display_name as creatorDisplayName
      FROM events e
      LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM registrations GROUP BY event_id) rc ON rc.event_id = e.id
      LEFT JOIN users u ON u.id = e.created_by
      WHERE e.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = {
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
      spotsLeft: row.capacity - row.registrationCount,
      isPast: row.date < new Date().toISOString().slice(0, 10),
      createdBy: row.creatorId ? { id: row.creatorId, displayName: row.creatorDisplayName } : null,
      createdAt: row.created_at
    };

    if (req.user) {
      const reg = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(req.user.id, req.params.id);
      event.isRegistered = !!reg;
      const bm = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND event_id = ?').get(req.user.id, req.params.id);
      event.isBookmarked = !!bm;
    } else {
      event.isRegistered = false;
      event.isBookmarked = false;
    }

    res.json(event);
  });

  // GET /api/events/:id/attendees — public, limited info
  router.get('/:id/attendees', validateEventId, (req, res) => {
    const event = db.prepare('SELECT id, title FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { total } = db.prepare('SELECT COUNT(*) as total FROM registrations WHERE event_id = ?').get(req.params.id);

    const attendees = db.prepare(`
      SELECT u.id, u.display_name
      FROM registrations r
      JOIN users u ON u.id = r.user_id
      WHERE r.event_id = ?
      ORDER BY r.registered_at ASC
      LIMIT 5
    `).all(req.params.id).map(row => ({
      id: row.id,
      displayName: row.display_name
    }));

    res.json({
      event: { id: event.id, title: event.title },
      attendees,
      total
    });
  });

  // POST /api/events — create (admin only)
  router.post('/', authenticate, requireAdmin, validateEventBody, (req, res) => {
    const { title, date, time, location, category, capacity, description } = req.body;
    const imageUrl = req.body.imageUrl || null;

    const result = db.prepare(
      'INSERT INTO events (title, description, date, time, location, category, capacity, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, description || null, date, time, location, category, capacity, imageUrl, req.user.id);

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      capacity: event.capacity,
      imageUrl: event.image_url,
      createdBy: req.user.id,
      createdAt: event.created_at
    });
  });

  // PUT /api/events/:id — update (admin only)
  router.put('/:id', authenticate, requireAdmin, validateEventId, (req, res) => {
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const fields = {};
    const allowedFields = ['title', 'description', 'date', 'time', 'location', 'category', 'capacity', 'imageUrl'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields[field] = req.body[field];
      }
    }

    // Validate provided fields
    if (fields.title !== undefined) {
      const t = String(fields.title).trim();
      if (t.length < 1 || t.length > 100) {
        return res.status(400).json({ error: 'Title must be between 1 and 100 characters' });
      }
      fields.title = t;
    }
    if (fields.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    if (fields.time !== undefined && !/^\d{2}:\d{2}$/.test(fields.time)) {
      return res.status(400).json({ error: 'Time must be in HH:MM format' });
    }
    if (fields.category !== undefined) {
      const { VALID_CATEGORIES } = require('../middleware/validate');
      if (!VALID_CATEGORIES.includes(fields.category)) {
        return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
    }
    if (fields.capacity !== undefined) {
      const cap = Number(fields.capacity);
      if (!Number.isInteger(cap) || cap < 1) {
        return res.status(400).json({ error: 'Capacity must be a positive integer' });
      }
      fields.capacity = cap;
    }
    if (fields.description !== undefined) {
      const desc = String(fields.description).trim();
      if (desc.length > 1000) {
        return res.status(400).json({ error: 'Description must be 1000 characters or fewer' });
      }
      fields.description = desc || null;
    }

    // Build update SQL
    const sets = [];
    const values = [];
    const fieldMap = {
      title: 'title', description: 'description', date: 'date', time: 'time',
      location: 'location', category: 'category', capacity: 'capacity', imageUrl: 'image_url'
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (fields[key] !== undefined) {
        sets.push(`${col} = ?`);
        values.push(fields[key]);
      }
    }

    if (sets.length > 0) {
      values.push(req.params.id);
      db.prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`).run(...values);

      // Notify registered users about the update
      notifyEventRegistrants(db, {
        eventId: req.params.id,
        type: 'event_updated',
        title: 'Event Updated',
        message: `"${existing.title}" has been updated. Check the latest details.`
      });
    }

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      date: updated.date,
      time: updated.time,
      location: updated.location,
      category: updated.category,
      capacity: updated.capacity,
      imageUrl: updated.image_url,
      createdAt: updated.created_at
    });
  });

  // DELETE /api/events/:id — delete (admin only)
  router.delete('/:id', authenticate, requireAdmin, validateEventId, (req, res) => {
    const existing = db.prepare('SELECT id, title FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Notify registered users before deleting
    notifyEventRegistrants(db, {
      eventId: req.params.id,
      type: 'event_cancelled',
      title: 'Event Cancelled',
      message: `"${existing.title}" has been cancelled.`
    });

    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  });

  return router;
}

module.exports = createEventsRouter;
