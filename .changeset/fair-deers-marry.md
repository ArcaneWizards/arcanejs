---
'@arcanejs/toolkit': major
'@arcanejs/toolkit-frontend': minor
---

[BREAKING] Move Arcane frontend styling to CSS assets + CSS variables and remove styled-components compatibility layers.

`@arcanejs/toolkit-frontend/styling` now exposes `ThemeRoot`, `ThemeVariableMap`, and `themeToCssVariables` as the supported theming API. Legacy `PreferredThemeProvider`, `BaseStyle`, `GlobalStyle`, and migration snippet exports have been removed.

Core frontend styles are distributed as precompiled CSS and should be imported from `@arcanejs/toolkit-frontend/styles/core.css`. Toolkit serves sibling `entrypoint.css`/`entrypoint.css.map` assets when present, and JS/CSS source maps are optional.

`@arcanejs/toolkit/frontend` startup keeps `themes` compatibility and supports `themeVariables` + `themeRootProps`, with variables scoped on `.arcane-theme-root` and preference classes (`theme-auto`/`theme-dark`/`theme-light`) applied internally.
