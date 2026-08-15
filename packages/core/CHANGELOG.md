# @webmcpui/core

## 0.4.0

### Minor Changes

- Tool results now always tell the agent the truth, and the library survives partial-DOM test environments.
  - **Truthful button tool results.** `<wmcp-button type="submit">` reports "submitted the form" only when the form's `submit` event actually dispatched. A submit button outside any form, or one whose form fails constraint validation, returns `isError: true` with a message saying exactly what didn't happen (the click itself still fires for light-DOM handlers). Reset likewise reports an error when there is no form. Previously the tool claimed a submit unconditionally.
  - **Graceful degradation without ElementInternals.** Components no longer hard-crash in jsdom (`setFormValue` missing) or happy-dom (`attachInternals` missing): they construct, render, validate, and expose their WebMCP tools, with native `<form>` participation disabled behind a single dev-mode console warning linking to the testing docs. Real browsers are unaffected.
  - **`installFakeAgent()` stubs the canonical surface.** The fake WebMCP host now installs on `document.modelContext` (what the library prefers) as well as `navigator.modelContext` (the deprecated fallback) — the same host object on both, so tools register exactly once. A new `surface: 'document' | 'navigator' | 'both'` option narrows it, and `restore()` puts back each surface's prior state. Zero-argument calls are unchanged.

## 0.3.1

### Patch Changes

- docs: refresh package READMEs after v0.3.0
  - **core**: element list now includes the W1 elements (switch, badge, separator, tooltip, alert, progress, avatar) and points React/Vue users at `@webmcpui/react` / `@webmcpui/vue`.
  - **react**: drop the stale "Remix" SSR reference (Remix v2 merged into React Router v7; Remix 3 dropped React) — replaced with React Router.
  - **react/vue**: this is their first release published via CI, so they now carry npm provenance.

## 0.3.0

### Minor Changes

- 0.3.0 — framework packages + first breadth wave.

  New in core (all additive): `<wmcp-switch>` (boolean form control), and the
  presentational `<wmcp-badge>`, `<wmcp-separator>`, `<wmcp-alert>`,
  `<wmcp-progress>`, `<wmcp-avatar>`, plus `<wmcp-tooltip>` (a hover preset of
  `<wmcp-popover>`). Matching `--switch-*` / `--badge-*` / `--separator-*` /
  `--alert-*` / `--progress-*` / `--avatar-*` token sets.

  Debuting alongside: **`@webmcpui/react`** and **`@webmcpui/vue`** — idiomatic,
  typed wrappers over the core custom elements (props, refs / v-model, on\*/@event),
  shadcn/Tailwind-aligned via the tokens, with an unstyled mode.

## 0.2.1

### Patch Changes

- docs: update package READMEs for 0.2.0.

  The core README still described only the Phase 1 form primitives (and referenced
  the deprecated `navigator.modelContext`); rewrite it to cover both families —
  form controls and the six interaction primitives — and the canonical
  `document.modelContext` exposure. Add a README to `@webmcpui/tokens`, which
  previously shipped without one.

## 0.2.0

### Minor Changes

- Phase 2 — interaction primitives.

  Add six agent-operable interaction elements. Where the form controls expose a
  _value_ an agent can set, these expose an _action_ an agent can trigger (or, for
  toast, a _reading_ an agent can perceive):
  - **`<wmcp-button>`** — a click an agent can trigger; `type="submit"`/`"reset"`
    drive the surrounding form across the shadow boundary.
  - **`<wmcp-dialog>`** — a modal whose action is _open_; closing/confirming stays
    a deliberate human step.
  - **`<wmcp-menu>`** — a menu button whose action is parameterized (the agent
    picks _which_ item, as an `enum`).
  - **`<wmcp-tabs>`** — a tab set holding a persistent `active` selection the
    agent can switch.
  - **`<wmcp-popover>`** — a non-modal anchored panel (with a `trigger="hover"`
    tooltip mode) whose action is _open_.
  - **`<wmcp-toast>`** — notifications the page throws and an agent can _read_ via
    `read_notifications` (the machine-readable twin of its `aria-live` region).

  The WebMCP exposure plumbing is unified into a shared `WmcpExposable` base
  (extended by both `WmcpFormControl` and the new `WmcpAction`). Tokens add
  dark-adaptive `--button-*`, `--dialog-*`, `--menu-*`, `--tabs-*`, `--popover-*`,
  and `--toast-*` custom-property sets. All additive and backward-compatible.
