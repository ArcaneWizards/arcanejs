# @arcanejs/build-utils

## 0.1.1

### Patch Changes

- cff3b49: Add a new publishable `@arcanejs/build-utils` package with a reusable `arcane-build-frontend` CLI/API for bundling Arcane browser entrypoints with React Compiler enabled.

  Update `@arcanejs/toolkit` to build its default browser entrypoint through `@arcanejs/build-utils`, including `@arcanejs/source` condition resolution so toolkit frontend source can be compiler-optimized in the generated default bundle.

  Add an `@arcanejs/source` condition for `@arcanejs/toolkit-frontend/styles/core.css` so source-based frontend bundling can resolve core Arcane styles without requiring prebuilt `dist` assets.

## 0.1.0

### Minor Changes

- Initial release.
