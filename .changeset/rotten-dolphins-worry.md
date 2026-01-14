---
'@arcanejs/toolkit': patch
---

Avoid fragment in WS URLs

Avoid a bug where websocket connections would fail to initialize if the current
window has a fragment in the URL.
