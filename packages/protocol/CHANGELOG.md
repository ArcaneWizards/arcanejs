# @arcanejs/protocol

## 0.7.0

### Minor Changes

- d0a3aa4: BREAKING: Introduce RPC mechanism for individual connections

  Introduce a new feature that allows components to send a message to the backend,
  and then await a response back to the original callee.
  This is an enhancement over the old message system that allows for things
  such as individual requests for data,
  without requiring that data to be present in the tree for all connections.

  The first usage of this has been to migrate the Button component over to it
  and also update the styling to display when the callback is still "in-progress".
  Any errors are now reflected back only to the original calling connection,
  and not all viewers.

## 0.6.0

### Minor Changes

- 22074e4: Allow Error objects to be logged in logger context

## 0.5.0

### Minor Changes

- 11701df: Add the connection UUID to StageContext

## 0.4.1

### Patch Changes

- 30aea22: Fix dependencies, and remove unnecessary external config in tsup

## 0.4.0

### Minor Changes

- 9d3919e: Allow for custom components to be defined

  This change comes with quite a few internal and architectural refactors to allow
  for custom components to be defied both in the `toolkit` and `react-toolkit`
  packages.

  Including:

  - Updating the protocol to include a namespace attribute for every component
  - Introducing the `FrontendComponentRenderer` interface in `toolkit-frontend`
  - Migrating the `core` components frontend implementation to
    `toolkit-frontend` as an instance of `FrontendComponentRenderer`
  - In `toolkit`: allowing for custom frontend entrypoint javascript files to be
    loaded instead of the default one
    (which only includes the core `FrontendComponentRenderer`).
  - Migrating logic handling for adding / removing listeners based on props into
    `toolkit` backend modules rather than having hard-coded handling in
    `react-toolkit`.
  - Refactoring `react-toolkit` to allow for component namespaces to be defined,
    by:
    - Introducing a new component registry concept,
      and exposing a helper function `prepareComponents` to create components
      object that can be used directly in react.
    - Migrating all core-component-specific logic to use this new registry logic.
  - Introducing an example app (`custom-components`)
    that defines a custom component, and demonstrates usage, including:
    - receiving messages from users
    - nesting and displaying other components
    - using `ref` to directly interact with the backend implementation

### Patch Changes

- f50dc39: Reorder package exports to remove esbuild warnings

## 0.3.0

### Minor Changes

- 7c4379d: Allow Rect and SliderButtons to grow
- 7c4379d: Introduce gradients on SliderButton

## 0.2.0

### Minor Changes

- 9247670: Remove console.log and introduce unified logging interface

## 0.1.1

### Patch Changes

- d99b44e: Initial release
