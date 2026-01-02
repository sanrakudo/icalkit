import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { split } from '../../splitter/index.js';
import { writeChunksToDirectory } from '../node.js';

export async function handleSplitCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      'chunk-size': { type: 'string' },
      'output-dir': { type: 'string' },
    },
    allowPositionals: true,
  });

  const inputFile = positionals[0];
  if (!inputFile) {
    throw new Error('Missing input file');
  }

  const options = {
    chunkSize: values['chunk-size']
      ? parseInt(values['chunk-size'], 10)
      : undefined,
    outputDir: values['output-dir'] || '.',
  };

  // Read input file
  const content = await readFile(inputFile, 'utf-8');

  // Split the calendar
  const result = await split(content, options);

  // Write chunks to directory
  const filePaths = await writeChunksToDirectory(
    result.chunks,
    options.outputDir,
  );

  // Log success
  console.log(
    `✓ Split ${result.totalEvents} events into ${result.chunks.length} files`,
  );
  filePaths.forEach((path) => console.log(`  - ${path}`));
}
