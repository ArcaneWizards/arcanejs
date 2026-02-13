---
'@arcanejs/toolkit': patch
---

Avoid sending websocket `tree-diff` messages when the computed diff is `{ type: 'match' }`.

This reduces no-op update traffic by suppressing unchanged tree broadcasts while preserving existing behavior when actual changes are present.
