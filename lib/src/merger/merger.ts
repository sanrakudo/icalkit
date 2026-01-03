import ICAL from 'ical.js';
import { parseICalContent } from '../common/parser.js';
import type { ParsedCalendar } from '../common/types.js';
import type {
  MergeOptions,
  MergeResult,
  MergeInput,
  DuplicateInfo,
  DuplicateHandling,
} from './types.js';

/**
 * Normalize input to ParsedCalendar
 */
function normalizeInput(input: MergeInput): ParsedCalendar {
  if (typeof input === 'string') {
    return parseICalContent(input);
  }
  return input;
}

/**
 * Extract UID from a VEVENT component
 */
function getEventUID(vevent: ICAL.Component): string {
  const uidProp = vevent.getFirstPropertyValue('uid');
  return uidProp ? String(uidProp) : '';
}

/**
 * Extract summary from a VEVENT component
 */
function getEventSummary(vevent: ICAL.Component): string {
  const summaryProp = vevent.getFirstPropertyValue('summary');
  return summaryProp ? String(summaryProp) : '(No title)';
}

/**
 * Find duplicates in events across multiple calendars
 */
function findDuplicates(parsedCalendars: ParsedCalendar[]): Map<
  string,
  {
    originalIndex: number;
    duplicates: Array<{ sourceIndex: number; vevent: ICAL.Component }>;
  }
> {
  const uidMap = new Map<
    string,
    {
      originalIndex: number;
      duplicates: Array<{ sourceIndex: number; vevent: ICAL.Component }>;
    }
  >();

  parsedCalendars.forEach((calendar, sourceIndex) => {
    calendar.vevents.forEach((vevent) => {
      const uid = getEventUID(vevent);
      if (!uid) return; // Skip events without UID

      const existing = uidMap.get(uid);
      if (existing) {
        existing.duplicates.push({ sourceIndex, vevent });
      } else {
        uidMap.set(uid, {
          originalIndex: sourceIndex,
          duplicates: [],
        });
      }
    });
  });

  return uidMap;
}

/**
 * Create merged ICS content from events and properties
 */
function createMergedICS(
  properties: ICAL.Property[],
  vevents: ICAL.Component[],
  calendarName?: string,
): string {
  const newCal = new ICAL.Component(['vcalendar', [], []]);
  let hasCalendarName = false;

  // Copy properties from first calendar
  properties.forEach((prop) => {
    // Override calendar name if provided
    if (prop.name === 'x-wr-calname') {
      hasCalendarName = true;
      if (calendarName) {
        const nameProp = new ICAL.Property('x-wr-calname');
        nameProp.setValue(calendarName);
        newCal.addProperty(nameProp);
      } else {
        newCal.addProperty(prop);
      }
    } else {
      newCal.addProperty(prop);
    }
  });

  // Add calendar name if not present and provided
  if (calendarName && !hasCalendarName) {
    const nameProp = new ICAL.Property('x-wr-calname');
    nameProp.setValue(calendarName);
    newCal.addProperty(nameProp);
  }

  // Add all events
  vevents.forEach((vevent) => {
    newCal.addSubcomponent(vevent);
  });

  return newCal.toString();
}

/**
 * Merge multiple calendars into one (synchronous core function)
 * @param inputs - Array of ICS content strings or ParsedCalendar objects
 * @param options - Merge options
 * @returns Merge result with content and metadata
 */
export function mergeCalendars(
  inputs: MergeInput[],
  options: MergeOptions = {},
): MergeResult {
  const { duplicates = 'warn', calendarName } = options;

  if (inputs.length === 0) {
    throw new Error('At least one calendar input is required');
  }

  // Parse all inputs
  const parsedCalendars = inputs.map(normalizeInput);

  // Get properties from first calendar (to preserve calendar metadata)
  const baseProperties = parsedCalendars[0].properties;

  // Find duplicates across all calendars
  const uidMap = findDuplicates(parsedCalendars);

  // Build duplicate info for metadata
  const duplicateDetails: DuplicateInfo[] = [];
  uidMap.forEach((info, uid) => {
    info.duplicates.forEach((dup) => {
      duplicateDetails.push({
        uid,
        summary: getEventSummary(dup.vevent),
        sourceIndex: dup.sourceIndex,
        originalIndex: info.originalIndex,
      });
    });
  });

  // Collect events based on duplicate handling strategy
  const seenUIDs = new Set<string>();
  const mergedEvents: ICAL.Component[] = [];
  let duplicatesRemoved = 0;

  parsedCalendars.forEach((calendar) => {
    calendar.vevents.forEach((vevent) => {
      const uid = getEventUID(vevent);

      if (uid && seenUIDs.has(uid)) {
        // This is a duplicate
        if (duplicates === 'remove') {
          duplicatesRemoved++;
          return; // Skip this event
        }
        // For 'keep-all' and 'warn', we still add the event
      }

      if (uid) {
        seenUIDs.add(uid);
      }
      mergedEvents.push(vevent);
    });
  });

  // Log warnings if in warn mode
  if (duplicates === 'warn' && duplicateDetails.length > 0) {
    console.warn(
      `Warning: Found ${duplicateDetails.length} duplicate event(s)`,
    );
    duplicateDetails.forEach((dup) => {
      console.warn(
        `  - "${dup.summary}" (UID: ${dup.uid}) appears in calendars ${dup.originalIndex + 1} and ${dup.sourceIndex + 1}`,
      );
    });
  }

  // Create merged content
  const content = createMergedICS(baseProperties, mergedEvents, calendarName);

  return {
    content,
    totalEvents: mergedEvents.length,
    sourceCount: parsedCalendars.length,
    metadata: {
      mergedAt: new Date(),
      duplicateHandling: duplicates as DuplicateHandling,
      duplicatesFound: duplicateDetails.length,
      duplicatesRemoved,
      duplicateDetails,
    },
  };
}

/**
 * Merge multiple calendars into one (async wrapper for API consistency)
 * @param inputs - Array of ICS content strings or ParsedCalendar objects
 * @param options - Merge options
 * @returns Promise resolving to merge result
 */
export async function merge(
  inputs: MergeInput[],
  options: MergeOptions = {},
): Promise<MergeResult> {
  return mergeCalendars(inputs, options);
}
