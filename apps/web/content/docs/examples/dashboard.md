---
title: Ask the dashboard a question
navTitle: Dashboard control
description: The agent sets the dashboard's filters, then reads the answer off the page — actuate and perceive in one flow.
group: Examples
groupOrder: 5
order: 7
---

# Ask the dashboard a question

"Show me Q3 EMEA revenue." The agent switches the quarter, switches the region, and then — the interesting part — **reads the number the dashboard now displays** and answers in a sentence. Actuate, then perceive: the two halves of WebMCP in one interaction.

::dashboard-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `switch_quarter` | Element (`<wmcp-tabs expose>`) | Sets the quarter — enum `q1`–`q4` |
| `switch_region` | Element (`<wmcp-tabs expose>`) | Sets the region — enum of sales regions |
| `read_revenue` | Page (`exposeTool`) | Returns the figure currently on screen |

## How it works

The filters are two exposed tab sets — a tab set's tool is an enum of its tabs, and switching by tool is the same state change as a human click:

```html
<wmcp-tabs name="quarter" label="Quarter" expose
  tool-name="switch_quarter"
  tool-description="Switch the dashboard to a quarter (q1–q4).">
  <section tab="q1" tab-label="Q1" />
  …
</wmcp-tabs>
```

The read side is one page-level tool that reports what the human is looking at:

```ts
exposeTool({
  name: 'read_revenue',
  description: 'Read the revenue figure the dashboard currently displays.',
  inputSchema: { type: 'object', properties: {} },
  execute: () => ({
    content: [{ type: 'text', text: `Q3 EMEA revenue is $1.69M, up 19% QoQ.` }],
  }),
});
```

That's the pattern for any analytics surface: expose the *controls* as element tools and the *readings* as page tools, and an agent can answer questions about your data without you building a separate API — the dashboard already is one. The same perceive-side idea powers the [toast element](/docs/elements/toast).
