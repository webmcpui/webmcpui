import {
  LitElement,
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * `<wmcp-avatar>` — a user/entity avatar. Presentational (no WebMCP tool).
 * Shows the `src` image; if it's missing or fails to load, falls back to the
 * `fallback` text (e.g. initials). `alt` provides the accessible name.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpAvatar extends LitElement {
  static readonly tagName = 'wmcp-avatar';

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--avatar-size, 2.5rem);
      height: var(--avatar-size, 2.5rem);
      overflow: hidden;
      border-radius: var(--avatar-radius, 50%);
      background: var(--avatar-bg, var(--muted, oklch(0.97 0 0)));
      color: var(--avatar-text, var(--muted-foreground, oklch(0.556 0 0)));
      font-family: var(--avatar-font-family, ui-sans-serif, system-ui, sans-serif);
      font-size: var(--avatar-font-size, 0.875rem);
      font-weight: var(--avatar-font-weight, 500);
      user-select: none;
    }
    :host([hidden]) {
      display: none;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  /** Image URL. */
  @property() src = '';

  /** Accessible name for the image. */
  @property() alt = '';

  /** Text shown when there's no image (e.g. initials). */
  @property() fallback = '';

  @state() private failed = false;

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('src')) this.failed = false;
  }

  override render(): TemplateResult {
    const showImg = this.src && !this.failed;
    return showImg
      ? html`<img
          src=${this.src}
          alt=${this.alt || nothing}
          @error=${() => (this.failed = true)}
        />`
      : html`<span aria-label=${this.alt || nothing}>${this.fallback}</span>`;
  }
}
