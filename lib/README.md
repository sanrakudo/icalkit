# iCalKit

[![CI][ci-badge]][ci-url]
[![npm version][npm-badge]][npm-url]
[![License: MIT][license-badge]][license-url]

<!-- Badge References -->

[ci-badge]: https://github.com/sanrakudo/icalkit/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/sanrakudo/icalkit/actions/workflows/ci.yml
[npm-badge]: https://img.shields.io/npm/v/icalkit.svg
[npm-url]: https://www.npmjs.com/package/icalkit
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/sanrakudo/icalkit/blob/main/LICENSE

iCalendar file management - CLI tools and Node.js API

## 📦 Installation

```bash
# CLI usage
npm install -g icalkit

# API usage (in your project)
npm install icalkit
```

## 🚀 Usage

### CLI

```bash
# Split large iCal files
icalkit split calendar.ics --chunk-size 1000

# View iCal file contents
icalkit view calendar.ics

# Merge multiple files
icalkit merge file1.ics file2.ics -o merged.ics

# Clean duplicates
icalkit clean calendar.ics
```

### Node.js API

```typescript
import { split, merge, view, clean } from 'icalkit';

// Split iCal file
const result = await split('calendar.ics', { chunkSize: 1000 });

// Merge multiple files
await merge(['file1.ics', 'file2.ics'], 'output.ics');

// View calendar info
const info = await view('calendar.ics');

// Clean duplicates
await clean('calendar.ics', { outputPath: 'cleaned.ics' });
```

## 🛠️ Development

This package is part of the iCalKit monorepo.

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Build
pnpm build:lib

# Run in development mode
pnpm --filter icalkit dev
```

## 📝 Features (Coming Soon)

- ✅ Split large iCal files into smaller chunks
- ✅ Merge multiple iCal files
- ✅ View and analyze calendar contents
- ✅ Remove duplicate events
- ✅ Clean up calendar data
- ✅ Both CLI and programmatic API

## 📄 License

MIT
