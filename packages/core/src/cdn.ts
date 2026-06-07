// CDN / no-build entry point. Bundled to a single IIFE that auto-registers
// every <wmcp-*> element on load, so it works as a plain <script src> in
// Webflow, WordPress, or hand-written HTML — no build step, no npm.
import { defineComponents } from './register.js';

defineComponents();

export * from './index.js';
