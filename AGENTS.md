# AGENTS.md

## Purpose

This repository is `arcanejs`, a pnpm/turbo monorepo for building realtime control panels for single-process Node.js apps.

## Agent Maintenance Rules

Treat this file as a living operational map for future agents.

When working in this repo, update `AGENTS.md` in the same change if you discover any of the following:

- Documentation in this file no longer matches actual source behavior.
- New architecture boundaries, runtime flows, or package responsibilities.
- New gotchas, failure modes, or non-obvious constraints that can save future debugging time.
- Important workflow changes (build/test/dev commands, entrypoints, extension patterns).

When changing public-facing APIs in publishable packages (`packages/toolkit`, `packages/react-toolkit`, `packages/toolkit-frontend`, `packages/protocol`, `packages/diff`), update that package's `README.md` in the same change. Treat README updates as required for:
- Export map changes (`package.json#exports`)
- Added/removed/renamed exported symbols
- Behavior changes that affect how consumers use the package
- New required peer/dependency expectations for package consumers

When exposing a new subpath/module that is not already re-exported by an existing entry module, update both:
- `tsup.config.ts` `entry` list in that package (controls what gets built into `dist/*`)
- `package.json#exports` for the new public import path

Do not update only one side. Publishable packages run `check-export-map` in their build scripts, so export map and built outputs must stay aligned.

Expectations for updates:

- Prefer small, precise edits over broad rewrites.
- Keep guidance implementation-anchored (point to concrete files/functions).
- Record facts, not speculation; verify against source before adding.
- If a discrepancy is uncertain, add it as a clearly-labeled “Open Question” instead of asserting it as fact.
- Do not remove older guidance unless it is confirmed obsolete or incorrect.

## Formatting Requirement

After any repository change (including Markdown/docs), agents must run Prettier from the repository root using pnpm before finishing work.

Required command:

- `pnpm format:fix`

Expectations:

- Run formatting after each set of edits and again before handoff if additional edits occurred.
- Treat formatting as mandatory, not optional.

The architecture is split across:

- Server-side component model and transport (`@arcanejs/toolkit`)
- Protocol types (`@arcanejs/protocol`)
- Diff/patch engine for incremental tree updates (`@arcanejs/diff`)
- Server-side React renderer (`@arcanejs/react-toolkit`)
- Browser-side renderer + UI components (`@arcanejs/toolkit-frontend`)

## Monorepo Layout

- `/packages/toolkit`: core server runtime, component classes, HTTP/WS server, frontend bootstrap entrypoint.
- `/packages/react-toolkit`: custom React reconciler that renders JSX into `@arcanejs/toolkit` component instances.
- `/packages/toolkit-frontend`: browser React components that render protocol nodes and send user events back.
- `/packages/protocol`: shared message/component TypeScript contracts.
- `/packages/diff`: JSON diff/patch used to sync tree changes efficiently.
- `/examples/react`: primary usage examples for React-based apps.
- `/examples/core`: usage without React renderer (direct toolkit classes).
- `/examples/custom-components`: full custom namespace example (backend + frontend + protocol).
- `/apps/docs`: Next.js sandbox/simulator for rendering components without live WS.

## How The System Works (End-to-End)

1. App code builds a control tree:
   - Usually with React via `ToolkitRenderer.render(...)` from `@arcanejs/react-toolkit`.
   - Or directly with toolkit classes (`Group`, `Button`, etc.).
2. Toolkit hosts HTTP + WebSocket:
   - `Toolkit.start(...)` in `/packages/toolkit/src/backend/toolkit.ts`.
   - Serves a minimal HTML shell and JS entrypoint from `Server` in `/packages/toolkit/src/backend/server.ts`.
3. Initial client sync:
   - On WS connect, server sends `metadata` and `tree-full`.
4. Incremental sync:
   - Component changes trigger `updateTree()` (throttled).
   - Server computes `diffJson(lastTreeSent, currentTree)` and sends `tree-diff`.
5. Browser render:
   - Frontend stage applies `patchJson(...)` for diffs in `/packages/toolkit/src/frontend/stage.tsx`.
   - Renderer dispatches nodes by `namespace` to frontend renderers (core by default).
6. User interaction:
   - Fire-and-forget events use `component-message` (switch/text input/group title, etc.).
   - Request/response actions use `component-call` + `call-response` (button press, custom actions).
7. Backend routing:
   - Toolkit routes messages/calls by component key through tree (`routeMessage` / `routeCall`).
   - Component handlers update props/state and emit listeners.

## Core Runtime Components

- `Toolkit` (`/packages/toolkit/src/backend/toolkit.ts`)
  - Owns root component tree, connection registry, and server lifecycle.
  - Supports startup modes: `automatic`, `express`, `manual`.
  - Enforces `options.path` must start and end with `/`.
- `Server` (`/packages/toolkit/src/backend/server.ts`)
  - Serves HTML + static assets and handles WebSocket connections.
  - Optional custom frontend bundle via `entrypointJsFile`.
- `Base` / `BaseParent` (`/packages/toolkit/src/backend/components/base.ts`)
  - Shared component behavior, immutable props updates, listener wiring.
  - Parent components own child lists and recursive message/call routing.
- `IDMap` (`/packages/toolkit/src/backend/util/id-map.ts`)
  - WeakMap-backed stable numeric keys per component instance identity.

## React Renderer Internals

