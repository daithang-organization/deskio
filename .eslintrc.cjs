/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/.next/**', '**/node_modules/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // hygiene
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

    // import order
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // keep TS rule set practical
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
};
