import { html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { WmcpFormControl } from './form-control.js';
import type { JSONSchema } from '../webmcp.js';

export interface WmcpRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let groupCounter = 0;

/**
 * `<wmcp-radio>` — a data member of a `<wmcp-radio-group>`.
 *
 * Like `<option>` is to `<select>`: it carries `value` / `label` / `disabled`
 * and renders nothing itself. The group reads these and renders the actual
 * radio inputs. Registered so it hides itself when used declaratively.
 */
export class WmcpRadio extends HTMLElement {
  static readonly tagName = 'wmcp-radio';

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  get label(): string {
    return this.getAttribute('label') ?? this.textContent?.trim() ?? '';
  }
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  connectedCallback(): void {
    this.style.display = 'none';
  }
}

/**
 * `<wmcp-radio-group>` — a form-associated, agent-operable single-choice group.
 *
 * The group is the form participant (owns name, value, validation, exposure);
 * `<wmcp-radio>` children are data. The group renders the native radio inputs
 * in its own shadow DOM under one internal name, so native single-selection,
 * roving tabindex, and arrow-key navigation all work. Options come from
 * declarative `<wmcp-radio>` children or the `options` property.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpRadioGroup extends WmcpFormControl {
  static readonly tagName = 'wmcp-radio-group';

  static styles = [
    WmcpFormControl.styles,
    css`
      .group-label {
        font-size: var(--input-font-size-label, 0.875rem);
        font-weight: var(--input-font-weight-label, 500);
        color: var(--input-label, var(--foreground, oklch(0.145 0 0)));
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: var(--input-gap-label, 0.375rem);
      }
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
        width: var(--radio-size, 1.05rem);
        height: var(--radio-size, 1.05rem);
        margin: 0;
        accent-color: var(--radio-accent, var(--primary, oklch(0.205 0 0)));
        cursor: inherit;
      }
      .control:focus-visible {
        outline: none;
        border-radius: 50%;
        box-shadow: 0 0 0 var(--ring-width, 3px)
          color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
      }
      .label-text {
        font-size: var(--input-font-size, 0.875rem);
        color: var(--input-text, var(--foreground, oklch(0.145 0 0)));
      }
    `,
  ];

  /** Options as data. When non-empty, takes precedence over `<wmcp-radio>`. */
  @property({ attribute: false }) options: WmcpRadioOption[] = [];

  @state() private resolvedOptions: WmcpRadioOption[] = [];

  private optionObserver?: MutationObserver;

  /** Internal name shared by the rendered inputs (groups them natively). */
  private readonly groupName = `wmcp-radio-${++groupCounter}`;

  protected override get controlNoun(): string {
    return 'radio';
  }

  override connectedCallback(): void {
    this.syncOptions();
    super.connectedCallback();
    this.optionObserver = new MutationObserver(() => this.syncOptions());
    this.optionObserver.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.optionObserver?.disconnect();
    this.optionObserver = undefined;
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('options')) this.syncOptions();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (this.expose && changed.has('resolvedOptions')) {
      this.registerTool();
    }
  }

  private syncOptions(): void {
    this.resolvedOptions =
      this.options.length > 0 ? this.options : this.readDeclarativeOptions();
  }

  private readDeclarativeOptions(): WmcpRadioOption[] {
    return Array.from(this.querySelectorAll(':scope > wmcp-radio')).map(
      (el) => ({
        value: el.getAttribute('value') ?? '',
        label: el.getAttribute('label') ?? el.textContent?.trim() ?? '',
        disabled: el.hasAttribute('disabled'),
      }),
    );
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          enum: this.resolvedOptions.map((o) => o.value),
          description: this.label || this.name || 'The option value to select.',
        },
      },
      required: ['value'],
    };
  }

  private async onSelect(event: Event): Promise<void> {
    this.value = (event.target as HTMLInputElement).value;
    await this.validate();
  }

  protected override renderControl() {
    return html`
      <div
        class="group"
        role="radiogroup"
        aria-labelledby=${this.label ? 'group-label' : nothing}
        aria-describedby=${this.describedBy ?? nothing}
        aria-invalid=${this.error ? 'true' : 'false'}
      >
        ${repeat(
          this.resolvedOptions,
          (o) => o.value,
          (o) => html`
            <label class="row">
              <input
                type="radio"
                class="control"
                part="control"
                name=${this.groupName}
                value=${o.value}
                ?disabled=${o.disabled ?? this.disabled}
                .checked=${o.value === this.value}
                @change=${this.onSelect}
              />
              <span class="label-text">${o.label}</span>
            </label>
          `,
        )}
      </div>
    `;
  }

  override render() {
    return html`
      ${this.label
        ? html`<span id="group-label" class="group-label">${this.label}</span>`
        : nothing}
      ${this.renderControl()}
      ${this.renderMessage()}
    `;
  }
}
