---
'@arcanejs/react-toolkit': minor
---

Improve createDataFileDefinition error handling

Introduce custom errors with rich information about the operation and path
that had an issue, along with the underlying cause.

Also allow a generic error handler property to be passed to receive calls
whenever an error occurs, regardless of the cause.
