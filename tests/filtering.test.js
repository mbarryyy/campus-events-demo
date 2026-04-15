import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp } from './setup.js';

describe('Advanced Filtering', () => {
  // GIVEN events with dates in May and June 2026
  // WHEN GET /api/events?dateFrom=2026-05-15&dateTo=2026-05-22
  // THEN returns only events within that range
  it('filters by date range', async () => {
    const res = await request(getApp())
      .get('/api/events?dateFrom=2026-05-15&dateTo=2026-05-22');

    expect(res.status).toBe(200);
    res.body.events.forEach((event) => {
      expect(event.date >= '2026-05-15').toBe(true);
      expect(event.date <= '2026-05-22').toBe(true);
    });
    expect(res.body.events.length).toBeGreaterThan(0);
  });

  // GIVEN events with dateFrom only
  // WHEN GET /api/events?dateFrom=2026-05-20
  // THEN returns events on or after that date
  it('filters by dateFrom only', async () => {
    const res = await request(getApp())
      .get('/api/events?dateFrom=2026-05-20');

    expect(res.status).toBe(200);
    res.body.events.forEach((event) => {
      expect(event.date >= '2026-05-20').toBe(true);
    });
  });

  // GIVEN all events have capacity > 0 and no registrations
  // WHEN GET /api/events?hasSpots=true
  // THEN returns events with available spots
  it('filters events with available spots', async () => {
    const res = await request(getApp())
      .get('/api/events?hasSpots=true');

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThan(0);
    res.body.events.forEach((event) => {
      expect(event.spotsLeft).toBeGreaterThan(0);
    });
  });

  // GIVEN events at various times
  // WHEN GET /api/events?timeOfDay=morning
  // THEN returns only morning events (06:00-12:00)
  it('filters by morning time of day', async () => {
    const res = await request(getApp())
      .get('/api/events?timeOfDay=morning');

    expect(res.status).toBe(200);
    res.body.events.forEach((event) => {
      expect(event.time >= '06:00').toBe(true);
      expect(event.time < '12:00').toBe(true);
    });
  });

  // GIVEN events at various times
  // WHEN GET /api/events?timeOfDay=afternoon
  // THEN returns only afternoon events (12:00-18:00)
  it('filters by afternoon time of day', async () => {
    const res = await request(getApp())
      .get('/api/events?timeOfDay=afternoon');

    expect(res.status).toBe(200);
    res.body.events.forEach((event) => {
      expect(event.time >= '12:00').toBe(true);
      expect(event.time < '18:00').toBe(true);
    });
  });

  // GIVEN events in list response
  // WHEN GET /api/events
  // THEN each event includes isPast and spotsLeft
  it('includes isPast and spotsLeft in list response', async () => {
    const res = await request(getApp()).get('/api/events');

    expect(res.status).toBe(200);
    res.body.events.forEach((event) => {
      expect(event).toHaveProperty('isPast');
      expect(event).toHaveProperty('spotsLeft');
      expect(typeof event.isPast).toBe('boolean');
      expect(typeof event.spotsLeft).toBe('number');
    });
  });
});
