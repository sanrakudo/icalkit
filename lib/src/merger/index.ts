/**
 * Merger module - Merge multiple iCalendar files into one
 */

export { merge, mergeCalendars } from './merger.js';

export type {
  MergeOptions,
  MergeResult,
  MergeInput,
  DuplicateHandling,
  DuplicateInfo,
} from './types.js';
