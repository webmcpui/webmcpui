import { LitElement, html, css, type CSSResultGroup, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/** Visual variants `<wmcp-badge>` supports (shadcn-aligned). */
export type WmcpBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline';

/**
 * `<wmcp-badge>` — a small status/label pill. Purely presentational: it exposes
 * no WebMCP tool (an agent reads its text from the accessibility tree), so it
 * extends `LitElement` directly rather than an exposure base.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpBadge extends LitElement {
  static readonly tagName = 'wmcp-badge';

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--badge-gap, 0.25rem);
      padding: var(--badge-padding, 0.125rem 0.5rem);
      font-family: var(--badge-font-family, ui-sans-serif, system-ui, sans-serif);
      font-size: var(--badge-font-size, 0.75rem);
      font-weight: var(--badge-font-weight, 500);
      line-height: 1.2;
      border: 1px solid transparent;
      border-radius: var(--badge-radius, 999px);
      white-space: nowrap;
    }
    :host([hidden]) {
      display: none;
    }
    :host {
      color: var(--badge-primary-text, var(--primary-foreground, oklch(0.985 0 0)));
      background: var(--badge-primary-bg, var(--primary, oklch(0.205 0 0)));
    }
    :host([variant='secondary']) {
      color: var(--badge-secondary-text, var(--secondary-foreground, oklch(0.205 0 0)));
      background: var(--badge-secondary-bg, var(--secondary, oklch(0.97 0 0)));
    }
    :host([variant='destructive']) {
      color: var(--badge-destructive-text, var(--destructive-foreground, oklch(0.985 0 0)));
      background: var(--badge-destructive-bg, var(--destructive, oklch(0.577 0.245 27.325)));
    }
    :host([variant='outline']) {
      color: var(--badge-outline-text, var(--foreground, oklch(0.145 0 0)));
      border-color: var(--badge-outline-border, var(--border, oklch(0.922 0 0)));
    }
  `;

  /** Visual variant. */
  @property({ reflect: true }) variant: WmcpBadgeVariant = 'primary';

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}
