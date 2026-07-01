import { defineConfig } from 'tsup';

// ESM package. React, react-dom, @lit/react, and @webmcpui/core stay external
// — the consumer's bundler resolves and dedupes them (one core registry).
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@lit/react', '@webmcpui/core', 'lit'],
});
