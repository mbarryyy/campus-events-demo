import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('Events API', () => {
  // GIVEN the database has 5 seed events
  // WHEN GET /api/events
  // THEN returns 200 with pagination shape
  it('returns events with pagination', async () => {
    const res = await request(getApp()).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('events');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.events).toHaveLength(5);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      total: 5,
      totalPages: 1
    });
    expect(res.body.events[0]).toHaveProperty('id');
    expect(res.body.events[0]).toHaveProperty('title');
    expect(res.body.events[0]).toHaveProperty('registrationCount');
  });

  // GIVEN the database has 3 Tech events
  // WHEN GET /api/events?category=Tech
  // THEN returns only Tech events
  it('filters events by category', async () => {
    const res = await request(getApp()).get('/api/events?category=Tech');

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(3);
    res.body.events.forEach((event) => {
      expect(event.category).toBe('Tech');
    });
  });

  // GIVEN a seed event titled "Web Dev Workshop"
  // WHEN GET /api/events?search=workshop
  // THEN returns matching events
  it('searches events by keyword', async () => {
    const res = await request(getApp()).get('/api/events?search=workshop');

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(1);
    const titles = res.body.events.map((e) => e.title.toLowerCase());
    expect(titles.some((t) => t.includes('workshop'))).toBe(true);
  });

  // GIVEN 5 events in database
  // WHEN GET /api/events?page=1&limit=2
  // THEN returns paginated results
  it('paginates events', async () => {
    const res = await request(getApp()).get('/api/events?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3
    });
  });

  // GIVEN event with ID 1 exists
  // WHEN GET /api/events/1
  // THEN returns event with registrationCount and spotsLeft
  it('returns single event by ID', async () => {
    const res = await request(getApp()).get('/api/events/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('registrationCount');
    expect(res.body).toHaveProperty('spotsLeft');
    expect(res.body).toHaveProperty('isRegistered', false);
  });

  // GIVEN no event with ID 999
  // WHEN GET /api/events/999
  // THEN returns 404
  it('returns 404 for non-existent event', async () => {
    const res = await request(getApp()).get('/api/events/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Event not found' });
  });

  // GIVEN admin credentials
  // WHEN POST /api/events with valid event data
  // THEN returns 201 with created event
  it('creates event as admin', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Event',
        description: 'Test event',
        date: '2026-07-01',
        time: '14:00',
        location: 'Room 101',
        category: 'Tech',
        capacity: 50
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('New Event');
  });

  // GIVEN non-admin user credentials
  // WHEN POST /api/events
  // THEN returns 403
  it('rejects event creation by non-admin', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unauthorized Event',
        date: '2026-07-01',
        time: '14:00',
        location: 'Room 101',
        category: 'Tech',
        capacity: 50
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN no authentication
  // WHEN POST /api/events
  // THEN returns 401
  it('rejects event creation without auth', async () => {
    const res = await request(getApp())
      .post('/api/events')
      .send({
        title: 'No Auth Event',
        date: '2026-07-01',
        time: '14:00',
        location: 'Room 101',
        category: 'Tech',
        capacity: 50
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN admin credentials and existing event
  // WHEN PUT /api/events/:id with updated title
  // THEN returns 200 with updated event
  it('updates event as admin', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .put('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Workshop' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Workshop');
  });

  // GIVEN admin credentials and existing event
  // WHEN DELETE /api/events/:id
  // THEN returns 200
  it('deletes event as admin', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .delete('/api/events/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Event deleted successfully' });
  });

  // GIVEN admin credentials
  // WHEN POST /api/events with missing required fields
  // THEN returns 400
  it('rejects event creation with missing fields', async () => {
    const token = getAuthToken('admin@campusevents.ac.nz', 'admin123');
    const res = await request(getApp())
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
