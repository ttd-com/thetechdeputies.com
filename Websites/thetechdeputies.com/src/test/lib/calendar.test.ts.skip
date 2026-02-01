import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNextSevenDaysEvents,
  getAvailableSpots,
  isEventFull,
  validateEventTime,
  formatDateTimeForDisplay,
} from '@/lib/calendar';

describe('Calendar Utilities', () => {
  describe('getNextSevenDaysEvents', () => {
    it('should return 7 days of dates', () => {
      const events = getNextSevenDaysEvents();
      expect(events).toHaveLength(7);
    });

    it('should filter events within 10am-4pm window', () => {
      const events = getNextSevenDaysEvents(10, 16);
      events.forEach((event) => {
        const hour = new Date(event.startTime).getHours();
        expect(hour).toBeGreaterThanOrEqual(10);
        expect(hour).toBeLessThan(16);
      });
    });

    it('should support custom hour range', () => {
      const events = getNextSevenDaysEvents(9, 17);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableSpots', () => {
    it('should return capacity minus booked count', async () => {
      // Mock event with capacity: 5, bookedCount: 2
      const spots = await getAvailableSpots('event-id-1');
      expect(spots).toBe(3);
    });

    it('should return 0 if fully booked', async () => {
      // Mock event with capacity: 2, bookedCount: 2
      const spots = await getAvailableSpots('event-id-full');
      expect(spots).toBe(0);
    });
  });

  describe('isEventFull', () => {
    it('should return true if bookedCount >= capacity', async () => {
      const full = await isEventFull('event-id-full');
      expect(full).toBe(true);
    });

    it('should return false if bookedCount < capacity', async () => {
      const full = await isEventFull('event-id-available');
      expect(full).toBe(false);
    });
  });

  describe('validateEventTime', () => {
    it('should validate time within 10am-4pm', () => {
      const valid = validateEventTime(new Date('2026-02-01T14:00:00Z'));
      expect(valid).toBe(true);
    });

    it('should reject time before 10am', () => {
      const valid = validateEventTime(new Date('2026-02-01T09:00:00Z'));
      expect(valid).toBe(false);
    });

    it('should reject time at or after 4pm', () => {
      const valid = validateEventTime(new Date('2026-02-01T16:00:00Z'));
      expect(valid).toBe(false);
    });
  });

  describe('formatDateTimeForDisplay', () => {
    it('should format date as human-readable string', () => {
      const formatted = formatDateTimeForDisplay(new Date('2026-02-01T14:30:00Z'));
      expect(formatted).toContain('February');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('2:30 PM');
    });
  });
});
