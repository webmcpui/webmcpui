---
title: <wmcp-switch>
navTitle: Switch
description: A form-associated on/off toggle an agent can flip by setting a boolean.
group: Interaction
groupOrder: 3
order: 7
---

# `<wmcp-switch>`

A boolean control like [`<wmcp-checkbox>`](/docs/elements/checkbox), but presented as a switch — `role="switch"`, on/off rather than checked/unchecked. It's form-associated: its state is the boolean `checked`, and when on it submits its `value` (default `"on"`) to the surrounding form. When `expose` is set, an agent can flip it by setting that boolean.

<wmcp-switch label="Email notifications" checked></wmcp-switch>

```html
<wmcp-switch label="Email notifications" checked></wmcp-switch>
```

A real toggle and an agent's tool call drive the same state, firing `input` and `change` either way, so the handlers you already wrote run in both cases.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Whether the switch is on (reflected). |
| `value` | `string` | `on` | Value submitted to the form when on. |
| `label` | `string` | — | Visible label and accessible name. |
| `name` | `string` | — | Form field name; also seeds the tool name. |
| `required` | `boolean` | `false` | Must be on for the form to be valid. |
| `disabled` | `boolean` | `false` | Disables it for humans and agents alike. |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that sets the switch. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

## Tool shape

The exposed tool takes the target state as a boolean:

```json
{
  "type": "object",
  "properties": { "checked": { "type": "boolean" } },
  "required": ["checked"]
}
```

Calling it sets `checked`, re-validates, and dispatches `input` + `change` — exactly as if a person had toggled it.

## Theming

Every visual is a CSS custom property, defaulting through the [design tokens](/docs/installation) to the shadcn base palette:

```css
:root {
  --switch-track-on: var(--brand); /* the "on" track color */
  --switch-width: 2.5rem;
  --switch-thumb: 1.15rem;
}
```
