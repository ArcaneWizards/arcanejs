# Theme customization example

This example demonstrates a custom frontend entrypoint that overrides Arcane
CSS variables using CSS only (no JS theme objects), including separate variable
sets for dark, light, and auto/system mode. It also includes a custom
`theme-switch` component namespace to control appearance mode
(`auto/system`, `dark`, `light`) from inside the Arcane UI.

Included controls:

- Text input
- Button
- Switch
- Slider button

Run locally:

- `pnpm install && pnpm build` from repository root
- `pnpm --filter @arcanejs/examples-theme-customization start`
