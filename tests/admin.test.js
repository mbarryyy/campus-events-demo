import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('Admin API', () => {
  // GIVEN admin credentials
  // WHEN GET /api/admin/stats
  // THEN returns 200 with stats shape
  it('returns stats for admin', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('totalEvents');
    expect(res.body).toHaveProperty('totalRegistrations');
    expect(res.body).toHaveProperty('recentRegistrations');
    expect(res.body).toHaveProperty('eventsByCategory');
    expect(res.body).toHaveProperty('upcomingEvents');
    expect(res.body.totalUsers).toBe(3);
    expect(res.body.totalEvents).toBe(5);
  });

  // GIVEN non-admin credentials
  // WHEN GET /api/admin/stats
  // THEN returns 403
  it('rejects stats for non-admin', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN admin credentials
  // WHEN GET /api/admin/users
  // THEN returns 200 with users and pagination
  it('returns users list for admin', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.users.length).toBe(3);
    expect(res.body.users[0]).toHaveProperty('id');
    expect(res.body.users[0]).toHaveProperty('username');
    expect(res.body.users[0]).toHaveProperty('email');
    expect(res.body.users[0]).toHaveProperty('displayName');
    expect(res.body.users[0]).toHaveProperty('role');
    expect(res.body.users[0]).toHaveProperty('registrationCount');
  });

  // GIVEN admin credentials and search query
  // WHEN GET /api/admin/users?search=alice
  // THEN returns filtered users
  it('searches users by name', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .get('/api/admin/users?search=alice')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].username).toBe('alice');
  });

  // GIVEN admin credentials and event with registrations
  // WHEN GET /api/admin/events/:id/attendees
  // THEN returns 200 with event and attendees
  it('returns attendees for an event', async () => {
    // Register alice for event 1 first
    const aliceToken = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${aliceToken}`);

    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .get('/api/admin/events/1/attendees')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('event');
    expect(res.body.event).toHaveProperty('id', 1);
    expect(res.body.event).toHaveProperty('title');
    expect(res.body).toHaveProperty('attendees');
    expect(res.body.attendees.length).toBe(1);
    expect(res.body.attendees[0]).toHaveProperty('username', 'alice');
    expect(res.body).toHaveProperty('total', 1);
  });

  // GIVEN non-admin credentials
  // WHEN GET /api/admin/events/:id/attendees
  // THEN returns 403
  it('rejects attendees request from non-admin', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/admin/events/1/attendees')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});
