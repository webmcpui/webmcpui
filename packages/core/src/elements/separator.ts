import { LitElement, css, type CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * `<wmcp-separator>` — a thin rule dividing content. Presentational; exposes no
 * WebMCP tool. `role="separator"` (decorative unless it separates focusable
 * groups). Set `orientation="vertical"` for a vertical divider.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpSeparator extends LitElement {
  static readonly tagName = 'wmcp-separator';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      background: var(--separator-color, var(--border, oklch(0.922 0 0)));
      border: 0;
      flex-shrink: 0;
    }
    :host([hidden]) {
      display: none;
    }
    :host([orientation='horizontal']) {
      width: 100%;
      height: var(--separator-size, 1px);
    }
    :host([orientation='vertical']) {
      width: var(--separator-size, 1px);
      height: 100%;
      align-self: stretch;
    }
  `;

  /** Divider direction. */
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' =
    'horizontal';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'separator');
    if (this.orientation === 'vertical') {
      this.setAttribute('aria-orientation', 'vertical');
    }
  }
}
