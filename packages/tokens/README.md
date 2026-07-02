# @webmcpui/tokens

Design tokens for [webmcpui](https://webmcpui.com) — CSS custom properties (with
light + dark themes), a typed JS object, and a Figma import file, built from a
[Style Dictionary](https://styledictionary.com) pipeline. Base names match
[shadcn](https://ui.shadcn.com)'s 1:1, so they drop into an existing shadcn theme.

The `<wmcp-*>` elements in [`@webmcpui/components`](https://www.npmjs.com/package/@webmcpui/components)
consume these variables (with inline fallbacks, so the elements render correctly
even without this stylesheet — it themes them).

## Install

```bash
pnpm add @webmcpui/tokens
```

```ts
import '@webmcpui/tokens/css'; // :root (light) + .dark blocks of CSS variables
```

Or via CDN — no build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@webmcpui/tokens/dist/css/tokens.css" />
```

## What's inside

- **`@webmcpui/tokens/css`** — the stylesheet: base tokens (`--background`,
  `--foreground`, `--primary`, `--border`, `--ring`, …) plus per-component sets
  for every element — `--input-*`, `--button-*`, `--dialog-*`, `--menu-*`,
  `--tabs-*`, `--popover-*`, `--toast-*`, and more. Component tokens default
  through the base palette, so overriding a base variable cascades everywhere.
- **`@webmcpui/tokens`** — the same tokens as a typed JS object.
- **`@webmcpui/tokens/figma`** — resolved values for the Figma Variables importer.

## Theming

Override any variable in your own `:root` / `.dark`:

```css
:root {
  --primary: oklch(0.55 0.2 260);
  --button-radius: 9999px;    /* pill buttons */
  --dialog-backdrop: color-mix(in oklch, black 60%, transparent);
}
```

Full token reference and live examples at **[webmcpui.com](https://webmcpui.com/docs/installation)**.
