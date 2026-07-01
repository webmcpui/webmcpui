# @webmcpui/tokens

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
