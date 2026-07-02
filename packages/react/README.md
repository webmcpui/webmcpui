# @webmcpui/react

Idiomatic, typed **React** components for [webmcpui](https://webmcpui.com) —
WebMCP-native, accessible, shadcn/Tailwind-aligned.

Each component wraps the corresponding [`@webmcpui/core`](https://www.npmjs.com/package/@webmcpui/core)
custom element via [`@lit/react`](https://www.npmjs.com/package/@lit/react), so
the WebMCP tool exposure, form association, and accessibility live **once** (in
core) and you get typed props, `ref` forwarding, and `on*` event handlers.

## Install

```bash
pnpm add @webmcpui/react @webmcpui/core react react-dom
# optional theme (shadcn-aligned):
pnpm add @webmcpui/tokens
```

## Usage

```tsx
import { Button, Input, Dialog, Tabs } from '@webmcpui/react';
import '@webmcpui/tokens/css'; // omit for an unstyled baseline (see below)

function Example() {
  const [email, setEmail] = React.useState('');
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Book</Button>

      {/* form control — expose it and an agent can fill it */}
      <Input label="Email" type="email" value={email}
             onInput={(e) => setEmail(e.currentTarget.value)} expose />

      {/* the agent opens it; the human confirms */}
      <Dialog open={open} label="Confirm" onClose={() => setOpen(false)} expose>
        <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
      </Dialog>
    </>
  );
}
```

Every component takes `expose` (+ optional `toolName` / `toolDescription`) to
register its [WebMCP](https://webmcpui.com/docs/webmcp) tool — a click, a fill,
an open — that an agent can call. With no agent present it's a no-op.

## Components

`Button` · `Input` · `Dialog` · `Tabs` — more land each release as the core kit
grows. Props mirror the [element attributes](https://webmcpui.com/docs) (camelCased):
`variant`, `size`, `value`, `type`, `open`, `active`, `disabled`, `expose`, `toolName`, …

Imperative handles come through the `ref` — e.g. `dialogRef.current.show()`.

## Styling

Themed through the [design tokens](https://www.npmjs.com/package/@webmcpui/tokens)
(CSS custom properties, shadcn-aligned, light + dark). Two modes:

- **Themed** — `import '@webmcpui/tokens/css'` once at your app root.
- **Unstyled** — don't import the tokens CSS. The elements render with neutral
  inline fallbacks; style them yourself via the CSS custom properties or the
  `::part()` selectors each element exposes.

## Server rendering (Next.js, Remix, …)

These are **client-rendered custom elements** — importing them evaluates
`class extends HTMLElement`, which has no meaning on the server. In an SSR/RSC
framework, load them client-side:

```tsx
'use client';
import dynamic from 'next/dynamic';
const Button = dynamic(() => import('@webmcpui/react').then((m) => m.Button), {
  ssr: false,
});
```

(`'use client'` alone isn't enough — Next still renders client components on the
server. Use `ssr: false`, or add a DOM shim such as
[`@lit-labs/ssr-dom-shim`](https://www.npmjs.com/package/@lit-labs/ssr-dom-shim)
if you want them in the server render.) The elements upgrade and hydrate on the
client normally.

## Docs

Full docs, live demos, and `llms.txt` at **[webmcpui.com](https://webmcpui.com)**.
