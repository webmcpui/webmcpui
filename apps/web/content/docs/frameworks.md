---
title: React & Vue
navTitle: React & Vue
description: Idiomatic, typed React and Vue components that wrap the core custom elements — with unstyled and SSR guidance.
group: Getting started
groupOrder: 1
order: 6
---

# React & Vue

The core is framework-agnostic custom elements — they work in any framework as-is. But `@webmcpui/react` and `@webmcpui/vue` give you **idiomatic, typed** components: real props, `ref`s / `v-model`, and `on*` / `@event` handlers. They're thin wrappers — the WebMCP exposure, form association, and accessibility all live once in [`@webmcpui/core`](/docs), so there's no second implementation to drift.

## React

```bash
pnpm add @webmcpui/react @webmcpui/core react react-dom
```

```tsx
import { Button, Input, Dialog } from '@webmcpui/react';
import '@webmcpui/tokens/css';

function Example() {
  const [email, setEmail] = React.useState('');
  return (
    <>
      <Input label="Email" type="email" value={email}
             onInput={(e) => setEmail(e.currentTarget.value)} expose />
      <Button variant="primary" onClick={save}>Save</Button>
    </>
  );
}
```

Props mirror the [element attributes](/docs/elements/input), camelCased. Imperative handles come through the `ref` (e.g. `dialogRef.current.show()`).

## Vue

```bash
pnpm add @webmcpui/vue @webmcpui/core vue
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Dialog } from '@webmcpui/vue';
import '@webmcpui/tokens/css';

const email = ref('');
const open = ref(false);
</script>

<template>
  <Input v-model="email" label="Email" type="email" expose />
  <Button variant="primary" @click="open = true">Book</Button>
  <Dialog v-model:open="open" label="Confirm">…</Dialog>
</template>
```

`v-model` binds an `Input`'s value; `v-model:open` a `Dialog`; `v-model:active` a `Tabs`. **No `isCustomElement` config needed** — the `wmcp-*` tag only lives inside each component's render function, never your templates.

## Unstyled (bring your own styles)

Every layer is headless underneath: the elements render with neutral inline fallbacks and only *look* shadcn-aligned when you load the theme. So:

- **Themed** — `import '@webmcpui/tokens/css'` once at your app root.
- **Unstyled** — don't import it. Then style the elements yourself via the CSS custom properties (e.g. `--button-primary-bg`) or the `::part()` selectors each element exposes:

```css
wmcp-button::part(control) { border-radius: 9999px; }
```

## Server rendering (Next.js, Nuxt, …)

These are **client-rendered custom elements** — importing them evaluates `class extends HTMLElement`, which has no meaning on the server. Load them client-side:

```tsx
// Next.js App Router
'use client';
import dynamic from 'next/dynamic';
const Button = dynamic(() => import('@webmcpui/react').then((m) => m.Button), {
  ssr: false,
});
```

`'use client'` alone isn't enough — Next still renders client components on the server, so use `ssr: false` (or add a DOM shim like [`@lit-labs/ssr-dom-shim`](https://www.npmjs.com/package/@lit-labs/ssr-dom-shim) to render them server-side). In **Nuxt**, register/use them in a `.client` plugin or wrap usage in `<ClientOnly>`. The elements upgrade and hydrate on the client normally.
