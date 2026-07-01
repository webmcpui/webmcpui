# Releasing webmcpui

How to cut a coordinated release of `@webmcpui/core` (npm + JSR) and
`@webmcpui/tokens` (npm). The docs site (`@webmcpui/web`) deploys separately on
push to `main`.

**Publishing is tokenless.** `.github/workflows/release.yml` publishes via OIDC
trusted publishing (npm, with provenance) and JSR (linked repo), triggered by
**publishing a GitHub Release**. No long-lived tokens are stored anywhere.

**Versioning is Changesets.** Core + tokens bump together.

---

## 1 · Before the release (on a feature branch; leave `main` clean)

- [ ] Feature/fix work committed and green.
- [ ] **Docs updated for anything new:**
  - [ ] Site: `apps/web/content/docs/**`, the homepage (`app/pages/index.vue`), and the Introduction (`content/docs/index.md`).
  - [ ] ⚠️ **Package READMEs** — `packages/core/README.md` **and** `packages/tokens/README.md`. These are what npm shows, and **npm only refreshes them on republish**, so they must be current *before* you tag. Keep the element list and API examples up to date.
  - `llms.txt` / `llms-full.txt` regenerate at build (`apps/web/scripts/gen-llms.mjs`) — no manual step.
- [ ] **Review:** run `/code-review` (or the `code-review` workflow) on `main..HEAD`. Fix real findings; add regression tests.
- [ ] **Green gates** (from `packages/core`):
  - [ ] `pnpm build`
  - [ ] `pnpm test`
  - [ ] `npx tsc --noEmit`
  - [ ] `npx jsr publish --dry-run --allow-slow-types`

## 2 · Version bump

- [ ] Add a changeset: `pnpm changeset` — `minor` for features, `patch` for fixes/docs. Select **both** packages if both change.
- [ ] `pnpm version-packages` — bumps `package.json`s, writes CHANGELOGs, consumes the changeset.
- [ ] ⚠️ **Sync `packages/core/jsr.json` `version` by hand** to match `package.json`. Changesets does **not** touch `jsr.json`, and `jsr publish` uses it — if it lags, JSR publishes the wrong (or an already-taken) version.
- [ ] Commit the bump.

## 3 · Ship

- [ ] Push the branch, open a PR, merge to `main`. *(Merging to `main` auto-deploys the docs site via Cloudflare Pages.)*
- [ ] `gh release create vX.Y.Z --target main` with notes. This fires `release.yml` → publishes core + tokens to npm (provenanced) + core to JSR. It's idempotent (skips versions already on a registry).
- [ ] Watch it: `gh run watch $(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`.

## 4 · Verify after publish

- [ ] npm: `npm view @webmcpui/core version` and `@webmcpui/tokens` == new version.
- [ ] Provenance: `npm view @webmcpui/core dist.attestations.provenance` is present.
- [ ] JSR: `curl -sf https://jsr.io/@webmcpui/core/<ver>_meta.json` → 200.
- [ ] CDN: `curl -sf https://cdn.jsdelivr.net/npm/@webmcpui/core@<ver>/dist/webmcpui.global.js` (and the tokens CSS) → 200. jsDelivr can lag a couple minutes.
- [ ] Site: `webmcpui.com` up, new docs pages resolve, `/llms.txt` is current.
- [ ] npm README sanity: `npm view @webmcpui/core@<ver> readme` shows the update.
- [ ] `git checkout main && git pull`.

---

## Gotchas (learned the hard way)

- ⚠️ **`jsr.json` version is not bumped by Changesets** — sync it manually every release (step 2).
- ⚠️ **Package READMEs only reach npm on republish** — update them *before* the release, never after (step 1). (v0.2.1 was a docs patch precisely because the core README shipped describing Phase 1 only.)
- ⚠️ **`.changeset/config.json` `ignore` must list only packages that exist.** A stale entry (a never-created `@webmcpui/docs`) makes `changeset version` throw a `ValidationError` and blocks every release.
- **JSR rejects `declare global`** even with `--allow-slow-types`. Element files must not carry the `HTMLElementTagNameMap` augmentation; it's re-injected into the npm `.d.ts` by `packages/core/scripts/append-global-dts.mjs` (postbuild). **New elements must be added to that script** (and to `register.ts` + `index.ts`).
- **First publish of a *new* package** needs a one-time manual bootstrap + registry setup (npm Trusted Publisher for the package; JSR repo link) before CI can publish it. Existing packages are already configured.
