import ICAL from 'ical.js';
import type { ParsedCalendar } from './types.js';

/**
 * Parse iCalendar file content
 * @param content - Raw ICS file content as string
 * @returns Parsed calendar data with components and events
 */
export function parseICalContent(content: string): ParsedCalendar {
  const jcalData = ICAL.parse(content);
  const component = new ICAL.Component(jcalData);
  const vevents = component.getAllSubcomponents('vevent');
  const properties = component
    .getAllProperties()
    .filter((p) => p.name !== 'vevent');

  return {
    component,
    vevents,
    properties,
    totalEvents: vevents.length,
  };
}
