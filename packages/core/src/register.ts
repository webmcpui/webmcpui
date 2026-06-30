import { WmcpInput } from './elements/input.js';
import { WmcpTextarea } from './elements/textarea.js';
import { WmcpSelect } from './elements/select.js';
import { WmcpCheckbox } from './elements/checkbox.js';
import { WmcpRadio, WmcpRadioGroup } from './elements/radio.js';
import { WmcpButton } from './elements/button.js';

interface WmcpElementCtor {
  readonly tagName: string;
  new (): HTMLElement;
}

/** Every custom element this package ships. */
const elements: WmcpElementCtor[] = [
  WmcpInput,
  WmcpTextarea,
  WmcpSelect,
  WmcpCheckbox,
  WmcpRadio,
  WmcpRadioGroup,
  WmcpButton,
];

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
