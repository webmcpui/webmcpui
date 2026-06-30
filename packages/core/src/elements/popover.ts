import {
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpAction } from './action.js';
import type { WebMCPToolResult } from '../webmcp.js';

/** Where the panel sits relative to its trigger. */
export type WmcpPopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

/** How the popover is opened: clicked (interactive) or hovered (tooltip). */
export type WmcpPopoverTrigger = 'click' | 'hover';

/**
 * `<wmcp-popover>` — a non-modal, anchored floating panel whose exposed action
 * is being opened. The sibling of [dialog](./dialog.ts) (modal) and
 * [menu](./menu.ts) (action list): same native-Popover-API + CSS-anchor
 * machinery as the menu, but the content is arbitrary.
 *
 * `trigger="click"` (default) gives an interactive popover — click to toggle,
 * with light-dismiss and Escape for free. `trigger="hover"` gives a tooltip —
 * it opens on hover/focus, closes on leave/blur, and labels its trigger via
 * `aria-describedby`. Either way the agent can `open` it; closing stays a
 * human/light-dismiss step, the same consent posture as the dialog.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpPopover extends WmcpAction {
  static readonly tagName = 'wmcp-popover';

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      font-family: var(
        --popover-font-family,
        var(--input-font-family, ui-sans-serif, system-ui, sans-serif)
      );
    }
    :host([hidden]) {
      display: none;
    }
    .trigger {
      appearance: none;
      font: inherit;
      cursor: pointer;
      anchor-name: --wmcp-pop-anchor;
      /* Unstyled by default so any trigger content (text, a button, an icon)
         sits flush; consumers theme via ::part(trigger). */
      border: 0;
      background: none;
      padding: 0;
      color: inherit;
    }
    .panel {
      box-sizing: border-box;
      width: max-content;
      max-width: var(--popover-max-width, 18rem);
      margin: 0;
      padding: var(--popover-padding, 0.75rem 0.875rem);
      color: var(--popover-text, var(--popover-foreground, oklch(0.145 0 0)));
      background: var(--popover-bg, var(--popover, oklch(1 0 0)));
      border: 1px solid var(--popover-border, var(--border, oklch(0.922 0 0)));
      border-radius: var(--popover-radius, var(--radius, 0.625rem));
      box-shadow: var(
        --popover-shadow,
        0 10px 38px -10px color-mix(in oklch, oklch(0 0 0) 35%, transparent)
      );
      font-size: var(--popover-font-size, 0.875rem);
      position-anchor: --wmcp-pop-anchor;
      inset: auto;
    }
    :host([placement='bottom']) .panel {
      top: anchor(bottom);
      left: anchor(left);
      margin-top: var(--popover-offset, 0.4rem);
    }
    :host([placement='top']) .panel {
      bottom: anchor(top);
      left: anchor(left);
      margin-bottom: var(--popover-offset, 0.4rem);
    }
    :host([placement='right']) .panel {
      left: anchor(right);
      top: anchor(top);
      margin-left: var(--popover-offset, 0.4rem);
    }
    :host([placement='left']) .panel {
      right: anchor(left);
      top: anchor(top);
      margin-right: var(--popover-offset, 0.4rem);
    }
    @media (prefers-reduced-motion: no-preference) {
      .panel {
        transition: opacity 130ms ease, translate 130ms ease,
          overlay 130ms allow-discrete, display 130ms allow-discrete;
      }
      .panel:not(:popover-open) {
        opacity: 0;
        translate: 0 -0.25rem;
      }
      @starting-style {
        .panel:popover-open {
          opacity: 0;
          translate: 0 -0.25rem;
        }
      }
    }
  `;

  /** Whether the panel is open (reflected). */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Trigger text, used when no `trigger` slot content is provided. */
  @property() label = '';

  /** Panel placement relative to the trigger. */
  @property({ reflect: true }) placement: WmcpPopoverPlacement = 'bottom';

  /** Open on click (interactive popover) or on hover/focus (tooltip). */
  @property() trigger: WmcpPopoverTrigger = 'click';

  private get panelEl(): HTMLElement | null {
    return this.renderRoot?.querySelector('.panel') ?? null;
  }

  // --- WmcpAction hooks ---------------------------------------------------

  protected override get actionVerb(): string {
    return 'open';
  }

  protected override get defaultNameSuffix(): string {
    return 'popover';
  }

  protected override get defaultToolDescription(): string {
    return `Open the "${this.actionNoun}" popover.`;
  }

  protected override executeTool(): WebMCPToolResult {
    const noun = this.actionNoun;
    if (this.open) {
      return { content: [{ type: 'text', text: `The "${noun}" popover is already open.` }] };
    }
    this.show();
    return { content: [{ type: 'text', text: `Opened the "${noun}" popover.` }] };
  }

  // --- Open / close -------------------------------------------------------

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) this.syncNativeOpen();
  }

  /** Open the popover. */
  show(): void {
    this.open = true;
  }

  /** Close the popover. */
  close(): void {
    this.open = false;
  }

  private syncNativeOpen(): void {
    const p = this.panelEl;
    if (!p) return;
    const isOpen = p.matches(':popover-open');
    if (this.open && !isOpen) p.showPopover();
    else if (!this.open && isOpen) p.hidePopover();
  }

  /** Native toggle fires for clicks, light-dismiss, Escape, and our own calls. */
  private onToggle(event: ToggleEvent): void {
    const opened = event.newState === 'open';
    this.open = opened;
    this.dispatchEvent(
      new Event(opened ? 'open' : 'close', { bubbles: true, composed: true }),
    );
  }

  private onHoverEnter(): void {
    if (this.trigger === 'hover') this.show();
  }

  private onHoverLeave(): void {
    if (this.trigger === 'hover') this.close();
  }

  override render(): TemplateResult {
    const isTooltip = this.trigger === 'hover';
    return html`
      <button
        type="button"
        class="trigger"
        part="trigger"
        popovertarget=${this.trigger === 'click' ? 'wmcp-pop' : nothing}
        aria-haspopup=${isTooltip ? nothing : 'dialog'}
        aria-expanded=${isTooltip ? nothing : this.open ? 'true' : 'false'}
        aria-describedby=${isTooltip ? 'wmcp-pop' : nothing}
        @pointerenter=${this.onHoverEnter}
        @pointerleave=${this.onHoverLeave}
        @focusin=${this.onHoverEnter}
        @focusout=${this.onHoverLeave}
      >
        <slot name="trigger">${this.label}</slot>
      </button>
      <div
        id="wmcp-pop"
        class="panel"
        part="panel"
        popover=${isTooltip ? 'manual' : 'auto'}
        role=${isTooltip ? 'tooltip' : 'dialog'}
        aria-label=${this.label || this.actionNoun}
        @toggle=${this.onToggle}
      >
        <slot></slot>
      </div>
    `;
  }
}
