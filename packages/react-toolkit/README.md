# `@arcanejs/react-toolkit`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Freact-toolkit)](https://www.npmjs.com/package/@arcanejs/react-toolkit)

React renderer for ArcaneJS server-side control panels.

This package lets you build toolkit component trees using React state/hooks on the server, then synchronize them to connected browser clients in real time.

<p align="center">
  <img src="https://raw.githubusercontent.com/ArcaneWizards/arcanejs/main/packages/react-toolkit/docs/architecture.svg" alt="Architecture Diagram">
</p>

## Why Use `@arcanejs/react-toolkit`

This package is useful when you want a control panel for a long-running Node.js process without building a full web app stack.

It gives you:

- server-side React state/hooks for control logic
- realtime multi-client sync over WebSockets
- a ready set of control-oriented UI components (switches, sliders, groups, tabs, timelines)
- an extension path for custom components when core components are not enough

Typical use cases:

- home/lab automation control surfaces
- AV/lighting/operations dashboards on a local network
- internal tooling for stateful services/scripts that need live operator controls

## When It Fits (And When It Doesn't)

Good fit:

- single-process Node.js apps with in-memory state
- trusted/internal networks where operators need live controls
- projects where React composition is preferred over manual tree mutation

Not a fit:

- internet-exposed apps requiring built-in auth/authz
- horizontally scaled/multi-process architectures needing shared state coordination
- general-purpose public web apps that need standard React DOM/SSR patterns

## Install

```bash
npm install react@^18 @arcanejs/toolkit @arcanejs/react-toolkit
```

Optional helper dependencies:

- `zod` is required if you use `@arcanejs/react-toolkit/data`

## Quick Start

```tsx
import { useState } from 'react';
import { Toolkit } from '@arcanejs/toolkit';
import {
  ToolkitRenderer,
  Group,
  Switch,
  SliderButton,
} from '@arcanejs/react-toolkit';

const toolkit = new Toolkit();
toolkit.start({ mode: 'automatic', port: 3000 });

function App() {
  const [enabled, setEnabled] = useState<'on' | 'off'>('off');
  const [level, setLevel] = useState(50);

  return (
    <Group direction="vertical" title="Controller">
      <Group>
        {`Enabled: ${enabled}`}
        <Switch value={enabled} onChange={setEnabled} />
      </Group>
      <Group>
        {`Level: ${level}`}
        <SliderButton value={level} onChange={setLevel} min={0} max={100} />
      </Group>
    </Group>
  );
}

ToolkitRenderer.render(<App />, toolkit);
```

## Core Exports

### From `@arcanejs/react-toolkit`

- `ToolkitRenderer`
  - `render(element, toolkit, rootGroupProps?, config?)`
  - `renderGroup(element, group, config?)`
- Core React components:
  - `Button`, `Group`, `GroupHeader`, `Label`, `Rect`, `SliderButton`, `Switch`, `Tab`, `Tabs`, `TextInput`, `Timeline`
- Extension helpers:
  - `prepareComponents(namespace, components)`
  - `CoreComponents`

Core component props/events map directly to the corresponding classes in `@arcanejs/toolkit`.

## Core Component API

These are the React components most users consume directly from `@arcanejs/react-toolkit`.

### `Button`

Props:

- `text?: string | null`
- `icon?: string | null` (Material Symbols Outlined icon name)
- `mode?: 'normal' | 'pressed'`
- `error?: string | null`
- `onClick?: (connection) => void | Promise<void>`

Notes:

- `onClick` uses request/response semantics and can be async.
- Throwing (or rejecting) in `onClick` surfaces an error state in the UI.

```tsx
<Button
  text="Run"
  icon="play_arrow"
  onClick={async () => {
    await runTask();
  }}
/>
```

### `Group`

Props:

- `direction?: 'horizontal' | 'vertical'`
- `wrap?: boolean`
- `border?: true`
- `title?: string | null`
- `labels?: Array<{ text: string }> | null`
- `editableTitle?: boolean`
- `defaultCollapsibleState?: 'open' | 'closed' | 'auto'`
- `onTitleChanged?: (title, connection) => void`

Use `Group` as the primary layout primitive and nest groups freely.

```tsx
<Group
  direction="vertical"
  title="Fixture Settings"
  border
  editableTitle
  onTitleChanged={(title) => setPanelTitle(title)}
>
  <Label text="Master Intensity" />
  <SliderButton value={master} min={0} max={100} onChange={setMaster} />
</Group>
```

### `GroupHeader`

`GroupHeader` lets you place controls in a group's header area.

```tsx
<Group title="Playlist">
  <GroupHeader>
    <Button text="Add" onClick={addItem} />
    <Button text="Shuffle" onClick={shuffle} />
  </GroupHeader>
  <Label text="Current Queue" />
</Group>
```

### `Label`

Props:

