---
title: Testing
navTitle: Testing
description: Exercise WebMCP exposure end-to-end with the bundled fake agent.
group: Getting started
groupOrder: 1
order: 5
---

# Testing with the fake agent

No mainstream agent calls WebMCP yet, so `@webmcpui/core/testing` ships a fake host that lets you exercise exposure end to end. It installs a stub `navigator.modelContext`, records the tools your elements register, and lets you invoke them exactly as an agent would.

```ts
import { installFakeAgent } from '@webmcpui/core/testing';

const agent = installFakeAgent();

// ... connect a <wmcp-input name="email" expose> to the DOM ...

const result = await agent.call('fill_email', { value: 'ada@webmcpui.com' });
// the live element is now filled, validated, and has fired input/change

agent.restore(); // remove the stub
```

> **Order matters.** Install the fake agent *before* the element connects — controls register their tool in `connectedCallback`, so the host must already be present.

## The handle

`installFakeAgent()` returns:

| Member | Description |
| --- | --- |
| `tools` | All currently-registered tools, in registration order. |
| `get(name)` | Look up a registered tool by name. |
| `call(name, args?)` | Invoke a tool as an agent would; throws if unknown. |
| `restore()` | Restore the previous `navigator.modelContext`. |

This is exactly what powers the live demo on the [homepage](/) — the same fake host, driving real elements.