- `/packages/react-toolkit/src/index.tsx`
  - Custom `react-reconciler` host config.
  - JSX tags are encoded as `"namespace:ComponentName"` host types.
  - `prepareComponents(...)` maps component classes to React components + creators.
  - `ToolkitRenderer.render(...)` creates a root `Group` and mounts React app into toolkit tree.
- Core component namespace registration:
  - `/packages/react-toolkit/src/core.ts`

## Browser Renderer Internals

- `/packages/toolkit/src/frontend/entrypoint-core.ts`
  - Default frontend bundle startup with core renderers.
- `/packages/toolkit/src/frontend/stage.tsx`
  - WebSocket lifecycle, tree state, diff patching, call request tracking.
- `/packages/toolkit-frontend/src/components/index.tsx`
  - Core namespace renderer dispatch (`button`, `group`, `switch`, etc.).
- `StageContext` provides `sendMessage`, `call`, `connection`, and renderer access.

## Protocol and Diff Contracts

- Protocol root types: `/packages/protocol/src/index.ts`
  - Server messages: `metadata`, `tree-full`, `tree-diff`, `call-response`.
  - Client messages: `component-message`, `component-call`.
- Core component protocol: `/packages/protocol/src/core.ts`
  - Defines component payload shape and core message/call type guards.
- Diff algorithm: `/packages/diff/src/diff.ts`
  - Produces typed JSON diffs (`match`, `value`, `splice`, `modified-a`, `modified-o`).
- Patch algorithm: `/packages/diff/src/patch.ts`
  - Applies diff to reconstruct next tree in browser.

## Extending With Custom Components

Use `/examples/custom-components` as the reference pattern.

For a new namespace/component you must implement all layers:

1. Protocol types and guards (message/call/component proto).
2. Backend component class (`Base` or `BaseParent`) with `getProtoInfo` and handlers.
3. React renderer registration via `prepareComponents(namespace, ...)`.
4. Frontend renderer for that namespace (`FrontendComponentRenderer`).
5. Frontend entrypoint bundle (if not using default core-only entrypoint), then set toolkit `entrypointJsFile`.

## Dev Commands

Repo root:

- `pnpm dev`: turbo dev across workspaces.
- `pnpm build`: turbo build.
- `pnpm lint`: turbo lint.
- `pnpm test`: turbo test.

Useful package/example commands:

- `pnpm --filter @arcanejs/toolkit build`
- `pnpm --filter @arcanejs/react-toolkit build`
- `pnpm --filter @arcanejs/toolkit-frontend build`
- `pnpm --filter @arcanejs/examples-react start:counter`
- `pnpm --filter @arcanejs/examples-custom-components start`

## Changesets (Required for Package Code Changes)

This repo uses Changesets for release notes and version bumps. Agents must keep `.changeset` entries accurate so release cuts bump all affected versions.

When to add a changeset:

- Add one for code changes in these publishable packages under `packages/*`: `@arcanejs/toolkit`, `@arcanejs/react-toolkit`, `@arcanejs/toolkit-frontend`, `@arcanejs/protocol`, `@arcanejs/diff`.
- Do not add a changeset for changes limited to docs, formatting, CI, or example/apps-only changes.
- Do not add a changeset for private config packages unless explicitly requested (`@arcanejs/eslint-config`, `@arcanejs/typescript-config`).

How to create it:

1. Run `pnpm changeset` after making package code changes.
2. Select every changed publishable package.
3. Choose bump level based on impact:
   - `patch`: bug fixes, internal refactors, non-breaking behavior changes.
   - `minor`: backward-compatible new features.
   - `major`: breaking API/behavior changes.
4. Write a concise summary focused on user-visible impact.
5. Stage the generated `.changeset/*.md` file with the code change.

Authoring guidelines for changeset text:

- Describe what changed and why it matters to package consumers.
- Mention API additions/removals/renames and behavior changes.
- Avoid vague text like “misc updates”.
- If multiple packages changed, include package-specific notes in one changeset where appropriate.
- Keep entries factual and scoped to the actual diff.

## Commit Signing Workflow

This repository requires signed commits using external key material and user interaction.

Agent rules:

- Do not create commits by default as part of normal workflow.
- If a commit is needed, explicitly confirm with the user first so they can respond to signing prompts.
- Prefer preparing changes, staging guidance, and commit message suggestions unless the user asks the agent to run `git commit`.
- Never create unsigned commits.

## Important Constraints and Gotchas

- Single-process architecture by design; no multi-process state coordination.
- No authentication/authorization built in; do not expose publicly without hardening.
- Toolkit root can only be set once (`setRoot` throws on second call).
- Tree updates are throttled; do not assume per-mutation immediate network flush.
- Component keys depend on instance identity; replacing instances changes keys.
- Core packages target React 18; `apps/docs` is a separate sandbox using Next/React RC versions.
- Package READMEs are maintained, but if docs and source diverge, treat source files as authoritative.

## Where To Start For Common Tasks

- Add/update core backend behavior: `/packages/toolkit/src/backend/components/*`
- Change server/network behavior: `/packages/toolkit/src/backend/toolkit.ts`, `/packages/toolkit/src/backend/server.ts`
- Change React rendering semantics: `/packages/react-toolkit/src/index.tsx`
- Change browser UI behavior/styles: `/packages/toolkit-frontend/src/components/*`, `/packages/toolkit-frontend/src/styling.tsx`
- Change wire contracts: `/packages/protocol/src/*`
- Validate sync logic: `/packages/diff/src/*.ts` + tests in `/packages/diff/src/*.test.ts`
