---
'@arcanejs/toolkit': minor
---

Improve types for `EventEmitter.emit()` and introduce `EventEmitter.call()`

Make it easier to introduce custom components with RCP calls by introducing
convenience functions for requiring & calling a single listener,
returning its value. Also improve the return types of `emit()`.