- `text: string | null`
- `bold?: boolean`

```tsx
<Label text={`Connected: ${isConnected ? 'yes' : 'no'}`} bold />
```

### `Rect`

Props:

- `color?: string`
- `grow?: boolean`

Useful for color/state swatches.

```tsx
<Group>
  <Label text="Current Color" />
  <Rect color={`hsl(${hue}deg 100% 50%)`} grow />
</Group>
```

### `SliderButton`

Props:

- `value: number` (required)
- `min?: number` (default `0`)
- `max?: number` (default `255`)
- `step?: number` (default `5`)
- `defaultValue?: number` (for uncontrolled style workflows)
- `gradient?: Array<{ color: string; position: number }>`
- `grow?: boolean`
- `onChange?: (value, connection) => void | Promise<void>`

```tsx
<SliderButton
  value={temperature}
  min={2700}
  max={6500}
  step={100}
  onChange={setTemperature}
/>
```

### `Switch`

Props:

- `value?: 'on' | 'off'`
- `defaultValue?: 'on' | 'off'`
- `onChange?: (state, connection) => void | Promise<void>`

```tsx
<Switch value={enabled} onChange={setEnabled} />
```

### `Tabs` and `Tab`

`Tabs` only accepts `Tab` children. Each `Tab` should contain one child component subtree.

```tsx
<Tabs>
  <Tab name="Input">
    <Group>
      <TextInput value={input} onChange={setInput} />
    </Group>
  </Tab>
  <Tab name="Output">
    <Group>
      <Label text={output} />
    </Group>
  </Tab>
</Tabs>
```

### `TextInput`

Props:

- `value?: string | null`
- `onChange?: (value, connection) => void | Promise<void>`

```tsx
<TextInput value={name} onChange={setName} />
```

### `Timeline`

Props:

- `state?`:
  - `{ state: 'playing'; totalTimeMillis; effectiveStartTime; speed }`
  - `{ state: 'stopped'; totalTimeMillis; currentTimeMillis }`
- `title?: string | null`
- `subtitles?: string[] | null`
- `source?: { name: string } | null`

```tsx
<Timeline
  title="Show Timeline"
  subtitles={[`Cue ${cue}`, `BPM ${bpm}`]}
  source={{ name: activeTrack }}
  state={
    playing
      ? {
          state: 'playing',
          totalTimeMillis: duration,
          effectiveStartTime: startedAt,
          speed: 1,
        }
      : {
          state: 'stopped',
          totalTimeMillis: duration,
          currentTimeMillis: pausedAt,
        }
  }
/>
```

## Helper Modules

### `@arcanejs/react-toolkit/connections`

Connection-awareness for server-side React trees:

- `ConnectionsContext`
- `ConnectionsContextProvider`

Use this to render connection-specific UI or track per-connection state.

### `@arcanejs/react-toolkit/data`

JSON file persistence helpers backed by Zod validation:

- `createDataFileDefinition`
- `useDataFileContext`
- `useDataFileData`
- `useDataFileUpdater`
- `useDataFile`
- `useDataFileCore`

Supports:

- lazy file creation with defaults
- schema validation on load
- throttled disk writes
- path switching behavior (`onPathChange: 'transfer' | 'defaultValue'`)

### `@arcanejs/react-toolkit/colors`

- `HslColor` type
- `HslColorPicker` component

### `@arcanejs/react-toolkit/logging`

- `LoggerContext`
- `useLogger()`

## Custom Component Namespaces

Use `prepareComponents(...)` + `ToolkitRenderer` config to add custom namespaces:

```tsx
import {
  prepareComponents,
  CoreComponents,
  ToolkitRenderer,
} from '@arcanejs/react-toolkit';

const Custom = prepareComponents('custom', {
  MyComponent,
});

ToolkitRenderer.render(
  <App />,
  toolkit,
  {},
  {
    componentNamespaces: [CoreComponents, Custom],
  },
);
```

You must also implement matching protocol/backend/frontend layers. See:

- <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/custom-components>

## Important Constraints

- This is a custom renderer, not React DOM. Standard HTML elements are not supported.
- React state/hooks run on the server process.
- Toolkit root can only be set once.
- Architecture is single-process and intentionally stateful.
- No built-in authentication/authorization.

## Stability / Suitability

ArcaneJS uses `react-reconciler` APIs and is considered experimental. It is best suited for trusted-network/internal control applications.

## Examples

- React examples: <https://github.com/ArcaneWizards/arcanejs/tree/main/examples/react>
- Main readme example: <https://github.com/ArcaneWizards/arcanejs/blob/main/examples/react/src/readme.tsx>
- Connections example: <https://github.com/ArcaneWizards/arcanejs/blob/main/examples/react/src/connections.tsx>
- Data file example: <https://github.com/ArcaneWizards/arcanejs/blob/main/examples/react/src/data-file.tsx>
