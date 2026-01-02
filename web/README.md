# iCalKit Web Application

Web-based tools for managing iCalendar files, built with React + TypeScript + Vite.

## 🚀 Development

From the root directory:

```bash
# Install dependencies
pnpm install

# Start development server (web only)
pnpm dev
# or from root: pnpm --filter icalkit-web dev

# Build for production
pnpm build:web
# or: pnpm --filter icalkit-web build

# Preview production build
pnpm --filter icalkit-web preview

# Lint code
pnpm --filter icalkit-web lint

# Generate images from SVG logos
pnpm generate-images
```

## 🏗️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS 4** - Styling
- **ical.js** - iCalendar parsing
- **JSZip** - ZIP file generation
- **file-saver** - File downloads

## 📁 Project Structure

```
web/
├── src/
│   ├── pages/          # Page components
│   │   ├── Home.tsx    # Landing page
│   │   └── Splitter.tsx # Splitter tool
│   ├── components/     # Reusable components
│   ├── App.tsx         # Router setup
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
└── package.json        # Dependencies
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint configuration

## 📝 Adding New Tools

1. Create a new page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update landing page (`src/pages/Home.tsx`) to link to the new tool

## 🌐 Deployment

The app is deployed to GitHub Pages. Build artifacts are generated in `dist/`.

```bash
# Build for production
npm run build

# The dist/ folder contains the deployable files
```

## 🔒 Privacy

All file processing happens client-side in the browser. No data is sent to any server.
