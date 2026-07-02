import { defineConfig } from 'tsup';

// ESM package. Vue, @webmcpui/components, and Lit stay external — the consumer's
// bundler resolves and dedupes them (one core registry).
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  external: ['vue', '@webmcpui/components', 'lit'],
});
