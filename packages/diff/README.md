# `@arcanejs/diff`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Fdiff)](https://www.npmjs.com/package/@arcanejs/diff)

Typed JSON diff/patch utilities used by ArcaneJS to synchronize state efficiently.

`@arcanejs/diff` provides:

- `diffJson(a, b)` to compute structural differences
- `patchJson(old, diff)` to apply a diff and reconstruct the new value
- Type-level diff contracts (`Diff<T>`, `NestedDiff<T>`, `JSONValue`, etc.)

## Install

```bash
npm install @arcanejs/diff
```

## API

### `diffJson(a, b)`

Compares two JSON-compatible values and returns a typed diff.

Possible diff forms:

- `{ type: 'match' }`
- `{ type: 'value', after }` for primitive/type changes
- `{ type: 'splice', start, count, items }` for array length changes
- `{ type: 'modified-a', changes }` for same-length array item updates
- `{ type: 'modified-o', additions?, deletions?, changes? }` for object updates

### `patchJson(old, diff)`

Applies a diff to a previous value and returns the patched result.

Patch behavior is immutable (returns new arrays/objects where needed).

## Usage

```ts
import { diffJson, patchJson, type Diff } from '@arcanejs/diff';

type Model = {
  name: string;
  values: number[];
};

const previous: Model = { name: 'A', values: [1, 2, 3] };
const next: Model = { name: 'B', values: [1, 4, 3, 5] };

const diff: Diff<Model> = diffJson(previous, next);
const reconstructed = patchJson(previous, diff);

console.log(reconstructed); // { name: 'B', values: [1, 4, 3, 5] }
```

## Type Safety

`Diff<T>` is parameterized on the JSON value type, so diffs and patch operations remain tied to the expected shape.

## Error Cases

`patchJson` throws when diff/value kinds are incompatible, for example:

- applying `splice` to non-arrays
- applying `modified-o` to non-objects

## ArcaneJS Usage

ArcaneJS server tracks the last tree sent to each client and sends `tree-diff` updates computed with `diffJson`; browser stage reconstructs latest tree with `patchJson`.

Relevant references:

- Diff producer: <https://github.com/ArcaneWizards/arcanejs/blob/main/packages/toolkit/src/backend/toolkit.ts>
- Diff consumer: <https://github.com/ArcaneWizards/arcanejs/blob/main/packages/toolkit/src/frontend/stage.tsx>
