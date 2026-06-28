---
title: Validation
navTitle: Validation
description: Bring any Standard Schema validator — Zod, Valibot, ArkType — and wire it straight into form validation.
group: Getting started
groupOrder: 1
order: 3
---

# Validation

Every control accepts a [Standard Schema](https://standardschema.dev) validator on its `schema` property. Bring Zod, Valibot, ArkType, or anything that implements the spec — there's no bespoke schema language to learn.

```ts
import { z } from 'zod';

const input = document.querySelector('wmcp-input')!;
input.schema = z.string().email('Enter a valid email');
```

Validation runs on input and during native form validation. On failure the element:

- sets `aria-invalid`,
- renders the error message in a live region (announced to assistive tech), and
- propagates the failure to the containing `<form>` via `ElementInternals`, so native form submission is blocked just like a built-in control.

## Required fields

`required` is a real constraint, not just a visual marker — an empty required control fails validation and participates in native form validity.

```html
<wmcp-input label="Name" name="name" required></wmcp-input>
```

## A note on tool schemas

Standard Schema validates *values* but does not emit JSON Schema, so a control's WebMCP tool parameter schema is derived from the element (its `type`, or its enumerated options for `<wmcp-select>` / `<wmcp-radio-group>`) rather than from the validator. Richer tool schemas are a future enhancement.
