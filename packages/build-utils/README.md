# `@arcanejs/build-utils`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Fbuild-utils)](https://www.npmjs.com/package/@arcanejs/build-utils)

Build utilities for ArcaneJS projects.

This package provides reusable build utilities for ArcaneJS projects.

Today it includes a frontend bundler with React Compiler enabled by default.
Over time, additional Arcane build helpers can be added under the same package.

## Install

```bash
npm install --save-dev @arcanejs/build-utils
```

## Current CLI Utilities

Use `arcane-build-frontend` to build a browser entrypoint:

```bash
arcane-build-frontend \
  --entry src/frontend.tsx \
  --outfile dist/entrypoint.js \
  --sourcemap
```

Optional flags:

- `--condition <name>` (repeatable): add custom resolver conditions (for example `@arcanejs/source` in monorepos)
- `--watch`: rebuild on file changes
- `--minify`: minify output
- `--no-react-compiler`: skip React Compiler transform

## Current API

```ts
import {
  buildArcaneFrontend,
  watchArcaneFrontend,
} from '@arcanejs/build-utils';

await buildArcaneFrontend({
  entry: 'src/frontend.tsx',
  outfile: 'dist/entrypoint.js',
  sourcemap: true,
});
```

`watchArcaneFrontend` returns an esbuild `BuildContext`.
