/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@arcanejs/eslint-config/library.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.lint.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist'],
};
