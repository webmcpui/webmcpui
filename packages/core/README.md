# @webmcpui/core

Framework-agnostic, WebMCP-native custom elements. Phase 1 ships form
primitives — shared behavior (form association, validation, WebMCP exposure,
theming) lives in a `WmcpFormControl` base class; each element is a thin
subclass that supplies its control and specifics.

Shipped so far: `<wmcp-input>`, `<wmcp-textarea>`.

One source of truth (vanilla custom elements built with [Lit](https://lit.dev)),
two distribution channels: an ESM package for build tools, and a single-file
CDN bundle for no-build environments (Webflow, WordPress, plain HTML).

## Install (build-tool consumers)

```bash
pnpm add @webmcpui/core @webmcpui/tokens
```

```ts
import { defineComponents } from '@webmcpui/core';
import '@webmcpui/tokens/css'; // the theme tokens (CSS custom properties)

defineComponents(); // registers <wmcp-input> (and future <wmcp-*> elements)
```

```html
<wmcp-input label="Email" name="email" type="email"></wmcp-input>
```

Importing the package does **not** register elements — you call
`defineComponents()` so you control timing. (The CDN bundle below registers
automatically.)

## No build? Drop a script tag

For Webflow / WordPress / hand-written HTML — one tag, elements auto-register:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@webmcpui/tokens/dist/css/tokens.css" />
<script src="https://cdn.jsdelivr.net/npm/@webmcpui/core/dist/webmcpui.global.js"></script>

<wmcp-input label="Email" name="email" type="email"></wmcp-input>
```

See `examples/plain-html.html` for a working local version.

## Standard Schema validation

Bring any [Standard Schema](https://standardschema.dev) validator — Zod,
Valibot, ArkType — set it as the `schema` property. No bespoke schema language.

```ts
import { z } from 'zod';

const input = document.querySelector('wmcp-input')!;
input.schema = z.string().email('Enter a valid email');
```

Validation runs on input and during native form validation; failures set
`aria-invalid`, render an error message in a live region, and propagate to the
containing `<form>` via ElementInternals.

> **Note:** Standard Schema validates values but does not emit JSON Schema, so
> the WebMCP tool's parameter schema is derived from the input `type`, not from
> the validator. Richer tool schemas are a future enhancement.

## WebMCP exposure

Opt in with `expose`. The element registers an imperative WebMCP tool
(`navigator.modelContext.registerTool`) on connect and unregisters on
disconnect. It is feature-detected — a complete no-op when no agent/host is
present (the common case today), so the input is always a good form control
first.

```html
<wmcp-input label="Email" name="email" expose></wmcp-input>
<!-- registers a "fill_email" tool an agent can call -->
```

## Testing without a real agent

No mainstream agent calls WebMCP yet, so `@webmcpui/core/testing` ships a fake
host to exercise exposure end to end (and seeds the future inspector):

```ts
import { installFakeAgent } from '@webmcpui/core/testing';

const agent = installFakeAgent();
// ... connect a <wmcp-input expose> ...
await agent.call('fill_email', { value: 'agent@webmcpui.com' });
agent.restore();
```

## Build & test

```bash
pnpm build        # tsup → dist/ (ESM + IIFE + d.ts)
pnpm typecheck    # tsc --noEmit
pnpm test         # @web/test-runner in real Chromium (form association,
                  # validation a11y, WebMCP exposure)
pnpm test:smoke   # node smoke check against the built dist
```

Tests run in a genuine browser via the Playwright launcher — form-associated
custom elements and ElementInternals don't work under jsdom. First run needs
the browser binary:

```bash
pnpm exec playwright install chromium
```
