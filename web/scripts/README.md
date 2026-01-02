# Scripts

This directory contains utility scripts for the iCalKit web application.

## generate-images.js

Generates PNG images from SVG logo files in various sizes for different use cases.

### Usage

```bash
pnpm generate-images
```

### What it generates

From `public/icalkit-logo.svg`:

- `icalkit-logo.png` (1200x630) - Open Graph / Twitter Card image

From `public/icalkit-icon.svg`:

- `icalkit-icon-512.png` (512x512) - PWA icon
- `icalkit-icon-192.png` (192x192) - PWA icon
- `apple-touch-icon.png` (180x180) - iOS home screen icon
- `favicon-32x32.png` (32x32) - Browser favicon
- `favicon-16x16.png` (16x16) - Browser favicon

### When to use

Run this script whenever you update the SVG logo files to regenerate all PNG variants:

```bash
# After updating logos
pnpm generate-images

# Then commit the updated PNG files
git add public/*.png
git commit -m "Update logo images"
```

### Dependencies

Requires `@resvg/resvg-js` package (already in devDependencies).
