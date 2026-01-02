import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

async function generateImages() {
  try {
    console.log('🎨 Generating PNG images from SVG logos...\n');

    // Read the SVG files
    const logoPath = join(publicDir, 'icalkit-logo.svg');
    const iconPath = join(publicDir, 'icalkit-icon.svg');

    const svgBuffer = readFileSync(logoPath);
    const iconBuffer = readFileSync(iconPath);

    // Generate OG image (1200x630)
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(join(publicDir, 'icalkit-logo.png'));
    console.log('✅ Generated icalkit-logo.png (1200x630) - OG image');

    // Generate PWA icons
    await sharp(iconBuffer)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icalkit-icon-512.png'));
    console.log('✅ Generated icalkit-icon-512.png (512x512) - PWA icon');

    await sharp(iconBuffer)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icalkit-icon-192.png'));
    console.log('✅ Generated icalkit-icon-192.png (192x192) - PWA icon');

    // Generate Apple Touch Icon
    await sharp(iconBuffer)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png (180x180) - iOS icon');

    // Generate favicons
    await sharp(iconBuffer)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png (32x32) - Browser favicon');

    await sharp(iconBuffer)
      .resize(16, 16)
      .png()
      .toFile(join(publicDir, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png (16x16) - Browser favicon');

    console.log('\n🎉 All images generated successfully!');
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

generateImages();
