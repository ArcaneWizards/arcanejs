---
'@arcanejs/toolkit': major
'@arcanejs/toolkit-frontend': minor
---

[BREAKING] Move Arcane frontend styling to CSS assets + CSS variables and remove styled-components compatibility layers.

`@arcanejs/toolkit-frontend/styling` now exposes a class-based `ThemeRoot` only. JS theme-object APIs (`DARK_THEME`, `LIGHT_THEME`, `Theme`, `ThemeVariableMap`, `themeToCssVariables`) and legacy compatibility helpers (`PreferredThemeProvider`, `BaseStyle`, `GlobalStyle`) have been removed.

Core frontend styles are now generated via a Tailwind CLI build pipeline and distributed from `@arcanejs/toolkit-frontend/styles/core.css`. Toolkit serves sibling `entrypoint.css`/`entrypoint.css.map` assets when present, and JS/CSS source maps are optional.

`@arcanejs/toolkit/frontend` startup no longer accepts `themes` or `themeVariables`; theme switching is applied via root preference classes (`theme-auto`/`theme-dark`/`theme-light`) and theme customization is CSS-only.

Core and example theme CSS have been refactored to reduce duplicated light/dark variable blocks while keeping behavior for `theme-auto`, `theme-dark`, and `theme-light`.
