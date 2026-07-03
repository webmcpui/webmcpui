# Foundation audit — findings

A pre-hardening sweep of the codebase (packages + build/release infra; the Nuxt
site content was out of scope). Produced by a 7-lens multi-agent review (67 raw
findings, each independently verified to refute false positives) plus a human
checker + gap pass on top.

**How to read the source tags:**
- `[agent]` — the fan-out found it.
- `[agent+known]` — agents found it *and* Errol/Claude had already flagged it.
- `[agent→adjusted]` — agents found it; I corrected the severity or framing.
- `[claude]` — added in the gap pass (agents missed or under-framed it).

Severities are my re-prioritization: the agents rated conservatively (1 high /
16 med / 50 low), but several "lows" are the *same systemic pattern* and matter
more clustered than alone.

**Did doing both pay off?** Yes, and clearly:
- **Agents caught things a manual pass wouldn't have** — the number-input schema
  mismatch, the tooltip `aria-label` shadowing the tip text, the duplicate-name
  tracker corruption, the JSR-guard-reads-the-wrong-file bug, the divergent
  `pnpm release` path. Subtle, and found at breadth no single reader matches.
- **The human layer added what the fan-out didn't** — dedup (67→~40 unique),
  clustering isolated "lows" into systemic patterns, severity judgment, and the
  architectural *thesis* (the agents found coupling *symptoms*; the "core is
  three packages + a DI seam" restructure is the through-line — see P2).
- **Verdict:** run both. Agents for exhaustive breadth + subtle catches; a
  human/checker for triage, clustering, and strategy. Neither alone is enough.

---

## P0 — correctness bugs to fix in the hardening pass

1. **Double tool-registration on mount** · `elements/exposable.ts:66` · `[agent+known]`
   `connectedCallback` registers when `expose` is set, then the first `updated()`
   registers again (disposer prevents a lingering dup, but it's register→dispose→
   register churn every mount). *Fix: gate the initial registration to one path.*
2. **Fake agent installs on the wrong host** · `testing.ts:41` · `[agent+known]`
   `installFakeAgent` stubs `navigator.modelContext`, but `webmcp.ts` prefers
   `document.modelContext`. Passes today only because the test browser has no real
   `document` host; the day it does, the fake is bypassed and tests hit the live
   host. *Fix: install on `document` with save/restore, fall through to navigator.*
3. **Number input advertises a numeric schema but stores a string** · `elements/input.ts:52` · `[agent]`
   `toolInputSchema()` emits `value: { type: 'number' }` for `type="number"`, but
   the value is coerced with `String(next)` and validated as a string — so the
   natural `z.number()` validator **rejects every value**. Subtle, real trap.
4. **Reactive ARIA set once, goes stale** (systemic) · `alert.ts:69`, `separator.ts:42` · `[agent, clustered]`
   `role`/`aria-orientation` are computed in `connectedCallback` but `variant` /
   `orientation` are reactive. An `info→error` alert keeps `role="status"` (not
   announced assertively); a separator flipped to horizontal keeps the vertical
   orientation. *Fix once as a pattern: compute reactive ARIA in `updated()`.*
5. **Tooltip `aria-label` shadows the tip text** · `elements/popover.ts:245` · `[agent]` · **(the one "high")**
   In tooltip mode the panel always gets `aria-label`, which supplies the
   accessible *name* and makes the trigger's `aria-describedby` ignore the slotted
   tooltip content — screen readers announce the label, not the tip.
6. **Duplicate-tool-name tracker corrupts on dispose** · `webmcp.ts:135` · `[agent]`
   The name `Set` isn't refcounted; disposing one control deletes a name still
   held by another, silencing legitimate collision warnings afterward.
7. **`exposeTool` doesn't catch a host `registerTool` throw** · `webmcp.ts:126` · `[agent]`
   A rejected/duplicate registration can break the element instead of degrading.
8. **`wmcp-menu open` is write-ineffective** · `elements/menu.ts:155` · `[agent]`
   Unlike dialog/popover, menu has no `updated()` reconciling `open` to the native
   popover — setting `el.open = true` updates `aria-expanded` but doesn't open it.
9. **`radio-group disabled` ignored for declarative children** · `elements/radio.ts:201` · `[agent]`
   `o.disabled ?? this.disabled` short-circuits (declarative options always yield a
   defined `false`), so a group-level `disabled` never reaches the radios.
10. **Agent can open a hover-tooltip into a stuck state** · `elements/popover.ts:146` · `[agent]`
    `executeTool` calls `show()` even for `trigger="hover"` (a `manual` popover with
    no light-dismiss); opened without a pointer over it, nothing ever closes it.
11. **Progress `aria-valuenow` unclamped + no `max<=0` guard** · `elements/progress.ts:78,84` · `[agent]`

## P1 — guardrails (so mistakes can't ship again)

12. **CI only gates `core`** · `.github/workflows/ci.yml` · `[agent]`
    react, vue, tokens are never typechecked/built/tested on PRs.
13. **CI never runs a build** · `ci.yml:24` · `[agent]`
    tsup, the CDN IIFE, and the `append-global-dts` postbuild are unexercised until
    release — a broken exports map or corrupted `.d.ts` ships green.
14. **Built `dist` is never smoke-tested before publish** · `scripts/smoke.mjs` orphaned · `[agent]`
    `test:smoke` (the only test that imports the built artifacts) is wired in
    package.json but invoked by neither CI nor release.
15. **JSR idempotency guard reads the wrong file** · `release.yml:138` · `[agent]`
    The skip-check reads the version from `package.json`, but `jsr publish` uses
    `jsr.json` — a forgotten manual sync causes a broken partial release. (This is
    the automatable check behind our known jsr-sync gotcha.)
16. **Divergent release path** · root `package.json:19` · `[agent]`
    `pnpm release` = `changeset publish`, which skips OIDC provenance **and** JSR.
    Anyone running it locally publishes a weaker artifact than `release.yml` does.
17. **`workspace:*` in published wrapper manifests** · `release.yml:119` · `[agent→adjusted]`
    `npm publish` (not `pnpm`) ships literal `workspace:*`. **Corrected: it's in
    devDependencies**, so consumers are unaffected — cleanup, not a break.
18. **react/vue publish without a LICENSE file** · `packages/react`, `packages/vue` · `[agent]` (MIT declared, no file shipped).
19. **Misc release hygiene** · `[agent]` — dry-run uses `--allow-slow-types` but the
    real publish doesn't (`release.yml:141`); release builds the whole monorepo incl.
    the Nuxt site before publishing (`:86`); Node version drift (release hardcodes
    22, CI uses `.node-version`); `.changeset/README.md` names a non-existent
    `@webmcpui/docs`.
20. **Add branch protection on `main`** · `[claude]` — require PR + green CI so a
    release can't be cut off unreviewed main (not a code finding, but the guardrail
    that ties P1 together).

