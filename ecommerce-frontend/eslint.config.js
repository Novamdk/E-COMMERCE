import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  { ignores: ['dist/**', 'dist-ssr/**', 'public/img/**', '.cache/**', 'node_modules/**'] },

  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),

  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-console': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-icons',
              message: 'Import from a subpath (e.g. react-icons/fi) so icons tree-shake.',
            },
            {
              name: 'framer-motion',
              importNames: ['motion'],
              message:
                'Use `m` instead. The app renders inside <LazyMotion features={domAnimation}>, and importing `motion` pulls the full animation bundle back into the entry chunk.',
            },
          ],
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'A feature is only reachable through its index.js barrel. Use relative paths inside your own feature.',
            },
          ],
        },
      ],
    },
  },

  // Node-side build tooling.
  {
    files: ['scripts/**/*.mjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off', 'no-restricted-imports': 'off' },
  },

  // The route table pairs lazy page components with a non-component `routes` array
  // export. Fast refresh cannot handle that file either way, and splitting it
  // would mean a second module whose only job is to re-export the same object.
  {
    files: ['src/app/routes.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  eslintConfigPrettier,
].flat();
