---
title: Examples
navTitle: Overview
description: Real-world, multi-tool WebMCP demos — everyday and business workflows an agent can drive end to end.
group: Examples
groupOrder: 5
order: 1
---

# Examples

The element pages show one control exposing one tool. These examples show why that matters: **whole workflows** — paste a recipe and the cart fills itself, paste an email and the CRM form fills itself — driven through the same tools a real WebMCP agent would call.

Every demo runs a simulated agent (`installFakeAgent()` from `@webmcpui/core/testing`) with a small deterministic parser standing in for the model's language understanding. The tools are the real thing: exactly what a WebMCP host sees on the page.

## Two kinds of tools

The examples deliberately mix both ways of exposing capability:

- **Element tools** — a `<wmcp-input expose>` registers `fill_<name>`, a `<wmcp-tabs expose>` registers `switch_<name>`, and so on. One control, one tool, zero extra code.
- **Page tools** — dynamic collections like a cart or a task list aren't a single control, so the page registers its own tools with `exposeTool()` from `@webmcpui/core`:

```ts
import { exposeTool } from '@webmcpui/core';

const dispose = exposeTool({
  name: 'add_to_cart',
  description: 'Add an item to the grocery cart.',
  inputSchema: {
    type: 'object',
    properties: { item: { type: 'string' }, quantity: { type: 'string' } },
    required: ['item'],
  },
  execute: ({ item, quantity }) => {
    cart.push({ item, quantity });
    return { content: [{ type: 'text', text: `Added ${quantity} ${item}.` }] };
  },
});
```

Both are feature-detected no-ops when no agent host is present.

## The examples

| Example | Flavor | What the agent does |
| --- | --- | --- |
| [Recipe → grocery cart](/docs/examples/recipe-cart) | Everyday | Parses a pasted recipe and fills the cart, one `add_to_cart` at a time |
| [Restaurant booking](/docs/examples/restaurant-booking) | Everyday | Turns one sentence into three filled selects and a confirm dialog |
| [Brain-dump → to-dos](/docs/examples/brain-dump) | Everyday | Splits a rambling paragraph into prioritized tasks |
| [Email → CRM lead](/docs/examples/crm-lead) | Business | Extracts contact, company, budget, and need from a messy email |
| [Receipt → expense](/docs/examples/expense-report) | Business | Reads a receipt into a filed expense row |
| [Dashboard control](/docs/examples/dashboard) | Business | Sets filters, then *reads the answer off the page* |

A thread runs through all six: the agent does the tedious part, and the consequential click — place the order, confirm the table, save the lead — stays with the human.
