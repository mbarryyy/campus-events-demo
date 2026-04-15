import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, getAuthToken } from './setup.js';

describe('Auth API', () => {
  // GIVEN valid registration data
  // WHEN POST /api/auth/register
  // THEN returns 201 with user object and token
  it('registers a new user', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({
        username: 'carol',
        email: 'carol@uni.ac.nz',
        password: 'password123',
        displayName: 'Carol Lee'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('carol');
    expect(res.body.user.email).toBe('carol@uni.ac.nz');
    expect(res.body.user.displayName).toBe('Carol Lee');
    expect(res.body.user.role).toBe('user');
  });

  // GIVEN an email that is already registered
  // WHEN POST /api/auth/register with duplicate email
  // THEN returns 400
  it('rejects duplicate email', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({
        username: 'alice2',
        email: 'alice@uni.ac.nz',
        password: 'password123',
        displayName: 'Alice Dup'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN a username that is already taken
  // WHEN POST /api/auth/register with duplicate username
  // THEN returns 400
  it('rejects duplicate username', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({
        username: 'alice',
        email: 'newalice@uni.ac.nz',
        password: 'password123',
        displayName: 'Alice New'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN missing required fields
  // WHEN POST /api/auth/register with empty body
  // THEN returns 400
  it('rejects registration with missing fields', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN a password shorter than 6 characters
  // WHEN POST /api/auth/register
  // THEN returns 400
  it('rejects short password', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({
        username: 'shortpw',
        email: 'shortpw@uni.ac.nz',
        password: '123',
        displayName: 'Short PW'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN valid credentials for an existing user
  // WHEN POST /api/auth/login
  // THEN returns 200 with user and token
  it('logs in with valid credentials', async () => {
    const res = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'alice@uni.ac.nz', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@uni.ac.nz');
  });

  // GIVEN an incorrect password
  // WHEN POST /api/auth/login
  // THEN returns 401
  it('rejects login with wrong password', async () => {
    const res = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'alice@uni.ac.nz', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // GIVEN a valid JWT token
  // WHEN GET /api/auth/me
  // THEN returns 200 with user profile
  it('returns current user with valid token', async () => {
    const token = getAuthToken('alice@uni.ac.nz', 'password123');
    const res = await request(getApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'alice');
    expect(res.body).toHaveProperty('email', 'alice@uni.ac.nz');
    expect(res.body).toHaveProperty('displayName', 'Alice Wang');
    expect(res.body).toHaveProperty('role', 'user');
    expect(res.body).toHaveProperty('createdAt');
  });
});
