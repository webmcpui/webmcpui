import { WmcpPopover } from './popover.js';

/**
 * `<wmcp-tooltip>` — a hover/focus tooltip. A thin preset of
 * {@link WmcpPopover}: the same anchored-panel machinery, defaulted to
 * `trigger="hover"` (so it gets `role="tooltip"` + `aria-describedby` and opens
 * on hover/focus). Put the trigger in the `trigger` slot and the text in the
 * default slot.
 *
 * ```html
 * <wmcp-tooltip>
 *   <button slot="trigger" aria-label="Copy">⧉</button>
 *   Copy to clipboard
 * </wmcp-tooltip>
 * ```
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpTooltip extends WmcpPopover {
  static readonly tagName = 'wmcp-tooltip';

  constructor() {
    super();
    this.trigger = 'hover';
  }

  protected override get defaultNameSuffix(): string {
    return 'tooltip';
  }
}
