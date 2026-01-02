const { createConfig } = require('@cybozu/license-manager');

const config = createConfig({
  packageManager: 'pnpm',
  analyze: {
    allowLicenses: [
      'MIT',
      'Apache-2.0',
      '(MIT OR Apache-2.0)',
      'MIT OR Apache-2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'ISC',
      '0BSD',
      'Python-2.0',
      'MPL-2.0',
      'CC0-1.0',
      'CC-BY-3.0',
      'CC-BY-4.0',
      '(MIT OR CC0-1.0)',
      'BlueOak-1.0.0',
      'Unlicense',
      'MIT-0',
      '(MIT AND Zlib)', // pako (jszip dependency) - both are permissive licenses
    ],
    allowPackages: [
      // sharp is a devDependency used only for generating images from SVG
      // It depends on @img/sharp-libvips-* which is LGPL-3.0-or-later
      'sharp',
      '@img/sharp-darwin-arm64',
      '@img/sharp-darwin-x64',
      '@img/sharp-libvips-darwin-arm64',
      '@img/sharp-libvips-darwin-x64',
      '@img/sharp-libvips-linux-arm64',
      '@img/sharp-libvips-linux-x64',
      '@img/sharp-linux-arm64',
      '@img/sharp-linux-x64',
      // jszip is dual-licensed: (MIT OR GPL-3.0-or-later)
      // We use it under the MIT license
      'jszip',
    ],
  },
});

module.exports = config;
