#!/usr/bin/env node

/**
 * iCalKit CLI
 * Command-line interface for iCalendar file management
 */

import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lib from './index.js';

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

export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for global flags first
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    showVersion();
    process.exit(0);
  }

  const command = args[0];

  if (!(command in COMMANDS)) {
    console.error(`Error: Unknown command '${command}'`);
    console.error(`Run 'icalkit --help' for usage information.`);
    process.exit(1);
  }

  try {
    switch (command) {
      case 'split': {
        const { values, positionals } = parseArgs({
          args: args.slice(1),
          options: {
            'chunk-size': { type: 'string' },
            'output-dir': { type: 'string' },
          },
          allowPositionals: true,
        });

        const inputFile = positionals[0];
        if (!inputFile) {
          console.error('Error: Missing input file');
          process.exit(1);
        }

        const options = {
          chunkSize: values['chunk-size'] ? parseInt(values['chunk-size'], 10) : undefined,
          outputDir: values['output-dir'],
        };

        // TODO: Call lib.split()
        console.log('Split command not yet implemented');
        console.log('Input:', inputFile);
        console.log('Options:', options);
        break;
      }

      case 'merge': {
        const { values, positionals } = parseArgs({
          args: args.slice(1),
          options: {
            output: { type: 'string', short: 'o' },
          },
          allowPositionals: true,
        });

        const inputFiles = positionals;
        if (inputFiles.length === 0) {
          console.error('Error: Missing input files');
          process.exit(1);
        }

        const outputPath = values.output;
        if (!outputPath) {
          console.error('Error: Missing output file (use -o or --output)');
          process.exit(1);
        }

        // TODO: Call lib.merge()
        console.log('Merge command not yet implemented');
        console.log('Inputs:', inputFiles);
        console.log('Output:', outputPath);
        break;
      }

      case 'view': {
        const { positionals } = parseArgs({
          args: args.slice(1),
          options: {},
          allowPositionals: true,
        });

        const inputFile = positionals[0];
        if (!inputFile) {
          console.error('Error: Missing input file');
          process.exit(1);
        }

        // TODO: Call lib.view()
        console.log('View command not yet implemented');
        console.log('Input:', inputFile);
        break;
      }

      case 'clean': {
        const { values, positionals } = parseArgs({
          args: args.slice(1),
          options: {
            output: { type: 'string', short: 'o' },
          },
          allowPositionals: true,
        });

        const inputFile = positionals[0];
        if (!inputFile) {
          console.error('Error: Missing input file');
          process.exit(1);
        }

        const options = {
          outputPath: values.output,
        };

        // TODO: Call lib.clean()
        console.log('Clean command not yet implemented');
        console.log('Input:', inputFile);
        console.log('Options:', options);
        break;
      }
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      console.error(`Error: ${error.message}`);
      console.error(`Run 'icalkit ${command} --help' for usage information.`);
      process.exit(1);
    }
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run CLI if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
