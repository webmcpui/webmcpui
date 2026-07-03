---
title: <wmcp-badge>
navTitle: Badge
description: A small status/label pill. Purely presentational — no agent tool.
group: Presentational
groupOrder: 4
order: 1
---

# `<wmcp-badge>`

A small status or label pill. The first of the **presentational primitives**: purely visual, it exposes no [WebMCP tool](/docs/webmcp) — an agent reads its text straight from the accessibility tree — so it extends `LitElement` directly rather than an exposure base.

<wmcp-badge>New</wmcp-badge>
<wmcp-badge variant="secondary">Beta</wmcp-badge>
<wmcp-badge variant="destructive">3 failed</wmcp-badge>
<wmcp-badge variant="outline">Draft</wmcp-badge>

```html
<wmcp-badge>New</wmcp-badge>
<wmcp-badge variant="secondary">Beta</wmcp-badge>
<wmcp-badge variant="destructive">3 failed</wmcp-badge>
<wmcp-badge variant="outline">Draft</wmcp-badge>
```

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `primary` | `primary`, `secondary`, `destructive`, or `outline` (reflected). |

The label is the element's slotted content.

## Theming

Each variant is a pair of CSS custom properties, defaulting through the [design tokens](/docs/installation):

```css
:root {
  --badge-primary-bg: var(--brand);
  --badge-primary-text: var(--brand-foreground);
  --badge-radius: 0.375rem; /* squared-off badges */
}
```
