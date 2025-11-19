---
'@arcanejs/toolkit': major
'@arcanejs/toolkit-frontend': minor
'@arcanejs/react-toolkit': minor
'@arcanejs/protocol': minor
---

Introduce RPC mechanism for individual connections

Introduce a new feature that allows components to send a message to the backend,
and then await a response back to the original callee.
This is an enhancement over the old message system that allows for things
such as individual requests for data,
without requiring that data to be present in the tree for all connections.

The first usage of this has been to migrate the Button component over to it
and also update the styling to display when the callback is still "in-progress".
Any errors are now reflected back only to the original calling connection,
and not all viewers.
