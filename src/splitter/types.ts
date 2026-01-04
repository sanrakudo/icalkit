/**
 * Sort order for events before splitting
 */
export type SortOrder = 'dtstart' | 'original';

/**
 * Options for splitting calendar files
 */
export interface SplitOptions {
  /** Number of events per chunk (default: 500) */
  chunkSize?: number;
  /** Output directory for Node.js CLI (default: current directory) */
  outputDir?: string;
  /** File name pattern with {n} and {total} placeholders */
  fileNamePattern?: string;
  /** Sort order for events before splitting (default: 'dtstart') */
  sortBy?: SortOrder;
}

/**
 * Result of splitting a calendar file
 */
export interface SplitResult {
  /** Array of calendar chunks */
  chunks: ICSChunk[];
  /** Total number of events in the original calendar */
  totalEvents: number;
  /** Metadata about the split operation */
  metadata: {
    /** Original file name (if provided) */
    originalFileName?: string;
    /** Timestamp of when the split was performed */
    splitAt: Date;
    /** Chunk size used for splitting */
    chunkSize: number;
  };
}

/**
 * Represents a single chunk of a split calendar file
 */
export interface ICSChunk {
  /** File name for this chunk */
  fileName: string;
  /** ICS content for this chunk */
  content: string;
  /** Number of events in this chunk */
  eventCount: number;
  /** Range of event indices in the original calendar */
  eventRange?: {
    start: number;
    end: number;
  };
}
