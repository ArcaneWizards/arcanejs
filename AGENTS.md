# AGENTS.md

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work on this project. If you even encounter something in the project that surprises or confuses you, please alert the developer and indicate that this is the case in this file to help future agents from having the same issue.

## Maintenance

When changing public-facing APIs in publishable packages, update that package's `README.md` if there is any outdated information.

Do not update package READMEs for backend-only/internal implementation details that do not change package usage, public API, or consumer-facing behavior.

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

## Worktree Dependency Setup

Agent sessions commonly run in fresh git worktrees where dependencies are not installed yet, and within a sandbox that does not have network access.

Required near the start of each workflow (before any other `pnpm` command):

- `pnpm install --offline`

## Sandbox Environment

You're running in a sandboxed environment. If you encounter network connectivity issues (such as with `pnpm install` without `--offline`), prompt the developer to run necessary commands for you to continue rather than attempting network operations that may fail.

## Monorepo Layout

A pnpm & turbo monorepo is used in this repository.

Keep the following list up to date when introducing any new packages:

- `/packages/toolkit`: core server runtime, component classes, HTTP/WS server, frontend bootstrap entrypoint.
- `/packages/react-toolkit`: custom React reconciler that renders JSX into `@arcanejs/toolkit` component instances.
- `/packages/toolkit-frontend`: browser React components that render protocol nodes and send user events back.
- `/packages/protocol`: shared message/component TypeScript contracts.
- `/packages/diff`: JSON diff/patch used to sync tree changes efficiently.
- `/examples/*`: various example packages
- `/apps/docs`: Next.js sandbox/simulator for rendering components without live WS.

## Changesets (Required for Package Code Changes)

This repo uses Changesets for release notes and version bumps. Agents must keep `.changeset` entries accurate so release cuts bump all affected versions.

When to add a changeset:

- Add one for code changes in publishable packages.
- Do not add a changeset for changes limited to docs, formatting, CI, or example/apps-only changes.
- Do not add a changeset for private config packages unless explicitly requested (e.g. `@arcanejs/eslint-config`).

How to create it:

1. Run `pnpm changeset` after making package code changes.
2. Select every changed publishable package.
3. Choose bump level based on impact:
   - `patch`: bug fixes, internal refactors, non-breaking behavior changes.
   - `minor`: backward-compatible new features.
   - `major`: breaking API/behavior changes.
   - For packages still on `0.x.x`, downgrade one level from the standard rule:
     - breaking changes use `minor` (instead of `major`)
     - new features use `patch` (instead of `minor`)
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
- Prefer preparing changes, staging guidance, and commit message suggestions.
- Never create unsigned commits.

## Important Constraints and Gotchas

- New example workspaces should include a local `.eslintrc.js` (same pattern as existing examples) so `pnpm lint` picks up TypeScript files correctly.
- Avoid synchronous filesystem APIs (`fs.existsSync`, `fs.readFileSync`, `fs.statSync`, etc.) across the repo; prefer `fs.promises` and lazy async initialization with memoized promises for shared setup paths.
- In `apps/docs` client-side code, do not import from `@arcanejs/toolkit` root (it pulls backend/server dependencies like `fs` into the Next.js client bundle). Use toolkit subpath imports (`@arcanejs/toolkit/components/*`, `@arcanejs/toolkit/util`) and local render-context objects instead.
