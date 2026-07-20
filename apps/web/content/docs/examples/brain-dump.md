---
title: Brain-dump → to-do list
navTitle: Brain-dump → to-dos
description: Paste a rambling paragraph; the agent turns it into prioritized tasks and checks off what you already did.
group: Examples
groupOrder: 5
order: 4
---

# Brain-dump → to-do list

Monday morning, everything's in your head, none of it is in your task app. Paste the mess as-is. The agent splits it into tasks, reads the urgency from your own words — "urgently", "asap", "no rush" — and even checks off the things you mentioned you'd already done.

::brain-dump-demo
::

## The tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `add_task` | Page (`exposeTool`) | Adds `{ title, priority }` to the list |
| `complete_task` | Page (`exposeTool`) | Checks a task off by title |
| `read_tasks` | Page (`exposeTool`) | Returns the list with priorities and status |

## How it works

The task list is a dynamic collection, so its tools are page-level — the same pattern as the [recipe cart](/docs/examples/recipe-cart):

```ts
exposeTool({
  name: 'add_task',
  description: 'Add a task to the to-do list with a priority.',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
    },
    required: ['title'],
  },
  execute: ({ title, priority }) => {
    tasks.push({ title, priority: priority ?? 'medium', done: false });
    return { content: [{ type: 'text', text: `Added "${title}".` }] };
  },
});
```

The checkboxes in the list are ordinary `<wmcp-checkbox>` elements the human clicks — they're deliberately **not** exposed. Rule of thumb: expose the *stable capability* ("add a task"), not every transient row the capability produces. Tool names are page-global, and a list of twenty tasks shouldn't mean twenty `fill_task-…` tools crowding the agent's context.
