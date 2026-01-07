---
'@arcanejs/toolkit': patch
---

Address bug where messages are sent to closed socket

When first trying to send a message while there's no active connection,
for example after a connection has just been closed,
the send would fail as it wouldn't wait for the connection to be open.

This was due to `initializeWebsocket` incorrectly resolving too early.
`initializeWebsocket` now only resolves after the socket has been opened.
