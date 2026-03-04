---
'@arcanejs/toolkit-frontend': patch
'@arcanejs/toolkit': patch
---

Split frontend styles into three public exports:

- `@arcanejs/toolkit-frontend/styles/core.css`: precompiled core component classes and shared global rules (no default theme variables)
- `@arcanejs/toolkit-frontend/styles/theme.css`: default Arcane theme variable values (`theme-light`, `theme-dark`, and `prefers-color-scheme`)
- `@arcanejs/toolkit-frontend/styles/base.css`: Tailwind source stylesheet for custom app builds that need Arcane `@theme` tokens and utility generation for custom class usage

`@arcanejs/toolkit` default frontend entrypoint now imports both `core.css` and `theme.css`.
