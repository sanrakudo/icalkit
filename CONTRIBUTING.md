# Contributing to iCalKit

Thanks for your interest in contributing!

## Development Setup

### Prerequisites

- Node.js >= 24.12.0
- pnpm >= 10.27.0 (or use [mise](https://mise.jdx.dev/))

```bash
# Using mise (recommended)
curl https://mise.run | sh
mise install

# Or install manually
npm install -g pnpm
```

### Getting Started

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
```

## Project Structure

```
icalkit/
├── src/
│   ├── common/       # Shared utilities (parser, events, types)
│   ├── splitter/     # Split functionality
│   ├── merger/       # Merge functionality
│   ├── cli/          # CLI implementation
│   │   ├── commands/ # Command handlers (split, merge, view, clean)
│   │   ├── index.ts  # CLI router
│   │   └── node.ts   # Node.js-specific utilities
│   └── index.ts      # Public API exports
├── bin/              # CLI executables
├── package.json
└── tsconfig.json
```

## Design Guidelines

### Architecture

- **Isomorphic Core**: `common/`, `splitter/`, `merger/` must work in browser and Node.js
- **Node.js Isolation**: All Node.js-specific code (fs, process) goes in `cli/`
- **Public API**: Only export from `src/index.ts` what's needed externally

### Code Style

- **TypeScript**: Use proper typing, avoid `any`
- **Naming**: Clear, descriptive variable and function names
- **Functions**: Keep functions focused and small
- **Error Handling**: Handle errors gracefully

## Testing

Before submitting:

```bash
pnpm build      # Build
pnpm check      # Format + lint
pnpm test:run   # Run tests
pnpm license    # Check licenses
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with conventional commits
6. Push and open a Pull Request

## Commit Message Format

We use conventional commits for automated releases:

- `feat:` - New feature (minor bump)
- `fix:` - Bug fix (patch bump)
- `feat!:` - Breaking change (major bump)
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Tests

Example: `feat: add event filtering to splitter`

## Questions?

Feel free to open an issue for discussion before starting work on major features!

---

Thank you for contributing!
