import type { ParsedCalendar } from '../common/types.js';

/**
 * Method for detecting duplicate events
 */
export type DuplicateDetection = 'uid' | 'content';

/**
 * Options for cleaning calendar files
 */
export interface CleanOptions {
  /**
   * Remove duplicate events using specified detection method
   * - 'uid': Same UID (strict duplicate)
   * - 'content': Same start time + same summary
   */
  duplicates?: DuplicateDetection;
  /** Remove cancelled events (STATUS:CANCELLED) */
  removeCancelled?: boolean;
  /** Remove tentative events (STATUS:TENTATIVE) */
  removeTentative?: boolean;
  /** Remove empty events (missing SUMMARY or DTSTART) */
  removeEmpty?: boolean;
  /** Remove orphaned VTIMEZONE components (not referenced by any event) */
  removeOrphanedTimezones?: boolean;
}

/**
 * Information about a removed item during clean operation
 */
export interface RemovedItemInfo {
  /** Type of removal reason */
  reason:
    | 'duplicate-uid'
    | 'duplicate-content'
    | 'cancelled'
    | 'tentative'
    | 'empty'
    | 'orphaned-timezone';
  /** UID of the event (if applicable) */
  uid?: string;
  /** Summary/title of the event (if applicable) */
  summary?: string;
  /** Timezone ID (for orphaned timezone removal) */
  tzid?: string;
}

/**
 * Result of cleaning calendar file
 */
export interface CleanResult {
  /** Cleaned ICS content as string */
  content: string;
  /** Number of events in cleaned calendar */
  eventCount: number;
  /** Metadata about the clean operation */
  metadata: {
    /** Timestamp of when the clean was performed */
    cleanedAt: Date;
    /** Original event count before cleaning */
    originalEventCount: number;
    /** Number of items removed */
    removedCount: number;
    /** Breakdown of removed items by reason */
    removedByReason: {
      duplicates: number;
      cancelled: number;
      tentative: number;
      empty: number;
      orphanedTimezones: number;
    };
    /** Details of removed items */
    removedItems: RemovedItemInfo[];
  };
}

/**
 * Input for clean operation - supports both parsed calendars and raw ICS strings
 */
export type CleanInput = string | ParsedCalendar;
