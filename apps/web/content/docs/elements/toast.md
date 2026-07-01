---
title: <wmcp-toast>
navTitle: Toast
description: A notification region whose agent surface is perceiving, not actuating — the agent reads the toasts the page throws.
group: Interaction
groupOrder: 3
order: 6
---

# `<wmcp-toast>`

A notification region — and the one component whose agent surface is **perceiving**, not actuating. Page code throws toasts the way it always has, and they announce to screen readers via an `aria-live` region. When `expose` is set, those very same notifications become readable by an agent through a `read_<name>` tool: the machine-readable twin of the `aria-live` announcement.

That's the right shape because the agent's job isn't to *post* toasts — it has its own channel for that — it's to *notice* them. A toast is often the only signal of an outcome ("Payment declined", an async "Export ready"), so an agent acting on the user's behalf reads the toasts rather than creating them. It extends `WmcpExposable` directly, not the action base, because the tool reports state instead of triggering anything.

```html
<wmcp-toast name="notifications" expose></wmcp-toast>
```

```ts
// Page code throws toasts as usual:
document.querySelector('wmcp-toast').show({
  message: 'Payment received',
  variant: 'success',
});
```

::toast-demo
::

## The primitive

`show(options)` returns an id; `dismiss(id)` and `clear()` remove toasts. Each is an `aria-live` child (`role="status"`, or `role="alert"` for `error`), so screen readers announce it.

| `show()` option | Type | Description |
| --- | --- | --- |
| `message` | `string` | The notification text (required). |
| `title` | `string` | Optional bold heading above the message. |
| `variant` | `string` | `info`, `success`, `warning`, or `error` (styling + the read summary). |
| `duration` | `number` | Auto-dismiss after this many ms; `0` keeps it until dismissed. |

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `string` | `bottom-right` | Corner the toasts stack in (`bottom-right`, `bottom-left`, `top-right`, `top-left`). |
| `duration` | `number` | `5000` | Default auto-dismiss for `show()` calls without their own. |
| `name` | `string` | — | Identifier for the default tool name (`read_<name>`, else `read_notifications`). |
| `expose` | `boolean` | `false` | Register the [WebMCP](/docs/webmcp) read tool. |
| `tool-name` / `tool-description` | `string` | — | Override the generated tool name / description. |

## Tool shape

A no-argument **read** tool:

```json
{ "type": "object", "properties": {} }
```

Calling it returns the notifications currently shown — and, if none are, the ones that appeared in the last 30 seconds — so an agent that checks *after* an async toast has auto-dismissed still learns what happened.

## Theming

Themed through `--toast-*` custom properties, including per-variant accent colors:

```css
:root {
  --toast-bg: var(--popover);
  --toast-accent-success: oklch(0.627 0.13 160);
  --toast-inset: 1.5rem;
}
```
