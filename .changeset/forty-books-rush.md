---
'@arcanejs/toolkit': minor
---

Add check for performance measures

This is because `react-reconciler` will track performance measurements over time
(namely with each component render) when not run with
`NODE_ENV=production`.
This uniquely affects `@arcanejs` apps as we use a custom
react renderer for long-running node.js processes,
and these apps designed to have regular re-renders over the course of an app's
runtime. Over time, the number of measurements increases,
and can eventually throw an `MaxPerformanceEntryBufferExceededWarning` error,
killing the process.

The issue can be avoided if react-reconciler is run in production mode,
so this change adds a logging check that will warn when performance measurement
is detected.
