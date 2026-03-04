---
'@arcanejs/toolkit': major
---

Render component trees per connection with a new render context.

This is a breaking change for custom components because `Base#getProtoInfo(...)` now requires a `ToolkitRenderContext` argument.
