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

🗓️ A collection of powerful tools for working with iCalendar (.ics) files - available as web apps and CLI utilities.

## 🌟 Features

### Web Tools (Browser-based, No Server Required)

- **📂 Splitter** - Split large iCal files into smaller chunks for easy import into Google Calendar and other services
- **👁️ Viewer** - View and browse iCal file contents in a beautiful, searchable interface _(Coming Soon)_
- **🔀 Merger** - Combine multiple iCal files into one _(Coming Soon)_
- **🧹 Cleaner** - Remove duplicate events and clean up your calendar _(Coming Soon)_

### CLI Tools _(Coming Soon)_

Command-line utilities for automation and scripting:

```bash
# Split an iCal file
ical-split calendar.ics --chunk-size 500

# View iCal file contents
ical-view calendar.ics

# Merge multiple files
ical-merge file1.ics file2.ics -o merged.ics
```

## 🚀 Getting Started

### Web Tools

Visit the live demo: **[https://icalkit.app](https://icalkit.app)**

Or run locally:

```bash
# Clone the repository
git clone https://github.com/sanrakudo/icalkit.git
cd icalkit

# Install dependencies (requires pnpm)
pnpm install

# Start development server
pnpm dev
# Then visit http://localhost:5173

# Or build for production
pnpm build
pnpm --filter icalkit-web preview
```

### CLI Tools _(Coming Soon)_

```bash
npm install -g icalkit
```

## 📖 Usage

### Splitter

The splitter helps you break down large iCal files that exceed import limits for services like Google Calendar (typically 1MB or ~1000 events).

**Features:**

- Adjustable chunk size (default: 500 events)
- Preserves all calendar properties and metadata
- Generates numbered files for easy sequential import
- Downloads as a convenient ZIP archive
- Search and preview events before splitting

**Use Cases:**

- Importing large historical calendars into Google Calendar
- Breaking down conference schedules
- Splitting multi-year calendars for better organization

### Viewer _(Coming Soon)_

Browse and search through your iCal files with ease.

## 🛠️ Technology Stack

- **Web**: React 19 + TypeScript, Vite, React Router, Tailwind CSS 4, ical.js, JSZip
- **CLI**: Node.js _(Coming Soon)_
- **Package Manager**: pnpm (monorepo with workspaces)
- **No backend required** - All processing happens client-side/locally

## 📦 Monorepo Structure

This project uses pnpm workspaces for monorepo management:

```
icalkit/
├── web/           # icalkit-web - React web application
├── lib/           # icalkit - CLI tools & Node.js API (npm package)
├── package.json   # Root package with workspace scripts
└── pnpm-workspace.yaml
```

### Available Scripts

From the root directory:

```bash
pnpm dev              # Start web dev server
pnpm build            # Build all packages
pnpm build:web        # Build web only
pnpm build:lib        # Build lib (icalkit) only
pnpm lint             # Lint all packages
pnpm generate-images  # Generate PNG images from logos
```

### Requirements

- Node.js >= 24.0.0
- pnpm >= 9.0.0

**Using mise (recommended):**

This project uses [mise](https://mise.jdx.dev/) for managing tool versions.

```bash
# Install mise
curl https://mise.run | sh

# Install tools (Node.js and pnpm)
mise install

# Tools will be automatically activated when you cd into the project
```

**Manual installation:**

```bash
# Install Node.js 24
# https://nodejs.org/

# Install pnpm
npm install -g pnpm
```

## 🚀 Deployment

The web application is deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

**Live URL:** [https://icalkit.app](https://icalkit.app)

### Quick Start

**Automatic Deployment:**

- Push to `main` branch → Cloudflare Pages automatically builds and deploys
- Pull requests → Automatic preview deployments

### Setup Guide

For detailed deployment instructions including:

- Initial Cloudflare Pages setup
- Custom domain configuration with Bulk Redirects
- Wrangler CLI usage
- Troubleshooting

See: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## 📦 Publishing

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

### How it works

1. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   ```

2. Push to `main` branch
3. release-please will automatically:
   - Create a release PR with changelog for `icalkit` package
   - Bump version number
   - Create GitHub releases
   - Publish to npm

**Note:** The web application (`icalkit-web`) is continuously deployed to Cloudflare Pages and doesn't use version management.

### Commit Types

- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `feat!:` or `fix!:` - Breaking change (major version bump)
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `perf:` - Performance improvements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [ical.js](https://github.com/mozilla-comm/ical.js) for iCalendar parsing
- [JSZip](https://stuk.github.io/jszip/) for ZIP file generation
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

## 📮 Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/sanrakudo/icalkit/issues).

---

Made with ❤️ for the calendar enthusiast community
