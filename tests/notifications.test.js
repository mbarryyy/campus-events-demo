import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getDb, getAuthToken } from './setup.js';

describe('Notifications API', () => {
  // Helper to seed a notification directly
  function seedNotification(db, userId, opts = {}) {
    db.prepare(
      'INSERT INTO notifications (user_id, type, title, message, event_id) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, opts.type || 'info', opts.title || 'Test', opts.message || 'Test message', opts.eventId || null);
  }

  // GIVEN an authenticated user with notifications
  // WHEN GET /api/notifications
  // THEN returns 200 with notifications and pagination
  it('lists user notifications', async () => {
    const db = getDb();
    const alice = db.prepare("SELECT id FROM users WHERE username = 'alice'").get();
    seedNotification(db, alice.id, { title: 'Welcome', message: 'Welcome to CampusEvents' });
    seedNotification(db, alice.id, { title: 'Reminder', message: 'Event tomorrow' });

    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notifications');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.notifications).toHaveLength(2);
    expect(res.body.notifications[0]).toHaveProperty('id');
    expect(res.body.notifications[0]).toHaveProperty('type');
    expect(res.body.notifications[0]).toHaveProperty('title');
    expect(res.body.notifications[0]).toHaveProperty('message');
    expect(res.body.notifications[0]).toHaveProperty('read', false);
  });

  // GIVEN an authenticated user with unread notifications
  // WHEN GET /api/notifications/unread-count
  // THEN returns count of unread
  it('returns unread count', async () => {
    const db = getDb();
    const alice = db.prepare("SELECT id FROM users WHERE username = 'alice'").get();
    seedNotification(db, alice.id);
    seedNotification(db, alice.id);

    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 2);
  });

  // GIVEN an authenticated user with a notification
  // WHEN PUT /api/notifications/:id/read
  // THEN marks it as read
  it('marks single notification as read', async () => {
    const db = getDb();
    const alice = db.prepare("SELECT id FROM users WHERE username = 'alice'").get();
    seedNotification(db, alice.id);
    const notif = db.prepare('SELECT id FROM notifications WHERE user_id = ?').get(alice.id);

    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Notification marked as read');

    // Verify it's read
    const countRes = await request(getApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(countRes.body.count).toBe(0);
  });

  // GIVEN an authenticated user with multiple unread notifications
  // WHEN PUT /api/notifications/read-all
  // THEN marks all as read
  it('marks all notifications as read', async () => {
    const db = getDb();
    const alice = db.prepare("SELECT id FROM users WHERE username = 'alice'").get();
    seedNotification(db, alice.id);
    seedNotification(db, alice.id);
    seedNotification(db, alice.id);

    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'All notifications marked as read');

    const countRes = await request(getApp())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(countRes.body.count).toBe(0);
  });

  // GIVEN notification belongs to another user
  // WHEN PUT /api/notifications/:id/read
  // THEN returns 404
  it('returns 404 for other user notification', async () => {
    const db = getDb();
    const bob = db.prepare("SELECT id FROM users WHERE username = 'bob'").get();
    seedNotification(db, bob.id);
    const notif = db.prepare('SELECT id FROM notifications WHERE user_id = ?').get(bob.id);

    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Notification not found');
  });

  // GIVEN no authentication
  // WHEN GET /api/notifications
  // THEN returns 401
  it('rejects without auth', async () => {
    const res = await request(getApp())
      .get('/api/notifications');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN registration creates a notification
  // WHEN user registers for an event
  // THEN notification is created automatically
  it('creates notification on event registration', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    // Register for event
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    // Check notifications
    const res = await request(getApp())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
  });

  // GIVEN a user registers for an event
  // WHEN checking notifications
  // THEN exactly 1 registration notification exists (no duplicates)
  it('creates exactly one notification per registration (no duplicates)', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    // Register for event
    const regRes = await request(getApp())
      .post('/api/events/3/register')
      .set('Authorization', `Bearer ${token}`);
    expect(regRes.status).toBe(201);

    // Check notifications — should have exactly 1 registration_confirmed
    const res = await request(getApp())
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const regNotifications = res.body.notifications.filter(
      n => n.type === 'registration_confirmed' && n.message.includes('Campus Soccer Tournament')
    );
    expect(regNotifications).toHaveLength(1);
  });
});
