import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('Profile API', () => {
  // GIVEN an authenticated user
  // WHEN PUT /api/auth/profile with new displayName
  // THEN returns 200 with updated user
  it('updates display name', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'Alice Updated' });

    expect(res.status).toBe(200);
    expect(res.body.displayName).toBe('Alice Updated');
    expect(res.body.email).toBe('alice@uni.ac.nz');
  });

  // GIVEN an authenticated user
  // WHEN PUT /api/auth/profile with new email
  // THEN returns 200 with updated email
  it('updates email', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'newalice@uni.ac.nz' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('newalice@uni.ac.nz');
  });

  // GIVEN an authenticated user
  // WHEN PUT /api/auth/profile with empty displayName
  // THEN returns 400
  it('rejects empty display name', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN an authenticated user
  // WHEN PUT /api/auth/profile with duplicate email
  // THEN returns 400
  it('rejects duplicate email', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'bob@uni.ac.nz' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN an authenticated user with correct current password
  // WHEN PUT /api/auth/password with valid new password
  // THEN returns 200
  it('changes password successfully', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newpass456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password updated successfully');
  });

  // GIVEN an authenticated user with wrong current password
  // WHEN PUT /api/auth/password
  // THEN returns 401
  it('rejects password change with wrong current password', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpass', newPassword: 'newpass456' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN an authenticated user
  // WHEN PUT /api/auth/password with short new password
  // THEN returns 400
  it('rejects short new password', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: '12' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN an authenticated user with registrations
  // WHEN GET /api/auth/activity
  // THEN returns 200 with activity list
  it('returns user activity', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');

    // Register for an event first
    await request(getApp())
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(getApp())
      .get('/api/auth/activity')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('activity');
    expect(res.body.activity).toHaveLength(1);
    expect(res.body.activity[0]).toHaveProperty('event');
    expect(res.body.activity[0].event).toHaveProperty('id', 1);
    expect(res.body.activity[0].event).toHaveProperty('title');
  });

  // GIVEN no authentication
  // WHEN GET /api/auth/activity
  // THEN returns 401
  it('rejects activity without auth', async () => {
    const res = await request(getApp())
      .get('/api/auth/activity');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
