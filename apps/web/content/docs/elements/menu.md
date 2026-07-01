---
title: <wmcp-menu>
navTitle: Menu
description: A menu button whose exposed action is parameterized — the agent picks which item.
group: Interaction
groupOrder: 3
order: 3
---

# `<wmcp-menu>`

A menu button. Its exposed action is the first **parameterized** one in the library: where [button](/docs/elements/button) and [dialog](/docs/elements/dialog) expose no-argument actions, the menu's tool takes *which item* — an `enum` of the item values — so the agent picks exactly as a person would.

The popup uses the native Popover API (top layer, light-dismiss, Escape, and anchored positioning), with arrow-key roving focus over the items. Selecting one — by click, keyboard, or agent — fires a composed `select` event and closes the menu. A menu **dispatches actions; it does not hold a value.**

```html
<wmcp-menu name="row_action" label="Row actions" expose>
  <option value="duplicate">Duplicate</option>
  <option value="archive">Archive</option>
  <option value="delete">Delete</option>
</wmcp-menu>
```

::menu-demo
::

## Items

Items come from declarative `<option>` children — the same authoring as [`<wmcp-select>`](/docs/elements/select), works with no build — or from the `items` property for JS / framework callers:

```ts
document.querySelector('wmcp-menu').items = [
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete', disabled: true },
];
```

When `items` is non-empty it takes precedence over the children. Disabled items render but can't be selected, and are left out of the tool's `enum`.

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — | Trigger text and the menu's accessible name. |
| `items` | `WmcpMenuItem[]` | `[]` | Items as data (property only); overrides `<option>` children. |
| `open` | `boolean` | `false` | Whether the popup is open (reflected; driven by the trigger). |
| `name` | `string` | — | Identifier used for the default tool name (`select_<name>`). |
| `expose` | `boolean` | `false` | Register a [WebMCP tool](/docs/webmcp) that selects an item. |
| `tool-name` | `string` | — | Override the generated tool name. |
| `tool-description` | `string` | — | Override the generated tool description. |

Selecting fires `select` with `detail: { value, label }`.

## Tool shape

The tool takes one argument — the item to pick, constrained to the enabled values:

```json
{
  "type": "object",
  "properties": {
    "item": { "type": "string", "enum": ["duplicate", "archive", "delete"] }
  },
  "required": ["item"]
}
```

The `enum` tracks the live item set: change `items` and the tool re-registers with the new values. Selecting an unknown or disabled item returns an error result.

## Theming

Trigger and popup are themed through `--menu-*` custom properties, defaulting to the shadcn palette:

```css
:root {
  --menu-bg: var(--popover);
  --menu-item-bg-hover: var(--accent);
  --menu-radius: 0.75rem;
}
```
