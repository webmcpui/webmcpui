import {
  LitElement,
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';

/** Severity variants `<wmcp-alert>` supports. */
export type WmcpAlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * `<wmcp-alert>` — an inline callout for a persistent message. Presentational
 * (no WebMCP tool; an agent reads it from the a11y tree). Gets `role="alert"`
 * for `error`/`warning`, `role="status"` otherwise. Optional `title`; the
 * message is the default slot.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpAlert extends LitElement {
  static readonly tagName = 'wmcp-alert';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--alert-padding, 0.75rem 1rem);
      color: var(--alert-text, var(--foreground, oklch(0.145 0 0)));
      background: var(--alert-bg, var(--background, oklch(1 0 0)));
      border: 1px solid var(--alert-border, var(--border, oklch(0.922 0 0)));
      border-left: 3px solid var(--alert-accent, var(--border, oklch(0.922 0 0)));
      border-radius: var(--alert-radius, var(--radius, 0.625rem));
      font-family: var(--alert-font-family, ui-sans-serif, system-ui, sans-serif);
      font-size: var(--alert-font-size, 0.875rem);
    }
    :host([hidden]) {
      display: none;
    }
    :host([variant='success']) {
      --alert-accent: var(--alert-accent-success, oklch(0.627 0.13 160));
    }
    :host([variant='warning']) {
      --alert-accent: var(--alert-accent-warning, oklch(0.7 0.16 75));
    }
    :host([variant='error']) {
      --alert-accent: var(--alert-accent-error, var(--destructive, oklch(0.577 0.245 27.325)));
    }
    :host([variant='info']) {
      --alert-accent: var(--alert-accent-info, var(--primary, oklch(0.205 0 0)));
    }
    .title {
      font-weight: 600;
      margin-bottom: 0.125rem;
    }
    .message {
      color: var(--alert-message, var(--muted-foreground, oklch(0.556 0 0)));
    }
  `;

  /** Severity. */
  @property({ reflect: true }) variant: WmcpAlertVariant = 'info';

  /** Optional bold heading above the message. */
  @property() title = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute(
      'role',
      this.variant === 'error' || this.variant === 'warning' ? 'alert' : 'status',
    );
  }

  override render(): TemplateResult {
    return html`
      ${this.title ? html`<div class="title">${this.title}</div>` : nothing}
      <div class="message"><slot></slot></div>
    `;
  }
}
