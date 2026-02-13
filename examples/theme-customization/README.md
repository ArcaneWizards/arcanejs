# Theme customization example

This example demonstrates a custom frontend entrypoint that overrides both
light and dark Arcane CSS-variable themes with a more colorful, modern look and
larger spacing. It also includes a custom `theme-switch` component namespace to
control appearance mode (`auto/system`, `dark`, `light`) from inside the Arcane
UI.

Included controls:

- Text input
- Button
- Switch
- Slider button

Run locally:

- `pnpm install && pnpm build` from repository root
- `pnpm --filter @arcanejs/examples-theme-customization start`
