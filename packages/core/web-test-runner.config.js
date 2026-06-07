import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  // Transpile TS sources on the fly. Imports use `.js` specifiers that resolve
  // to the `.ts` files — handled by @web/dev-server-esbuild. tsconfig carries
  // the Lit decorator settings (experimentalDecorators, useDefineForClassFields).
  plugins: [
    esbuildPlugin({ ts: true, tsconfig: 'tsconfig.json', target: 'es2022' }),
  ],
  // Real Chromium — ElementInternals / form-associated custom elements need a
  // genuine browser, not jsdom.
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testFramework: {
    config: { ui: 'bdd', timeout: '4000' },
  },
};
