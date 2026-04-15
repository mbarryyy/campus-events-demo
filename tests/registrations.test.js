import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getDb, getAuthToken } from './setup.js';

describe('Registrations API', () => {
  // GIVEN an authenticated user and existing event
  // WHEN POST /api/events/:id/register
  // THEN returns 201 with registration
  it('registers user for an event', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Successfully registered');
    expect(res.body).toHaveProperty('registration');
    expect(res.body.registration).toHaveProperty('eventId', 1);
  });

  // GIVEN user already registered for event
  // WHEN POST /api/events/:id/register again
  // THEN returns 409
  it('rejects duplicate registration', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    // Register first
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    // Try again
    const res = await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Already registered for this event');
  });

  // GIVEN a user registered for an event
  // WHEN DELETE /api/events/:id/register
  // THEN returns 200
  it('cancels registration', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    // Register first
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    // Cancel
    const res = await request(getApp())
      .delete('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Registration cancelled' });
  });

  // GIVEN user is not registered for an event
  // WHEN DELETE /api/events/:id/register
  // THEN returns 404
  it('returns 404 when cancelling non-existent registration', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .delete('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not registered for this event');
  });

  // GIVEN no authentication
  // WHEN POST /api/events/:id/register
  // THEN returns 401
  it('rejects registration without auth', async () => {
    const res = await request(getApp())
      .post('/api/events/1/register');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN an event at full capacity
  // WHEN POST /api/events/:id/register
  // THEN returns 409 with capacity error
  it('rejects registration when event is full', async () => {
    const db = getDb();
    // Create a capacity-1 event
    const adminId = db.prepare('SELECT id FROM users WHERE username = ?').get('admin').id;
    db.prepare(
      'INSERT INTO events (title, description, date, time, location, category, capacity, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('Tiny Event', 'Only 1 spot', '2026-07-01', '10:00', 'Room 1', 'Tech', 1, adminId);

    const tinyEventId = db.prepare("SELECT id FROM events WHERE title = 'Tiny Event'").get().id;

    // First user registers (fills capacity)
    const aliceToken = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post(`/api/events/${tinyEventId}/register`)
      .set('Authorization', `Bearer ${aliceToken}`);

    // Second user tries to register
    const bobToken = getAuthToken('bob@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .post(`/api/events/${tinyEventId}/register`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Event is at full capacity');
  });
});
