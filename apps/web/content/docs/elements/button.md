---
title: <wmcp-button>
navTitle: Button
description: A themeable button that exposes an action — not a value — for an agent to trigger.
group: Interaction
groupOrder: 3
order: 1
---

# `<wmcp-button>`

The first **interaction primitive**. Where the form controls expose a *value* an agent can set, a button exposes an *action* an agent can trigger. With no agent present (the common case today) it is simply a good, accessible button.

```html
<wmcp-button variant="primary">Save</wmcp-button>
```

::button-demo
::

Both a real click and an agent's tool call route through the same inner button, so the click handlers you already wrote run either way — and `type="submit"` / `type="reset"` drive the surrounding form. A `disabled` button can be activated by neither.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `primary` | Visual style: `primary`, `secondary`, `destructive`, `outline`, `ghost` (reflected). |
| `size` | `string` | `md` | `sm`, `md`, or `lg` (reflected). |
| `type` | `string` | `button` | `button`, `submit`, or `reset`. `submit`/`reset` act on the containing form. |
| `disabled` | `boolean` | `false` | Disables the button for humans and agents alike (reflected). |
| `label` | `string` | — | Accessible name. Falls back to the slotted text; set it for icon-only buttons. |
| `name` | `string` | — | Identifier used for the default tool name (`click_<name>`). |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that activates this button. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

The visible label is provided as the element's content (slotted), not via an attribute:

```html
<wmcp-button variant="destructive">Delete account</wmcp-button>
```

## Form participation

A native `<button type="submit">` inside a shadow root can't reach the page's form. `<wmcp-button>` is form-associated, so it does — submitting and resetting work as you'd expect:

```html
<form>
  <wmcp-input name="email" type="email" required></wmcp-input>
  <wmcp-button type="submit">Sign up</wmcp-button>
  <wmcp-button type="reset" variant="ghost">Clear</wmcp-button>
</form>
```

## Tool shape

The exposed tool takes **no arguments** — calling it *is* the action:

```json
{
  "type": "object",
  "properties": {}
}
```

When the agent calls it, the button activates exactly as a click would. The tool result is the agent's only feedback channel, so it reports the outcome the button *observed* — never the outcome it merely intended. A `type="submit"` call is reported as submitted only if the form's `submit` event actually fired; if a page handler calls `preventDefault()` on that event, it still counts as submitted, because the form *was* submitted as far as the DOM is concerned.

In every message below, `<noun>` is the button's `label`, else its trimmed text content, else its `name`, else `"button"`.

| Case | Outcome | Message |
| --- | --- | --- |
| `disabled` (any `type`) | error | `The "<noun>" button is disabled and can't be activated.` |
| `type="button"` | success | `Clicked the "<noun>" button.` |
| `type="submit"`, form submits | success | `Clicked the "<noun>" button and submitted the form.` |
| `type="submit"`, not inside a form | error | `Clicked the "<noun>" button, but it is not inside a form — nothing was submitted.` |
| `type="submit"`, form fails validation | error | `Clicked the "<noun>" button, but the form failed validation and was not submitted. Fix the invalid fields and try again.` |
| `type="reset"`, inside a form | success | `Clicked the "<noun>" button and reset the form.` |
| `type="reset"`, not inside a form | error | `Clicked the "<noun>" button, but it is not inside a form — nothing was reset.` |

"error" means the result comes back with `isError: true`, so an agent orchestrator can branch on it without parsing the message text. Note that in the "not inside a form" cases the click still runs — light-DOM `click` handlers fire as normal — only the form step is skipped.

## Theming

Every visual is a CSS custom property, defaulting through the [design tokens](/docs/installation) to the shadcn base palette. Override per variant:

```css
:root {
  --button-primary-bg: var(--brand);
  --button-primary-text: var(--brand-foreground);
  --button-radius: 9999px; /* pill buttons */
}
```
