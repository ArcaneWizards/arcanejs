# `@arcanejs/diff`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Fdiff)](https://www.npmjs.com/package/@arcanejs/diff)

This package provides an easy way to:

- Create diffs by comparing objects
- Update objects by applying diffs

This library is written in TypeScript,
and produces diffs that are type-safe,
and can only be applied to objects that match the type
of the objects being compared.

This package is part of the
[`arcanejs` project](https://github.com/ArcaneWizards/arcanejs#arcanejs),
and is used to maintain a copy of a JSON tree in downstream clients in real-time
via websockets.

## Usage

```ts
import { diffJson, Diff } from '@arcanejs/diff/diff';
import { patchJson } from '@arcanejs/diff/patch';

type E = {
  foo: string;
  bar?: number[];
};

const a: E = { foo: 'bar' };
const b: E = { foo: 'baz', bar: [1] };

const diffA: Diff<E> = diffJson(a, b);

const resultA = patchJson(a, diffA);

console.log(resultB); // { foo: 'baz', bar: [1] }

const c = { baz: 'foo' };

const resultB = patchJson(c, diffA); // TypeScript Type Error: Property 'baz' is missing in type '{ foo: string; bar?: number[] | undefined; }' but required in type '{ baz: string; }'
```
