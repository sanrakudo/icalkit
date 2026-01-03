import { describe, it, expect } from 'vitest';
import { parseICalContent } from '../common/parser.js';
import { splitCalendarIntoChunks, split } from './splitter.js';

describe('parseICalContent', () => {
  it('should parse valid ICS content', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
DTEND:20240101T130000Z
SUMMARY:Test Event
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);
    expect(result.totalEvents).toBe(1);
    expect(result.vevents).toHaveLength(1);
    expect(result.properties).toHaveLength(2); // VERSION and PRODID
  });

  it('should handle calendar with no events', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
END:VCALENDAR`;

    const result = parseICalContent(ics);
    expect(result.totalEvents).toBe(0);
    expect(result.vevents).toHaveLength(0);
  });

  it('should handle calendar with multiple events', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20240101T120000Z
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20240102T120000Z
SUMMARY:Event 2
END:VEVENT
END:VCALENDAR`;

    const result = parseICalContent(ics);
    expect(result.totalEvents).toBe(2);
    expect(result.vevents).toHaveLength(2);
  });
});

describe('splitCalendarIntoChunks', () => {
  const createTestCalendar = (eventCount: number) => {
    let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Test//Test//EN\n`;
    for (let i = 0; i < eventCount; i++) {
      ics += `BEGIN:VEVENT\nUID:test${i}@example.com\nDTSTART:20240101T120000Z\nSUMMARY:Event ${i}\nEND:VEVENT\n`;
    }
    ics += `END:VCALENDAR`;
    return parseICalContent(ics);
  };

  it('should split events into correct number of chunks', () => {
    const parsed = createTestCalendar(150);
    const chunks = splitCalendarIntoChunks(parsed, { chunkSize: 50 });

    expect(chunks).toHaveLength(3);
    expect(chunks[0].eventCount).toBe(50);
    expect(chunks[1].eventCount).toBe(50);
    expect(chunks[2].eventCount).toBe(50);
  });

  it('should handle partial last chunk', () => {
    const parsed = createTestCalendar(125);
    const chunks = splitCalendarIntoChunks(parsed, { chunkSize: 50 });

    expect(chunks).toHaveLength(3);
    expect(chunks[0].eventCount).toBe(50);
    expect(chunks[1].eventCount).toBe(50);
    expect(chunks[2].eventCount).toBe(25);
  });

  it('should use default chunk size of 1000', () => {
    const parsed = createTestCalendar(1500);
    const chunks = splitCalendarIntoChunks(parsed);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].eventCount).toBe(1000);
    expect(chunks[1].eventCount).toBe(500);
  });

  it('should use custom file name pattern', () => {
    const parsed = createTestCalendar(100);
    const chunks = splitCalendarIntoChunks(parsed, {
      chunkSize: 50,
      fileNamePattern: 'custom_{n}_of_{total}.ics',
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0].fileName).toBe('custom_1_of_2.ics');
    expect(chunks[1].fileName).toBe('custom_2_of_2.ics');
  });

  it('should include event range in chunks', () => {
    const parsed = createTestCalendar(100);
    const chunks = splitCalendarIntoChunks(parsed, { chunkSize: 50 });

    expect(chunks[0].eventRange).toEqual({ start: 0, end: 50 });
    expect(chunks[1].eventRange).toEqual({ start: 50, end: 100 });
  });

  it('should create valid ICS content', () => {
    const parsed = createTestCalendar(10);
    const chunks = splitCalendarIntoChunks(parsed, { chunkSize: 5 });

    // Each chunk should be valid ICS
    chunks.forEach((chunk) => {
      expect(chunk.content).toContain('BEGIN:VCALENDAR');
      expect(chunk.content).toContain('END:VCALENDAR');
      expect(chunk.content).toContain('VERSION:2.0');
    });
  });
});

describe('split', () => {
  it('should split calendar and return result', async () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test1@example.com
DTSTART:20240101T120000Z
SUMMARY:Event 1
END:VEVENT
BEGIN:VEVENT
UID:test2@example.com
DTSTART:20240102T120000Z
SUMMARY:Event 2
END:VEVENT
END:VCALENDAR`;

    const result = await split(ics, { chunkSize: 1 });

    expect(result.totalEvents).toBe(2);
    expect(result.chunks).toHaveLength(2);
    expect(result.metadata.chunkSize).toBe(1);
    expect(result.metadata.splitAt).toBeInstanceOf(Date);
  });
});

describe('sortBy option', () => {
  // Events in non-chronological order
  const unsortedCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:middle@example.com
DTSTART:20240115T100000Z
SUMMARY:Middle Event
END:VEVENT
BEGIN:VEVENT
UID:last@example.com
DTSTART:20240201T100000Z
SUMMARY:Last Event
END:VEVENT
BEGIN:VEVENT
UID:first@example.com
DTSTART:20240101T100000Z
SUMMARY:First Event
END:VEVENT
END:VCALENDAR`;

  it('should sort by dtstart by default', async () => {
    const result = await split(unsortedCalendar, { chunkSize: 1 });

    expect(result.chunks).toHaveLength(3);
    expect(result.chunks[0].content).toContain('First Event');
    expect(result.chunks[1].content).toContain('Middle Event');
    expect(result.chunks[2].content).toContain('Last Event');
  });

  it('should preserve original order with sortBy=original', async () => {
    const result = await split(unsortedCalendar, {
      chunkSize: 1,
      sortBy: 'original',
    });

    expect(result.chunks).toHaveLength(3);
    expect(result.chunks[0].content).toContain('Middle Event');
    expect(result.chunks[1].content).toContain('Last Event');
    expect(result.chunks[2].content).toContain('First Event');
  });

  it('should handle events without dtstart', async () => {
    const calendarWithMissingDtstart = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:nodtstart@example.com
SUMMARY:No DTSTART Event
END:VEVENT
BEGIN:VEVENT
UID:hasdtstart@example.com
DTSTART:20240101T100000Z
SUMMARY:Has DTSTART Event
END:VEVENT
END:VCALENDAR`;

    const result = await split(calendarWithMissingDtstart, {
      chunkSize: 1,
      sortBy: 'dtstart',
    });

    expect(result.chunks).toHaveLength(2);
    // Event with DTSTART should come first, event without should come last
    expect(result.chunks[0].content).toContain('Has DTSTART Event');
    expect(result.chunks[1].content).toContain('No DTSTART Event');
  });

  it('should handle all-day events', async () => {
    const allDayCalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:allday@example.com
DTSTART;VALUE=DATE:20240101
SUMMARY:All Day Event
END:VEVENT
BEGIN:VEVENT
UID:timed@example.com
DTSTART:20240115T100000Z
SUMMARY:Timed Event
END:VEVENT
END:VCALENDAR`;

    const result = await split(allDayCalendar, {
      chunkSize: 1,
      sortBy: 'dtstart',
    });

    expect(result.chunks).toHaveLength(2);
    // All-day event on Jan 1 should come before timed event on Jan 15
    expect(result.chunks[0].content).toContain('All Day Event');
    expect(result.chunks[1].content).toContain('Timed Event');
  });
});
