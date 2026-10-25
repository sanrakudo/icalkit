import { describe, it, expect } from 'vitest';
import { clean, cleanCalendar } from './cleaner.js';
import { parseICalContent } from '../common/parser.js';

describe('cleanCalendar', () => {
  const basicCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
SUMMARY:Meeting 1
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
DTEND:20240102T150000Z
SUMMARY:Meeting 2
END:VEVENT
END:VCALENDAR`;

  const calendarWithDuplicateUID = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Meeting 1
END:VEVENT
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Meeting 1 (duplicate)
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
SUMMARY:Meeting 2
END:VEVENT
END:VCALENDAR`;

  const calendarWithDuplicateContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Same Meeting
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240101T100000Z
SUMMARY:Same Meeting
END:VEVENT
BEGIN:VEVENT
UID:event3@example.com
DTSTART:20240102T140000Z
SUMMARY:Different Meeting
END:VEVENT
END:VCALENDAR`;

  const calendarWithCancelled = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Active Meeting
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
SUMMARY:Cancelled Meeting
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

  const calendarWithTentative = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Confirmed Meeting
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
SUMMARY:Tentative Meeting
STATUS:TENTATIVE
END:VEVENT
END:VCALENDAR`;

  const calendarWithEmpty = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Normal Meeting
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
END:VEVENT
BEGIN:VEVENT
UID:event3@example.com
SUMMARY:No Start Date
END:VEVENT
END:VCALENDAR`;

  const calendarWithTimezones = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar//EN
BEGIN:VTIMEZONE
TZID:Asia/Tokyo
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0900
TZOFFSETTO:+0900
END:STANDARD
END:VTIMEZONE
BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:-0500
TZOFFSETTO:-0500
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:event1@example.com
DTSTART;TZID=Asia/Tokyo:20240101T100000
SUMMARY:Tokyo Meeting
END:VEVENT
END:VCALENDAR`;

  describe('error handling', () => {
    it('should throw error when no options provided', () => {
      expect(() => cleanCalendar(basicCalendar)).toThrow(
        'At least one clean option is required',
      );
    });

    it('should throw error when empty options provided', () => {
      expect(() => cleanCalendar(basicCalendar, {})).toThrow(
        'At least one clean option is required',
      );
    });
  });

  describe('duplicate removal by UID', () => {
    it('should remove duplicate events with same UID', () => {
      const result = cleanCalendar(calendarWithDuplicateUID, {
        duplicates: 'uid',
      });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.duplicates).toBe(1);
      expect(result.content).toContain('event1@example.com');
      expect(result.content).toContain('event2@example.com');
    });

    it('should keep first occurrence when removing UID duplicates', () => {
      const result = cleanCalendar(calendarWithDuplicateUID, {
        duplicates: 'uid',
      });

      expect(result.content).toContain('Meeting 1');
      expect(result.content).not.toContain('Meeting 1 (duplicate)');
    });

    it('should not remove events with different UIDs', () => {
      const result = cleanCalendar(basicCalendar, { duplicates: 'uid' });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.duplicates).toBe(0);
    });
  });

  describe('duplicate removal by content', () => {
    it('should remove duplicate events with same start time and summary', () => {
      const result = cleanCalendar(calendarWithDuplicateContent, {
        duplicates: 'content',
      });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.duplicates).toBe(1);
    });

    it('should keep events with different content', () => {
      const result = cleanCalendar(basicCalendar, { duplicates: 'content' });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.duplicates).toBe(0);
    });
  });

  describe('cancelled event removal', () => {
    it('should remove cancelled events', () => {
      const result = cleanCalendar(calendarWithCancelled, {
        removeCancelled: true,
      });

      expect(result.eventCount).toBe(1);
      expect(result.metadata.removedByReason.cancelled).toBe(1);
      expect(result.content).toContain('Active Meeting');
      expect(result.content).not.toContain('Cancelled Meeting');
    });

    it('should not affect non-cancelled events', () => {
      const result = cleanCalendar(basicCalendar, { removeCancelled: true });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.cancelled).toBe(0);
    });
  });

  describe('tentative event removal', () => {
    it('should remove tentative events', () => {
      const result = cleanCalendar(calendarWithTentative, {
        removeTentative: true,
      });

      expect(result.eventCount).toBe(1);
      expect(result.metadata.removedByReason.tentative).toBe(1);
      expect(result.content).toContain('Confirmed Meeting');
      expect(result.content).not.toContain('Tentative Meeting');
    });

    it('should not affect non-tentative events', () => {
      const result = cleanCalendar(basicCalendar, { removeTentative: true });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.tentative).toBe(0);
    });
  });

  describe('empty event removal', () => {
    it('should remove events without summary', () => {
      const result = cleanCalendar(calendarWithEmpty, { removeEmpty: true });

      expect(result.eventCount).toBe(1);
      expect(result.metadata.removedByReason.empty).toBe(2);
      expect(result.content).toContain('Normal Meeting');
    });

    it('should remove events without DTSTART', () => {
      const result = cleanCalendar(calendarWithEmpty, { removeEmpty: true });

      expect(result.metadata.removedByReason.empty).toBe(2);
    });

    it('should not affect complete events', () => {
      const result = cleanCalendar(basicCalendar, { removeEmpty: true });

      expect(result.eventCount).toBe(2);
      expect(result.metadata.removedByReason.empty).toBe(0);
    });
  });

  describe('orphaned timezone removal', () => {
    it('should remove unreferenced timezones', () => {
      const result = cleanCalendar(calendarWithTimezones, {
        removeOrphanedTimezones: true,
      });

      expect(result.metadata.removedByReason.orphanedTimezones).toBe(1);
      expect(result.content).toContain('Asia/Tokyo');
      expect(result.content).not.toContain('America/New_York');
    });

    it('should keep referenced timezones', () => {
      const result = cleanCalendar(calendarWithTimezones, {
        removeOrphanedTimezones: true,
      });

      expect(result.content).toContain('VTIMEZONE');
      expect(result.content).toContain('Asia/Tokyo');
    });
  });

  describe('combined options', () => {
    it('should apply multiple clean options', () => {
      const mixedCalendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Normal
END:VEVENT
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
SUMMARY:Duplicate
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
SUMMARY:Cancelled
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

      const result = cleanCalendar(mixedCalendar, {
        duplicates: 'uid',
        removeCancelled: true,
      });

      expect(result.eventCount).toBe(1);
      expect(result.metadata.removedByReason.duplicates).toBe(1);
      expect(result.metadata.removedByReason.cancelled).toBe(1);
    });
  });

  describe('metadata', () => {
    it('should include correct metadata', () => {
      const result = cleanCalendar(calendarWithDuplicateUID, {
        duplicates: 'uid',
      });

      expect(result.metadata.cleanedAt).toBeInstanceOf(Date);
      expect(result.metadata.originalEventCount).toBe(3);
      expect(result.metadata.removedCount).toBe(1);
    });

    it('should include removed item details', () => {
      const result = cleanCalendar(calendarWithCancelled, {
        removeCancelled: true,
      });

      expect(result.metadata.removedItems).toHaveLength(1);
      expect(result.metadata.removedItems[0].reason).toBe('cancelled');
      expect(result.metadata.removedItems[0].summary).toBe('Cancelled Meeting');
    });
  });

  describe('input handling', () => {
    it('should handle ParsedCalendar input', () => {
      const parsed = parseICalContent(basicCalendar);
      const result = cleanCalendar(parsed, { duplicates: 'uid' });

      expect(result.eventCount).toBe(2);
    });

    it('should produce valid ICS output', () => {
      const result = cleanCalendar(calendarWithDuplicateUID, {
        duplicates: 'uid',
      });

      const parsed = parseICalContent(result.content);
      expect(parsed.totalEvents).toBe(2);
    });
  });
});

describe('clean (async wrapper)', () => {
  it('should return a promise', () => {
    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T100000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = clean(calendar, { duplicates: 'uid' });
    expect(result).toBeInstanceOf(Promise);
  });

  it('should resolve with clean result', async () => {
    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T100000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = await clean(calendar, { duplicates: 'uid' });
    expect(result.eventCount).toBe(1);
    expect(result.content).toContain('BEGIN:VCALENDAR');
  });
});
