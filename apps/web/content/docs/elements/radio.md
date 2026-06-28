---
title: <wmcp-radio-group>
navTitle: Radio group
description: An accessible radio group with roving focus and an enum-typed WebMCP tool.
group: Elements
groupOrder: 2
order: 5
---

# `<wmcp-radio-group>`

A single-choice group. The group is the form-associated control (`<wmcp-radio-group>`); each option is a `<wmcp-radio>`. Roving tabindex and arrow-key navigation work out of the box. Shares the [common attributes](/docs/elements/input#common-attributes).

## Declarative options

```html
<wmcp-radio-group label="Plan" name="plan">
  <wmcp-radio value="free">Free</wmcp-radio>
  <wmcp-radio value="pro">Pro</wmcp-radio>
  <wmcp-radio value="team">Team</wmcp-radio>
</wmcp-radio-group>
```

## Programmatic options

```ts
const group = document.querySelector('wmcp-radio-group')!;
group.options = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
```

## Enum-typed tool

Like `<wmcp-select>`, an exposed radio group generates an `enum`-typed schema so the agent knows the exact allowed values:

```json
{
  "type": "object",
  "properties": { "value": { "type": "string", "enum": ["free", "pro", "team"] } },
  "required": ["value"]
}
```
