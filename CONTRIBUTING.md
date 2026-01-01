# Contributing to iCalKit

Thanks for your interest in contributing! 🎉

## Development Setup

### Web Tools

The web tools are pure HTML/JavaScript files that can be opened directly in a browser.

```bash
# Clone the repository
git clone https://github.com/sanrakudo/icalkit.git
cd icalkit

# For local development, use a simple HTTP server
cd web
python -m http.server 8000
# or
npx serve
```

Then open http://localhost:8000 in your browser.

### CLI Tools (Coming Soon)

Instructions will be added when CLI development begins.

## Project Structure

```
icalkit/
├── web/              # Web-based tools
│   ├── index.html    # Landing page
│   ├── splitter/     # Splitter tool
│   ├── viewer/       # Viewer tool (coming soon)
│   ├── merger/       # Merger tool (coming soon)
│   └── shared/       # Shared CSS/JS utilities
├── cli/              # Command-line tools (coming soon)
│   ├── bin/          # Executable scripts
│   └── src/          # Source code
└── README.md
```

## Adding a New Web Tool

1. Create a new directory under `web/` (e.g., `web/viewer/`)
2. Add an `index.html` file with your tool
3. Follow the existing design patterns (Tailwind CSS, React via CDN)
4. Update `web/index.html` to add a link to your tool
5. Update the main `README.md` with tool description

## Design Guidelines

### UI/UX
- Use Tailwind CSS for styling
- Follow the gradient color scheme (indigo/purple)
- Maintain responsive design (mobile-friendly)
- Keep interfaces simple and intuitive

### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and small
- Handle errors gracefully with user-friendly messages

### Privacy & Security
- All processing must happen client-side
- No data should be sent to external servers
- Clearly communicate privacy benefits to users

## Testing

Before submitting:
1. Test with various iCal file sizes
2. Check browser console for errors
3. Verify mobile responsiveness
4. Test in multiple browsers (Chrome, Firefox, Safari)

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add: Amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a clear description

## Commit Message Format

- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Docs:` - Documentation changes
- `Style:` - Code style changes (formatting, etc.)
- `Refactor:` - Code refactoring

## Questions?

Feel free to open an issue for discussion before starting work on major features!

---

Thank you for contributing! 💙
