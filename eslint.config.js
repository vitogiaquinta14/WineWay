// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'backend/**'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          extensions: ['.native.tsx', '.web.tsx', '.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
  },
]);
