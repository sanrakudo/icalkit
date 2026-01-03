/**
 * Splitter module - Split large iCalendar files into smaller chunks
 */

export { split } from './splitter.js';

export type {
  SplitOptions,
  SplitResult,
  ICSChunk,
  SortOrder,
} from './types.js';
