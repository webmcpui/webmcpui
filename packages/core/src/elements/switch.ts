import {
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpFormControl } from './form-control.js';
import type { JSONSchema } from '../webmcp.js';

/**
 * `<wmcp-switch>` — a form-associated, agent-operable toggle.
 *
 * A boolean control like `<wmcp-checkbox>`, but presented as a switch
 * (`role="switch"`) — on/off rather than checked/unchecked. Its state is the
 * boolean `checked`; `value` is the string submitted to the form *when on*.
 * (checkbox and switch are two boolean controls now — a shared
 * `WmcpBooleanControl` base is a future extraction.)
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpSwitch extends WmcpFormControl {
  static readonly tagName = 'wmcp-switch';

  static styles: CSSResultGroup = [
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
        color: var(--input-text-disabled, var(--muted-foreground, oklch(0.556 0 0)));
      }
      .control {
        appearance: none;
        box-sizing: border-box;
        position: relative;
        flex-shrink: 0;
        width: var(--switch-width, 2.25rem);
        height: var(--switch-height, 1.35rem);
        margin: 0;
        padding: 0;
        border-radius: 999px;
        background: var(--switch-track, var(--input, oklch(0.922 0 0)));
        cursor: inherit;
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .control::before {
        content: '';
        position: absolute;
        top: 50%;
        left: var(--switch-gap, 0.15rem);
        width: var(--switch-thumb, 1.05rem);
        height: var(--switch-thumb, 1.05rem);
        border-radius: 50%;
        background: var(--switch-thumb-color, var(--background, oklch(1 0 0)));
        translate: 0 -50%;
        transition: translate 150ms cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 2px color-mix(in oklch, oklch(0 0 0) 25%, transparent);
      }
      .control:checked {
        background: var(--switch-track-on, var(--primary, oklch(0.205 0 0)));
      }
      .control:checked::before {
        translate: calc(var(--switch-width, 2.25rem) - var(--switch-thumb, 1.05rem) - var(--switch-gap, 0.15rem) * 2) -50%;
      }
      .control:focus-visible {
        outline: none;
        box-shadow: 0 0 0 var(--ring-width, 3px)
          color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
      }
      .control:disabled {
        opacity: 0.5;
      }
      .label-text {
        font-size: var(--input-font-size, 0.875rem);
        color: var(--input-text, var(--foreground, oklch(0.145 0 0)));
      }
    `,
  ];

  /** Whether the switch is on. */
  @property({ type: Boolean, reflect: true }) checked = false;

  private defaultChecked = false;

  constructor() {
    super();
    // Submits this value to the form when on (native checkbox default is "on").
    this.value = 'on';
  }

  protected override get controlNoun(): string {
    return 'switch';
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
    return 'Please turn this on.';
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        checked: {
          type: 'boolean',
          description: this.label || this.name || 'Whether the switch is on.',
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
    return this.checked ? 'on' : 'off';
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

  protected override renderControl(): TemplateResult {
    return html`
      <input
        id="control"
        class="control"
        part="control"
        type="checkbox"
        role="switch"
        .checked=${this.checked}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${this.describedBy ?? nothing}
        @change=${this.onToggle}
      />
    `;
  }

  override render(): TemplateResult {
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
