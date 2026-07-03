---
title: <wmcp-alert>
navTitle: Alert
description: An inline callout for a persistent message, with severity roles for a11y.
group: Presentational
groupOrder: 4
order: 2
---

# `<wmcp-alert>`

An inline callout for a message that stays on the page (as opposed to a [toast](/docs/elements/toast), which is transient). Presentational — no [WebMCP tool](/docs/webmcp); an agent reads it from the accessibility tree. It takes `role="alert"` for `error`/`warning` and `role="status"` otherwise, so assistive tech announces the urgent ones.

<wmcp-alert variant="success" title="Payment received">Your seats are booked.</wmcp-alert>

```html
<wmcp-alert variant="error" title="Card declined">
  Check the number and try again.
</wmcp-alert>
```

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `info` | `info`, `success`, `warning`, or `error` (reflected). Drives the accent color and the a11y role. |
| `title` | `string` | — | Optional bold heading above the message. |

The message is the element's slotted content.

## Theming

The left accent bar is per-variant; the rest is themeable through the [design tokens](/docs/installation):

```css
:root {
  --alert-accent-success: oklch(0.627 0.13 160);
  --alert-radius: 0.5rem;
  --alert-padding: 1rem 1.25rem;
}
```
