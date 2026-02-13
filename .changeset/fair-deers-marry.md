---
'@arcanejs/toolkit': minor
'@arcanejs/toolkit-frontend': minor
---

Add CSS-variable-based theme root support while keeping `themes` compatibility in frontend startup.

`@arcanejs/toolkit-frontend` now exposes `ThemeRoot`, `ThemeVariableMap`, and `themeToCssVariables`, plus a distributed core stylesheet export at `@arcanejs/toolkit-frontend/styles/core.css`.

`@arcanejs/toolkit/frontend` startup options now accept `themeVariables` and `themeRootProps`, and toolkit server `htmlPage` context includes optional `coreAssets.entrypointCss` when a sibling CSS asset exists for the frontend entrypoint.
