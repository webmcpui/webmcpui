import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM package for build-tool consumers (React / Vue / Vite / etc).
  // Lit stays external — the consumer's bundler resolves and dedupes it.
  {
    entry: { index: 'src/index.ts', testing: 'src/testing.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    target: 'es2022',
    external: ['lit'],
  },
  // Single-file IIFE bundle for no-build consumers (Webflow / WordPress /
  // plain HTML). Auto-registers every <wmcp-*> element on load. Lit is
  // inlined so it's one <script src> with no dependencies.
  {
    entry: { webmcpui: 'src/cdn.ts' },
    format: ['iife'],
    globalName: 'webmcpui',
    minify: true,
    target: 'es2022',
    noExternal: [/.*/],
    clean: false,
  },
]);
