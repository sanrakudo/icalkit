import { parseArgs } from 'node:util';

export async function handleMergeCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', short: 'o' },
    },
    allowPositionals: true,
  });

  const inputFiles = positionals;
  if (inputFiles.length === 0) {
    throw new Error('Missing input files');
  }

  const outputPath = values.output;
  if (!outputPath) {
    throw new Error('Missing output file (use -o or --output)');
  }

  // TODO: Call lib.merge()
  console.log('Merge command not yet implemented');
  console.log('Inputs:', inputFiles);
  console.log('Output:', outputPath);
}
