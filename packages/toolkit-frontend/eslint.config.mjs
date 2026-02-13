import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('@arcanejs/eslint-config/library.js'),
  eslintPluginBetterTailwindcss.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.lint.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: './src/styles/core.css',
        tsconfig: './tsconfig.json',
        callees: ['cn'],
      },
    },
  },
];
