---
title: <wmcp-avatar>
navTitle: Avatar
description: A user/entity avatar that falls back to initials when the image is missing.
group: Presentational
groupOrder: 4
order: 3
---

# `<wmcp-avatar>`

A user or entity avatar. Presentational — no [WebMCP tool](/docs/webmcp). It shows the `src` image and, if that's missing or fails to load, falls back to the `fallback` text (typically initials). `alt` provides the accessible name.

<wmcp-avatar src="https://avatars.githubusercontent.com/u/9919?s=80" alt="GitHub"></wmcp-avatar>
<wmcp-avatar fallback="AD" alt="Ada Lovelace"></wmcp-avatar>

```html
<wmcp-avatar src="/ada.jpg" alt="Ada Lovelace" fallback="AD"></wmcp-avatar>

<!-- No image → renders the fallback initials -->
<wmcp-avatar fallback="AD" alt="Ada Lovelace"></wmcp-avatar>
```

The fallback is automatic: if the image 404s or errors at runtime, the element swaps to the initials without a flash of broken image.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | — | Image URL. |
| `alt` | `string` | — | Accessible name for the image / fallback. |
| `fallback` | `string` | — | Text shown when there's no image (e.g. initials). |

## Theming

Size, shape, and the fallback's colors are custom properties, defaulting through the [design tokens](/docs/installation):

```css
:root {
  --avatar-size: 3rem;
  --avatar-radius: 0.75rem; /* rounded-square instead of a circle */
  --avatar-bg: var(--muted);
}
```
