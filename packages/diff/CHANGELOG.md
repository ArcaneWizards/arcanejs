# @arcanejs/diff

## 0.5.2

### Patch Changes

- 2d6c238: Publish refreshed package documentation across all public ArcaneJS packages.

  - Add complete, package-specific README content for toolkit, react-toolkit, toolkit-frontend, protocol, and diff.
  - Restore clear value-proposition and suitability guidance for `@arcanejs/react-toolkit` to improve npm package discovery.
  - Document API surface, usage patterns, extension points, and constraints so npm consumers can adopt packages without relying on monorepo internals.

## 0.5.1

### Patch Changes

- f50dc39: Reorder package exports to remove esbuild warnings

## 0.5.0

### Minor Changes

- a11d331: Allow diffing values of different types

  Previously, when there were different types for a value, we weren't able to
  compare then and provide a patch.
  Now it simply includes the entire new value.

- a11d331: Optimize value changes

  Don't include the previous value in a calculated diff when its entire value
  needs to be replaced, as this is not used to calculate the new value,
  and only serves to bloat the diff sizes.

## 0.4.0

### Minor Changes

- 9247670: Remove console.log and introduce unified logging interface

## 0.3.2

### Patch Changes

- bc83786: Fix imports by ensuring we split all bundles

## 0.3.1

### Patch Changes

- adfbcbf: Flesh out documentation for packages

## 0.3.0

### Minor Changes

- fe0d7fb: Introduce advanced array diffing + patching (splices and nested changes)
- 6424c0a: Add initial patch implementation

## 0.2.0

### Minor Changes

- 779fae0: Initial implementation of diff

## 0.1.4

### Patch Changes

- bumping to release new package

## 0.1.3

### Patch Changes

- bump version again to publish tags

## 0.1.2

### Patch Changes

- Bump to test tag publishing

## 0.1.1

### Patch Changes

- 459ff7b: Initial publish
