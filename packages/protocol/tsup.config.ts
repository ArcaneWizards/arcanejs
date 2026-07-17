import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/core.ts', 'src/index.ts', 'src/logging.ts', 'src/styles.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
});
