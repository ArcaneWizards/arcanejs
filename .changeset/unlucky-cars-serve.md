---
'@arcanejs/toolkit': minor
---

Log errors when backend components throw errors

Previously, errors that occur in `handleMessage` were not correctly caught,
and errors that occur in `handleCall` would only be visible to client-side code.
Now, both types of errors will print an error in the log,
and handleMessage errors won't cause the app to crash.
