import cybozuConfig from '@cybozu/eslint-config/flat/presets/node-typescript-prettier.js';
import packageJson from 'eslint-plugin-package-json';

export default [
  ...cybozuConfig,
  packageJson.configs.recommended,
  {
    ignores: ['dist'],
  },
  {
    files: ['bin/**/*.js', 'src/cli/**/*.ts'],
    rules: {
      // CLI entry points need process.exit()
      'n/no-process-exit': 'off',
      // bin files import from dist which doesn't exist at lint time
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      // ical.js can't be resolved by eslint-plugin-n, but is a valid dependency
      'n/no-missing-import': ['error', { allowModules: ['ical.js'] }],
    },
  },
];
