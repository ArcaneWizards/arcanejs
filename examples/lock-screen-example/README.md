# `lock-screen-example`

Example app demonstrating connection-scoped tree rendering with a custom lock
screen component.

Each browser connection starts in a locked state and must pass a password call
before protected components are rendered for that connection.

To run locally:

- Clone this repository
- Run `pnpm install && pnpm build` in the repo root
- Run `pnpm --filter @arcanejs/examples-lock-screen-example start`
