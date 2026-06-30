---
title: <wmcp-tabs>
navTitle: Tabs
description: A tab set whose exposed action switches a persistent active tab — the first stateful interaction primitive.
group: Interaction
groupOrder: 3
order: 4
---

# `<wmcp-tabs>`

A tab set — and the first **stateful** interaction primitive. Where [button](/docs/elements/button), [dialog](/docs/elements/dialog), and [menu](/docs/elements/menu) dispatch one-shot actions, a tab set holds a persistent `active` selection (reflected as an attribute), and the agent's tool both reads it and moves it. Switching — by click, arrow keys, or agent — reveals the matching panel and fires a composed `change` event.

```html
<wmcp-tabs name="account" label="Account" active="overview" expose>
  <section tab="overview" tab-label="Overview">Your account at a glance.</section>
  <section tab="usage" tab-label="Usage">12,480 requests this month.</section>
  <section tab="billing" tab-label="Billing">Pro plan · renews Jul 28.</section>
</wmcp-tabs>
```

::tabs-demo
::

## Panels

Panels are declarative light-DOM children carrying a `tab` attribute; the tablist is derived from them. Each panel takes an optional `tab-label` (falling back to the `tab` value) and `tab-disabled`:

| Panel attribute | Description |
| --- | --- |
| `tab` | The tab's value — used in `active`, the `change` event, and the tool enum. |
| `tab-label` | The visible tab label (defaults to the `tab` value). |
| `tab-disabled` | Renders the tab but blocks selection; excluded from the tool enum. |

The active panel is shown; the rest get `hidden`. Keyboard follows the ARIA tabs pattern — arrow keys (with Home/End) move the active tab and focus.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `string` | first tab | The value of the active tab (reflected — the persistent state). |
| `label` | `string` | — | Accessible name for the tablist, and the noun in the tool description. |
| `name` | `string` | — | Identifier used for the default tool name (`switch_<name>`). |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that switches the active tab. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

Switching fires `change` with `detail: { value }`.

## Tool shape

The tool takes the tab to switch to, constrained to the enabled values:

```json
{
  "type": "object",
  "properties": {
    "tab": { "type": "string", "enum": ["overview", "usage", "billing"] }
  },
  "required": ["tab"]
}
```

The `enum` tracks the live tabs, and the result reports which tab is now active — so an agent can read the state it just set. Switching to an unknown or disabled tab returns an error result.

## Theming

Tablist, tabs, and the active indicator are themed through `--tabs-*` custom properties:

```css
:root {
  --tabs-indicator: var(--brand);
  --tabs-tab-text-active: var(--foreground);
}
```
