# Contributing to webmcpui

Thanks for helping build a WebMCP-native component library. This guide gets you
from clone to merged PR. For where the project is headed, see
[`ROADMAP.md`](./ROADMAP.md); for calls we're still making, see
[`docs/open-decisions.md`](./docs/open-decisions.md).

## Prerequisites

- **Node 22+** and **pnpm** (this is a pnpm workspace).
- A Chromium install for the core tests (they run in a real browser —
  form-associated custom elements and `ElementInternals` don't work under jsdom):
  `pnpm --filter @webmcpui/core exec playwright install chromium`.

## Setup

```bash
git clone https://github.com/webmcpui/webmcpui.git
cd webmcpui
pnpm install
pnpm build        # builds all packages
```

## Repo layout

```
packages/
  core/     @webmcpui/core   — the custom elements (source of truth)
  tokens/   @webmcpui/tokens — design tokens (Style Dictionary → CSS/JS/Figma)
  react/    @webmcpui/react  — typed React wrappers
  vue/      @webmcpui/vue    — typed Vue wrappers
apps/
  web/      the docs site (Nuxt Content) — deploys on merge to main
```

## Everyday commands

```bash
pnpm build                          # all packages
pnpm --filter @webmcpui/core test   # core tests (real Chromium)
pnpm --filter @webmcpui/core typecheck
```

## Adding or changing a component

Core is the source of truth; the framework wrappers are thin. A new element
touches a predictable set of files — keep them in sync:

1. **Element** — `packages/core/src/elements/<name>.ts` (+ a test; presentational
   elements share `presentational.test.ts`).
2. **Register it** in all three: `src/register.ts`, `src/index.ts`, and
   `scripts/append-global-dts.mjs` (the `HTMLElementTagNameMap` augmentation —
   JSR forbids `declare global` in source, so it's re-injected postbuild).
3. **Tokens** — `packages/tokens/tokens/components/<name>.json` for its themeable
   CSS custom properties (auto-globbed by the build).
4. **Wrappers** — a typed export in `packages/react/src/` and `packages/vue/src/`,
   re-exported from each package's `index.ts`.
5. **Docs** — a page under `apps/web/content/docs/elements/<name>.md`; raw
   `<wmcp-*>` elements render live in the docs, so prefer inline examples.

## Accessibility & WebMCP exposure

Every element is a good, accessible HTML control **first**. Agent exposure is
additive and opt-in (`expose`) and must be a no-op when no agent host is present.
Consequential steps (submitting, confirming, deleting) stay a deliberate human
action — an agent can fill a field or open a dialog, not press "confirm."

## Branching & PRs

- Branch off `main`: `feat/…`, `fix/…`, or `docs/…`.
- Keep PRs focused. Green CI is required (typecheck + tests run on every PR).
- Include tests for behavior changes, and a **changeset** for anything users
  consume (see below).
- Fill out the PR template.

## Changesets & releases

We version with [Changesets](https://github.com/changesets/changesets). If your
change affects a published package, add one:

```bash
pnpm changeset   # pick the package(s) and bump type; write a user-facing note
```

`patch` for fixes/docs, `minor` for features. A version bump should represent a
**coherent** set of changes, not "something changed." Releases are cut by
publishing a GitHub Release — full mechanics and gotchas live in
[`RELEASING.md`](./RELEASING.md).

## Code style

Match the surrounding code — its comment density, naming, and idioms. TypeScript
throughout; explicit public types (JSR publishes typed source). Prefer
composition over inheritance; keep each element a good control before it's an
agent tool.

## Questions

Open an [issue](https://github.com/webmcpui/webmcpui/issues). Good-first-issues
are labeled for newcomers.
