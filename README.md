# iCalKit

🗓️ A collection of powerful tools for working with iCalendar (.ics) files - available as web apps and CLI utilities.

## 🌟 Features

### Web Tools (Browser-based, No Server Required)

- **📂 Splitter** - Split large iCal files into smaller chunks for easy import into Google Calendar and other services
- **👁️ Viewer** - View and browse iCal file contents in a beautiful, searchable interface *(Coming Soon)*
- **🔀 Merger** - Combine multiple iCal files into one *(Coming Soon)*
- **🧹 Cleaner** - Remove duplicate events and clean up your calendar *(Coming Soon)*

### CLI Tools *(Coming Soon)*

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

### CLI Tools *(Coming Soon)*

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

### Viewer *(Coming Soon)*

Browse and search through your iCal files with ease.

## 🛠️ Technology Stack

- **Web**: React 19 + TypeScript, Vite, React Router, Tailwind CSS 4, ical.js, JSZip
- **CLI**: Node.js *(Coming Soon)*
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

### Cloudflare Pages

The web application is deployed to Cloudflare Pages.

#### Method 1: Cloudflare Dashboard (Recommended for automatic deployments)

1. Go to Cloudflare Pages dashboard
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `pnpm build:web`
   - **Build output directory**: `web/dist`
   - **Root directory**: (leave empty)
5. Environment variables:
   - `NODE_VERSION`: `24`
6. Save and deploy

Cloudflare Pages will automatically deploy on every push to the main branch.

#### Method 2: Wrangler CLI (Manual deployments)

Wrangler is included in the project's devDependencies.

```bash
# Login to Cloudflare (first time only)
pnpm --filter icalkit-web exec wrangler login

# Deploy to production
pnpm deploy

# Deploy preview
pnpm deploy:preview
```

**Custom Domain:**

To use a custom domain like `icalkit.app`:
1. Go to your Cloudflare Pages project → Custom domains
2. Add your domain
3. Cloudflare will automatically configure DNS if the domain is on Cloudflare

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
