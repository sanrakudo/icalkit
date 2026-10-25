import ICAL from 'ical.js';
import { parseICalContent } from '../common/parser.js';
import type { ParsedCalendar } from '../common/types.js';
import type {
  CleanOptions,
  CleanResult,
  CleanInput,
  RemovedItemInfo,
} from './types.js';

/**
 * Normalize input to ParsedCalendar
 */
function normalizeInput(input: CleanInput): ParsedCalendar {
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
  return summaryProp ? String(summaryProp) : '';
}

/**
 * Extract STATUS from a VEVENT component
 */
function getEventStatus(vevent: ICAL.Component): string {
  const statusProp = vevent.getFirstPropertyValue('status');
  return statusProp ? String(statusProp).toUpperCase() : '';
}

/**
 * Extract DTSTART as ISO string for content-based duplicate detection
 */
function getEventStartString(vevent: ICAL.Component): string {
  const dtstart = vevent.getFirstPropertyValue('dtstart');
  if (dtstart && dtstart instanceof ICAL.Time) {
    return dtstart.toICALString();
  }
  return '';
}

/**
 * Check if event has DTSTART
 */
function hasEventStart(vevent: ICAL.Component): boolean {
  return vevent.getFirstProperty('dtstart') !== null;
}

/**
 * Get all timezone IDs referenced by events
 */
function getReferencedTimezones(vevents: ICAL.Component[]): Set<string> {
  const tzids = new Set<string>();

  vevents.forEach((vevent) => {
    // Check DTSTART
    const dtstart = vevent.getFirstProperty('dtstart');
    if (dtstart) {
      const tzid = dtstart.getParameter('tzid');
      if (tzid) tzids.add(String(tzid));
    }

    // Check DTEND
    const dtend = vevent.getFirstProperty('dtend');
    if (dtend) {
      const tzid = dtend.getParameter('tzid');
      if (tzid) tzids.add(String(tzid));
    }
  });

  return tzids;
}

/**
 * Check if any clean option is enabled
 */
function hasAnyOption(options: CleanOptions): boolean {
  return (
    options.duplicates !== undefined ||
    options.removeCancelled === true ||
    options.removeTentative === true ||
    options.removeEmpty === true ||
    options.removeOrphanedTimezones === true
  );
}

/**
 * Create content key for content-based duplicate detection
 */
function getContentKey(vevent: ICAL.Component): string {
  const start = getEventStartString(vevent);
  const summary = getEventSummary(vevent);
  return `${start}|${summary}`;
}

/**
 * Create cleaned ICS content
 */
function createCleanedICS(
  properties: ICAL.Property[],
  vevents: ICAL.Component[],
  vtimezones: ICAL.Component[],
): string {
  const newCal = new ICAL.Component(['vcalendar', [], []]);

  // Copy properties
  properties.forEach((prop) => {
    newCal.addProperty(prop);
  });

  // Add timezones
  vtimezones.forEach((vtz) => {
    newCal.addSubcomponent(vtz);
  });

  // Add events
  vevents.forEach((vevent) => {
    newCal.addSubcomponent(vevent);
  });

  return newCal.toString();
}

/**
 * Clean a calendar by removing duplicates and unwanted events (synchronous core function)
 * @param input - ICS content string or ParsedCalendar object
 * @param options - Clean options
 * @returns Clean result with content and metadata
 */
export function cleanCalendar(
  input: CleanInput,
  options: CleanOptions = {},
): CleanResult {
  if (!hasAnyOption(options)) {
    throw new Error(
      'At least one clean option is required. Available options: --duplicates, --remove-cancelled, --remove-tentative, --remove-empty, --remove-orphan-tz',
    );
  }

  const parsed = normalizeInput(input);
  const originalEventCount = parsed.vevents.length;

  const removedItems: RemovedItemInfo[] = [];
  const removedByReason = {
    duplicates: 0,
    cancelled: 0,
    tentative: 0,
    empty: 0,
    orphanedTimezones: 0,
  };

  // Track seen items for duplicate detection
  const seenUIDs = new Set<string>();
  const seenContent = new Set<string>();

  // Filter events
  const cleanedEvents = parsed.vevents.filter((vevent) => {
    const uid = getEventUID(vevent);
    const summary = getEventSummary(vevent);

    // Check for duplicates
    if (options.duplicates === 'uid' && uid) {
      if (seenUIDs.has(uid)) {
        removedItems.push({ reason: 'duplicate-uid', uid, summary });
        removedByReason.duplicates++;
        return false;
      }
      seenUIDs.add(uid);
    } else if (options.duplicates === 'content') {
      const contentKey = getContentKey(vevent);
      if (contentKey && seenContent.has(contentKey)) {
        removedItems.push({ reason: 'duplicate-content', uid, summary });
        removedByReason.duplicates++;
        return false;
      }
      if (contentKey) seenContent.add(contentKey);
    }

    // Check for cancelled events
    if (options.removeCancelled) {
      const status = getEventStatus(vevent);
      if (status === 'CANCELLED') {
        removedItems.push({ reason: 'cancelled', uid, summary });
        removedByReason.cancelled++;
        return false;
      }
    }

    // Check for tentative events
    if (options.removeTentative) {
      const status = getEventStatus(vevent);
      if (status === 'TENTATIVE') {
        removedItems.push({ reason: 'tentative', uid, summary });
        removedByReason.tentative++;
        return false;
      }
    }

    // Check for empty events
    if (options.removeEmpty) {
      const hasSummary = summary !== '';
      const hasStart = hasEventStart(vevent);
      if (!hasSummary || !hasStart) {
        removedItems.push({
          reason: 'empty',
          uid,
          summary: summary || '(empty)',
        });
        removedByReason.empty++;
        return false;
      }
    }

    return true;
  });

  // Handle timezones
  const component = parsed.component;
  let vtimezones = component.getAllSubcomponents('vtimezone');

  if (options.removeOrphanedTimezones) {
    const referencedTzids = getReferencedTimezones(cleanedEvents);
    const originalTzCount = vtimezones.length;

    vtimezones = vtimezones.filter((vtz) => {
      const tzid = vtz.getFirstPropertyValue('tzid');
      const tzidStr = tzid ? String(tzid) : '';

      if (tzidStr && !referencedTzids.has(tzidStr)) {
        removedItems.push({ reason: 'orphaned-timezone', tzid: tzidStr });
        removedByReason.orphanedTimezones++;
        return false;
      }
      return true;
    });

    // Log if timezones were removed but count differs (sanity check)
    if (
      originalTzCount !==
      vtimezones.length + removedByReason.orphanedTimezones
    ) {
      // This shouldn't happen, but just in case
    }
  }

  // Create cleaned content
  const content = createCleanedICS(
    parsed.properties,
    cleanedEvents,
    vtimezones,
  );

  return {
    content,
    eventCount: cleanedEvents.length,
    metadata: {
      cleanedAt: new Date(),
      originalEventCount,
      removedCount: removedItems.length,
      removedByReason,
      removedItems,
    },
  };
}

/**
 * Clean a calendar by removing duplicates and unwanted events (async wrapper for API consistency)
 * @param input - ICS content string or ParsedCalendar object
 * @param options - Clean options
 * @returns Promise resolving to clean result
 */
export async function clean(
  input: CleanInput,
  options: CleanOptions = {},
): Promise<CleanResult> {
  return cleanCalendar(input, options);
}
