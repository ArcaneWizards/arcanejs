---
'@arcanejs/toolkit': minor
---

Add support for serving user-defined static assets via `ToolkitOptions.additionalFiles` and generating custom root HTML via `ToolkitOptions.htmlPage`.

`htmlPage` now receives typed asset URL context that includes toolkit core assets and user-provided static asset paths, making it easier to mount custom HTML shells with extra CSS or preloaded resources.
