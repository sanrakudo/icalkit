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
        output: path.join(__dirname, 'dist', 'LICENSES.txt'),
        includePrivate: false,
      },
    }),
  ],
});
