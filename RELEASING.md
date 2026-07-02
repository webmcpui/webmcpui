# Releasing webmcpui

How to cut a coordinated release of the four packages:

| Package | npm | JSR | Notes |
|---|---|---|---|
| `@webmcpui/components` | ✅ | ✅ | the custom elements |
| `@webmcpui/tokens` | ✅ | — | CSS custom properties (can't live on JSR) |
| `@webmcpui/react` | ✅ | — | typed React wrappers over core |
| `@webmcpui/vue` | ✅ | — | typed Vue wrappers over core |

The docs site (`@webmcpui/web`) deploys separately on push to `main`.

**Publishing is tokenless.** `.github/workflows/release.yml` publishes via OIDC
trusted publishing (npm, with provenance) and JSR (linked repo), triggered by
**publishing a GitHub Release**. No long-lived tokens are stored anywhere. Each
publish step is idempotent (`npm view @pkg@$VER` → skip if already up).

**Versioning is Changesets.** All packages bump together to keep the wave
coherent. react/vue peer-depend on core — see the ⚠️ major-bump gotcha in step 2.

---

## 1 · Before the release (on a feature branch; leave `main` clean)

- [ ] Feature/fix work committed and green.
- [ ] **Docs updated for anything new:**
  - [ ] Site: `apps/web/content/docs/**`, the homepage (`app/pages/index.vue`), and the Introduction (`content/docs/index.md`). **When adding elements, update the element lists in BOTH the homepage and the Introduction; when adding a package, make sure the homepage + Introduction name it.**
  - [ ] ⚠️ **Package READMEs — all five that ship:** `packages/components/README.md`, `packages/components/README.md`, `packages/tokens/README.md`, `packages/react/README.md`, `packages/vue/README.md`. These are what npm shows, and **npm only refreshes them on republish**, so they must be current *before* you tag. The core README enumerates every element — keep that list and the API examples in sync with what actually ships.
  - `llms.txt` / `llms-full.txt` regenerate at build (`apps/web/scripts/gen-llms.mjs`) — no manual step.
- [ ] **Review:** run `/code-review` (or the `code-review` workflow) on `main..HEAD`. Fix real findings; add regression tests.
- [ ] **Green gates:**
  - [ ] `pnpm build` (repo root — builds all packages)
  - [ ] `pnpm test` (from `packages/components`)
  - [ ] Typecheck **each package that changed**: `packages/components`, `packages/react`, `packages/vue` (`pnpm typecheck` / `npx tsc --noEmit`).
  - [ ] `npx jsr publish --dry-run --allow-slow-types` (from `packages/webmcp`)

## 2 · Version bump

- [ ] Add a changeset: `pnpm changeset` — `minor` for features, `patch` for fixes/docs. Select **every** package that changed.
- [ ] `pnpm version-packages` — bumps `package.json`s, writes CHANGELOGs, consumes the changeset.
- [ ] ⚠️ **Verify react/vue did NOT jump a major.** They peer-depend on core, and Changesets by default treats a peer-dependent as needing a **major** bump when the dependency bumps (this once shoved react/vue to `1.0.0`). Guard is `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange: true` in `.changeset/config.json` — keep it. After `version-packages`, **eyeball all four `package.json` versions**; if react/vue over-bumped, reset them by hand and delete any spurious CHANGELOG entries.
- [ ] ⚠️ **Sync `packages/webmcp/jsr.json` `version` by hand** to match `package.json`. Changesets does **not** touch `jsr.json`, and `jsr publish` uses it — if it lags, JSR publishes the wrong (or an already-taken) version.
- [ ] Commit the bump.

## 3 · Ship

- [ ] Push the branch, open a PR, merge to `main`. *(Merging to `main` auto-deploys the docs site via Cloudflare Pages.)*
- [ ] **First-ever publish of a NEW package?** Do the one-time bootstrap FIRST — see the gotcha below — before tagging. (Already-published packages need nothing here.)
- [ ] `gh release create vX.Y.Z --target main` with notes. This fires `release.yml` → publishes core + tokens + react + vue to npm (provenanced) + core to JSR. Idempotent (skips versions already on a registry).
- [ ] Watch it: `gh run watch $(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`.

## 4 · Verify after publish

- [ ] npm: `npm view @webmcpui/<pkg> version` == new version for **all four** (`core`, `tokens`, `react`, `vue`).
  - ⚠️ `npm view` can 404 a just-published version for a few minutes — that's registry lag, **not** a failed publish. Confirm on the npm web UI, or note that a retry `npm publish` returns E403 "cannot publish over previously published version" (which proves it's there).
- [ ] Provenance: `npm view @webmcpui/components dist.attestations.provenance` present (same for tokens/react/vue **if** they published via CI — a manually bootstrapped first release has none; that's expected).
- [ ] JSR: `curl -sf https://jsr.io/@webmcpui/components/<ver>_meta.json` → 200.
- [ ] CDN: `curl -sf https://cdn.jsdelivr.net/npm/@webmcpui/components@<ver>/dist/webmcpui.global.js` and `.../@webmcpui/tokens@<ver>/dist/css/tokens.css` → 200. jsDelivr can lag a couple minutes.
- [ ] Site: `webmcpui.com` up, new docs pages resolve, `/llms.txt` is current.
- [ ] npm README sanity: `npm view @webmcpui/components@<ver> readme` shows the update (and that it lists any new elements).
- [ ] `git checkout main && git pull`.

---

## Gotchas (learned the hard way)

- ⚠️ **Package READMEs only reach npm on republish** — update them *before* the release, never after (step 1). The core README enumerates every element; it has shipped stale twice (v0.2.1 was a docs-only patch because the core README described Phase 1 only; v0.3.0 shipped missing the 7 W1 elements + no react/vue mention). Treat the element list as a release-gate item.
- ⚠️ **react/vue can silently major-bump.** Peer-dependent-on-core → Changesets defaults to a major bump. Keep `onlyUpdatePeerDependentsWhenOutOfRange: true` and verify versions after `version-packages` (step 2).
- ⚠️ **`jsr.json` version is not bumped by Changesets** — sync it manually every release (step 2).
- ⚠️ **`.changeset/config.json` `ignore` must list only packages that exist.** A stale entry (a never-created `@webmcpui/docs`) makes `changeset version` throw a `ValidationError` and blocks every release. Current ignore: the example apps + `@webmcpui/web`.
- **First publish of a *new* package** is a one-time manual bootstrap: OIDC trusted publishing can't attach to a package that doesn't exist yet (chicken-and-egg). So the maintainer runs `npm publish --access public` for the new package (logged in, 2FA), **then** configures its Trusted Publisher in the npm UI (repo `webmcpui/webmcpui`, workflow `release.yml`) and sets "require 2FA / disallow tokens". Only after that does CI publish it on future tags. The very first version has **no provenance** (manual publish); subsequent CI releases do. (react + vue were bootstrapped this way at 0.3.0.)
- **JSR rejects `declare global`** even with `--allow-slow-types`. Element files must not carry the `HTMLElementTagNameMap` augmentation; it's re-injected into the npm `.d.ts` by `packages/components/scripts/append-global-dts.mjs` (postbuild). **New elements must be added to that script** (and to `register.ts` + `index.ts`). New elements with a react/vue wrapper also need the wrapper exported from `packages/react/src/index.ts` + `packages/vue/src/index.ts`.
