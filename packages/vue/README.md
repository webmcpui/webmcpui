# @webmcpui/vue

Idiomatic, typed **Vue** components for [webmcpui](https://webmcpui.com) —
WebMCP-native, accessible, shadcn/Tailwind-aligned.

Each component wraps the corresponding [`@webmcpui/core`](https://www.npmjs.com/package/@webmcpui/core)
custom element, so the WebMCP tool exposure, form association, and accessibility
live **once** (in core) and you get typed props, `v-model`, `@event` listeners,
and slots — with **no `isCustomElement` config** (the `wmcp-*` tag only appears
inside the component's render function, never your templates).

## Install

```bash
pnpm add @webmcpui/vue @webmcpui/core vue
# optional theme (shadcn-aligned):
pnpm add @webmcpui/tokens
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Dialog, Tabs } from '@webmcpui/vue';
import '@webmcpui/tokens/css'; // omit for an unstyled baseline (see below)

const email = ref('');
const open = ref(false);
</script>

<template>
  <Button variant="primary" @click="open = true">Book</Button>

  <!-- form control with v-model — expose it and an agent can fill it -->
  <Input v-model="email" label="Email" type="email" expose />

  <!-- the agent opens it; the human confirms -->
  <Dialog v-model:open="open" label="Confirm" expose>
    <Button variant="primary" @click="open = false">Confirm</Button>
  </Dialog>
</template>
```

`v-model` binds `Input`'s value, `v-model:open` a `Dialog`, `v-model:active` a
`Tabs`. Every component takes `expose` (+ optional `tool-name` /
`tool-description`) to register its [WebMCP](https://webmcpui.com/docs/webmcp)
tool that an agent can call. With no agent present it's a no-op.

## Components

`Button` · `Input` · `Dialog` · `Tabs` — more land each release as the core kit
grows. Props mirror the [element attributes](https://webmcpui.com/docs):
`variant`, `size`, `type`, `disabled`, `expose`, `tool-name`, … plus the
`v-model` bindings above.

## Styling

Themed through the [design tokens](https://www.npmjs.com/package/@webmcpui/tokens)
(CSS custom properties, shadcn-aligned, light + dark). Two modes:

- **Themed** — `import '@webmcpui/tokens/css'` once at your app root.
- **Unstyled** — don't import the tokens CSS. The elements render with neutral
  inline fallbacks; style them yourself via the CSS custom properties or the
  `::part()` selectors each element exposes.

## Server rendering (Nuxt, …)

These are **client-rendered custom elements** — importing them evaluates
`class extends HTMLElement`, which has no meaning on the server. Register/use
them client-side only:

```ts
// a Nuxt plugin: plugins/webmcpui.client.ts (the .client suffix = browser only)
import { Button } from '@webmcpui/vue';
```

or wrap usage in `<ClientOnly>`. The elements upgrade and hydrate on the client
normally.

## Docs

Full docs, live demos, and `llms.txt` at **[webmcpui.com](https://webmcpui.com)**.
