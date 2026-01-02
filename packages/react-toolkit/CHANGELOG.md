# @arcanejs/react-toolkit

## 0.12.3

### Patch Changes

- Updated dependencies
  - @arcanejs/toolkit@5.0.1

## 0.12.2

### Patch Changes

- @arcanejs/toolkit@5.0.0

## 0.12.1

### Patch Changes

- Updated dependencies [32da064]
  - @arcanejs/toolkit@4.1.0

## 0.12.0

### Minor Changes

- d0a3aa4: Introduce RPC mechanism for individual connections

  Introduce a new feature that allows components to send a message to the backend,
  and then await a response back to the original callee.
  This is an enhancement over the old message system that allows for things
  such as individual requests for data,
  without requiring that data to be present in the tree for all connections.

  The first usage of this has been to migrate the Button component over to it
  and also update the styling to display when the callback is still "in-progress".
  Any errors are now reflected back only to the original calling connection,
  and not all viewers.

### Patch Changes

- Updated dependencies [d0a3aa4]
  - @arcanejs/toolkit@4.0.0
  - @arcanejs/protocol@0.7.0

## 0.11.2

### Patch Changes

- d29dfc7: Expose data file loading/error state

## 0.11.1

### Patch Changes

- Updated dependencies [22074e4]
  - @arcanejs/protocol@0.6.0
  - @arcanejs/toolkit@3.1.1

## 0.11.0

### Minor Changes

- 6c607cd: Allow theme to be specified in startArcaneFrontend

### Patch Changes

- Updated dependencies [6c607cd]
  - @arcanejs/toolkit@4.0.0

## 0.10.0

### Minor Changes

- 911f3db: Add light-mode support

  Introduce a LIGHT_THEME and use prefers-color-scheme to
  pick between a light and dark mode.

### Patch Changes

- 8a7d944: Test new release
- Updated dependencies [911f3db]
  - @arcanejs/toolkit@3.0.0

## 0.9.1

### Patch Changes

- 6fa616a: Test new publish action

## 0.9.0

### Minor Changes

- 73c47d7: Use ReactNode for all children

  Avoid causing type errors in TypeScript when certain types of elements or
  components are given as children even though react can render them properly
  by using `ReactNode` everywhere.

- 3467342: Introduce `ConnectionsContext` and `connections` module

  A new `ConnectionsContextProvider` component can be used at the root
  of an application to add a context that tracks the list of active connections
  to the toolkit.

### Patch Changes

- Updated dependencies [3467342]
- Updated dependencies [2b82fc4]
- Updated dependencies [11701df]
  - @arcanejs/toolkit@2.0.0
  - @arcanejs/protocol@0.5.0

## 0.8.5

### Patch Changes

- Updated dependencies [541d8f1]
  - @arcanejs/toolkit@1.1.1

## 0.8.4

### Patch Changes

- 30aea22: Fix dependencies, and remove unnecessary external config in tsup
- Updated dependencies [3f71c86]
- Updated dependencies [8038521]
- Updated dependencies [30aea22]
  - @arcanejs/toolkit@1.1.0
  - @arcanejs/protocol@0.4.1

## 0.8.3

### Patch Changes

- Updated dependencies [94d6467]
  - @arcanejs/toolkit@1.0.1

## 0.8.2

### Patch Changes

- b3f1fcd: Add compatibility for ZodError types in data module

  Previously, usage of `.catch()` in type definitions would result in
  type-inference for `createDataFileDefinition` failing as it's unable to infer the
  types automatically when a `ZodError` type exists in the type def,
  defaulting instead to `unknown`.

  This change adjusts the way we do type inference for these types,
  and always uses `z.infer<>` to extract the actual type from the zod type
  definition.

## 0.8.1

### Patch Changes

- 14ef843: Export CoreComponents

## 0.8.0

### Minor Changes

