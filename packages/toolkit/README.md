# `@arcanejs/toolkit`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Ftoolkit)](https://www.npmjs.com/package/@arcanejs/toolkit)

Core server/runtime package for ArcaneJS control panels.

`@arcanejs/toolkit` provides:

- A server-side component tree (`Group`, `Button`, `Switch`, etc.)
- HTTP + WebSocket transport for syncing state to browsers
- Tree diff broadcasting (`tree-full` + `tree-diff`)
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

## Public API

### Top-level exports

- `Toolkit`
- Components: `Button`, `Group`, `GroupHeader`, `Label`, `Rect`, `SliderButton`, `Switch`, `Tab`, `Tabs`, `TextInput`, `Timeline`
- Types: `ToolkitOptions`, `ToolkitConnection`, `ToolkitServerListenerOptions`, `ToolkitServerListener`, `AnyComponent`

### Subpath exports

- `@arcanejs/toolkit/components/*`: component classes and types
- `@arcanejs/toolkit/components/base`: `Base`, `BaseParent`, `EventEmitter`, related types
- `@arcanejs/toolkit/frontend`: browser entrypoint helpers (`startArcaneFrontend`)
- `@arcanejs/toolkit/util`: utility exports like `HUE_GRADIENT` and `IDMap`

`startArcaneFrontend(...)` supports:

- `renderers`: frontend component renderer list
- `themes?: { dark; light }` (legacy-compatible themed objects)
- `themeVariables?: Partial<ThemeVariableMap>` (CSS variable overrides)
- `themeRootProps?: React.HTMLAttributes<HTMLDivElement>` (root theme container props)

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
- `entrypointJsFile?: string`: custom frontend bundle path for custom namespaces/components
- `materialIconsFontFile?: string`: explicit path to `material-symbols-outlined.woff2` when auto-resolution is not possible
- `additionalFiles?: Record<string, () => Promise<{ contentType: string; content: Buffer }>>`: additional static files served from the toolkit path. Keys are relative request paths (for example `styles/app.css` -> `/your-path/styles/app.css`), and must not start with `/`.
- `htmlPage?: (context) => string | Promise<string>`: custom HTML renderer for the root route. Context includes:
  - `coreAssets`: URLs for built-in toolkit static assets (`materialSymbolsOutlined`, `entrypointJs`, `entrypointJsMap`, `entrypointCss`)
  - `assetUrls`: URL mapping for all static assets by relative path (core + `additionalFiles`)
  - `title`, `path`

Important constraint:

- `path` must start and end with `/` (for example: `/`, `/control/`)

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
- Tree updates are throttled internally

## Related Packages

- [`@arcanejs/react-toolkit`](https://www.npmjs.com/package/@arcanejs/react-toolkit): React renderer for composing server-side component trees
- [`@arcanejs/toolkit-frontend`](https://www.npmjs.com/package/@arcanejs/toolkit-frontend): browser renderer components and stage context
- [`@arcanejs/protocol`](https://www.npmjs.com/package/@arcanejs/protocol): wire protocol types
- [`@arcanejs/diff`](https://www.npmjs.com/package/@arcanejs/diff): JSON diff/patch engine

## Examples

- React examples: <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/react>
- Core API examples (no React renderer): <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/core>
- Custom namespace end-to-end example: <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/custom-components>
