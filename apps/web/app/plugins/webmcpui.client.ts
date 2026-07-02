// Registers the <wmcp-*> custom elements in the browser only.
//
// Custom elements need the DOM (customElements.define), so this must never run
// during SSR/prerender — the `.client` suffix guarantees that. Importing the
// package does not auto-register; we opt in by calling defineComponents().
import { defineComponents } from '@webmcpui/components';

export default defineNuxtPlugin(() => {
  defineComponents();
});
