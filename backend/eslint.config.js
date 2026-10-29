import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  { ignores: ['generated/**', 'dist/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
);
