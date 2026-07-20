# Roadmap

webmcpui is a WebMCP-native web component library: every element is a proper,
accessible HTML control first and, when you opt in, also registers an imperative
[WebMCP](https://webmcpui.com/docs/webmcp) tool an agent can call.

This roadmap is the public source of truth for direction. It's intentionally
high-level — concrete work lives in [issues](https://github.com/webmcpui/webmcpui/issues),
and open design calls live in [`docs/open-decisions.md`](./docs/open-decisions.md).
Nothing here is a dated promise.

## Architecture (the shape we're building toward)

A layered kit, so you take only what you want:

1. **Core** (`@webmcpui/core`) — framework-agnostic custom elements: headless
   behavior + accessibility + WebMCP exposure, themeable via design tokens.
2. **Framework layers** (`@webmcpui/react`, `@webmcpui/vue`) — typed, idiomatic
   wrappers over the core elements.
3. **Design tokens** (`@webmcpui/tokens`) — shadcn-aligned CSS custom properties
   (light + dark); omit them for an unstyled baseline.
4. **Blocks** (`@webmcpui/blocks`, planned) — pre-baked, agent-operable solution
   patterns (booking flows, multi-step forms, command palettes) — the pieces an
   agent can *trust to build on top of*.

## Shipped

- **Form primitives** — input, textarea, select, checkbox, radio/radio-group,
  switch, with Standard Schema validation and `fill_`-style agent exposure.
- **Interaction primitives** — button, dialog, menu, tabs, popover, toast
  (action / perceive exposure surfaces).
- **Presentational primitives** — badge, separator, tooltip, alert, progress,
  avatar, card, skeleton, spinner.
- **Framework wrappers** — `@webmcpui/react` and `@webmcpui/vue`.
- **Distribution** — npm + JSR (core) with provenance, a no-build CDN bundle,
  design tokens, docs site with live demos and `llms.txt`.

## In progress / next

- **Breadth** — rounding out common UI: sheet/drawer, accordion, collapsible,
  breadcrumb, pagination, empty-state, stat, scroll-area, combobox, stepper.
- **À-la-carte registration** — per-element `defineComponent()` for
  tree-shakeable bundles (see open-decisions #2).
- **`@webmcpui/webmcp`** — extract the imperative exposure layer into a
  standalone, Lit-free package so anyone can register agent tools without the
  components (see open-decisions #3).
- **Engineering foundation** — CI gates, release/semver discipline, and this
  contributor process.

## Exploring

- **Data display** — table/data-grid built on a headless data engine
  (TanStack Table is the leading candidate), with agent-queryable exposure.
- **Blocks** — the pre-baked agent-operable patterns above.
- **Standards tracking** — the WebMCP declarative form API is being standardized;
  we track the spec and align exposure with it as it lands.

## How to influence it

Open an [issue](https://github.com/webmcpui/webmcpui/issues) or weigh in on an
existing one. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
