---
title: <wmcp-spinner>
navTitle: Spinner
description: An indeterminate loading indicator with an accessible label.
group: Presentational
groupOrder: 4
order: 8
---

# `<wmcp-spinner>`

An indeterminate loading indicator — the spinning ring for "working on it" with no known duration. Presentational (no [WebMCP tool](/docs/webmcp)), but unlike the [skeleton](/docs/elements/skeleton) it's **announced**: `role="status"` with an accessible `label` (default "Loading…"), so assistive tech tells the user something is happening.

<wmcp-spinner></wmcp-spinner>

```html
<wmcp-spinner></wmcp-spinner>
<wmcp-spinner label="Saving…"></wmcp-spinner>
```

The `label` is the accessible name — set it to describe the specific operation. It stops rotating under `prefers-reduced-motion`.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `Loading…` | Accessible name, mirrored to `aria-label` (kept in sync if it changes). |

## Theming

Size, thickness, and the two ring colors are custom properties, defaulting through the [design tokens](/docs/installation):

```css
:root {
  --spinner-size: 1.5rem;
  --spinner-width: 3px;
  --spinner-color: var(--brand); /* the moving arc */
}
```
