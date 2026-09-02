# @webmcpui/webmcp

The imperative [WebMCP](https://webmcpui.com/docs/webmcp) exposure layer, on its
own — zero dependencies, Lit-free, ~2 kB. Register tools with a page's
`document.modelContext` host without taking a dependency on the
[`@webmcpui/core`](https://www.npmjs.com/package/@webmcpui/core) component
library (which builds on this package).

Everything is additive and feature-detected: WebMCP ships only behind a Chrome
origin trial today, so on pages with no agent host every call is a safe no-op.
The package prefers the canonical `document.modelContext` and falls back to the
deprecated `navigator.modelContext`.

## Install

```bash
pnpm add @webmcpui/webmcp
```

## Use

```ts
import { exposeTool, isWebMCPAvailable } from '@webmcpui/webmcp';

const dispose = exposeTool({
  name: 'book_appointment',
  description: 'Book the currently selected appointment slot.',
  inputSchema: {
    type: 'object',
    properties: { slot: { type: 'string' } },
    required: ['slot'],
  },
  async execute(args) {
    const slot = String(args.slot);
    const ok = await book(slot);
    return {
      content: [{ type: 'text', text: ok ? `Booked ${slot}.` : 'Slot taken.' }],
      isError: !ok,
    };
  },
});

// Later — unregister the tool:
dispose();
```

## API

- **`exposeTool(definition): ToolDisposer`** — registers a tool with the page's
  WebMCP host (no-op returning a no-op disposer when none is present). Warns in
  dev on duplicate tool names.
- **`isWebMCPAvailable(): boolean`** — whether a WebMCP host exists on this page.
- **Types** — `WebMCPToolDefinition`, `WebMCPToolResult`,
  `WebMCPToolResultContent`, `JSONSchema`, `ToolDisposer`.

Part of [webmcpui](https://webmcpui.com). MIT licensed.
