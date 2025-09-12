# @arcanejs/toolkit

## 3.1.1

### Patch Changes

- Updated dependencies [22074e4]
  - @arcanejs/protocol@0.6.0
  - @arcanejs/toolkit-frontend@0.6.1

## 3.1.0

### Minor Changes

- 6c607cd: Allow theme to be specified in startArcaneFrontend

### Patch Changes

- Updated dependencies [6c607cd]
  - @arcanejs/toolkit-frontend@0.6.0

## 3.0.0

### Minor Changes

- 911f3db: Add light-mode support

  Introduce a LIGHT_THEME and use prefers-color-scheme to
  pick between a light and dark mode.

### Patch Changes

- Updated dependencies [911f3db]
  - @arcanejs/toolkit-frontend@0.5.0

## 2.0.0

### Minor Changes

- 3467342: Introduce ability to listen to connection changes

  Expose the `Connection` interface,
  and listeners on the `Toolkit` class that can be used to listen to
  new or closed connections to the Toolkit.
  In addition to a `getConnections()` method.

- 2b82fc4: Pass connection to all messageHandlers & component listeners

  Make the ToolkitConnection object available to all components that handle
  messages,
  and include it as a parameter for all existing component event listeners.

- 11701df: Add the connection UUID to StageContext

### Patch Changes

- Updated dependencies [11701df]
  - @arcanejs/toolkit-frontend@0.4.0
  - @arcanejs/protocol@0.5.0

## 1.1.1

### Patch Changes

- 541d8f1: Export ToolkitOptions type

## 1.1.0

### Minor Changes

- 3f71c86: Allow toolkit to be run outside of known contexts:

  - Allow for the font file path to be given directly as an options
  - Don't try to automatically determine the path of the `dist` directory if a
    specific entrypoint file has been provided.

- 8038521: Allow for the window title to be specified in options

### Patch Changes

- 30aea22: Fix dependencies, and remove unnecessary external config in tsup
- Updated dependencies [30aea22]
  - @arcanejs/protocol@0.4.1
  - @arcanejs/toolkit-frontend@0.3.1

## 1.0.1

### Patch Changes

- 94d6467: Fix issue with fonts being re-downloaded

  Custom fonts used for the material icons would be re-downloaded every
  time styled-components updated the styling for anything.

  As a result, there's a flash-of-unstyled-content during this time,
  which causes the whole layout to shift.

## 1.0.0

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
- Updated dependencies [9d3919e]
- Updated dependencies [f50dc39]
  - @arcanejs/toolkit-frontend@0.3.0
  - @arcanejs/protocol@0.4.0
  - @arcanejs/diff@0.5.1

## 0.5.1

### Patch Changes

- Updated dependencies [a11d331]
- Updated dependencies [a11d331]
  - @arcanejs/diff@0.5.0
  - @arcanejs/protocol@0.3.0

## 0.5.0

### Minor Changes

- 7c4379d: Allow Rect and SliderButtons to grow
- 7c4379d: Introduce gradients on SliderButton

### Patch Changes

- 7c4379d: Improve display of SliderButton and Rect when vertical
- Updated dependencies [7c4379d]
- Updated dependencies [7c4379d]
  - @arcanejs/protocol@0.3.0

## 0.4.0

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

## 0.3.0

### Minor Changes

- 9247670: Remove console.log and introduce unified logging interface

### Patch Changes

- Updated dependencies [9247670]
  - @arcanejs/protocol@0.2.0
  - @arcanejs/diff@0.4.0

## 0.2.2

### Patch Changes

- bc83786: Fix imports by ensuring we split all bundles
- Updated dependencies [bc83786]
  - @arcanejs/diff@0.3.2
  - @arcanejs/protocol@0.1.1

## 0.2.1

### Patch Changes

- df70fb5: Ensure 3rd party deps are not bundled
- Updated dependencies [d99b44e]
  - @arcanejs/protocol@0.1.1

## 0.2.0

### Minor Changes

- efc76ba: Removed unused prop headerComponents

## 0.1.1

### Patch Changes

- adfbcbf: Flesh out documentation for packages
- Updated dependencies [adfbcbf]
  - @arcanejs/diff@0.3.1

## 0.1.0

### Minor Changes

- f54f4f5: Initial implementation

## 0.0.3

### Patch Changes

- 3607779: Use non-strict version for workspace packages

## 0.0.2

### Patch Changes

- Updated dependencies [fe0d7fb]
- Updated dependencies [6424c0a]
  - @arcanejs/diff@0.3.0
