# Open decisions

A living log of calls we need to make together, so a sync is 20 minutes of
**deciding** — not re-deriving. Each entry states the question, the options with
honest tradeoffs, and a recommendation to accept, reject, or amend. When we
decide, move the entry to **Decided** at the bottom with the date and outcome.

> Recommendations here are starting points, not verdicts. The point is to argue
> from a shared surface.

**Owners:** Gary (product, design, the pre-baked-patterns moat, strategy) ·
Errol (architecture, systems, code structure, build/release/infra, engineering
discipline). Claude supports both and keeps this doc current.

---

## 1. Do the `@webmcpui/react` / `@webmcpui/vue` wrapper packages earn their keep?

**Where we are:** both shipped in 0.3.0/0.3.1 (thin typed wrappers over the
core custom elements) and have real installs.

**The question:** keep investing, freeze, or wind down?

**Tradeoffs**
- *For keeping:* typed props/events, `v-model`, no `isCustomElement` config,
  IDE autocomplete. Real DX for framework users; already adopted.
- *Against:* they're low-differentiation maintenance surface, and **React 19's
  native custom-element support** (props + declarative events) shrinks the
  react wrapper's value from "makes it possible" to "makes it nicer." Our moat
  is design + interaction primitives + pre-baked patterns — not passthrough
  wrappers.

**Recommendation (to argue with):** **Keep, but freeze.** Treat them as optional
sugar, stop adding wrapper-only surface, and put energy into core + `blocks`.
Be explicit in docs that the core is first-class standalone and the wrappers are
a convenience. Revisit "wind down react specifically" once we see whether React
19 adoption makes it redundant. *This is Errol's structural call to drive; the
React-19 point is real.*

---

## 2. À-la-carte registration: `defineComponent(ctor)` alongside `defineComponents()`

**Where we are:** `defineComponents()` registers **every** element by importing
all of them in `register.ts`, which defeats tree-shaking — a consumer who wants
one `<wmcp-input>` pulls in all ~20 element classes.

**The question:** add a singular, per-element registration path (IOC / a la
carte), and what's the API shape?

**Tradeoffs**
- *For:* tree-shakeable bundles, SRP, composition over inheritance. Additive and
  non-breaking — keep `defineComponents()` for the CDN bundle and convenience.
- *Against:* two registration entry points to document; minor API-surface
  growth.

**Open sub-questions**
- API shape: `defineComponent(WmcpInput)` (single) vs `defineElements([...])`
  (batch) vs both.
- Keep the `typeof customElements === 'undefined'` guard — `if (!customElements)`
  throws a `ReferenceError` under SSR/Node, where `customElements` is an
  undeclared global.

**Recommendation:** **Do it** (Errol is already drafting the rework). Ship the
single `defineComponent(ctor)` as the primary path, keep `defineComponents()`
as the batch/CDN convenience, keep the SSR guard.

**Status: Errol owns the implementation.** Claude to hold off building a parallel
version to avoid collision.

---

## 3. `@webmcpui/webmcp` as its own package (PR #8)

**Where we are:** PR #8 extracts the imperative WebMCP layer (`exposeTool`,
`isWebMCPAvailable`, types) into a Lit-free, dependency-free package; core keeps
re-exporting the same symbols (public API unchanged). CI/release/JSR wired.

**The question:** merge it? And settle naming + versioning first.

**Tradeoffs**
- *For:* serves the "WebMCP reference implementation" positioning — anyone can
  register agent tools without adopting our components. Combined with #2 it makes
  the whole kit composable.
- *Against:* a 5th package to version/bootstrap/maintain; core gains a runtime
  dependency (slightly less self-contained on JSR, which pulls it via `npm:`).

**Must fix before merge**
- Version desync: `package.json` says `1.0.0-beta.1`, `jsr.json` says `0.1.0`.
- The `1.0` signal implies a stability commitment we may not want yet — align to
  `0.x`?
- Naming: `@webmcpui/webmcp` reads redundantly. Alternatives: keep it,
  `@webmcpui/mcp`, `@webmcpui/expose`. (Naming is cheap now, expensive later.)

**Recommendation:** **Merge, after** picking a name and setting the version to
`0.x` in lockstep-or-independent (decide which — see #4).

---

## 4. Release + semver discipline

**Where we are:** Changesets is wired, but cadence has been loose (0.3.0 → 0.3.1
same day). Errol's point: a bump should represent a **coherent** set of
features/fixes, not "we changed something."

**The question:** what are our release rules, and who cuts releases?

**Options / to decide**
- Version bumps map to a curated changelog of A/B/C, not per-commit.
- Lockstep vs independent versioning across the 4–5 packages (tokens is already
  off-lockstep at 0.3.0 while core/react/vue are 0.3.1).
- Who has release authority, and do we add branch protection (require PR + green
  CI) so releases can't be cut off an unreviewed main?

**Recommendation:** Write the rules into `RELEASING.md` (it already has the
mechanics). Add branch protection on `main`. Prefer **independent** versioning
per package (bump only what changed) with a curated changeset per release. Agree
a light "release captain" rotation or default owner.

---

## 5. Real open-source process

**Where we are:** planning lives in Gary's private Obsidian vault; the repo has
no `CONTRIBUTING`, roadmap, issue/PR templates. Errol: "otherwise we aren't
really open source other than people can use it."

**The question:** what's the minimum viable contributor process?

**Recommendation:** Land the scaffolding in this same PR — `CONTRIBUTING.md`,
`ROADMAP.md` (public), PR + issue templates — and seed a first batch of issues
(drafted in [`docs/proposed-issues.md`](./proposed-issues.md)) including
good-first-issues. Move roadmap ownership from Obsidian into `ROADMAP.md` +
GitHub issues. **Decide labels and whether to enable GitHub Discussions.**

---

## 6. Ownership lanes (so we don't step on each other)

Not a code decision — a working agreement. Proposed, to confirm:
- **Errol:** architecture, systems, code structure, build/CI/release infra,
  engineering discipline, the primitives/`webmcp` layer.
- **Gary:** product, design, the pre-baked-patterns moat, strategy, go-to-market.
- **Claude:** connective tissue — implement agreed decisions, keep both in sync,
  do the grunt work, keep this doc and the roadmap current.
- Anything cross-cutting (like #1) gets decided together before work starts.

---

## Decided

_(empty — move entries here with date + outcome as we settle them)_
