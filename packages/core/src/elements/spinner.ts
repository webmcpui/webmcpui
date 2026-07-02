import { LitElement, css, type CSSResultGroup, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * `<wmcp-spinner>` — an indeterminate loading indicator. Presentational;
 * `role="status"` with an accessible `label` (default "Loading…"). Stops
 * animating under `prefers-reduced-motion`.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpSpinner extends LitElement {
  static readonly tagName = 'wmcp-spinner';

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      width: var(--spinner-size, 1.25rem);
      height: var(--spinner-size, 1.25rem);
      border: var(--spinner-width, 2px) solid
        var(--spinner-track, var(--secondary, oklch(0.97 0 0)));
      border-top-color: var(--spinner-color, var(--primary, oklch(0.205 0 0)));
      border-radius: 50%;
    }
    :host([hidden]) {
      display: none;
    }
    @media (prefers-reduced-motion: no-preference) {
      :host {
        animation: spinner-rotate 0.6s linear infinite;
      }
      @keyframes spinner-rotate {
        to {
          rotate: 360deg;
        }
      }
    }
  `;

  /** Accessible label for assistive tech. */
  @property() label = 'Loading…';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'status');
  }

  override updated(changed: PropertyValues<this>): void {
    // `label` is the spinner's accessible name; keep aria-label in sync with it
    // (also runs on first render, so the name is set once mounted).
    if (changed.has('label')) this.setAttribute('aria-label', this.label);
  }
}
