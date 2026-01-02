import cybozuConfig from '@cybozu/eslint-config/flat/presets/node-typescript-prettier.js';

export default [
  ...cybozuConfig,
  {
    ignores: ['dist'],
  },
  {
    files: ['eslint.config.js'],
    rules: {
      // Dependency is managed at monorepo root
      'n/no-extraneous-import': 'off',
    },
  },
  {
    files: ['bin/**/*.js', 'src/cli.ts'],
    rules: {
      // CLI entry points need process.exit()
      'n/no-process-exit': 'off',
    },
  },
];
