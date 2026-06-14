---
title: <wmcp-checkbox>
navTitle: Checkbox
description: A boolean control whose WebMCP tool takes a checked argument.
group: Elements
groupOrder: 2
order: 4
---

# `<wmcp-checkbox>`

A single boolean control. Shares the [common attributes](/docs/elements/input#common-attributes), with a boolean value instead of a string.

```html
<wmcp-checkbox
  label="Subscribe to the newsletter"
  name="subscribe"
  required-message="Please confirm to continue"
></wmcp-checkbox>
```

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Whether the box is checked (reflected). |

## Tool shape

The exposed tool takes a `checked` boolean rather than a string `value`:

```json
{
  "type": "object",
  "properties": { "checked": { "type": "boolean" } },
  "required": ["checked"]
}
```

A `required` checkbox must be checked to pass validation — useful for consent and terms-of-service boxes.
