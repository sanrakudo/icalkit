import { describe, it, expect, vi, afterEach } from 'vitest';
import { merge, mergeCalendars } from './merger.js';
import { parseICalContent } from '../common/parser.js';

describe('mergeCalendars', () => {
  const calendar1 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar1//EN
X-WR-CALNAME:Work Calendar
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
SUMMARY:Meeting 1
END:VEVENT
END:VCALENDAR`;

  const calendar2 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar2//EN
X-WR-CALNAME:Personal Calendar
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T140000Z
DTEND:20240102T150000Z
SUMMARY:Meeting 2
END:VEVENT
END:VCALENDAR`;

  const calendar3WithDuplicate = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Calendar3//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
SUMMARY:Meeting 1 (duplicate)
END:VEVENT
BEGIN:VEVENT
UID:event3@example.com
DTSTART:20240103T090000Z
DTEND:20240103T100000Z
SUMMARY:Meeting 3
END:VEVENT
END:VCALENDAR`;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should merge two calendars with unique events', () => {
    const result = mergeCalendars([calendar1, calendar2]);

    expect(result.totalEvents).toBe(2);
    expect(result.sourceCount).toBe(2);
    expect(result.content).toContain('BEGIN:VCALENDAR');
    expect(result.content).toContain('event1@example.com');
    expect(result.content).toContain('event2@example.com');
    expect(result.metadata.duplicatesFound).toBe(0);
  });

  it('should preserve calendar properties from first calendar', () => {
    const result = mergeCalendars([calendar1, calendar2]);

    expect(result.content).toContain('VERSION:2.0');
    expect(result.content).toContain('PRODID:-//Test//Calendar1//EN');
    expect(result.content).toContain('X-WR-CALNAME:Work Calendar');
  });

  it('should detect duplicates and warn by default', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = mergeCalendars([calendar1, calendar3WithDuplicate]);

    expect(result.totalEvents).toBe(3); // Keeps all events in warn mode
    expect(result.metadata.duplicatesFound).toBe(1);
    expect(result.metadata.duplicatesRemoved).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should remove duplicates when duplicates=remove', () => {
    const result = mergeCalendars([calendar1, calendar3WithDuplicate], {
      duplicates: 'remove',
    });

    expect(result.totalEvents).toBe(2); // Only unique events
    expect(result.metadata.duplicatesFound).toBe(1);
    expect(result.metadata.duplicatesRemoved).toBe(1);
  });

  it('should keep all duplicates when duplicates=keep-all', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = mergeCalendars([calendar1, calendar3WithDuplicate], {
      duplicates: 'keep-all',
    });

    expect(result.totalEvents).toBe(3);
    expect(result.metadata.duplicatesFound).toBe(1);
    expect(result.metadata.duplicatesRemoved).toBe(0);
    // Should not warn in keep-all mode
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should allow custom calendar name', () => {
    const result = mergeCalendars([calendar1, calendar2], {
      calendarName: 'Merged Calendar',
    });

    expect(result.content).toContain('X-WR-CALNAME:Merged Calendar');
    expect(result.content).not.toContain('X-WR-CALNAME:Work Calendar');
  });

  it('should add calendar name when not present in original', () => {
    const calendarNoName = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//NoName//EN
BEGIN:VEVENT
UID:event@example.com
DTSTART:20240101T100000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = mergeCalendars([calendarNoName], {
      calendarName: 'New Name',
    });

    expect(result.content).toContain('X-WR-CALNAME:New Name');
  });

  it('should throw error for empty input array', () => {
    expect(() => mergeCalendars([])).toThrow(
      'At least one calendar input is required',
    );
  });

  it('should handle ParsedCalendar inputs', () => {
    const parsed1 = parseICalContent(calendar1);
    const parsed2 = parseICalContent(calendar2);

    const result = mergeCalendars([parsed1, parsed2]);

    expect(result.totalEvents).toBe(2);
    expect(result.sourceCount).toBe(2);
  });

  it('should handle mixed string and ParsedCalendar inputs', () => {
    const parsed1 = parseICalContent(calendar1);

    const result = mergeCalendars([parsed1, calendar2]);

    expect(result.totalEvents).toBe(2);
  });

  it('should include duplicate details in metadata', () => {
    const result = mergeCalendars([calendar1, calendar3WithDuplicate], {
      duplicates: 'keep-all',
    });

    expect(result.metadata.duplicateDetails).toHaveLength(1);
    expect(result.metadata.duplicateDetails[0]).toMatchObject({
      uid: 'event1@example.com',
      originalIndex: 0,
      sourceIndex: 1,
    });
  });

  it('should handle events without UID', () => {
    const calendarNoUID = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//NoUID//EN
BEGIN:VEVENT
DTSTART:20240101T100000Z
SUMMARY:Event without UID
END:VEVENT
END:VCALENDAR`;

    const result = mergeCalendars([calendar1, calendarNoUID]);

    expect(result.totalEvents).toBe(2);
  });

  it('should produce valid ICS output', () => {
    const result = mergeCalendars([calendar1, calendar2]);

    // Verify output can be parsed back
    const parsed = parseICalContent(result.content);
    expect(parsed.totalEvents).toBe(2);
    expect(parsed.vevents).toHaveLength(2);
  });

  it('should handle single calendar input', () => {
    const result = mergeCalendars([calendar1]);

    expect(result.totalEvents).toBe(1);
    expect(result.sourceCount).toBe(1);
    expect(result.metadata.duplicatesFound).toBe(0);
  });

  it('should set correct metadata', () => {
    const result = mergeCalendars([calendar1, calendar2]);

    expect(result.metadata.mergedAt).toBeInstanceOf(Date);
    expect(result.metadata.duplicateHandling).toBe('warn');
    expect(result.metadata.duplicatesFound).toBe(0);
    expect(result.metadata.duplicatesRemoved).toBe(0);
    expect(result.metadata.duplicateDetails).toHaveLength(0);
  });
});

describe('merge (async wrapper)', () => {
  it('should return a promise', () => {
    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T100000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = merge([calendar]);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should resolve with merge result', async () => {
    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T100000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = await merge([calendar]);
    expect(result.totalEvents).toBe(1);
    expect(result.content).toContain('BEGIN:VCALENDAR');
  });
});
