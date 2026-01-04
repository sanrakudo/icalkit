# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iCalKit is an npm package providing CLI tools and Node.js API for managing iCalendar (.ics) files.

## Development Workflow

### After Code Changes

Always run these commands after making code changes:

```bash
pnpm build              # Build the package
pnpm check              # Format check + lint
pnpm test:run           # Run all tests
```

This ensures code quality and that changes don't break existing functionality.

### Commits

- The user handles all git commits
- When a task is completed, suggest a commit message using Conventional Commits format
- Use `git status` to check what files have changed before suggesting the message

## Common Commands

### Development

```bash
pnpm dev                # Watch mode build
pnpm build              # Build for production
```

### Testing

```bash
pnpm test               # Run tests in watch mode
pnpm test:run           # Run tests once
pnpm test:ui            # Run tests with Vitest UI
pnpm test:coverage      # Run tests with coverage
```

### Quality Checks

```bash
pnpm check              # Run format check + lint
pnpm lint               # Lint code
pnpm format             # Format all files with Prettier
pnpm fix                # Auto-fix formatting and linting issues
pnpm license            # Check dependency licenses
pnpm typecheck          # Run TypeScript type checking
```

### CLI Testing

```bash
node bin/icalkit.js --help          # Test CLI help
node bin/icalkit.js split test.ics  # Test split command
node bin/icalkit.js merge a.ics b.ics -o out.ics  # Test merge command
```

## Architecture

### Project Structure

```
src/
├── common/           # Shared utilities (parser, events, types)
├── splitter/         # Split functionality
├── merger/           # Merge functionality
├── cli/              # CLI implementation
│   ├── commands/     # Individual command handlers (split, merge, view, clean)
│   ├── index.ts      # CLI router
│   └── node.ts       # Node.js-specific utilities (file I/O)
└── index.ts          # Public API exports
```

### Key Design Principles

1. **Isomorphic Core:** `common/`, `splitter/`, and `merger/` are platform-agnostic (work in browser & Node.js)
2. **Node.js Isolation:** All Node.js-specific code (fs, process) lives in `cli/`
3. **Public API:** Only explicitly exported functions in `src/index.ts` are public API
4. **CLI Commands:** Each command (split, merge, view, clean) is a separate file in `cli/commands/`

### API vs CLI

- **API:** Exported from `src/index.ts` for use in other packages
- **CLI:** Implemented in `src/cli/` and exported via `bin/icalkit.js`

### Implementation Status

- ✅ `split`: Fully implemented
- ✅ `merge`: Fully implemented
- ⏳ `view`, `clean`: Stubs exist (throw "Not implemented yet")

### Testing Strategy

- Unit tests: `*.test.ts` files alongside implementation
- Integration tests: `src/integration.test.ts` (real ICS formats, Google Calendar exports)
- Test on Node.js 20, 22, 24 in CI

### CI/CD

**CI Jobs (run in parallel):**

- `check`: Format + lint (needs build first)
- `test`: Tests on Node.js 20/22/24 matrix (needs build first)
- `license`: License check
- `build`: Verify build succeeds

**Publishing:**

- npm via release-please (on release PR merge)

### Commit Conventions

Use Conventional Commits for release-please automation:

```bash
feat: new feature (minor bump)
fix: bug fix (patch bump)
feat!: breaking change (major bump)
docs: documentation
chore: maintenance
```

### ESLint Configuration

Uses `@cybozu/eslint-config` with these customizations:

- CLI files can use `process.exit()`
- ical.js is explicitly allowed despite ESLint resolution issues
- bin files can import from dist (won't exist during linting)

### Tool Versions

- Node.js: >=24.12.0
- pnpm: >=10.27.0
- Uses mise for version management (see `.mise.toml`)

### Common Pitfalls

1. **ical.js imports:** Always use static imports, not dynamic (for better bundling)
2. **Variable shadowing:** ESLint will catch this - avoid reusing variable names in nested scopes
3. **Browser vs Node.js:** Keep platform-specific code isolated (cli/ for Node.js only)
