/**
 * iCalKit CLI
 * Command-line interface for iCalendar file management
 */

import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
const VERSION = packageJson.version;

const COMMANDS = {
  split: 'Split large iCal files into smaller chunks',
  merge: 'Merge multiple iCal files into one',
  view: 'View iCal file contents',
  clean: 'Remove duplicate events',
} as const;

function showHelp(): void {
  console.log(`
iCalKit v${VERSION}
iCalendar file management tool

Usage:
  icalkit <command> [options]

Commands:
  split <file>              Split large iCal file into chunks
    --chunk-size <n>        Events per chunk (default: 500)
    --output-dir <dir>      Output directory (default: current)

  merge <files...>          Merge multiple iCal files
    -o, --output <file>     Output file path

  view <file>               View iCal file information

  clean <file>              Remove duplicate events
    -o, --output <file>     Output file path (default: overwrites input)

Options:
  -h, --help               Show this help message
  -v, --version            Show version number

Examples:
  icalkit split calendar.ics --chunk-size 500
  icalkit merge file1.ics file2.ics -o merged.ics
  icalkit view calendar.ics
  icalkit clean calendar.ics -o cleaned.ics

Documentation: https://github.com/sanrakudo/icalkit
`);
}

function showVersion(): void {
  console.log(`iCalKit v${VERSION}`);
}

async function handleSplitCommand(args: string[]): Promise<void> {
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
    outputDir: values['output-dir'],
  };

  // TODO: Call lib.split()
  console.log('Split command not yet implemented');
  console.log('Input:', inputFile);
  console.log('Options:', options);
}

async function handleMergeCommand(args: string[]): Promise<void> {
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

async function handleViewCommand(args: string[]): Promise<void> {
  const { positionals } = parseArgs({
    args,
    options: {},
    allowPositionals: true,
  });

  const inputFile = positionals[0];
  if (!inputFile) {
    throw new Error('Missing input file');
  }

  // TODO: Call lib.view()
  console.log('View command not yet implemented');
  console.log('Input:', inputFile);
}

async function handleCleanCommand(args: string[]): Promise<void> {
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

export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for global flags first
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('-v') || args.includes('--version')) {
    showVersion();
    return;
  }

  const command = args[0];

  if (!(command in COMMANDS)) {
    throw new Error(
      `Unknown command '${command}'\nRun 'icalkit --help' for usage information.`,
    );
  }

  try {
    const commandArgs = args.slice(1);
    switch (command) {
      case 'split':
        await handleSplitCommand(commandArgs);
        break;
      case 'merge':
        await handleMergeCommand(commandArgs);
        break;
      case 'view':
        await handleViewCommand(commandArgs);
        break;
      case 'clean':
        await handleCleanCommand(commandArgs);
        break;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
    ) {
      throw new Error(
        `${error.message}\nRun 'icalkit ${command} --help' for usage information.`,
      );
    }
    throw error;
  }
}

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  });
}
