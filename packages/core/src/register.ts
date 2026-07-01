import { WmcpInput } from './elements/input.js';
import { WmcpTextarea } from './elements/textarea.js';
import { WmcpSelect } from './elements/select.js';
import { WmcpCheckbox } from './elements/checkbox.js';
import { WmcpRadio, WmcpRadioGroup } from './elements/radio.js';
import { WmcpButton } from './elements/button.js';
import { WmcpDialog } from './elements/dialog.js';
import { WmcpMenu } from './elements/menu.js';
import { WmcpTabs } from './elements/tabs.js';
import { WmcpPopover } from './elements/popover.js';
import { WmcpToast } from './elements/toast.js';
import { WmcpSwitch } from './elements/switch.js';
import { WmcpBadge } from './elements/badge.js';
import { WmcpSeparator } from './elements/separator.js';

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
  WmcpDialog,
  WmcpMenu,
  WmcpTabs,
  WmcpPopover,
  WmcpToast,
  WmcpSwitch,
  WmcpBadge,
  WmcpSeparator,
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
