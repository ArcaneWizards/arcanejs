# `@arcanejs/toolkit-frontend`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Ftoolkit-frontend)](https://www.npmjs.com/package/@arcanejs/toolkit-frontend)

Browser-side renderer components and stage utilities for ArcaneJS.

This package is used by `@arcanejs/toolkit`'s default frontend bundle, and can also be used directly when building custom frontend entrypoints for custom component namespaces.

## Install

```bash
npm install @arcanejs/toolkit-frontend
```

Peer ecosystem typically used with this package:

- `react@^19.2.0`
- `react-dom@^19.2.0`
- `styled-components`
- `@arcanejs/protocol`

## What It Provides

- Core frontend renderer: `CORE_FRONTEND_COMPONENT_RENDERER`
- Core UI components (`Button`, `Group`, `Switch`, `Tabs`, etc.)
- Stage context and connection state (`StageContext`)
- Theme primitives (`DARK_THEME`, `LIGHT_THEME`, `BaseStyle`, `GlobalStyle`)
- Touch/mouse interaction helpers (`usePressable`, `trackTouch`, `initialiseListeners`)

## Public Exports

### `@arcanejs/toolkit-frontend`

- `CORE_FRONTEND_COMPONENT_RENDERER`
- Component exports: `Button`, `Group`, `GroupStateWrapper`, `Label`, `NestedContent`, `Rect`, `SliderButton`, `Switch`, `Tabs`, `TextInput`, `Timeline`
- `StageContext`
- Types: `StageContextData`, `StageConnectionState`
- `code` namespace re-export (`core` helpers such as `Icon`, transparency SVG constants)

### `@arcanejs/toolkit-frontend/components/core`

- `Icon`
- `TRANSPARENCY_SVG`
- `TRANSPARENCY_SVG_URI`

### `@arcanejs/toolkit-frontend/styling`

- `DARK_THEME`, `LIGHT_THEME`
- `PreferredThemeProvider`
- `BaseStyle`, `GlobalStyle`
- shared button/touch style fragments and `Theme` type

### `@arcanejs/toolkit-frontend/types`

- `FrontendComponentRenderer`
- `FrontendComponentRenderers`

### `@arcanejs/toolkit-frontend/util`

- `calculateClass`
- touch helpers: `initialiseListeners`, `usePressable`, `trackTouch`, etc.
- theme preference hooks: `useColorSchemePreferences`, `usePreferredColorScheme`
- `VALID_COLOR_SCHEME_PREFS`

## Typical Usage

In most apps you will not call this package directly; `@arcanejs/toolkit` serves a prebuilt frontend entrypoint.

Use this package directly when you provide your own frontend bundle for custom namespaces:

```tsx
import { startArcaneFrontend } from '@arcanejs/toolkit/frontend';
import { CORE_FRONTEND_COMPONENT_RENDERER } from '@arcanejs/toolkit-frontend';

startArcaneFrontend({
  renderers: [CORE_FRONTEND_COMPONENT_RENDERER, customRenderer],
});
```

## Stage Context

`StageContext` provides browser-side runtime hooks for custom renderers:

- `sendMessage(...)`: fire-and-forget component messages
- `call(...)`: request/response component calls
- `renderComponent(...)`: render nested protocol components
- `connection`, `connectionUuid`, `reconnect()`

## When To Use This Package

Use `@arcanejs/toolkit-frontend` if you are:

- creating custom frontend renderers for non-core namespaces
- customizing ArcaneJS theme/styling behavior
- implementing browser-side interaction behavior integrated with Arcane stage context

If you only need server-side panel composition, use `@arcanejs/react-toolkit` and the default toolkit frontend.

## Example

- Custom frontend entrypoint example: <https://github.com/ArcaneWizards/arcanejs/blob/main/examples/custom-components/src/frontend.tsx>