## P2 — architecture / separation of concerns (Errol leads)

21. **The thesis: core is really three packages** · `[claude, from agent symptoms]`
    The agents found the *symptoms* (below); the through-line is Errol's: split
    `core` into **elements / webmcp / test-utils**, make the CDN bundle a build
    step, and inject the host + env at the registration seam (DI) so elements are
    reusable with a consumer's own WebMCP host. Non-breaking if `core` keeps
    re-exporting. Extends PR #8.
22. **Single source of truth for the element registry** · `register.ts` / `append-global-dts.mjs` / wrapper indexes · `[agent]`
    The shipped-element list is hand-maintained in 3–4 disjoint places with no test
    guard — drift is inevitable (and already happening with wrapper parity).
23. **`toolReactiveProps` hook drift** · `select.ts:97`, `radio.ts:140` · `[agent]`
    radio/select hand-roll tool re-registration instead of the hook menu/tabs use —
    two patterns for one concern.
24. **Form-association implemented twice** across the base-class branches · `button.ts:187` · `[agent]`
25. **`label` re-declared** on menu/tabs/popover though already on `WmcpAction` · `[agent]`

## P3 — API consistency, tests, dead code

**Consistency**
26. **Wrapper parity: 11/19** · react/vue `index.ts` · `[agent+known]` — missing 4
    form controls (select, checkbox, radio, textarea) + menu, popover, toast.
    Ties directly to the open react/vue-scope decision.
27. **form-control omits `label` from `toolReactiveProps`** · `form-control.ts:242` · `[agent]`
    Changing `label` after mount leaves a stale tool description/schema (WmcpAction
    includes it; the sibling base doesn't — direct inconsistency).
28. **Vue Switch omits `schema`/`helperText`/… props** · `vue/switch.ts` · `[agent]`
29. **Tooltip inherits popover's tool-name suffix but not its description** · `tooltip.ts:27` · `[agent]` (self-describes as "popover").
30. **`alert.title` shadows native `HTMLElement.title`** · `alert.ts:65` · `[agent]`
    One lowercase `title` attribute drives both the heading *and* a native browser
    tooltip — conflicting semantics.

**Test coverage** `[agent]` — the exposure core is thinnest exactly where it's most
spec-sensitive: `webmcp.ts` has no dedicated test; the canonical AbortSignal
disposal path is untested; runtime `expose` toggling / re-registration untested;
MutationObserver enum refresh (menu/tabs/radio) untested; standard-schema async +
multi-issue untested; toast history expiry/cap untested; `cdn.ts` untested.

**Dead code** `[agent]` — `WmcpRadio` value/label/disabled getters are dead;
checkbox/switch duplicate the base `applyAgentValue` body; a few defensive
branches that never trigger.

---

## Suggested sequence

1. **P1 guardrails first** — widen the CI net (all packages, build, smoke) + the
   jsr-sync check + branch protection. *Then* mistakes can't re-ship while we work.
2. **P0 correctness** — batch the lifecycle + reactive-ARIA + input-schema fixes,
   each with a regression test (the coverage gaps in P3 get filled as we go).
3. **P2 architecture** — Errol-led, as its own RFC/effort; the registry
   single-source (#22) is a good first structural win.
4. **P3 consistency/dead-code** — cleanup pass, and fold the wrapper-parity item
   into the react/vue-scope decision rather than blindly filling all 8.

Raw 67-finding output (with per-finding verify reasoning) is in the workflow
result if we want to drill into any single item.
