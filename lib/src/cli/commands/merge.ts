import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { merge } from '../../merger/index.js';
import type { DuplicateHandling } from '../../merger/types.js';

export async function handleMergeCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', short: 'o' },
      duplicates: { type: 'string', short: 'd' },
      name: { type: 'string', short: 'n' },
    },
    allowPositionals: true,
  });

  const inputFiles = positionals;
  if (inputFiles.length === 0) {
    throw new Error(
      'Missing input files. Usage: icalkit merge file1.ics file2.ics -o output.ics',
    );
  }

  if (inputFiles.length === 1) {
    throw new Error('At least two input files are required for merging');
  }

  const outputPath = values.output;
  if (!outputPath) {
    throw new Error('Missing output file (use -o or --output)');
  }

  // Validate duplicates option
  const duplicatesOption = values.duplicates ?? 'warn';
  if (!['keep-all', 'remove', 'warn'].includes(duplicatesOption)) {
    throw new Error(
      `Invalid duplicates option: "${duplicatesOption}". Valid options: keep-all, remove, warn`,
    );
  }

  // Read all input files
  const contents: string[] = [];
  for (const inputFile of inputFiles) {
    try {
      const content = await readFile(inputFile, 'utf-8');
      contents.push(content);
    } catch (error) {
      throw new Error(
        `Failed to read file "${inputFile}": ${(error as Error).message}`,
      );
    }
  }

  // Merge calendars
  const result = await merge(contents, {
    duplicates: duplicatesOption as DuplicateHandling,
    calendarName: values.name,
  });

  // Write output file
  await writeFile(outputPath, result.content, 'utf-8');

  // Log success
  console.log(`Merged ${result.sourceCount} calendars into ${outputPath}`);
  console.log(`  Total events: ${result.totalEvents}`);

  if (result.metadata.duplicatesFound > 0) {
    if (result.metadata.duplicateHandling === 'remove') {
      console.log(`  Duplicates removed: ${result.metadata.duplicatesRemoved}`);
    } else {
      console.log(`  Duplicates found: ${result.metadata.duplicatesFound}`);
    }
  }
}
