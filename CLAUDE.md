# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iCalKit is a monorepo containing tools for managing iCalendar (.ics) files:

- **lib** (`icalkit`): npm package providing CLI tools and Node.js API
- **web** (`icalkit-web`): React web application deployed to Cloudflare Pages

## Development Workflow

### After Code Changes

Always run these commands after making code changes:

```bash
pnpm build              # Build all packages
pnpm check              # Format check + lint
pnpm test               # Run all tests
```

This ensures code quality and that changes don't break existing functionality.

### Commits

- The user handles all git commits
- When a task is completed, suggest a commit message using Conventional Commits format
- Use `git status` to check what files have changed before suggesting the message

## Common Commands

### Development

```bash
pnpm dev                # Start web dev server
pnpm build              # Build lib → web (in dependency order)
pnpm build:lib          # Build lib only
pnpm build:web          # Build web only
```

### Testing

```bash
pnpm test               # Run all tests (lib + web)
pnpm --filter icalkit test         # Run lib tests only
pnpm --filter icalkit-web test     # Run web tests only
pnpm --filter icalkit test:ui      # Run lib tests with Vitest UI
```

### Quality Checks

```bash
pnpm check              # Run format check + lint
pnpm lint               # Lint all packages
pnpm format             # Format all files with Prettier
pnpm fix                # Auto-fix formatting and linting issues
pnpm license            # Check dependency licenses
```

### CLI Testing (lib)

```bash
node bin/icalkit.js --help          # Test CLI help
node bin/icalkit.js split test.ics  # Test split command
```

### Deployment

```bash
pnpm deploy             # Build and deploy web to Cloudflare Pages
pnpm deploy:preview     # Deploy preview branch
```

## Architecture

### Monorepo Structure

This is a pnpm workspace monorepo with strict dependency order:

```
lib (icalkit)
  ↓ workspace:* dependency
web (icalkit-web)
```

**Critical:** Always build `lib` before `web` because web imports from lib via workspace dependency.

### lib (icalkit) Package

**Structure:**

```
lib/src/
├── common/           # Shared utilities (parser, events, types)
├── splitter/         # Split functionality
├── cli/              # CLI implementation
│   ├── commands/     # Individual command handlers (split, merge, view, clean)
│   ├── index.ts      # CLI router
│   └── node.ts       # Node.js-specific utilities (file I/O)
└── index.ts          # Public API exports
```

**Key Design Principles:**

1. **Isomorphic Core:** `common/` and `splitter/` are platform-agnostic (work in browser & Node.js)
2. **Node.js Isolation:** All Node.js-specific code (fs, process) lives in `cli/`
3. **Public API:** Only explicitly exported functions in `lib/src/index.ts` are public API
4. **CLI Commands:** Each command (split, merge, view, clean) is a separate file in `cli/commands/`

**API vs CLI:**

- **API:** Exported from `lib/src/index.ts` for use in web and other packages
- **CLI:** Implemented in `lib/src/cli/` and exported via `bin/icalkit.js`

**Implementation Status:**

- ✅ `split`: Fully implemented
- ⏳ `merge`, `view`, `clean`: Stubs exist (throw "Not implemented yet")

### web (icalkit-web) Package

**Structure:**

```
web/src/
├── pages/            # Route components (Home, Splitter)
├── components/       # Reusable UI components
├── test/             # Test setup (vitest)
└── App.tsx           # Router setup
```

**Key Points:**

- Imports from `icalkit` lib via workspace dependency
- All processing happens client-side (no backend)
- Uses JSZip for browser-only ZIP creation (not in lib)

### Dependency Management

**ical.js Handling:**

- ical.js has non-standard module structure
- ESLint requires special config: `allowModules: ['ical.js']` in lib/eslint.config.js
- This is intentional and correct

**Build Order Matters:**

- `pnpm build` runs `build:lib` then `build:web`
- CI jobs that need both packages must run `pnpm build` first
- Tests and checks require built lib because web imports from it

### Testing Strategy

**lib Tests:**

- Unit tests: `*.test.ts` files alongside implementation
- Integration tests: `lib/src/integration.test.ts` (real ICS formats, Google Calendar exports)
- Test on Node.js 20, 22, 24 in CI

**web Tests:**

- Component tests using React Testing Library
- Test setup: `web/src/test/setup.ts` imports jest-dom matchers

### CI/CD

**CI Jobs (run in parallel):**

- `check`: Format + lint (needs build first)
- `test`: Tests on Node.js 20/22/24 matrix (needs build first)
- `license`: License check
- `build`: Verify build succeeds

**Deployment:**

- Web: Cloudflare Pages (automatic on push to main)
- lib: npm via release-please (on release PR merge)

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

- Node.js: >=24.0.0 (root), >=20.0.0 (lib package)
- pnpm: >=10.26.2
- Uses mise for version management (see `.mise.toml`)

### Common Pitfalls

1. **Don't skip lib build:** Web won't work without lib being built first
2. **workspace:\* dependency:** web's package.json references `"icalkit": "workspace:*"`
3. **Browser vs Node.js:** Keep platform-specific code isolated (cli/ for Node.js, web for browser)
4. **ical.js imports:** Always use static imports, not dynamic (for better bundling)
5. **Variable shadowing:** ESLint will catch this - avoid reusing variable names in nested scopes
