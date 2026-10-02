# `@arcanejs/toolkit`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Ftoolkit)](https://www.npmjs.com/package/@arcanejs/toolkit)

Core server/runtime package for ArcaneJS control panels.

`@arcanejs/toolkit` provides:

- A server-side component tree (`Group`, `Button`, `Switch`, etc.)
- HTTP + WebSocket transport for syncing state to browsers
- Per-connection tree sync (`tree-full` + `tree-diff`)
- Routing for fire-and-forget messages and request/response calls

Most users should pair this with [`@arcanejs/react-toolkit`](https://www.npmjs.com/package/@arcanejs/react-toolkit), but this package can also be used directly.

## Install

```bash
npm install @arcanejs/toolkit
```

If you use the default Arcane frontend renderer, install React peers:

```bash
npm install react@^19.2.0 react-dom@^19.2.0
```

## Quick Start (Without React)

```ts
import { Toolkit, Group, Button, Label } from '@arcanejs/toolkit';

const toolkit = new Toolkit({
  title: 'My Control Panel',
  path: '/',
});

toolkit.start({
  mode: 'automatic',
  port: 3000,
});

const root = new Group({ direction: 'vertical', title: 'Controls' });
const status = new Label({ text: 'Idle' });
const trigger = new Button({
  text: 'Run',
  onClick: async () => {
    status.setText('Running...');
    await doWork();
    status.setText('Done');
  },
});

root.appendChildren(status, trigger);
toolkit.setRoot(root);
```

## Note on performance measurement with react-reconciler

You may see a warning when running `@arcanejs` apps that looks like:

```
============================= PERF CHECKS ENABLED ==============================
Performance entries are being created (6),
this probably means you are running react-reconciler in development mode.

Make sure you set NODE_ENV=production to avoid performance issues & memory leaks
================================================================================
```

This is because `react-reconciler` will track performance measurements over time
(namely with each component render) when not run with
`NODE_ENV=production`.
This uniquely affects `@arcanejs` apps as we use a custom
react renderer for long-running node.js processes,
and these apps designed to have regular re-renders over the course of an app's
runtime. Over time, the number of measurements increases,
and can eventually throw an `MaxPerformanceEntryBufferExceededWarning` error,
killing the process.

The issue can be avoided if react-reconciler is run in production mode,
so ensure you run your processes with `NODE_ENV=production`.

## Public API

### Top-level exports

- `Toolkit`
- Components: `Button`, `Group`, `GroupHeader`, `Label`, `Rect`, `SliderButton`, `Switch`, `Tab`, `Tabs`, `TextInput`, `Timeline`
- Types: `ToolkitOptions`, `ToolkitConnection`, `ToolkitRenderContext`, `ToolkitServerListenerOptions`, `ToolkitServerListener`, `AnyComponent`

### Subpath exports

- `@arcanejs/toolkit/components/*`: component classes and types
- `@arcanejs/toolkit/components/base`: `Base`, `BaseParent`, `EventEmitter`, related types
- `@arcanejs/toolkit/frontend`: browser entrypoint helpers (`startArcaneFrontend`)
- `@arcanejs/toolkit/util`: utility exports like `HUE_GRADIENT` and `IDMap`

`startArcaneFrontend(...)` supports:

- `renderers`: frontend component renderer list
- `themeRootProps?: React.HTMLAttributes<HTMLDivElement>` (root theme container props)
- `loadingState?: () => ReactNode` (custom render output while waiting for initial websocket metadata/tree sync)

Theme switching is handled by Arcane via root classes (`theme-auto`, `theme-dark`, `theme-light`). Theme customization is CSS-only by overriding Arcane CSS variables in your entrypoint stylesheet.

## Toolkit Lifecycle

`Toolkit.start(...)` supports three modes:

- `automatic`: creates internal HTTP + WebSocket server on a port
- `express`: attaches websocket handling + route mounting to existing Express/HTTP server
- `manual`: gives direct access to `Server` for custom integration

`Toolkit.listen(...)` is also available when you want direct lifecycle control and a closable listener handle.

## Toolkit Options

`new Toolkit(options)` supports:

- `title?: string`: page title
- `path: string` (default: `/`): route prefix where Arcane UI is served
- `log?: Logger`: optional logger (`debug`, `info`, `warn`, `error`)
- `entrypointJsFile?: string`: custom frontend bundle path for custom namespaces/components. ArcaneJS expects a same-basename stylesheet (`.css`) to exist for this entrypoint so styles can be served automatically. Source maps (`.js.map`, `.css.map`) are optional and exposed when present.
- `materialIconsFontFile?: string`: explicit path to `material-symbols-outlined.woff2` when auto-resolution is not possible
- `additionalFiles?: Record<string, () => Promise<{ contentType: string; content: Buffer }>>`: additional static files served from the toolkit path. Keys are relative request paths (for example `styles/app.css` -> `/your-path/styles/app.css`), and must not start with `/`.
- `htmlPage?: (context) => string | Promise<string>`: custom HTML renderer for the root route. Context includes:
  - `coreAssets`: URLs for built-in toolkit static assets (`materialSymbolsOutlined`, `entrypointJs`, `entrypointJsMap`, `entrypointCss`, `entrypointCssMap`)
  - `assetUrls`: URL mapping for all static assets by relative path (core + `additionalFiles`)
  - `title`, `path`
- `clockSync?: false | { pingIntervalMs: number }`: optional browser/server clock synchronization. When enabled via object options, frontend stage context exposes `timeDifferenceMs` and `lastPingMs`.

Important constraint:

- `path` must start and end with `/` (for example: `/`, `/control/`)

## Building Custom Frontend Entrypoints

When using `entrypointJsFile`, build your browser bundle with
[`@arcanejs/build-utils`](https://www.npmjs.com/package/@arcanejs/build-utils):

```bash
arcane-build-frontend \
  --entry src/frontend.tsx \
  --outfile dist/custom-entrypoint.js \
  --sourcemap
```

Import `@arcanejs/toolkit-frontend/styles/core.css` in the entrypoint so Arcane
core styles are included in the emitted `.css` sidecar.

## Events and Connections

`Toolkit` emits:

- `new-connection`: when a browser connects
- `closed-connection`: when a browser disconnects

Use `toolkit.getConnections()` to inspect active connections. Each connection has a stable `uuid`.

## Component Notes

Core components are stateful server objects. Notable interaction behavior:

- `Button` uses request/response call flow (`press` action)
- `Switch` and `SliderButton` support controlled and uncontrolled usage
- `TextInput` updates value from browser messages
- `Group` supports editable titles and collapsible defaults (`open`, `closed`, `auto`)
- `Tabs` only accepts `Tab` children

## Architectural Constraints

- Single-process architecture by design
- No built-in authentication/authorization
- `Toolkit.setRoot(...)` can only be called once
- Tree updates are throttled internally and rendered per active connection

## Related Packages

- [`@arcanejs/react-toolkit`](https://www.npmjs.com/package/@arcanejs/react-toolkit): React renderer for composing server-side component trees
- [`@arcanejs/toolkit-frontend`](https://www.npmjs.com/package/@arcanejs/toolkit-frontend): browser renderer components and stage context
- [`@arcanejs/protocol`](https://www.npmjs.com/package/@arcanejs/protocol): wire protocol types
- [`@arcanejs/diff`](https://www.npmjs.com/package/@arcanejs/diff): JSON diff/patch engine

## Examples

- React examples: <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/react>
- Core API examples (no React renderer): <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/core>
- Custom namespace end-to-end example: <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/custom-components>
