import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getDb, getAuthToken } from './setup.js';

describe('Comments API', () => {
  // ── GET /api/events/:id/comments ──

  // GIVEN an event with no comments
  // WHEN GET /api/events/:id/comments
  // THEN returns 200 with empty comments array
  it('returns empty comments list for an event with no comments', async () => {
    const res = await request(getApp()).get('/api/events/1/comments');

    expect(res.status).toBe(200);
    expect(res.body.comments).toEqual([]);
    expect(res.body.pagination).toMatchObject({ page: 1, total: 0, totalPages: 0 });
  });

  // GIVEN an event with comments
  // WHEN GET /api/events/:id/comments
  // THEN returns comments with author info, newest first
  it('returns comments with author info, newest first', async () => {
    const db = getDb();
    const alice = db.prepare('SELECT id FROM users WHERE username = ?').get('alice');
    db.prepare("INSERT INTO comments (event_id, user_id, body, created_at) VALUES (?, ?, ?, datetime('now', '-1 minute'))").run(1, alice.id, 'First comment');
    db.prepare("INSERT INTO comments (event_id, user_id, body, created_at) VALUES (?, ?, ?, datetime('now'))").run(1, alice.id, 'Second comment');

    const res = await request(getApp()).get('/api/events/1/comments');

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.comments[0].body).toBe('Second comment');
    expect(res.body.comments[0].author).toMatchObject({ displayName: 'Alice Wang' });
    expect(res.body.comments[0]).toHaveProperty('id');
    expect(res.body.comments[0]).toHaveProperty('createdAt');
  });

  // GIVEN more comments than one page
  // WHEN GET /api/events/:id/comments?page=2&limit=1
  // THEN returns correct page
  it('paginates comments', async () => {
    const db = getDb();
    const alice = db.prepare('SELECT id FROM users WHERE username = ?').get('alice');
    db.prepare('INSERT INTO comments (event_id, user_id, body) VALUES (?, ?, ?)').run(1, alice.id, 'Comment A');
    db.prepare('INSERT INTO comments (event_id, user_id, body) VALUES (?, ?, ?)').run(1, alice.id, 'Comment B');
    db.prepare('INSERT INTO comments (event_id, user_id, body) VALUES (?, ?, ?)').run(1, alice.id, 'Comment C');

    const res = await request(getApp()).get('/api/events/1/comments?page=2&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 1, total: 3, totalPages: 3 });
  });

  // GIVEN event ID does not exist
  // WHEN GET /api/events/99999/comments
  // THEN returns 404
  it('returns 404 for comments on non-existent event', async () => {
    const res = await request(getApp()).get('/api/events/99999/comments');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Event not found' });
  });

  // ── POST /api/events/:id/comments ──

  // GIVEN an authenticated user
  // WHEN POST /api/events/:id/comments with valid body
  // THEN returns 201 with created comment
  it('creates a comment when authenticated', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    const res = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Great event!' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      body: 'Great event!',
      author: { displayName: 'Alice Wang' },
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
  });

  // GIVEN no auth token
  // WHEN POST /api/events/:id/comments
  // THEN returns 401
  it('rejects comment creation without authentication', async () => {
    const res = await request(getApp())
      .post('/api/events/1/comments')
      .send({ body: 'Hello' });

    expect(res.status).toBe(401);
  });

  // GIVEN an authenticated user
  // WHEN POST with empty/whitespace body
  // THEN returns 400
  it('rejects empty comment body', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    const res = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/1-500 characters/);
  });

  // GIVEN an authenticated user
  // WHEN POST with body over 500 characters
  // THEN returns 400
  it('rejects comment body over 500 characters', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const longBody = 'a'.repeat(501);

    const res = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: longBody });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/1-500 characters/);
  });

  // GIVEN event ID does not exist
  // WHEN POST /api/events/99999/comments
  // THEN returns 404
  it('returns 404 when posting comment on non-existent event', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    const res = await request(getApp())
      .post('/api/events/99999/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Hello' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Event not found' });
  });

  // ── DELETE /api/events/:id/comments/:commentId ──

  // GIVEN a user's own comment
  // WHEN DELETE /api/events/:id/comments/:commentId
  // THEN returns 200 and comment is removed
  it('allows user to delete their own comment', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    const createRes = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'To be deleted' });

    const commentId = createRes.body.id;

    const res = await request(getApp())
      .delete(`/api/events/1/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Comment deleted successfully' });
  });

  // GIVEN a comment by another user
  // WHEN a non-admin tries to DELETE it
  // THEN returns 403
  it('prevents user from deleting another user\'s comment', async () => {
    const aliceToken = getAuthToken('alice@uni.ac.nz', 'password123');
    const bobToken = getAuthToken('bob@uni.ac.nz', 'password123');

    const createRes = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ body: 'Alice\'s comment' });

    const commentId = createRes.body.id;

    const res = await request(getApp())
      .delete(`/api/events/1/comments/${commentId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: 'You can only delete your own comments' });
  });

  // GIVEN a comment by any user
  // WHEN an admin DELETEs it
  // THEN returns 200
  it('allows admin to delete any comment', async () => {
    const aliceToken = getAuthToken('alice@uni.ac.nz', 'password123');
    const adminToken = getAuthToken('admin@campusevents.ac.nz', 'admin123');

    const createRes = await request(getApp())
      .post('/api/events/1/comments')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ body: 'Alice\'s comment' });

    const commentId = createRes.body.id;

    const res = await request(getApp())
      .delete(`/api/events/1/comments/${commentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'Comment deleted successfully' });
  });

  // GIVEN a non-existent comment ID
  // WHEN DELETE /api/events/:id/comments/99999
  // THEN returns 404
  it('returns 404 when deleting non-existent comment', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    const res = await request(getApp())
      .delete('/api/events/1/comments/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Comment not found' });
  });
});
