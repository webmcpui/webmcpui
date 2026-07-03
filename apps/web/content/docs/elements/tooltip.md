---
title: <wmcp-tooltip>
navTitle: Tooltip
description: A hover/focus tooltip — a thin preset of the popover, defaulted to hover with role=tooltip.
group: Interaction
groupOrder: 3
order: 8
---

# `<wmcp-tooltip>`

A hover/focus tooltip. It's a thin preset of [`<wmcp-popover>`](/docs/elements/popover) — the same anchored-panel machinery, defaulted to `trigger="hover"`, so it gets `role="tooltip"` and `aria-describedby` and opens on hover **and** keyboard focus. Put the trigger in the `trigger` slot and the tip text in the default slot.

<wmcp-tooltip>
  <button slot="trigger" aria-label="Copy" style="padding:0.35rem 0.6rem">⧉</button>
  Copy to clipboard
</wmcp-tooltip>

```html
<wmcp-tooltip>
  <button slot="trigger" aria-label="Copy">⧉</button>
  Copy to clipboard
</wmcp-tooltip>
```

Because it opens on focus (not just hover), keyboard and screen-reader users get the tip too — the trigger references the panel via `aria-describedby`.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `string` | `top` | `top`, `bottom`, `left`, or `right` of the trigger. |
| `trigger` | `string` | `hover` | Inherited from popover; a tooltip defaults to `hover`. |
| `label` | `string` | — | Text tip, as an alternative to the default slot. |
| `expose` | `boolean` | `false` | Inherited from [`<wmcp-popover>`](/docs/elements/popover); rarely needed for a tooltip. |

A tooltip is primarily a presentational affordance — an agent has no meaningful reason to "open" one. It inherits popover's exposure surface for completeness, but you'll usually leave `expose` off. For agent-triggered content, reach for [`<wmcp-popover>`](/docs/elements/popover) instead.

## Slots

| Slot | Description |
| --- | --- |
| `trigger` | The element that reveals the tip on hover/focus. |
| _default_ | The tip content. |

## Theming

Inherits the popover's custom properties:

```css
:root {
  --popover-bg: var(--card);
  --popover-radius: 0.5rem;
}
```
