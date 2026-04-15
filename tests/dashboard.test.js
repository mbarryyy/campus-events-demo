import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('User Dashboard API', () => {
  // GIVEN an authenticated user with no registrations
  // WHEN GET /api/auth/dashboard
  // THEN returns 200 with zero counts
  it('returns dashboard stats for user', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/auth/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('eventsRegistered', 0);
    expect(res.body).toHaveProperty('upcomingCount', 0);
    expect(res.body).toHaveProperty('pastCount', 0);
    expect(res.body).toHaveProperty('bookmarkCount', 0);
    expect(res.body).toHaveProperty('upcomingEvents');
    expect(res.body.upcomingEvents).toHaveLength(0);
  });

  // GIVEN user registered for events and has bookmarks
  // WHEN GET /api/auth/dashboard
  // THEN counts reflect registrations and bookmarks
  it('reflects registrations and bookmarks', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    // Register for 2 events
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);
    await request(getApp())
      .post('/api/events/2/register')
      .set('Authorization', `Bearer ${token}`);

    // Bookmark 1 event
    await request(getApp())
      .post('/api/events/3/bookmark')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(getApp())
      .get('/api/auth/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.eventsRegistered).toBe(2);
    expect(res.body.bookmarkCount).toBe(1);
    expect(res.body.upcomingEvents.length).toBeGreaterThanOrEqual(0);
  });

  // GIVEN no authentication
  // WHEN GET /api/auth/dashboard
  // THEN returns 401
  it('rejects dashboard without auth', async () => {
    const res = await request(getApp())
      .get('/api/auth/dashboard');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Public Attendees API', () => {
  // GIVEN an event with registered attendees
  // WHEN GET /api/events/:id/attendees
  // THEN returns limited attendee info (no auth required)
  it('returns public attendee list', async () => {
    // Register alice for event 1
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    // Public endpoint - no auth needed
    const res = await request(getApp())
      .get('/api/events/1/attendees');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('event');
    expect(res.body.event).toHaveProperty('id', 1);
    expect(res.body.event).toHaveProperty('title');
    expect(res.body).toHaveProperty('attendees');
    expect(res.body.attendees).toHaveLength(1);
    expect(res.body.attendees[0]).toHaveProperty('displayName');
    expect(res.body).toHaveProperty('total', 1);
  });

  // GIVEN non-existent event
  // WHEN GET /api/events/999/attendees
  // THEN returns 404
  it('returns 404 for non-existent event attendees', async () => {
    const res = await request(getApp())
      .get('/api/events/999/attendees');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Event not found' });
  });

  // GIVEN event with no attendees
  // WHEN GET /api/events/:id/attendees
  // THEN returns empty attendees array
  it('returns empty attendees for event with no registrations', async () => {
    const res = await request(getApp())
      .get('/api/events/1/attendees');

    expect(res.status).toBe(200);
    expect(res.body.attendees).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });
});
