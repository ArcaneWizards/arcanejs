---
'@arcanejs/toolkit': major
'@arcanejs/react-toolkit': major
'@arcanejs/toolkit-frontend': major
---

Upgrade ArcaneJS React dependencies to the current React 19 stack.

- Move package React expectations to `react@^19.2.0` and `react-dom@^19.2.0`.
- Update `@arcanejs/react-toolkit` to `react-reconciler@0.33.0`.
- Update the custom reconciler host config to support current `react-reconciler` internals, including React 19-era container/update signatures.
