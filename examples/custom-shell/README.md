# `@arcanejs/examples-custom-shell`

Example app showing how to use:

- `ToolkitOptions.htmlPage` to provide a custom root HTML shell
- `ToolkitOptions.additionalFiles` to expose extra assets via HTTP

This example serves a custom CSS file and renders a shell header:

- Header: `h1.custom-shell-header`
- App mount point: `<div id="root"></div>`

Run from repo root:

```bash
pnpm --filter @arcanejs/examples-custom-shell start
```

Then open:

```text
http://localhost:3000/custom-shell/
```
