<!-- Thanks for contributing! Keep PRs focused; green CI is required. -->

## What & why

<!-- What does this change, and what's the motivation? Link any issue: Closes #123 -->

## Type

- [ ] Fix
- [ ] Feature
- [ ] Docs
- [ ] Refactor / infra

## Checklist

- [ ] Tests added/updated for behavior changes (`pnpm --filter @webmcpui/core test`)
- [ ] `pnpm build` and typecheck pass
- [ ] A **changeset** is included if a published package changed (`pnpm changeset`)
- [ ] New/changed element is registered in **all three**: `register.ts`,
      `index.ts`, `scripts/append-global-dts.mjs` (N/A if no element added)
- [ ] Tokens + React/Vue wrappers + a docs page updated if an element was added
- [ ] The element is a good, accessible control first; agent exposure is opt-in
      and a no-op with no host

## Notes for reviewers

<!-- Anything you want a reviewer to look at closely, tradeoffs, follow-ups. -->
