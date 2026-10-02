---
'@arcanejs/toolkit': minor
'@arcanejs/toolkit-frontend': patch
'@arcanejs/protocol': patch
---

Introduce client logging

Introduce protocol messages and an API in StageContextData to allow client code
to log messages and errors (including stack traces),
and send these messages to the backend,
then padding along to whatever logging handler the toolkit
has been initialized with.
