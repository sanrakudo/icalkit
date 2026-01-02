#!/usr/bin/env node

/**
 * iCalKit CLI Entry Point
 * This is a small wrapper that imports and runs the compiled TypeScript CLI
 */

import('../dist/cli.js')
  .then((module) => module.main())
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
