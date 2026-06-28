---
title: <wmcp-textarea>
navTitle: Textarea
description: A multi-line text control with the same validation and WebMCP exposure as the input.
group: Elements
groupOrder: 2
order: 2
---

# `<wmcp-textarea>`

A multi-line text control. Shares every [common attribute](/docs/elements/input#common-attributes) with `<wmcp-input>`.

```html
<wmcp-textarea
  label="Message"
  name="message"
  rows="5"
  helper-text="Tell us what you need."
></wmcp-textarea>
```

## Element attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `number` | `3` | Visible rows of text. |

The exposed WebMCP tool is `fill_<name>` with a single string `value` argument, identical to `<wmcp-input>`.
