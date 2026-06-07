# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets). It coordinates versioning and changelogs across the workspace packages (`@webmcpui/*`), which release together.

- `pnpm changeset` — describe a change (pick affected packages + bump type)
- `pnpm version-packages` — apply pending changesets: bump versions, write changelogs
- `pnpm release` — build everything, then publish bumped packages

The docs app (`@webmcpui/docs`) is ignored — it isn't published to npm.
