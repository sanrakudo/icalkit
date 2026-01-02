import packageJson from 'eslint-plugin-package-json';

export default [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.wrangler/**',
      'lib/**',
      'web/**',
    ],
  },

  // package.json linting
  packageJson.configs.recommended,
];