- f50dc39: Refactor event listener usage to use props
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
- Updated dependencies [f50dc39]
- Updated dependencies [9d3919e]
- Updated dependencies [f50dc39]
  - @arcanejs/toolkit@1.0.0
  - @arcanejs/protocol@0.4.0

## 0.7.0

### Minor Changes

- 52fb995: Introduce lastUpdatedMillis for data module

  Expose the last time that a data file was updated in-memory as a property of the
  context exposed in the API.

## 0.6.1

### Patch Changes

- @arcanejs/protocol@0.3.0
- @arcanejs/toolkit@0.5.1

## 0.6.0

### Minor Changes

- 7c4379d: Introduce new `HslColorPicker` composite component

  Introduce a new component that can be used to select different colors,
  build from `Group`, `Rect` and `SliderButton` components.

### Patch Changes

- Updated dependencies [7c4379d]
- Updated dependencies [7c4379d]
- Updated dependencies [7c4379d]
  - @arcanejs/toolkit@0.5.0
  - @arcanejs/protocol@0.3.0

## 0.5.0

### Minor Changes

- a053abb: **BREAKING:** Update Switch and SliderButton to support controlled/uncontrolled

  Update the properties for both SliderButton and Switch so that they can both
  maintain internal state, and also support being explicitly controlled:

  - For controlled inputs: `value` should be used
  - For uncontrolled inputs:

    - `defaultValue` can be used to set the initial value
    - The value of the input will change automatically,
      but if it needs to be overridden,
      `ref` can be used along with `setValue()`.

  `TextInput` is not affected by this change as it always needs to maintain an
  uncontrolled experience in the frontend, and we need to think-through a bit how
  this will work in the backend.

### Patch Changes

- 027c764: Use vertical group be default for root group
- Updated dependencies [a053abb]
  - @arcanejs/toolkit@0.4.0

## 0.4.1

### Patch Changes

- 2ac2928: Fix tsup config and missing bundle

## 0.4.0

### Minor Changes

- 9247670: Remove console.log and introduce unified logging interface

### Patch Changes

- Updated dependencies [9247670]
  - @arcanejs/protocol@0.2.0
  - @arcanejs/toolkit@0.3.0

## 0.3.2

### Patch Changes

- bc83786: Fix imports by ensuring we split all bundles
- Updated dependencies [bc83786]
  - @arcanejs/toolkit@0.2.2

## 0.3.1

### Patch Changes

- 41cbac3: Fix dependency definition for react-reconciler

## 0.3.0

### Minor Changes

- 390ace0: **BREAKING:** Refactor the data file interface for easier direct use with hooks

  `createDataFileSpec` has been renamed to `createDataFileDefinition`
  `useDataFile` has been renamed to `useDataFileContext`,
  and `useDataFile` is now used to directly use the hooks without a provider.

## 0.2.0

### Minor Changes

- df70fb5: Introduce a new module, hooks and components for storing data as json files

  Introduce `createDataFileSpec` alongside hooks `useDataFile`, `useDataFileData`
  and `useDataFileUpdater`, which allows for easily composing applications that
  need to persist data across one or more files.

- df70fb5: Allow using ref for all components

### Patch Changes

- df70fb5: Ensure 3rd party deps are not bundled
- Updated dependencies [df70fb5]
  - @arcanejs/toolkit@0.2.1

## 0.1.5

### Patch Changes

- Fix images display in README

## 0.1.4

### Patch Changes

- Update docs

## 0.1.3

### Patch Changes

- Update docs with architacture diagram

## 0.1.2

### Patch Changes

- ce0958d: Flesh out Button and Group docs
- Updated dependencies [efc76ba]
  - @arcanejs/toolkit@0.2.0

## 0.1.1

### Patch Changes

- adfbcbf: Flesh out documentation for packages
- Updated dependencies [adfbcbf]
  - @arcanejs/toolkit@0.1.1

## 0.1.0

### Minor Changes

- f54f4f5: Initial implementation

### Patch Changes

- Updated dependencies [f54f4f5]
  - @arcanejs/toolkit@0.1.0
