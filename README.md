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
[license-url]: LICENSE

iCalendar file management - CLI tools and Node.js API for working with .ics files.

## Features

- **Split** - Split large iCal files into smaller chunks for easy import into Google Calendar
- **Merge** - Combine multiple iCal files into one with duplicate detection
- **View** - View and browse iCal file contents _(Coming Soon)_
- **Clean** - Remove duplicate events and clean up your calendar _(Coming Soon)_

## Web Application

A browser-based version is available at **[https://icalkit.app](https://icalkit.app)**

## Installation

```bash
npm install -g icalkit
```

## CLI Usage

### Split

Split a large iCal file into smaller chunks:

```bash
# Basic split (default: 1000 events per file)
icalkit split calendar.ics -o output/

# Custom chunk size
icalkit split calendar.ics -o output/ --chunk-size 500

# Sort events before splitting
icalkit split calendar.ics -o output/ --sort-by start-asc
```

### Merge

Combine multiple iCal files:

```bash
# Basic merge
icalkit merge cal1.ics cal2.ics -o merged.ics

# With duplicate handling
icalkit merge cal1.ics cal2.ics -o merged.ics --duplicates remove

# With custom calendar name
icalkit merge cal1.ics cal2.ics -o merged.ics --name "My Calendar"
```

Duplicate handling options:

- `warn` (default) - Keep all events, warn about duplicates
- `remove` - Remove duplicate events (keep first occurrence)
- `keep-all` - Keep all events without warnings

## API Usage

```typescript
import { split, merge, parseCalendar, extractEvents } from 'icalkit';

// Split a calendar
const result = await split(icsContent, { chunkSize: 500 });
console.log(result.chunks); // Array of ICS strings

// Merge calendars
const merged = await merge([icsContent1, icsContent2], {
  duplicates: 'remove',
  calendarName: 'Merged Calendar',
});
console.log(merged.content); // Merged ICS string

// Parse and extract events
const calendar = parseCalendar(icsContent);
const events = extractEvents(calendar.vevents);
```

## Development

### Requirements

- Node.js >= 24.12.0
- pnpm >= 10.27.0

### Setup

```bash
# Clone the repository
git clone https://github.com/sanrakudo/icalkit.git
cd icalkit

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test:run

# Check formatting and linting
pnpm check
```

### Using mise (recommended)

This project uses [mise](https://mise.jdx.dev/) for managing tool versions.

```bash
# Install mise
curl https://mise.run | sh

# Install tools (Node.js and pnpm)
mise install
```

## Publishing

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

1. Commit using [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   ```

2. Push to `main` branch
3. release-please automatically creates release PRs and publishes to npm

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with [ical.js](https://github.com/mozilla-comm/ical.js) for iCalendar parsing
