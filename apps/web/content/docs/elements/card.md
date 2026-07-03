---
title: <wmcp-card>
navTitle: Card
description: A themeable surface container that slots its content.
group: Presentational
groupOrder: 4
order: 6
---

# `<wmcp-card>`

A surface container — the box you group related content into. Purely presentational (no [WebMCP tool](/docs/webmcp)); content is slotted, so you compose freely with any markup or other `<wmcp-*>` elements inside.

<wmcp-card style="max-width:22rem">
  <h3 style="margin:0 0 0.25rem">Pro plan</h3>
  <p style="margin:0 0 0.75rem; color:var(--muted-foreground)">Everything in Free, plus priority support.</p>
  <wmcp-button variant="primary">Upgrade</wmcp-button>
</wmcp-card>

```html
<wmcp-card>
  <h3>Pro plan</h3>
  <p>Everything in Free, plus priority support.</p>
  <wmcp-button variant="primary">Upgrade</wmcp-button>
</wmcp-card>
```

## Element attributes

The card has no attributes — it's a styled surface. Compose its contents as children.

## Theming

Padding, border, radius, and an optional elevation shadow are custom properties, defaulting through the [design tokens](/docs/installation):

```css
:root {
  --card-padding: 1.5rem;
  --card-radius: 1rem;
  --card-shadow: 0 4px 20px oklch(0 0 0 / 0.06); /* lift the surface */
}
```
