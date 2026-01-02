import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import license from 'rollup-plugin-license';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    license({
      thirdParty: {
        output: {
          file: path.join(__dirname, 'public', 'licenses.json'),
          template(dependencies) {
            return JSON.stringify(
              dependencies.map((dep) => ({
                name: dep.name || 'Unknown',
                version: dep.version || 'Unknown',
                license: dep.license || 'Unknown',
                repository: dep.repository || '',
                licenseText: dep.licenseText || '',
              })),
              null,
              2,
            );
          },
        },
        includePrivate: false,
      },
    }),
  ],
});
