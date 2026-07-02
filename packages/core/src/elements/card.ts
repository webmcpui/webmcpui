import { LitElement, html, css, type CSSResultGroup, type TemplateResult } from 'lit';

/**
 * `<wmcp-card>` — a surface container. Purely presentational (no WebMCP tool);
 * content is slotted so consumers compose freely. Padding, border, radius, and
 * an optional elevation shadow are themeable.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpCard extends LitElement {
  static readonly tagName = 'wmcp-card';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--card-padding, 1.25rem);
      color: var(--card-text, var(--card-foreground, oklch(0.145 0 0)));
      background: var(--card-bg, var(--card, oklch(1 0 0)));
      border: 1px solid var(--card-border, var(--border, oklch(0.922 0 0)));
      border-radius: var(--card-radius, var(--radius, 0.625rem));
      box-shadow: var(--card-shadow, none);
      font-family: var(--card-font-family, ui-sans-serif, system-ui, sans-serif);
    }
    :host([hidden]) {
      display: none;
    }
  `;

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}
