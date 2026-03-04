import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: false,
    clean: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
