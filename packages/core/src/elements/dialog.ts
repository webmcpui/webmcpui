import {
  html,
  css,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpAction } from './action.js';
import type { WebMCPToolResult } from '@webmcpui/webmcp';

/**
 * `<wmcp-dialog>` — a modal dialog whose *action* is being opened. The second
 * Phase 2 interaction primitive, and the one that motivated the shared
 * {@link WmcpAction} base.
 *
 * It wraps the native `<dialog>` element, so it inherits the platform's focus
 * trap, top-layer stacking, backdrop, and Escape-to-close for free. The
 * exposed WebMCP action is **open** — the agent surfaces the dialog for the
 * user to review; closing/confirming stays a deliberate human (or
 * programmatic) step. That asymmetry is the consent gate: an agent can ask for
 * attention, but the irreversible confirm is the person's to make.
 *
 * Drive it declaratively with the reflected `open` attribute or imperatively
 * with {@link show} / {@link close}; either way it emits composed `open` and
 * `close` events. With no agent present it is simply an accessible modal.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpDialog extends WmcpAction {
  static readonly tagName = 'wmcp-dialog';

  static styles: CSSResultGroup = css`
    :host {
      display: contents;
    }
    dialog {
      box-sizing: border-box;
      width: var(--dialog-width, min(92vw, 32rem));
      max-width: var(--dialog-max-width, 32rem);
      max-height: var(--dialog-max-height, 85dvh);
      color: var(--dialog-text, var(--popover-foreground, oklch(0.145 0 0)));
      background: var(--dialog-bg, var(--popover, oklch(1 0 0)));
      border: var(--dialog-border-width, 1px) solid
        var(--dialog-border, var(--border, oklch(0.922 0 0)));
      border-radius: var(--dialog-radius, var(--radius, 0.625rem));
      box-shadow: var(
        --dialog-shadow,
        0 10px 38px -10px color-mix(in oklch, oklch(0 0 0) 35%, transparent),
        0 10px 20px -15px color-mix(in oklch, oklch(0 0 0) 20%, transparent)
      );
      font-family: var(
        --dialog-font-family,
        ui-sans-serif,
        system-ui,
        sans-serif
      );
      overflow: auto;
    }
    dialog::backdrop {
      background: var(
        --dialog-backdrop,
        color-mix(in oklch, oklch(0 0 0) 50%, transparent)
      );
    }
    /* Padding lives on the panel, not the dialog, so the dialog's box is the
       panel's box — a click whose target is the <dialog> is unambiguously the
       backdrop, never the dialog's own visible frame. */
    .panel {
      padding: var(--dialog-padding, 1.5rem);
    }
    /* Modern-CSS entrance: fade + lift, honoring reduced-motion. */
    @media (prefers-reduced-motion: no-preference) {
      dialog,
      dialog::backdrop {
        transition: opacity var(--dialog-transition-duration, 180ms)
            var(--dialog-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
          translate var(--dialog-transition-duration, 180ms)
            var(--dialog-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
          overlay var(--dialog-transition-duration, 180ms) allow-discrete,
          display var(--dialog-transition-duration, 180ms) allow-discrete;
      }
      dialog:not([open]),
      dialog:not([open])::backdrop {
        opacity: 0;
      }
      dialog:not([open]) {
        translate: 0 0.5rem;
      }
      @starting-style {
        dialog[open],
        dialog[open]::backdrop {
          opacity: 0;
        }
        dialog[open] {
          translate: 0 0.5rem;
        }
      }
    }
  `;

  /** Whether the dialog is open (reflected, so `[open]` styling works). */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Open as a modal (focus-trapping, with backdrop). Set false for non-modal. */
  @property({ type: Boolean }) modal = true;

  /** Keep the dialog open when the backdrop is clicked (modal "static" mode). */
  @property({ type: Boolean, attribute: 'static-backdrop' }) staticBackdrop =
    false;

  /** Last `returnValue` the dialog closed with (mirrors native `<dialog>`). */
  returnValue = '';

  private get dialogEl(): HTMLDialogElement | null {
    return this.renderRoot?.querySelector('dialog') ?? null;
  }

  // --- WmcpAction hooks ---------------------------------------------------

  protected override get actionVerb(): string {
    return 'open';
  }

  protected override get defaultNameSuffix(): string {
    return 'dialog';
  }

  protected override get defaultToolDescription(): string {
    return `Open the "${this.actionNoun}" dialog for the user to review.`;
  }

  protected override executeTool(): WebMCPToolResult {
    const noun = this.actionNoun;
    if (this.open) {
      return {
        content: [
          { type: 'text', text: `The "${noun}" dialog is already open.` },
        ],
      };
    }
    this.show();
    return {
      content: [
        {
          type: 'text',
          text: `Opened the "${noun}" dialog for the user to review.`,
        },
      ],
    };
  }

  // --- Open / close -------------------------------------------------------

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('open')) this.syncNativeOpen();
  }

  /** Open the dialog (modal unless `modal` is false). */
  show(): void {
    this.open = true;
  }

  /** Close the dialog, optionally recording a `returnValue`. */
  close(returnValue?: string): void {
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.open = false;
  }

  /** Reconcile our `open` state with the native dialog's imperative API. */
  private syncNativeOpen(): void {
    const d = this.dialogEl;
    if (!d) return;
    if (this.open && !d.open) {
      if (this.modal) d.showModal();
      else d.show();
      this.dispatchEvent(new Event('open', { bubbles: true, composed: true }));
    } else if (!this.open && d.open) {
      d.close(this.returnValue);
    }
  }

  /** Native `close` fires for Escape, backdrop, or our own `close()`. */
  private onNativeClose(): void {
    this.returnValue = this.dialogEl?.returnValue ?? this.returnValue;
    if (this.open) this.open = false;
    this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
  }

  /**
   * Close on a backdrop click. A click whose target is the `<dialog>` itself
   * is the backdrop — content clicks retarget to `.panel` or its children — so
   * this never fires on the dialog's own frame or a text drag-select.
   */
  private onDialogClick(event: MouseEvent): void {
    if (this.staticBackdrop) return;
    if (event.target === this.dialogEl) this.close();
  }

  override render(): TemplateResult {
    return html`
      <dialog
        part="dialog"
        aria-label=${this.label || this.actionNoun}
        @close=${this.onNativeClose}
        @click=${this.onDialogClick}
      >
        <div class="panel" part="panel">
          <slot></slot>
        </div>
      </dialog>
    `;
  }
}
