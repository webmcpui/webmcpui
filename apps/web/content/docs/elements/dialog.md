---
title: <wmcp-dialog>
navTitle: Dialog
description: A modal dialog whose exposed action is opening — the agent surfaces it, the human confirms.
group: Interaction
groupOrder: 3
order: 2
---

# `<wmcp-dialog>`

A modal dialog wrapping the native `<dialog>` element — so it inherits the platform's focus trap, top-layer stacking, backdrop, and Escape-to-close for free. The exposed **action is _open_**: an agent can surface the dialog for the user to review, but closing and confirming stay a deliberate human step.

That asymmetry is the point. An agent can ask for attention; the irreversible confirm is the person's to make. It's the same consent gate the form controls draw between *setting* a value and *submitting* it.

```html
<wmcp-dialog name="booking" label="Confirm booking" expose>
  <h3>Confirm your booking</h3>
  <p>Book Tuesday, 3:00 PM with Dr. Reyes?</p>
  <wmcp-button variant="ghost" onclick="this.closest('wmcp-dialog').close()">Cancel</wmcp-button>
  <wmcp-button variant="primary">Confirm</wmcp-button>
</wmcp-dialog>
```

::dialog-demo
::

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the dialog is open (reflected — drives `[open]` styling). |
| `modal` | `boolean` | `true` | Open as a focus-trapping modal with a backdrop. Set `false` for a non-modal dialog. |
| `static-backdrop` | `boolean` | `false` | Keep the dialog open when the backdrop is clicked. |
| `label` | `string` | — | Accessible name for the dialog, and the noun in the default tool description. |
| `name` | `string` | — | Identifier used for the default tool name (`open_<name>`). |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that opens this dialog. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

## Methods, events & properties

| Member | Kind | Description |
| --- | --- | --- |
| `show()` | method | Open the dialog (modal unless `modal` is `false`). |
| `close(returnValue?)` | method | Close it, optionally recording a `returnValue`. |
| `returnValue` | property | The value the dialog last closed with (mirrors native `<dialog>`). |
| `open` event | event | Fired (composed) when the dialog opens. |
| `close` event | event | Fired (composed) when it closes — via `close()`, Escape, or backdrop. |

## Tool shape

Like every [interaction primitive](/docs/elements/button), the exposed tool takes **no arguments** — calling it opens the dialog:

```json
{
  "type": "object",
  "properties": {}
}
```

Calling the tool on an already-open dialog is a no-op that reports as much; it never closes the dialog (closing is never the agent's call).

## Theming

Every visual is a CSS custom property defaulting through the [design tokens](/docs/installation) to the shadcn popover palette, including the backdrop:

```css
:root {
  --dialog-bg: var(--popover);
  --dialog-radius: 1rem;
  --dialog-backdrop: color-mix(in oklch, black 60%, transparent);
}
```

The entrance fade-and-lift uses `@starting-style` and `transition-behavior: allow-discrete`, and is suppressed under `prefers-reduced-motion`.
