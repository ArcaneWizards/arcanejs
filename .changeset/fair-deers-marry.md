---
'@arcanejs/toolkit': major
'@arcanejs/toolkit-frontend': minor
---

Migrate from styled-components to tailwind.

Breaking:

- JS theme-object APIs (`DARK_THEME`, `LIGHT_THEME`, `Theme`, `ThemeVariableMap`, `themeToCssVariables`) have been removed.
- `@arcanejs/toolkit/frontend` startup no longer accepts `themes` or `themeVariables`; theme switching is applied via root preference classes (`theme-auto`/`theme-dark`/`theme-light`) and theme customization is CSS-only.

For styling customization,
various css files are published to allow for you to use tailwind for your own apps
and custom components:

- `@arcanejs/toolkit-frontend/styles/base.css`
- `@arcanejs/toolkit-frontend/styles/theme.css`
- `@arcanejs/toolkit-frontend/styles/core.css`

(See the documentation of `@arcanejs/toolkit-frontend` for correct usage)

To override the theme,
you can compile your own css bundle, excluding theme.css above.

See the `theme-customization` example for reference.
