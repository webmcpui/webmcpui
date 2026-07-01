import {
  LitElement,
  html,
  css,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';

/**
 * `<wmcp-progress>` — a determinate or indeterminate progress bar.
 * Presentational (no WebMCP tool). `role="progressbar"` with `aria-valuenow` /
 * `aria-valuemax` wired from `value` / `max`; omit `value` (or set
 * `indeterminate`) for an animated indeterminate bar.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpProgress extends LitElement {
  static readonly tagName = 'wmcp-progress';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      height: var(--progress-height, 0.5rem);
      overflow: hidden;
      background: var(--progress-track, var(--secondary, oklch(0.97 0 0)));
      border-radius: var(--progress-radius, 999px);
    }
    :host([hidden]) {
      display: none;
    }
    .bar {
      height: 100%;
      background: var(--progress-bar, var(--primary, oklch(0.205 0 0)));
      border-radius: inherit;
      transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bar.indeterminate {
      width: 40% !important;
      animation: progress-slide 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes progress-slide {
      from {
        translate: -100%;
      }
      to {
        translate: 350%;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .bar.indeterminate {
        animation: none;
        width: 100% !important;
        opacity: 0.5;
      }
    }
  `;

  /** Current value; leave unset for indeterminate. */
  @property({ type: Number }) value?: number;

  /** Maximum value. */
  @property({ type: Number }) max = 100;

  /** Force the indeterminate (animated) state. */
  @property({ type: Boolean }) indeterminate = false;

  private get isIndeterminate(): boolean {
    return this.indeterminate || this.value == null;
  }

  override updated(): void {
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(this.max));
    if (this.isIndeterminate) this.removeAttribute('aria-valuenow');
    else this.setAttribute('aria-valuenow', String(this.value));
  }

  override render(): TemplateResult {
    const pct = this.isIndeterminate
      ? 0
      : Math.max(0, Math.min(100, ((this.value ?? 0) / this.max) * 100));
    return html`<div
      class="bar ${this.isIndeterminate ? 'indeterminate' : ''}"
      style=${this.isIndeterminate ? '' : `width: ${pct}%`}
    ></div>`;
  }
}
