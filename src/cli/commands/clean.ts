import { parseArgs } from 'node:util';

export async function handleCleanCommand(args: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', short: 'o' },
    },
    allowPositionals: true,
  });

  const inputFile = positionals[0];
  if (!inputFile) {
    throw new Error('Missing input file');
  }

  const options = {
    outputPath: values.output,
  };

  // TODO: Call lib.clean()
  console.log('Clean command not yet implemented');
  console.log('Input:', inputFile);
  console.log('Options:', options);
}
