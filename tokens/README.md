# @webmcpui/tokens

The design token dictionary — the foundation layer every webmcpui component is built on.

**Source of truth: `tokens/*.json`.** Style Dictionary builds these into CSS custom properties, TypeScript types, and a Figma import. Figma is a *consumer* of the tokens, never the source (decided in the plan — code-first workflow, AI agents adopt via repo, no paid tooling).

## Layout

```
tokens/
  base/
    color.json        base semantic colors (light) — matches shadcn exactly
    color.dark.json    dark overrides for the same names
    dimension.json     --radius, --ring-width, --ring-offset
  components/
    input.json         first component — exhaustive input token set
config/
  build.js             Style Dictionary build (custom name transform + formats)
```

## Build

```bash
npm install
npm run build
```

Outputs (git-ignored, generated):

```
dist/css/tokens.css     :root (light + components) and .dark blocks
dist/js/tokens.js       { 'token-name': 'value', ... }
dist/js/tokens.d.ts     type declarations
dist/figma/tokens.json  resolved values keyed by slash path, for Figma import
```

## Naming convention

Base tokens match shadcn 1:1 (`--background`, `--primary`, `--ring`, `--radius`). A
custom name transform drops the group prefix from the token path:

| token path (JSON)        | CSS variable        |
| ------------------------ | ------------------- |
| `base.input`             | `--input`           |
| `base.card-foreground`   | `--card-foreground` |
| `components.input.bg`    | `--input-bg`        |
| `components.input.border`| `--input-border`    |

Component tokens that "default to" a base token use a reference (`{base.input}`).
`outputReferences` is on, so the CSS emits `var(--input)` rather than the resolved
value — consumer overrides of the base token cascade into the component. Example:

```css
--input-border: var(--input);
--input-border-focus: var(--ring);
--input-radius: var(--radius);
```

## Color format

OKLCH (matches shadcn's late-2024 migration and Tailwind v4). Dark mode is a
`.dark` class toggle, not a media query — consumers choose when to apply it.

## Figma sync

`dist/figma/tokens.json` mirrors the CSS variable names (slash-separated). Import
it via the Figma Variables importer / Token Studio. Because both sides reference
the same names and Style Dictionary is canonical, Code Connect mappings can't drift.

## Adding a component

1. Add `tokens/components/<name>.json` under a `components.<name>` group.
2. Reference base tokens with `{base.*}` where a default should cascade.
3. `npm run build`.
