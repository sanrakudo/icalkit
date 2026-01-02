# Contributing to iCalKit

Thanks for your interest in contributing! 🎉

## Development Setup

### Prerequisites

- Node.js >= 24.0.0
- pnpm >= 9.0.0 (or use [mise](https://mise.jdx.dev/))

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

# Start development server
pnpm dev

# Open http://localhost:5173
```

### Building

```bash
# Build all packages
pnpm build

# Build web only
pnpm build:web

# Build lib only
pnpm build:lib
```

## Project Structure

This is a pnpm monorepo with two main packages:

```
icalkit/
├── web/              # icalkit-web - React web application
│   ├── src/
│   │   ├── pages/    # Page components (Home, Splitter, etc.)
│   │   ├── App.tsx   # Router setup
│   │   └── main.tsx  # Entry point
│   ├── public/       # Static assets
│   └── scripts/      # Build scripts
├── lib/              # icalkit - CLI tools & Node.js API
│   ├── src/          # Source code (coming soon)
│   ├── bin/          # CLI executables (coming soon)
│   └── README.md
├── package.json      # Root workspace configuration
└── pnpm-workspace.yaml
```

## Adding a New Web Tool

1. Create a new page component in `web/src/pages/` (e.g., `Viewer.tsx`)
2. Add route in `web/src/App.tsx`
3. Add navigation link in `web/src/pages/Home.tsx`
4. Update the main `README.md` with tool description

## Design Guidelines

### UI/UX

- Use Tailwind CSS 4 for styling
- Follow the gradient color scheme (indigo/purple)
- Maintain responsive design (mobile-friendly)
- Keep interfaces simple and intuitive

### Code Style

- **TypeScript**: Use proper typing, avoid `any`
- **React**: Use functional components and hooks
- **Naming**: Clear, descriptive variable and function names
- **Comments**: Add comments for complex logic
- **Functions**: Keep functions focused and small
- **Error Handling**: Handle errors gracefully with user-friendly messages

### Privacy & Security

- All calendar file processing must happen client-side
- Calendar files should never be uploaded to external servers
- Clearly communicate privacy benefits to users

### Monorepo Guidelines

- Use workspace references for shared dependencies
- Keep packages loosely coupled
- Use `pnpm --filter <package>` for package-specific commands

## Testing

Before submitting:

1. **Build Check**: Ensure `pnpm build` completes without errors
2. **Type Check**: Run TypeScript type checking
3. **Lint**: Run `pnpm lint` and fix any issues
4. **Manual Testing**:
   - Test with various iCal file sizes
   - Check browser console for errors
   - Verify mobile responsiveness
   - Test in multiple browsers (Chrome, Firefox, Safari)

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add: Amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a clear description

## Commit Message Format

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `build:` - Build system or dependency changes

Example: `feat: add event filtering to splitter tool`

## Questions?

Feel free to open an issue for discussion before starting work on major features!

---

Thank you for contributing! 💙
