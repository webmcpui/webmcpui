---
title: <wmcp-select>
navTitle: Select
description: A native select with declarative options and an enum-typed WebMCP tool schema.
group: Elements
groupOrder: 2
order: 3
---

# `<wmcp-select>`

A dropdown built on the native `<select>` (so you get native keyboard and mobile pickers for free). Shares every [common attribute](/docs/elements/input#common-attributes).

## Declarative options

```html
<wmcp-select label="Country" name="country">
  <option value="us">United States</option>
  <option value="ca">Canada</option>
  <option value="mx">Mexico</option>
</wmcp-select>
```

Option groups are supported with `<optgroup>`.

## Programmatic options

Set the `options` property (an array) for dynamic data:

```ts
const select = document.querySelector('wmcp-select')!;
select.options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { label: 'Europe', options: [{ value: 'fr', label: 'France' }] }, // group
];
```

## Enum-typed tool

When exposed, `<wmcp-select>` generates an `enum`-typed input schema from its options, so an agent is told the exact set of allowed values:

```json
{
  "type": "object",
  "properties": { "value": { "type": "string", "enum": ["us", "ca", "mx"] } },
  "required": ["value"]
}
```
