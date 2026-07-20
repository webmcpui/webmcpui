# Proposed first issues

A starting batch to seed the tracker once we've agreed lanes and priorities at
the sync. These are **drafts** — not yet created on GitHub. After the sync,
Claude can `gh issue create` the ones we keep, with the labels we settle on.

Legend: `good-first-issue` = small, well-scoped, newcomer-friendly ·
`tracked` = larger, owner-led work.

## Foundation / process

- **[tracked] Add branch protection on `main`** — require PR + green CI before
  merge, so releases can't be cut off an unreviewed main. (open-decisions #4)
- **[tracked] Codify release + semver rules in `RELEASING.md`** — what earns a
  bump, lockstep vs independent versioning, release-captain default.
- **[good-first-issue] Add a `CODE_OF_CONDUCT.md`** (Contributor Covenant) and
  link it from CONTRIBUTING.

## Architecture (owner-led)

- **[tracked] À-la-carte `defineComponent(ctor)`** — per-element registration
  for tree-shakeable bundles; keep `defineComponents()` for the CDN/convenience
  path and the SSR `typeof` guard. (open-decisions #2 — Errol)
- **[tracked] Extract `@webmcpui/webmcp`** — finish PR #8: pick the name, set
  version to `0.x`, fix the package.json/jsr.json desync. (open-decisions #3)
- **[tracked] Decide react/vue wrapper scope** — keep-but-freeze vs wind-down,
  with the React-19 question. (open-decisions #1)

## Components (breadth)

- **[tracked] `sheet` / `drawer`** — a Dialog-adjacent slide-in panel; the meaty
  agent-facing one (open/close exposure).
- **[good-first-issue] `accordion` + `collapsible`** — disclosure primitives.
- **[good-first-issue] `breadcrumb`** — presentational navigation trail.
- **[good-first-issue] `pagination`** — page controls (agent can go to page N).
- **[good-first-issue] `empty-state`** and **`stat`** — presentational.

## Data (exploring)

- **[tracked] Spike: headless data engine for a table/data-grid** — evaluate
  TanStack Table; define the agent-queryable exposure surface. (ROADMAP)

## Docs / DX

- **[good-first-issue] Add a "no agent yet? test with the fake host" callout** to
  each exposable element's docs page, linking `@webmcpui/core/testing`.
- **[good-first-issue] Framework guide: React 19 native custom-element note** —
  when you do/don't need the wrapper.
