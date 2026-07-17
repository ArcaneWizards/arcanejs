import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/diff.ts', 'src/patch.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  dts: true,
  sourcemap: true,
});
