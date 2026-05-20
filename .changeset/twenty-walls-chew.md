---
'@arcanejs/protocol': minor
'@arcanejs/toolkit': major
'@arcanejs/toolkit-frontend': minor
---

Implement file uploads / downloads

Allow for custom components to handle streamed file uploads & downloads,
responding to custom messages like calls (with customizable parameters),
handling the file transfers as separate HTTP calls that can transfer binary data
directly.

For most custom components, the existing API will probably work fine without any
issues, but there may be some minor type errors to address.
