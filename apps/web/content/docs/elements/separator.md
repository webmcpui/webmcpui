---
title: <wmcp-separator>
navTitle: Separator
description: A thin rule dividing content, horizontal or vertical.
group: Presentational
groupOrder: 4
order: 5
---

# `<wmcp-separator>`

A thin rule that divides content. Presentational — no [WebMCP tool](/docs/webmcp). It carries `role="separator"` (and `aria-orientation` when vertical), so assistive tech understands the division between groups.

<div style="max-width:20rem">
  <p style="margin:0 0 0.75rem">Account</p>
  <wmcp-separator></wmcp-separator>
  <p style="margin:0.75rem 0 0">Billing</p>
</div>

```html
<wmcp-separator></wmcp-separator>

<!-- Vertical, inside a flex row -->
<div style="display:flex; height:1.5rem; align-items:center">
  <span>Edit</span>
  <wmcp-separator orientation="vertical" style="margin:0 0.75rem"></wmcp-separator>
  <span>Delete</span>
</div>
```

A horizontal separator fills its container's width; a vertical one fills the height of its flex row.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `string` | `horizontal` | `horizontal` or `vertical` (reflected). |

## Theming

```css
:root {
  --separator-color: var(--border);
  --separator-size: 2px; /* thickness */
}
```
