import ICAL from 'ical.js';
import { parseICalContent } from '../common/parser.js';
import type { ParsedCalendar } from '../common/types.js';
import type {
  SplitOptions,
  SplitResult,
  ICSChunk,
  SortOrder,
} from './types.js';

/**
 * Get DTSTART timestamp from a VEVENT component
 * @param vevent - VEVENT component
 * @returns Timestamp in milliseconds, or Infinity if no DTSTART
 */
function getDtstartTime(vevent: ICAL.Component): number {
  const dtstart = vevent.getFirstPropertyValue('dtstart');
  if (!dtstart) return Infinity;
  // Handle both ICAL.Time objects and date strings
  if (typeof dtstart === 'object' && 'toJSDate' in dtstart) {
    return (dtstart as ICAL.Time).toJSDate().getTime();
  }
  return Infinity;
}

/**
 * Sort VEVENT components by specified order
 * @param vevents - Array of VEVENT components
 * @param sortBy - Sort order
 * @returns New sorted array (does not mutate input)
 */
function sortVevents(
  vevents: ICAL.Component[],
  sortBy: SortOrder,
): ICAL.Component[] {
  switch (sortBy) {
    case 'original':
      return vevents;
    case 'dtstart':
      return [...vevents].sort((a, b) => {
        const timeA = getDtstartTime(a);
        const timeB = getDtstartTime(b);
        return timeA - timeB;
      });
    default: {
      const _exhaustiveCheck: never = sortBy;
      throw new Error(`Unknown sort order: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Create ICS content for a chunk
 * @param properties - Original calendar properties
 * @param vevents - Array of VEVENT components to include
 * @returns ICS content as string
 */
function createChunkICS(
  properties: ICAL.Property[],
  vevents: ICAL.Component[],
): string {
  const newCal = new ICAL.Component(['vcalendar', [], []]);

  // Copy original properties (excluding events)
  properties.forEach((prop) => {
    newCal.addProperty(prop);
  });

  // Add events
  vevents.forEach((vevent) => {
    newCal.addSubcomponent(vevent);
  });

  return newCal.toString();
}

/**
 * Split events into chunks
 * @param parsed - Parsed calendar data
 * @param options - Split options
 * @returns Array of ICS chunks
 */
export function splitCalendarIntoChunks(
  parsed: ParsedCalendar,
  options: SplitOptions = {},
): ICSChunk[] {
  const { chunkSize = 1000, fileNamePattern, sortBy = 'dtstart' } = options;
  const { vevents: originalVevents, properties } = parsed;

  // Sort events if requested
  const vevents = sortVevents(originalVevents, sortBy);

  const numChunks = Math.ceil(vevents.length / chunkSize);
  const chunks: ICSChunk[] = [];

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, vevents.length);
    const chunkEvents = vevents.slice(start, end);

    const content = createChunkICS(properties, chunkEvents);
    const fileName = fileNamePattern
      ? fileNamePattern
          .replace('{n}', String(i + 1))
          .replace('{total}', String(numChunks))
      : `calendar_part_${i + 1}_of_${numChunks}.ics`;

    chunks.push({
      fileName,
      content,
      eventCount: chunkEvents.length,
      eventRange: { start, end },
    });
  }

  return chunks;
}

/**
 * Main split function - parses ICS content and splits into chunks
 * @param content - Raw ICS file content as string
 * @param options - Split options
 * @returns Split result with chunks and metadata
 */
export async function split(
  content: string,
  options: SplitOptions = {},
): Promise<SplitResult> {
  const parsed = parseICalContent(content);
  const chunks = splitCalendarIntoChunks(parsed, options);

  return {
    chunks,
    totalEvents: parsed.totalEvents,
    metadata: {
      originalFileName: options.outputDir ? undefined : 'calendar_split.zip', // Only for browser
      splitAt: new Date(),
      chunkSize: options.chunkSize || 500,
    },
  };
}
