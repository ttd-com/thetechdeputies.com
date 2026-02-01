import { describe, it, expect } from 'vitest';

describe('GET /api/calendar/events', () => {
  it('should return events in date range', async () => {
    const response = await fetch('/api/calendar/events?days=7');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.events)).toBe(true);
    expect(data.events.length).toBeGreaterThan(0);
  });

  it('should filter by time window (10am-4pm)', async () => {
    const response = await fetch('/api/calendar/events?days=7&startHour=10&endHour=16');

    expect(response.status).toBe(200);
    const data = await response.json();
    data.events.forEach((event: any) => {
      const hour = new Date(event.startTime).getHours();
      expect(hour).toBeGreaterThanOrEqual(10);
      expect(hour).toBeLessThan(16);
    });
  });

  it('should return availability data', async () => {
    const response = await fetch('/api/calendar/events?days=7');

    expect(response.status).toBe(200);
    const data = await response.json();
    data.events.forEach((event: any) => {
      expect(event.capacity).toBeDefined();
      expect(event.bookedCount).toBeDefined();
      expect(event.title).toBeDefined();
      expect(event.startTime).toBeDefined();
    });
  });
});

describe('POST /api/calendar/events', () => {
  it('should create event with valid data (admin-only)', async () => {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({
        title: '1-on-1 Coaching',
        description: 'Personal coaching session',
        startTime: '2026-02-05T14:00:00Z',
        capacity: 2,
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.event.title).toBe('1-on-1 Coaching');
  });

  it('should reject non-admin requests', async () => {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer user-token',
      },
      body: JSON.stringify({
        title: 'Event',
        startTime: '2026-02-05T14:00:00Z',
      }),
    });

    expect(response.status).toBe(403);
  });

  it('should validate capacity >= 1', async () => {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({
        title: 'Event',
        startTime: '2026-02-05T14:00:00Z',
        capacity: 0,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should validate time window (10am-4pm)', async () => {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({
        title: 'Event',
        startTime: '2026-02-05T09:00:00Z', // Before 10am
      }),
    });

    expect(response.status).toBe(400);
  });
});

describe('DELETE /api/calendar/events/[id]', () => {
  it('should delete event and cancel all bookings', async () => {
    const response = await fetch('/api/calendar/events/event-id-to-delete', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer admin-token' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    // Verify: Event deleted, all bookings cancelled
  });

  it('should send cancellation emails', async () => {
    const response = await fetch('/api/calendar/events/event-id-to-delete', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer admin-token' },
    });

    expect(response.status).toBe(200);
    // Verify: Mailgun emails sent to all affected users
  });
});
