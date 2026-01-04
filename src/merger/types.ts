import type { ParsedCalendar } from '../common/types.js';

/**
 * Duplicate event handling strategy
 */
export type DuplicateHandling = 'keep-all' | 'remove' | 'warn';

/**
 * Options for merging calendar files
 */
export interface MergeOptions {
  /** How to handle duplicate events (default: 'warn') */
  duplicates?: DuplicateHandling;
  /** Calendar name for the merged output (uses first calendar's name if not provided) */
  calendarName?: string;
}

/**
 * Information about a duplicate event found during merge
 */
export interface DuplicateInfo {
  /** UID of the duplicate event */
  uid: string;
  /** Summary/title of the event */
  summary: string;
  /** Source calendar index (0-based) where duplicate was found */
  sourceIndex: number;
  /** Original calendar index (0-based) where event first appeared */
  originalIndex: number;
}

/**
 * Result of merging calendar files
 */
export interface MergeResult {
  /** Merged ICS content as string */
  content: string;
  /** Total number of events in merged calendar */
  totalEvents: number;
  /** Number of source calendars that were merged */
  sourceCount: number;
  /** Metadata about the merge operation */
  metadata: {
    /** Timestamp of when the merge was performed */
    mergedAt: Date;
    /** Duplicate handling mode that was used */
    duplicateHandling: DuplicateHandling;
    /** Number of duplicates found */
    duplicatesFound: number;
    /** Number of duplicates removed (only when duplicates='remove') */
    duplicatesRemoved: number;
    /** Details of duplicates found (when duplicates='warn' or 'remove') */
    duplicateDetails: DuplicateInfo[];
  };
}

/**
 * Input for merge operation - supports both parsed calendars and raw ICS strings
 */
export type MergeInput = string | ParsedCalendar;
