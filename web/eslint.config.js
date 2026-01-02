import cybozuConfig from '@cybozu/eslint-config/flat/presets/react-typescript-prettier.js';

export default [
  ...cybozuConfig,
  {
    ignores: ['dist', '.wrangler'],
  },
];
