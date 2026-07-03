import { LitElement, css, type CSSResultGroup } from 'lit';

/**
 * `<wmcp-skeleton>` — a loading placeholder block. Presentational and
 * decorative (`aria-hidden`); size it with `width`/`height` styles. Pulses
 * unless `prefers-reduced-motion`.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpSkeleton extends LitElement {
  static readonly tagName = 'wmcp-skeleton';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      height: var(--skeleton-height, 1rem);
      background: var(--skeleton-bg, var(--muted, oklch(0.97 0 0)));
      border-radius: var(--skeleton-radius, var(--radius, 0.625rem));
    }
    :host([hidden]) {
      display: none;
    }
    @media (prefers-reduced-motion: no-preference) {
      :host {
        animation: skeleton-pulse 1.6s ease-in-out infinite;
      }
      @keyframes skeleton-pulse {
        50% {
          opacity: 0.55;
        }
      }
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }
}
