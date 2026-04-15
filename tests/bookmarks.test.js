import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('Bookmarks API', () => {
  // GIVEN an authenticated user and existing event
  // WHEN POST /api/events/:id/bookmark
  // THEN returns 201
  it('bookmarks an event', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .post('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Event bookmarked');
  });

  // GIVEN user already bookmarked event
  // WHEN POST /api/events/:id/bookmark again
  // THEN returns 409
  it('rejects duplicate bookmark', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(getApp())
      .post('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Event is already bookmarked');
  });

  // GIVEN user has bookmarked an event
  // WHEN DELETE /api/events/:id/bookmark
  // THEN returns 200
  it('removes a bookmark', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(getApp())
      .delete('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Bookmark removed');
  });

  // GIVEN user has not bookmarked the event
  // WHEN DELETE /api/events/:id/bookmark
  // THEN returns 404
  it('returns 404 when removing non-existent bookmark', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .delete('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Event is not bookmarked');
  });

  // GIVEN no authentication
  // WHEN POST /api/events/:id/bookmark
  // THEN returns 401
  it('rejects bookmark without auth', async () => {
    const res = await request(getApp())
      .post('/api/events/1/bookmark');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN user has bookmarked some events
  // WHEN GET /api/bookmarks
  // THEN returns list of bookmarked events
  it('lists bookmarked events', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    await request(getApp())
      .post('/api/events/1/bookmark')
      .set('Authorization', `Bearer ${token}`);
    await request(getApp())
      .post('/api/events/2/bookmark')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(getApp())
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bookmarks');
    expect(res.body.bookmarks).toHaveLength(2);
    expect(res.body.bookmarks[0]).toHaveProperty('title');
    expect(res.body.bookmarks[0]).toHaveProperty('bookmarkedAt');
  });

  // GIVEN event does not exist
  // WHEN POST /api/events/999/bookmark
  // THEN returns 404
  it('returns 404 for non-existent event', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .post('/api/events/999/bookmark')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Event not found');
  });
});
