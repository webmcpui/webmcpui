import { WmcpInput } from './elements/input.js';

/** Every custom element this package ships, keyed by tag name. */
const elements: Array<typeof WmcpInput> = [WmcpInput];

/**
 * Register all webmcpui custom elements. Idempotent — safe to call more than
 * once and safe alongside the CDN bundle (already-defined tags are skipped).
 */
export function defineComponents(): void {
  if (typeof customElements === 'undefined') return;
  for (const ctor of elements) {
    if (!customElements.get(ctor.tagName)) {
      customElements.define(ctor.tagName, ctor);
    }
  }
}
