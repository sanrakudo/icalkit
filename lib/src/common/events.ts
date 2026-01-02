import ICAL from 'ical.js';
import type { ICalEvent } from './types.js';

/**
 * Extract event details from ICAL components
 * @param vevents - Array of VEVENT components
 * @returns Array of extracted event objects
 */
export function extractEvents(vevents: ICAL.Component[]): ICalEvent[] {
  return vevents.map((vevent, index) => {
    const event = new ICAL.Event(vevent);
    const summary = event.summary || '(タイトルなし)';
    const description = event.description || '';
    const location = event.location || '';

    const startDate = event.startDate ? event.startDate.toJSDate() : null;
    const endDate = event.endDate ? event.endDate.toJSDate() : null;

    return {
      id: index,
      summary,
      description,
      location,
      startDate,
      endDate,
    };
  });
}

/**
 * Sort events by start date
 * @param events - Array of events to sort
 * @returns New sorted array (does not mutate input)
 */
export function sortEventsByDate(events: ICalEvent[]): ICalEvent[] {
  return [...events].sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
}

/**
 * Filter events by search query
 * @param events - Array of events to filter
 * @param query - Search query string
 * @returns Filtered array of events
 */
export function filterEvents(events: ICalEvent[], query: string): ICalEvent[] {
  if (!query.trim()) return events;

  const lowerQuery = query.toLowerCase();
  return events.filter(
    (event) =>
      event.summary.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery),
  );
}
