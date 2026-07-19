---
title: Recipe → grocery cart
navTitle: Recipe → cart
description: Paste a recipe and watch an agent fill a shopping cart through page-level and element WebMCP tools.
group: Examples
groupOrder: 5
order: 2
---

# Recipe → grocery cart

The demo that makes WebMCP click. Paste any recipe — from a blog, a screenshot transcription, a text from your mom — and the agent picks out the ingredients and adds each one to the cart. No search box, no clicking through categories: the page *told* the agent how to add groceries, so it just does.

::recipe-cart-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `add_to_cart` | Page (`exposeTool`) | Adds `{ item, quantity? }` to the cart |
| `remove_from_cart` | Page (`exposeTool`) | Removes an item by name |
| `read_cart` | Page (`exposeTool`) | Returns the cart contents as text |
| `open_checkout` | Element (`<wmcp-dialog expose>`) | Opens checkout for the human to review |

## How it works

A cart is a dynamic collection, not a single control, so the page registers its own tools:

```ts
import { exposeTool } from '@webmcpui/core';

exposeTool({
  name: 'add_to_cart',
  description: 'Add an item to the grocery cart, with an optional quantity.',
  inputSchema: {
    type: 'object',
    properties: {
      item: { type: 'string' },
      quantity: { type: 'string' },
    },
    required: ['item'],
  },
  execute: ({ item, quantity }) => {
    cart.push({ item, quantity: quantity ?? '1' });
    return {
      content: [{ type: 'text', text: `Added ${quantity} ${item}.` }],
    };
  },
});
```

Checkout is a single control, so it's just an exposed element:

```html
<wmcp-dialog
  name="checkout"
  label="Checkout"
  tool-name="open_checkout"
  tool-description="Open the checkout for the user to review the cart and place the order."
  expose
>
  …order summary and a human-only “Place order” button…
</wmcp-dialog>
```

The agent can fill the cart and surface the checkout, but **placing the order stays a human click** — the consent gate pattern from the [dialog element](/docs/elements/dialog), applied where it actually matters: money.

In this demo a small parser stands in for the model. With a real WebMCP host, the model does the reading and the *same four tools* do the work.
