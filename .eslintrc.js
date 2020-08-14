module.exports = {
  root: true,
  overrides: [
    // Add linting (and Prettier formatting) for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-typescript/base',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' },
        ],
        'object-shorthand': 0,
        'prefer-destructuring': 0,
        'import/prefer-default-export': 0,
        'global-require': 0,
        'no-console': 'off',
      },
      overrides: [
        {
          // Allow importing dev dependencies in generated theme files
          files: ['**/theme/**/*.{ts,tsx}'],
          rules: {
            'import/no-extraneous-dependencies': 'off',
          },
        },
      ],
    },
    {
      // Add basic linting (and Prettier formatting) for the few necessary JS files (i.e. `next.config.js`, `jest.config.js`, etc.)
      files: ['**/*.js'],
      extends: ['airbnb-base', 'plugin:prettier/recommended'],
    },
  ],
};
