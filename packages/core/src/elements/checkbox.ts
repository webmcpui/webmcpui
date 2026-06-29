import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpFormControl } from './form-control.js';
import type { JSONSchema } from '../webmcp.js';

/**
 * `<wmcp-checkbox>` — a form-associated, agent-operable boolean checkbox.
 *
 * The first non-string control. Its primary state is the boolean `checked`;
 * `value` is the string submitted to the form *when checked* (native default
 * `"on"`). This is why {@link WmcpFormControl} exposes hooks: checkbox overrides
 * `getFormValue` (conditional), `validationValue` (the boolean),
 * `applyAgentValue` / `toolInputSchema` (a `checked` boolean), and
 * `formResetCallback` (restore the initial checked state).
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpCheckbox extends WmcpFormControl {
  static readonly tagName = 'wmcp-checkbox';

  static styles = [
    WmcpFormControl.styles,
    css`
      .row {
        display: inline-flex;
        align-items: center;
        gap: var(--input-gap-icon, 0.5rem);
        cursor: pointer;
        font-weight: 400;
      }
      .row:has(.control:disabled) {
        cursor: not-allowed;
        color: var(
          --input-text-disabled,
          var(--muted-foreground, oklch(0.556 0 0))
        );
      }
      .control {
        box-sizing: border-box;
        width: var(--checkbox-size, 1.05rem);
        height: var(--checkbox-size, 1.05rem);
        margin: 0;
        accent-color: var(--checkbox-accent, var(--primary, oklch(0.205 0 0)));
        cursor: inherit;
      }
      .control:focus-visible {
        outline: none;
        border-radius: 0.25rem;
        box-shadow: 0 0 0 var(--ring-width, 3px)
          color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
      }
      .label-text {
        font-size: var(--input-font-size, 0.875rem);
        color: var(--input-text, var(--foreground, oklch(0.145 0 0)));
      }
    `,
  ];

  /** Whether the box is checked. */
  @property({ type: Boolean, reflect: true }) checked = false;

  private defaultChecked = false;

  constructor() {
    super();
    // A checkbox submits this value when checked (native default is "on").
    this.value = 'on';
  }

  protected override get controlNoun(): string {
    return 'checkbox';
  }

  override connectedCallback(): void {
    this.defaultChecked = this.checked;
    super.connectedCallback();
  }

  protected override getFormValue(): string | File | FormData | null {
    return this.checked ? this.value : null;
  }

  protected override get validationValue(): unknown {
    return this.checked;
  }

  protected override get isEmpty(): boolean {
    return !this.checked;
  }

  protected override get requiredMessageDefault(): string {
    return 'Please check this box.';
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        checked: {
          type: 'boolean',
          description:
            this.label || this.name || 'Whether the box is checked.',
        },
      },
      required: ['checked'],
    };
  }

  protected override async applyAgentValue(
    args: Record<string, unknown>,
  ): Promise<void> {
    this.checked = Boolean(args.checked);
    await this.validate();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  protected override stateDescription(): string {
    return this.checked ? 'checked' : 'unchecked';
  }

  override formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.error = '';
    this.toggleAttribute('invalid', false);
    void this.validate(false);
  }

  private async onToggle(event: Event): Promise<void> {
    this.checked = (event.target as HTMLInputElement).checked;
    await this.validate();
  }

  protected override renderControl() {
    return html`
      <input
        id="control"
        class="control"
        part="control"
        type="checkbox"
        .checked=${this.checked}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${this.describedBy ?? nothing}
        @change=${this.onToggle}
      />
    `;
  }

  override render() {
    return html`
      <label class="row">
        ${this.renderControl()}
        ${this.label
          ? html`<span class="label-text">${this.label}</span>`
          : nothing}
      </label>
      ${this.renderMessage()}
    `;
  }
}
