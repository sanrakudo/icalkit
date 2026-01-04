/**
 * iCalKit - iCalendar file management library
 * @module icalkit
 */

import packageJson from '../package.json' with { type: 'json' };

export const version = packageJson.version;

// Common utilities
export { parseICalContent } from './common/parser.js';
export {
  extractEvents,
  sortEventsByDate,
  filterEvents,
} from './common/events.js';

// Common types
export type { ICalEvent, ParsedCalendar } from './common/types.js';

// Splitter functionality
export { split } from './splitter/index.js';

// Splitter types
export type {
  SplitOptions,
  SplitResult,
  ICSChunk,
  SortOrder,
} from './splitter/index.js';

// Merger functionality
export { merge } from './merger/index.js';

// Merger types
export type {
  MergeOptions,
  MergeResult,
  MergeInput,
  DuplicateHandling,
  DuplicateInfo,
} from './merger/index.js';

/**
 * View iCalendar file information
 * @param inputPath - Path to the .ics file
 */
export async function view(inputPath: string): Promise<{
  eventCount: number;
  todoCount: number;
  calendarName: string;
}> {
  // TODO: Implement view functionality
  throw new Error('Not implemented yet');
}

/**
 * Clean duplicate events from iCalendar file
 * @param inputPath - Path to the .ics file
 * @param options - Clean options
 */
export async function clean(
  inputPath: string,
  options?: {
    outputPath?: string;
  },
): Promise<{ removed: number; kept: number }> {
  // TODO: Implement clean functionality
  throw new Error('Not implemented yet');
}
