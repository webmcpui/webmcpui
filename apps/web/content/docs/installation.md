---
title: Installation
navTitle: Installation
description: Add webmcpui to your project with a build tool, or drop a single script tag — no build step required.
group: Getting started
groupOrder: 1
order: 2
---

# Installation

Two distribution channels from one source of truth. Use the ESM package with your bundler, or the single-file CDN bundle for no-build environments.

## With a build tool

```bash
pnpm add @webmcpui/core @webmcpui/tokens
```

```ts
import { defineComponents } from '@webmcpui/core';
import '@webmcpui/tokens/css'; // theme tokens (CSS custom properties)

defineComponents(); // registers <wmcp-input> and the other <wmcp-*> elements
```

```html
<wmcp-input label="Email" name="email" type="email"></wmcp-input>
```

Importing the package does **not** register the elements — you call `defineComponents()` so you control timing. (The CDN bundle below registers automatically.)

> In an SSR framework, call `defineComponents()` on the client only — custom elements need the DOM. In Nuxt, for example, do it from a `.client.ts` plugin.

## No build? Drop a script tag

For Webflow, WordPress, or hand-written HTML — one tag, every `<wmcp-*>` element auto-registers:

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@webmcpui/tokens/dist/css/tokens.css" />
<script src="https://cdn.jsdelivr.net/npm/@webmcpui/core/dist/webmcpui.global.js"></script>

<wmcp-input label="Email" name="email" type="email"></wmcp-input>
```

## Frameworks

Because these are standard custom elements, they work anywhere HTML renders. The only framework-specific note is telling the framework's template compiler not to treat `<wmcp-*>` as its own components:

- **Vue / Nuxt** — set `compilerOptions.isCustomElement = (tag) => tag.startsWith('wmcp-')`.
- **React** (19+) — custom elements and their props/attributes work directly.
- **Svelte / SolidJS / Angular** — supported with each framework's standard custom-element handling.
