import { describe, it, expect } from 'vitest';
import { split } from './index.js';
import { parseICalContent } from './common/parser.js';
import { extractEvents } from './common/events.js';

describe('Integration Tests', () => {
  // Sample Google Calendar export format
  const googleCalendarSample = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Work Calendar
X-WR-TIMEZONE:Asia/Tokyo
BEGIN:VEVENT
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
DTSTAMP:20240101T000000Z
UID:event1@google.com
CREATED:20240101T000000Z
DESCRIPTION:Team standup meeting
LAST-MODIFIED:20240101T000000Z
LOCATION:Conference Room A
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Daily Standup
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART:20240102T140000Z
DTEND:20240102T150000Z
DTSTAMP:20240101T000000Z
UID:event2@google.com
CREATED:20240101T000000Z
DESCRIPTION:Review sprint progress
LAST-MODIFIED:20240101T000000Z
LOCATION:Online
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Sprint Review
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART:20240103T093000Z
DTEND:20240103T103000Z
DTSTAMP:20240101T000000Z
UID:event3@google.com
CREATED:20240101T000000Z
DESCRIPTION:Planning next sprint
LAST-MODIFIED:20240101T000000Z
LOCATION:Conference Room B
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Sprint Planning
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

  it('should handle real Google Calendar export', () => {
    const parsed = parseICalContent(googleCalendarSample);

    expect(parsed.totalEvents).toBe(3);
    expect(parsed.vevents).toHaveLength(3);
    expect(parsed.properties.length).toBeGreaterThan(0);
  });

  it('should extract events from Google Calendar format', () => {
    const parsed = parseICalContent(googleCalendarSample);
    const events = extractEvents(parsed.vevents);

    expect(events).toHaveLength(3);
    expect(events[0].summary).toBe('Daily Standup');
    expect(events[0].location).toBe('Conference Room A');
    expect(events[0].description).toBe('Team standup meeting');
    expect(events[1].summary).toBe('Sprint Review');
    expect(events[2].summary).toBe('Sprint Planning');
  });

  it('should split Google Calendar export into chunks', async () => {
    const result = await split(googleCalendarSample, { chunkSize: 2 });

    expect(result.totalEvents).toBe(3);
    expect(result.chunks).toHaveLength(2);
    expect(result.chunks[0].eventCount).toBe(2);
    expect(result.chunks[1].eventCount).toBe(1);
    expect(result.chunks[0].fileName).toBe('calendar_part_1_of_2.ics');
    expect(result.chunks[1].fileName).toBe('calendar_part_2_of_2.ics');
  });

  it('should preserve calendar properties in chunks', async () => {
    const result = await split(googleCalendarSample, { chunkSize: 2 });

    // Each chunk should be valid ICS
    result.chunks.forEach((chunk) => {
      expect(chunk.content).toContain('BEGIN:VCALENDAR');
      expect(chunk.content).toContain('END:VCALENDAR');
      expect(chunk.content).toContain('VERSION:2.0');
      expect(chunk.content).toContain('PRODID');
    });
  });

  it('should handle large calendar files', async () => {
    // Create a calendar with 1000 events
    let largeCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Large Calendar//EN
CALSCALE:GREGORIAN
`;

    for (let i = 0; i < 1000; i++) {
      largeCalendar += `BEGIN:VEVENT
DTSTART:20240101T${String(i % 24).padStart(2, '0')}0000Z
DTEND:20240101T${String((i % 24) + 1).padStart(2, '0')}0000Z
DTSTAMP:20240101T000000Z
UID:event${i}@example.com
SUMMARY:Event ${i}
DESCRIPTION:Description for event ${i}
SEQUENCE:0
STATUS:CONFIRMED
END:VEVENT
`;
    }

    largeCalendar += `END:VCALENDAR`;

    const result = await split(largeCalendar, { chunkSize: 500 });

    expect(result.totalEvents).toBe(1000);
    expect(result.chunks).toHaveLength(2);
    expect(result.chunks[0].eventCount).toBe(500);
    expect(result.chunks[1].eventCount).toBe(500);

    // Verify each chunk is valid
    result.chunks.forEach((chunk) => {
      const parsed = parseICalContent(chunk.content);
      expect(parsed.vevents.length).toBeLessThanOrEqual(500);
    });
  });

  it('should handle calendar with Japanese characters', () => {
    const japaneseCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Japanese Calendar//EN
X-WR-CALNAME:日本のカレンダー
BEGIN:VEVENT
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
UID:jp1@example.com
SUMMARY:新年会
DESCRIPTION:チームメンバーとの新年会
LOCATION:渋谷の居酒屋
END:VEVENT
BEGIN:VEVENT
DTSTART:20240107T090000Z
DTEND:20240107T100000Z
UID:jp2@example.com
SUMMARY:週次ミーティング
DESCRIPTION:進捗確認
LOCATION:会議室A
END:VEVENT
END:VCALENDAR`;

    const parsed = parseICalContent(japaneseCalendar);
    const events = extractEvents(parsed.vevents);

    expect(parsed.totalEvents).toBe(2);
    expect(events[0].summary).toBe('新年会');
    expect(events[0].description).toBe('チームメンバーとの新年会');
    expect(events[0].location).toBe('渋谷の居酒屋');
    expect(events[1].summary).toBe('週次ミーティング');
  });

  it('should handle all-day events correctly', () => {
    const allDayCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//All Day Events//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20240101
DTEND;VALUE=DATE:20240102
UID:allday1@example.com
SUMMARY:New Year's Day
DESCRIPTION:公休日
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20240111
DTEND;VALUE=DATE:20240112
UID:allday2@example.com
SUMMARY:成人の日
DESCRIPTION:公休日
END:VEVENT
END:VCALENDAR`;

    const parsed = parseICalContent(allDayCalendar);
    const events = extractEvents(parsed.vevents);

    expect(parsed.totalEvents).toBe(2);
    expect(events[0].summary).toBe("New Year's Day");
    expect(events[1].summary).toBe('成人の日');
    expect(events[0].startDate).toBeInstanceOf(Date);
    expect(events[0].endDate).toBeInstanceOf(Date);
  });

  it('should handle recurring events', () => {
    const recurringCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Recurring Events//EN
BEGIN:VEVENT
DTSTART:20240101T100000Z
DTEND:20240101T110000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10
UID:recurring1@example.com
SUMMARY:Exercise
DESCRIPTION:Morning workout
END:VEVENT
END:VCALENDAR`;

    const parsed = parseICalContent(recurringCalendar);

    expect(parsed.totalEvents).toBe(1);
    // Note: The parsed calendar treats the recurring rule as a single event
    // Expansion of recurrence would be handled by the consuming application
  });
});
