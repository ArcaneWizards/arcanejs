---
'@arcanejs/react-toolkit': patch
---

Prevent `@arcanejs/react-toolkit/data` from corrupting JSON files when multiple saves happen close together. Data file writes are now serialized and written via a temporary file swap so interrupted or overlapping saves do not leave invalid JSON behind.
