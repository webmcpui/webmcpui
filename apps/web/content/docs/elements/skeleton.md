---
title: <wmcp-skeleton>
navTitle: Skeleton
description: A decorative loading placeholder that pulses while content loads.
group: Presentational
groupOrder: 4
order: 7
---

# `<wmcp-skeleton>`

A loading placeholder — the pulsing grey block you show while real content loads. Presentational and **decorative**: it's `aria-hidden`, so screen readers skip it (announce loading state elsewhere, e.g. an [`aria-live`](/docs/elements/toast) region or a [spinner](/docs/elements/spinner)). No [WebMCP tool](/docs/webmcp).

<wmcp-skeleton style="width:14rem; margin-bottom:0.5rem"></wmcp-skeleton>
<wmcp-skeleton style="width:10rem"></wmcp-skeleton>

```html
<!-- Size it with plain width/height styles -->
<wmcp-skeleton style="width: 14rem"></wmcp-skeleton>
<wmcp-skeleton style="width: 2.5rem; height: 2.5rem; border-radius: 50%"></wmcp-skeleton>
```

It stops pulsing under `prefers-reduced-motion`.

## Element attributes

The skeleton has no attributes — set its dimensions with `width` / `height` styles to match the content it stands in for.

## Theming

```css
:root {
  --skeleton-bg: var(--muted);
  --skeleton-radius: 0.5rem;
}
```
