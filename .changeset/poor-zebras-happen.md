---
'@arcanejs/react-toolkit': patch
---

Fix: Memoize `sendNotification` in `ConnectionsContext`.

The `sendNotification` function in the `ConnectionsContext` was not correctly
memoized, meaning that unnecessary re-renders could occur when
used in a dependency array.

This also affected `useNotificationSender`,
which used used `sendNotification` internally in a dependency array.
