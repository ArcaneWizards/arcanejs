# @arcanejs/build-utils

## 0.1.3

### Patch Changes

- 53652d5: Include sourcemaps in published packages

  Make debugging of applications easier by including sourcemaps so that stack
  traces can include the original source code lines

## 0.1.2

### Patch Changes

- ef201d6: Bump version for first CI build with provenance

## 0.1.1

### Patch Changes

- cff3b49: Add a new publishable `@arcanejs/build-utils` package with a reusable `arcane-build-frontend` CLI/API for bundling Arcane browser entrypoints with React Compiler enabled.

  Update `@arcanejs/toolkit` to build its default browser entrypoint through `@arcanejs/build-utils`, including `@arcanejs/source` condition resolution so toolkit frontend source can be compiler-optimized in the generated default bundle.

  Add an `@arcanejs/source` condition for `@arcanejs/toolkit-frontend/styles/core.css` so source-based frontend bundling can resolve core Arcane styles without requiring prebuilt `dist` assets.

## 0.1.0

### Minor Changes

- Initial release.
