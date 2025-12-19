---
'@arcanejs/examples-custom-components': minor
'@arcanejs/toolkit-frontend': minor
---

Allow for color preferences to be overridden

Introduce a new hook `useColorSchemePreferences` which can be used by
custom components to introduce UI that allows a user to override their theme
preferences (and not just use OS settings),
and saves the changes to localStorage.
