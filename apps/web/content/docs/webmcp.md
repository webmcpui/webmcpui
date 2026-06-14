---
title: WebMCP exposure
navTitle: WebMCP exposure
description: How a form control becomes an imperative WebMCP tool an agent can discover and call.
group: Getting started
groupOrder: 1
order: 4
---

# WebMCP exposure

WebMCP is an imperative browser API — `navigator.modelContext.registerTool(...)` — that lets a page offer tools to an AI agent running in or alongside the browser. webmcpui controls can register themselves as tools.

## Opt in with `expose`

```html
<wmcp-input label="Email" name="email" type="email" expose></wmcp-input>
<!-- registers a "fill_email" tool an agent can call -->
```

On connect, the element registers an imperative WebMCP tool; on disconnect, it unregisters. It is **feature-detected** — a complete no-op when no agent/host is present (the common case today), so the control is always a good form control first.

## The generated tool

For the example above, the registered tool is:

| Field | Value |
| --- | --- |
| `name` | `fill_email` (`fill_` + the `name` attribute) |
| `description` | `Set the value of the "Email" field.` |
| `inputSchema` | `{ type: 'object', properties: { value: { type: 'string' } }, required: ['value'] }` |

When the agent calls the tool, the element applies the value exactly as if a user typed it — updating state, running validation, announcing errors, and firing `input`/`change` events.

## Customizing the tool

```html
<wmcp-input
  name="email"
  label="Work email"
  expose
  tool-name="set_work_email"
  tool-description="Set the customer's work email address."
></wmcp-input>
```

- `tool-name` overrides the generated `fill_<name>`.
- `tool-description` overrides the generated description.

Controls with enumerated values (`<wmcp-select>`, `<wmcp-radio-group>`) generate an `enum`-typed schema so the agent knows the exact allowed values.

## Spec status

As of 2026 WebMCP is early — behind a flag in Chrome and undefined for almost everyone, with no mainstream agent consuming it yet. Everything here is additive and feature-detected, so adopting webmcpui costs nothing today and pays off as hosts ship. To exercise exposure now, use the [fake agent](/docs/testing).
