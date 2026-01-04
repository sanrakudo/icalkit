import { describe, it, expect } from 'vitest';
import { parseICalContent } from './parser.js';

describe('parseICalContent', () => {
  it('should parse a simple calendar with one event', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T120000Z
DTEND:20240101T130000Z
SUMMARY:New Year Meeting
DESCRIPTION:Discuss goals for 2024
LOCATION:Conference Room A
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(1);
    expect(result.vevents).toHaveLength(1);
    expect(result.properties).toHaveLength(2); // VERSION and PRODID
    expect(result.component).toBeDefined();
  });

  it('should parse a calendar with multiple events', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T120000Z
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
UID:event2@example.com
DTSTART:20240102T120000Z
SUMMARY:Event 2
END:VEVENT
BEGIN:VEVENT
UID:event3@example.com
DTSTART:20240103T120000Z
SUMMARY:Event 3
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(3);
    expect(result.vevents).toHaveLength(3);
  });

  it('should parse calendar with various properties', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:My Calendar
X-WR-TIMEZONE:Asia/Tokyo
BEGIN:VEVENT
UID:event1@example.com
DTSTART:20240101T120000Z
SUMMARY:Test Event
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(1);
    expect(result.properties.length).toBeGreaterThan(2);

    // Check that properties don't include vevent
    const hasVevent = result.properties.some((p) => p.name === 'vevent');
    expect(hasVevent).toBe(false);
  });

  it('should parse calendar with all-day events', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
BEGIN:VEVENT
UID:allday@example.com
DTSTART;VALUE=DATE:20240101
DTEND;VALUE=DATE:20240102
SUMMARY:New Year's Day
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(1);
    expect(result.vevents).toHaveLength(1);
  });

  it('should parse calendar with recurring events', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
BEGIN:VEVENT
UID:recurring@example.com
DTSTART:20240101T090000Z
DTEND:20240101T100000Z
SUMMARY:Weekly Meeting
RRULE:FREQ=WEEKLY;BYDAY=MO
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(1);
    expect(result.vevents).toHaveLength(1);
  });

  it('should handle empty calendar', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
END:VCALENDAR`;

    const result = parseICalContent(ics);

    expect(result.totalEvents).toBe(0);
    expect(result.vevents).toHaveLength(0);
    expect(result.properties).toHaveLength(2);
  });

  it('should preserve component structure', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//Example Calendar//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
SUMMARY:Test
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);

    // Component should be able to be serialized back to string
    const serialized = result.component.toString();
    expect(serialized).toContain('BEGIN:VCALENDAR');
    expect(serialized).toContain('BEGIN:VEVENT');
    expect(serialized).toContain('END:VEVENT');
    expect(serialized).toContain('END:VCALENDAR');
  });
});
