import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

function renderSvg(svgBuffer, width, height) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

async function generateImages() {
  try {
    console.log('🎨 Generating PNG images from SVG logos...\n');

    // Read the SVG files
    const logoPath = join(publicDir, 'icalkit-logo.svg');
    const iconPath = join(publicDir, 'icalkit-icon.svg');

    const svgBuffer = readFileSync(logoPath);
    const iconBuffer = readFileSync(iconPath);

    // Generate OG image (1200x630)
    const ogImage = renderSvg(svgBuffer, 1200, 630);
    writeFileSync(join(publicDir, 'icalkit-logo.png'), ogImage);
    console.log('✅ Generated icalkit-logo.png (1200x630) - OG image');

    // Generate PWA icons
    const icon512 = renderSvg(iconBuffer, 512, 512);
    writeFileSync(join(publicDir, 'icalkit-icon-512.png'), icon512);
    console.log('✅ Generated icalkit-icon-512.png (512x512) - PWA icon');

    const icon192 = renderSvg(iconBuffer, 192, 192);
    writeFileSync(join(publicDir, 'icalkit-icon-192.png'), icon192);
    console.log('✅ Generated icalkit-icon-192.png (192x192) - PWA icon');

    // Generate Apple Touch Icon
    const appleTouchIcon = renderSvg(iconBuffer, 180, 180);
    writeFileSync(join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
    console.log('✅ Generated apple-touch-icon.png (180x180) - iOS icon');

    // Generate favicons
    const favicon32 = renderSvg(iconBuffer, 32, 32);
    writeFileSync(join(publicDir, 'favicon-32x32.png'), favicon32);
    console.log('✅ Generated favicon-32x32.png (32x32) - Browser favicon');

    const favicon16 = renderSvg(iconBuffer, 16, 16);
    writeFileSync(join(publicDir, 'favicon-16x16.png'), favicon16);
    console.log('✅ Generated favicon-16x16.png (16x16) - Browser favicon');

    console.log('\n🎉 All images generated successfully!');
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

generateImages();
