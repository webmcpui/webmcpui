---
title: Testing
navTitle: Testing
description: Exercise WebMCP exposure end-to-end with the bundled fake agent.
group: Getting started
groupOrder: 1
order: 5
---

# Testing with the fake agent

No mainstream agent calls WebMCP yet, so `@webmcpui/core/testing` ships a fake host that lets you exercise exposure end to end. It installs a stub WebMCP host on `document.modelContext` (and `navigator.modelContext` for the legacy fallback), records the tools your elements register, and lets you invoke them exactly as an agent would.

```ts
import { installFakeAgent } from '@webmcpui/core/testing';

const agent = installFakeAgent();

// ... connect a <wmcp-input name="email" expose> to the DOM ...

const result = await agent.call('fill_email', { value: 'ada@webmcpui.com' });
// the live element is now filled, validated, and has fired input/change

agent.restore(); // remove the stub
```

> **Order matters.** Install the fake agent *before* the element connects — controls register their tool in `connectedCallback`, so the host must already be present.

## Environments

`<wmcp-*>` form controls are form-associated custom elements built on `ElementInternals`, so run component tests in a real browser — `@web/test-runner`, Vitest browser mode, and Playwright component testing all work.

As of v0.4, jsdom and happy-dom degrade gracefully instead of crashing: components render, validate, and expose their WebMCP tools, and a single console warning is logged. What doesn't work under jsdom/happy-dom is native `<form>` participation — `FormData`, `form.checkValidity()`, and `requestSubmit()`-driven submits are all disabled. Anything asserting on form submission needs a real browser.

| | Real browser | jsdom / happy-dom |
| --- | --- | --- |
| Render, validate, expose tools | yes | yes |
| `FormData` includes control values | yes | no |
| `form.checkValidity()` | yes | no |
| `requestSubmit()`-driven submit | yes | no |
| Console warning on load | no | yes (once) |

## Options

`installFakeAgent(options?)` accepts:

| Option | Description |
| --- | --- |
| `surface` | Which host surface(s) to stub: `'document'`, `'navigator'`, or `'both'` (default). With `'both'`, the same host object is set on both `document.modelContext` and `navigator.modelContext`, so exposure works regardless of which one a component checks. |

## The handle

`installFakeAgent()` returns:

| Member | Description |
| --- | --- |
| `tools` | All currently-registered tools, in registration order. |
| `get(name)` | Look up a registered tool by name. |
| `call(name, args?)` | Invoke a tool as an agent would; throws if unknown. |
| `restore()` | Restore whatever `document.modelContext` and `navigator.modelContext` were before install — including removing the property entirely if it was absent. |

This is exactly what powers the live demo on the [homepage](/) — the same fake host, driving real elements.
