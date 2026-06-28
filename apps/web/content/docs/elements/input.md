---
title: <wmcp-input>
navTitle: Input
description: A text input — the canonical form control, with type variants, validation, and WebMCP exposure.
group: Elements
groupOrder: 2
order: 1
---

# `<wmcp-input>`

A single-line text input. The reference implementation of `WmcpFormControl`.

```html
<wmcp-input label="Email" name="email" type="email" helper-text="We'll never share it."></wmcp-input>
```

## Element attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `type` | `string` | Native input type: `text`, `email`, `url`, `tel`, `password`, `number`, `search`. |

## Common attributes

These are shared by every `<wmcp-*>` form control:

| Attribute | Type | Description |
| --- | --- | --- |
| `label` | `string` | Visible label, associated with the control. |
| `name` | `string` | Form field name; also the default tool name (`fill_<name>`). |
| `value` | `string` | Current value. |
| `placeholder` | `string` | Placeholder text. |
| `required` | `boolean` | Real constraint — empty fails validation. |
| `disabled` | `boolean` | Disables the control. |
| `helper-text` | `string` | Helper text below the control. |
| `required-message` | `string` | Custom message when a required field is empty. |
| `expose` | `boolean` | Register a [WebMCP tool](/docs/webmcp) for this control. |
| `tool-name` | `string` | Override the generated tool name. |
| `tool-description` | `string` | Override the generated tool description. |

`schema` (a [Standard Schema](/docs/validation) validator) is set as a **property**, not an attribute:

```ts
import { z } from 'zod';
document.querySelector('wmcp-input')!.schema = z.string().email();
```
