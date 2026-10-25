import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { clean } from '../../cleaner/index.js';
import type { DuplicateDetection } from '../../cleaner/types.js';

export async function handleCleanCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', short: 'o' },
      duplicates: { type: 'string', short: 'd' },
      'remove-cancelled': { type: 'boolean' },
      'remove-tentative': { type: 'boolean' },
      'remove-empty': { type: 'boolean' },
      'remove-orphan-tz': { type: 'boolean' },
    },
    allowPositionals: true,
  });

  const inputFile = positionals[0];
  if (!inputFile) {
    throw new Error(
      'Missing input file. Usage: icalkit clean input.ics -o output.ics [options]',
    );
  }

  const outputPath = values.output;
  if (!outputPath) {
    throw new Error('Missing output file (use -o or --output)');
  }

  // Validate duplicates option
  if (values.duplicates && !['uid', 'content'].includes(values.duplicates)) {
    throw new Error(
      `Invalid duplicates option: "${values.duplicates}". Valid options: uid, content`,
    );
  }

  // Check that at least one clean option is provided
  const hasAnyOption =
    values.duplicates !== undefined ||
    values['remove-cancelled'] === true ||
    values['remove-tentative'] === true ||
    values['remove-empty'] === true ||
    values['remove-orphan-tz'] === true;

  if (!hasAnyOption) {
    throw new Error(
      'At least one clean option is required. Available options: --duplicates, --remove-cancelled, --remove-tentative, --remove-empty, --remove-orphan-tz',
    );
  }

  // Read input file
  let content: string;
  try {
    content = await readFile(inputFile, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to read file "${inputFile}": ${(error as Error).message}`,
    );
  }

  // Clean calendar
  const result = await clean(content, {
    duplicates: values.duplicates as DuplicateDetection | undefined,
    removeCancelled: values['remove-cancelled'],
    removeTentative: values['remove-tentative'],
    removeEmpty: values['remove-empty'],
    removeOrphanedTimezones: values['remove-orphan-tz'],
  });

  // Write output file
  await writeFile(outputPath, result.content, 'utf-8');

  // Log success
  console.log(`Cleaned ${inputFile} -> ${outputPath}`);
  console.log(
    `  Events: ${result.metadata.originalEventCount} -> ${result.eventCount}`,
  );

  if (result.metadata.removedCount > 0) {
    console.log(`  Removed: ${result.metadata.removedCount} items`);
    const { removedByReason } = result.metadata;
    if (removedByReason.duplicates > 0) {
      console.log(`    - Duplicates: ${removedByReason.duplicates}`);
    }
    if (removedByReason.cancelled > 0) {
      console.log(`    - Cancelled: ${removedByReason.cancelled}`);
    }
    if (removedByReason.tentative > 0) {
      console.log(`    - Tentative: ${removedByReason.tentative}`);
    }
    if (removedByReason.empty > 0) {
      console.log(`    - Empty: ${removedByReason.empty}`);
    }
    if (removedByReason.orphanedTimezones > 0) {
      console.log(
        `    - Orphaned timezones: ${removedByReason.orphanedTimezones}`,
      );
    }
  }
}
