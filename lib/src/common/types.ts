import type ICAL from 'ical.js';

/**
 * Represents a single calendar event with extracted properties
 */
export interface ICalEvent {
  id: number;
  summary: string;
  description: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Parsed calendar data from an ICS file
 */
export interface ParsedCalendar {
  /** Root VCALENDAR component */
  component: ICAL.Component;
  /** Array of VEVENT subcomponents */
  vevents: ICAL.Component[];
  /** Calendar properties (excluding events) */
  properties: ICAL.Property[];
  /** Total number of events */
  totalEvents: number;
}
