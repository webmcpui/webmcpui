import { WmcpInput } from "./elements/input.js";
import { WmcpTextarea } from "./elements/textarea.js";
import { WmcpSelect } from "./elements/select.js";
import { WmcpCheckbox } from "./elements/checkbox.js";
import { WmcpRadio, WmcpRadioGroup } from "./elements/radio.js";
import { WmcpButton } from "./elements/button.js";
import { WmcpDialog } from "./elements/dialog.js";
import { WmcpMenu } from "./elements/menu.js";
import { WmcpTabs } from "./elements/tabs.js";
import { WmcpPopover } from "./elements/popover.js";
import { WmcpToast } from "./elements/toast.js";
import { WmcpSwitch } from "./elements/switch.js";
import { WmcpBadge } from "./elements/badge.js";
import { WmcpSeparator } from "./elements/separator.js";
import { WmcpTooltip } from "./elements/tooltip.js";
import { WmcpAlert } from "./elements/alert.js";
import { WmcpProgress } from "./elements/progress.js";
import { WmcpAvatar } from "./elements/avatar.js";

/** Every valid `<wmcp-*>` tag name — the single source of truth for registration and `HTMLElementTagNameMap`. */
export type WmcpTagName =
  | "wmcp-alert"
  | "wmcp-avatar"
  | "wmcp-badge"
  | "wmcp-button"
  | "wmcp-checkbox"
  | "wmcp-dialog"
  | "wmcp-input"
  | "wmcp-menu"
  | "wmcp-popover"
  | "wmcp-progress"
  | "wmcp-radio"
  | "wmcp-radio-group"
  | "wmcp-select"
  | "wmcp-separator"
  | "wmcp-switch"
  | "wmcp-tabs"
  | "wmcp-textarea"
  | "wmcp-toast"
  | "wmcp-tooltip";

/** Constructor shape for any registerable `<wmcp-*>` element. */
export interface WmcpElementConstructor<T extends WmcpTagName = WmcpTagName> {
  readonly tagName: T;
  new (): HTMLElement;
}

/** All elements shipped by this package, in registration order. */
export const allElements: WmcpElementConstructor[] = [
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
  WmcpTooltip,
  WmcpAlert,
  WmcpProgress,
  WmcpAvatar,
];

/**
 * Register webmcpui custom elements. Idempotent — safe to call more than once
 * and safe alongside the CDN bundle (already-defined tags are skipped).
 *
 * Pass a subset of `allElements` to register only what you need (tree-shake
 * friendly). Omit the argument to register everything.
 */
export function defineComponents(
  components: WmcpElementConstructor[] = allElements,
): void {
  if (typeof customElements === "undefined") return;
  for (const ctor of components) {
    if (!customElements.get(ctor.tagName)) {
      customElements.define(ctor.tagName, ctor);
    }
  }
}
