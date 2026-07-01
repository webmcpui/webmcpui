# @webmcpui/core

Framework-agnostic, WebMCP-native custom elements. Every `<wmcp-*>` element is a
proper, accessible HTML control first and, when you opt in, also registers an
imperative [WebMCP](https://webmcpui.com/docs/webmcp) tool an agent can call.

**Two families of primitives:**

- **Form controls** expose a _value_ an agent can set — `<wmcp-input>`,
  `<wmcp-textarea>`, `<wmcp-select>`, `<wmcp-checkbox>`, `<wmcp-radio>` /
  `<wmcp-radio-group>`. Shared behavior (form association via `ElementInternals`,
  Standard Schema validation, a11y, theming) lives in a `WmcpFormControl` base.
- **Interaction primitives** expose an _action_ an agent can trigger —
  `<wmcp-button>`, `<wmcp-dialog>`, `<wmcp-menu>`, `<wmcp-tabs>`,
  `<wmcp-popover>` — or, for `<wmcp-toast>`, a _reading_ an agent can perceive.
  They share a `WmcpAction` / `WmcpExposable` base.

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

defineComponents(); // registers every <wmcp-*> element
```

```html
<wmcp-input label="Email" name="email" type="email"></wmcp-input>
<wmcp-button variant="primary">Save</wmcp-button>
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

## Standard Schema validation (form controls)

Bring any [Standard Schema](https://standardschema.dev) validator — Zod,
Valibot, ArkType — set it as the `schema` property. No bespoke schema language.

```ts
import { z } from 'zod';

const input = document.querySelector('wmcp-input')!;
input.schema = z.string().email('Enter a valid email');
```

Validation runs on input and during native form validation; failures set
`aria-invalid`, render an error message in a live region, and propagate to the
containing `<form>` via `ElementInternals`.

## WebMCP exposure

Opt in with `expose`. The element registers an imperative WebMCP tool on connect
and unregisters on disconnect. It is feature-detected — preferring
`document.modelContext` (canonical as of the Chrome 149+ origin trial) and
falling back to the deprecated `navigator.modelContext` — and a complete no-op
when no host is present, so the element is always a good control first.

```html
<!-- form control → a "fill" tool that sets a value -->
<wmcp-input label="Email" name="email" expose></wmcp-input>

<!-- interaction primitive → an "action" tool the agent can trigger -->
<wmcp-button tool-name="book_appointment" expose>Book</wmcp-button>

<!-- a menu → a parameterized action (the agent picks which item) -->
<wmcp-menu name="row_action" label="Actions" expose>
  <option value="edit">Edit</option>
  <option value="delete">Delete</option>
</wmcp-menu>
```

Consequential steps stay a deliberate human action: an agent can _set_ a value
or _open_ a dialog, but submitting/confirming is the person's to make.

## Testing without a real agent

No mainstream agent calls WebMCP broadly yet, so `@webmcpui/core/testing` ships a
fake host to exercise exposure end to end:

```ts
import { installFakeAgent } from '@webmcpui/core/testing';

const agent = installFakeAgent();
// ... connect a <wmcp-input expose> / <wmcp-button expose> ...
await agent.call('fill_email', { value: 'agent@webmcpui.com' });
await agent.call('click_button');
agent.restore();
```

## Documentation

Full docs, live demos for every element, and `llms.txt` at
**[webmcpui.com](https://webmcpui.com)**.

## Build & test

```bash
pnpm build        # tsup → dist/ (ESM + IIFE + d.ts)
pnpm typecheck    # tsc --noEmit
pnpm test         # @web/test-runner in real Chromium
pnpm test:smoke   # node smoke check against the built dist
```

Tests run in a genuine browser via the Playwright launcher — form-associated
custom elements and `ElementInternals` don't work under jsdom. First run needs
the browser binary:

```bash
pnpm exec playwright install chromium
```
