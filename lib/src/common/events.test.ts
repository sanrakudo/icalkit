import { describe, it, expect } from 'vitest';
import { extractEvents, sortEventsByDate, filterEvents } from './events.js';
import { parseICalContent } from './parser.js';

describe('extractEvents', () => {
  it('should extract event details', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
DTEND:20240101T130000Z
SUMMARY:Test Event
DESCRIPTION:Test Description
LOCATION:Test Location
END:VEVENT
END:VCALENDAR`;

    const parsed = parseICalContent(ics);
    const events = extractEvents(parsed.vevents);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: 0,
      summary: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
    });
    expect(events[0].startDate).toBeInstanceOf(Date);
    expect(events[0].endDate).toBeInstanceOf(Date);
  });

  it('should handle events without optional fields', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test@example.com
DTSTART:20240101T120000Z
END:VEVENT
END:VCALENDAR`;

    const parsed = parseICalContent(ics);
    const events = extractEvents(parsed.vevents);

    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('(タイトルなし)');
    expect(events[0].description).toBe('');
    expect(events[0].location).toBe('');
  });

  it('should assign incremental IDs', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
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

    const parsed = parseICalContent(ics);
    const events = extractEvents(parsed.vevents);

    expect(events).toHaveLength(2);
    expect(events[0].id).toBe(0);
    expect(events[1].id).toBe(1);
  });
});

describe('sortEventsByDate', () => {
  it('should sort events by start date ascending', () => {
    const events = [
      {
        id: 0,
        summary: 'Event 3',
        description: '',
        location: '',
        startDate: new Date('2024-03-01'),
        endDate: null,
      },
      {
        id: 1,
        summary: 'Event 1',
        description: '',
        location: '',
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
      {
        id: 2,
        summary: 'Event 2',
        description: '',
        location: '',
        startDate: new Date('2024-02-01'),
        endDate: null,
      },
    ];

    const sorted = sortEventsByDate(events);

    expect(sorted[0].summary).toBe('Event 1');
    expect(sorted[1].summary).toBe('Event 2');
    expect(sorted[2].summary).toBe('Event 3');
  });

  it('should handle null dates', () => {
    const events = [
      {
        id: 0,
        summary: 'Event with date',
        description: '',
        location: '',
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
      {
        id: 1,
        summary: 'Event without date',
        description: '',
        location: '',
        startDate: null,
        endDate: null,
      },
    ];

    const sorted = sortEventsByDate(events);

    expect(sorted[0].summary).toBe('Event with date');
    expect(sorted[1].summary).toBe('Event without date');
  });

  it('should not mutate original array', () => {
    const events = [
      {
        id: 0,
        summary: 'Event 2',
        description: '',
        location: '',
        startDate: new Date('2024-02-01'),
        endDate: null,
      },
      {
        id: 1,
        summary: 'Event 1',
        description: '',
        location: '',
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
    ];

    const sorted = sortEventsByDate(events);

    expect(events[0].summary).toBe('Event 2'); // Original unchanged
    expect(sorted[0].summary).toBe('Event 1'); // Sorted
  });
});

describe('filterEvents', () => {
  const events = [
    {
      id: 0,
      summary: 'Meeting with John',
      description: 'Discuss project',
      location: 'Office',
      startDate: new Date('2024-01-01'),
      endDate: null,
    },
    {
      id: 1,
      summary: 'Team Lunch',
      description: 'Pizza party',
      location: 'Restaurant',
      startDate: new Date('2024-01-02'),
      endDate: null,
    },
    {
      id: 2,
      summary: 'Conference Call',
      description: 'Remote meeting',
      location: 'Online',
      startDate: new Date('2024-01-03'),
      endDate: null,
    },
  ];

  it('should filter by summary', () => {
    const filtered = filterEvents(events, 'meeting');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].summary).toBe('Meeting with John');
    expect(filtered[1].summary).toBe('Conference Call');
  });

  it('should filter by description', () => {
    const filtered = filterEvents(events, 'pizza');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].summary).toBe('Team Lunch');
  });

  it('should filter by location', () => {
    const filtered = filterEvents(events, 'online');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].summary).toBe('Conference Call');
  });

  it('should be case insensitive', () => {
    const filtered = filterEvents(events, 'MEETING');
    expect(filtered).toHaveLength(2);
  });

  it('should return all events for empty query', () => {
    const filtered = filterEvents(events, '');
    expect(filtered).toHaveLength(3);
  });

  it('should return all events for whitespace-only query', () => {
    const filtered = filterEvents(events, '   ');
    expect(filtered).toHaveLength(3);
  });

  it('should return empty array for no matches', () => {
    const filtered = filterEvents(events, 'nonexistent');
    expect(filtered).toHaveLength(0);
  });
});
