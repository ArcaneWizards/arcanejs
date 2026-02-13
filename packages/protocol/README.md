# `@arcanejs/protocol`

[![NPM Version](https://img.shields.io/npm/v/%40arcanejs%2Fprotocol)](https://www.npmjs.com/package/@arcanejs/protocol)

TypeScript protocol contracts for ArcaneJS.

This package defines the shared wire/message types used between:

- ArcaneJS server runtime (`@arcanejs/toolkit`)
- Browser frontend stage (`@arcanejs/toolkit/frontend` + `@arcanejs/toolkit-frontend`)
- Custom extensions (custom namespaces/components)

## Install

```bash
npm install @arcanejs/protocol
```

## What It Defines

## Base protocol (`@arcanejs/protocol`)

- Base component envelope (`BaseComponentProto`, `AnyComponentProto`)
- Server messages:
  - `metadata`
  - `tree-full`
  - `tree-diff`
  - `call-response`
- Client messages:
  - `component-message`
  - `component-call`
- Type helpers for call/response pair typing:
  - `BaseClientComponentCallPair`
  - `CallForPair`
  - `ReturnForPair`

## Core namespace (`@arcanejs/protocol/core`)

Core component protocol types and guards:

- Component types: `ButtonComponent`, `GroupComponent`, `LabelComponent`, `RectComponent`, `SliderButtonComponent`, `SwitchComponent`, `TabComponent`, `TabsComponent`, `TextInputComponent`, `TimelineComponent`
- Message types: `CoreComponentMessage` and specific message variants
- Call type map: `CoreComponentCalls`
- Guards:
  - `isCoreComponent(...)`
  - `isCoreComponentMessage(...)`
  - `isCoreComponentCall(...)`

## Supporting modules

- `@arcanejs/protocol/styles`: shared style contracts (`GroupComponentStyle`, `LabelComponentStyle`)
- `@arcanejs/protocol/logging`: logger contract (`Logger`)

## Usage Example

```ts
import type {
  ServerMessage,
  ClientMessage,
  BaseComponentProto,
  CallForPair,
  ReturnForPair,
} from '@arcanejs/protocol';

import type {
  CoreComponentCalls,
  CoreComponentMessage,
} from '@arcanejs/protocol/core';

const onServerMessage = (msg: ServerMessage) => {
  if (msg.type === 'tree-full') {
    const root: BaseComponentProto<string, string> = msg.root;
    console.log(root.namespace, root.component);
  }
};

const message: CoreComponentMessage = {
  type: 'component-message',
  namespace: 'core',
  componentKey: 1,
  component: 'switch',
};

const callMessage: CallForPair<'core', CoreComponentCalls, 'press'> = {
  type: 'component-call',
  namespace: 'core',
  componentKey: 5,
  action: 'press',
};

type PressReturn = ReturnForPair<CoreComponentCalls, 'press'>; // true
const _resultExample: PressReturn = true;

const _clientMessage: ClientMessage = message;
```

## Notes

- This package is primarily type contracts and guard helpers.
- `tree-diff` payloads use `Diff<...>` from `@arcanejs/diff`.
- Custom namespaces should follow the same pattern as `core`: define component proto types, message/call unions, and guard helpers.

## Example Reference

- Custom protocol implementation example: <https://github.com/ArcaneWizards/arcanejs/blob/main/examples/custom-components/src/custom-proto.ts>
