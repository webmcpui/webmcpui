---
title: <wmcp-popover>
navTitle: Popover
description: A non-modal anchored floating panel — and a tooltip mode — whose exposed action is opening.
group: Interaction
groupOrder: 3
order: 5
---

# `<wmcp-popover>`

A non-modal, anchored floating panel — the sibling of the [dialog](/docs/elements/dialog) (modal) and the [menu](/docs/elements/menu) (action list). It uses the same native Popover API + CSS anchor positioning as the menu (top layer, light-dismiss, Escape), but its content is arbitrary. The exposed action is **open**: the agent surfaces the panel, and closing stays a light-dismiss or human step — the same consent posture as the dialog.

```html
<wmcp-popover name="account_menu" label="Account ▾" expose>
  <p>Signed in as Ada</p>
</wmcp-popover>
```

::popover-demo
::

## Click vs hover (tooltip)

`trigger="click"` (the default) is an interactive popover — click to toggle, light-dismiss to close. `trigger="hover"` turns it into a **tooltip**: it opens on hover and focus, closes on leave and blur, gets `role="tooltip"`, and labels its trigger via `aria-describedby`.

```html
<!-- tooltip -->
<wmcp-popover trigger="hover" label="Copy to clipboard">
  <button slot="trigger" aria-label="Copy">⧉</button>
  Copy to clipboard
</wmcp-popover>
```

The trigger content comes from the `trigger` slot (falling back to `label`); the panel content is the default slot.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the panel is open (reflected). |
| `placement` | `string` | `bottom` | `top`, `bottom`, `left`, or `right` of the trigger. |
| `trigger` | `string` | `click` | `click` (interactive popover) or `hover` (tooltip). |
| `label` | `string` | — | Trigger text (when no `trigger` slot) and the panel's accessible name. |
| `name` | `string` | — | Identifier used for the default tool name (`open_<name>`). |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that opens the panel. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

`show()` / `close()` methods and composed `open` / `close` events round out the imperative surface.

## Tool shape

Like the dialog, the exposed tool takes **no arguments** — calling it opens the panel:

```json
{ "type": "object", "properties": {} }
```

Opening an already-open popover is a no-op that reports as much; the tool never closes it.

## Theming

The panel is themed through `--popover-*` custom properties (shadcn popover palette), and the trigger is unstyled by default so any content sits flush — theme it via `::part(trigger)`:

```css
:root {
  --popover-bg: var(--popover);
  --popover-max-width: 22rem;
}
wmcp-popover::part(trigger) { font-weight: 500; }
```
