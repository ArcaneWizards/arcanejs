import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/backend/components/base.ts',
      'src/backend/components/button.ts',
      'src/backend/components/group.ts',
      'src/backend/components/label.ts',
      'src/backend/components/rect.ts',
      'src/backend/components/slider-button.ts',
      'src/backend/components/switch.ts',
      'src/backend/components/tabs.ts',
      'src/backend/components/text-input.ts',
      'src/backend/components/timeline.ts',
      'src/backend/util/index.ts',
    ],
    format: ['cjs', 'esm'],
    splitting: true,
    dts: true,
  },
  {
    tsconfig: 'tsconfig.frontend.json',
    outDir: 'dist/frontend',
    entry: ['src/frontend/index.ts'],
    format: ['cjs', 'esm'],
    splitting: true,
    dts: true,
    external: [
      '@arcanejs/diff',
      '@arcanejs/protocol',
      '@arcanejs/toolkit-frontend',
      'react',
      'react-dom',
    ],
  },
]);
