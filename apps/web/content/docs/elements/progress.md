---
title: <wmcp-progress>
navTitle: Progress
description: A determinate or indeterminate progress bar with progressbar a11y.
group: Presentational
groupOrder: 4
order: 4
---

# `<wmcp-progress>`

A progress bar, determinate or indeterminate. Presentational — no [WebMCP tool](/docs/webmcp). It's a `role="progressbar"` with `aria-valuenow` / `aria-valuemax` wired from `value` / `max`; omit `value` (or set `indeterminate`) for an animated indeterminate bar.

<wmcp-progress value="60"></wmcp-progress>

```html
<!-- Determinate -->
<wmcp-progress value="60" max="100"></wmcp-progress>

<!-- Indeterminate (omit value) -->
<wmcp-progress></wmcp-progress>
```

The indeterminate animation respects `prefers-reduced-motion` — it falls back to a static half-opacity bar rather than sliding.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Current value. Leave unset for indeterminate. |
| `max` | `number` | `100` | Maximum value. |
| `indeterminate` | `boolean` | `false` | Force the animated indeterminate state. |

## Theming

Track, bar, height, and radius are custom properties, defaulting through the [design tokens](/docs/installation):

```css
:root {
  --progress-bar: var(--brand);
  --progress-height: 0.375rem;
  --progress-radius: 0.25rem;
}
```
