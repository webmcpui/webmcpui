import { LitElement, html, css, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import {
  isStandardSchema,
  validateStandard,
  type StandardSchemaV1,
} from '../standard-schema.js';
import { exposeTool, type JSONSchema, type ToolDisposer } from '../webmcp.js';

export type WmcpInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date';

/**
 * `<wmcp-input>` — a form-associated, agent-operable text input.
 *
 * - Participates in native `<form>` submission/reset/validation via
 *   ElementInternals (`formAssociated`).
 * - Validates against any Standard Schema set on the `schema` property.
 * - Exposes a WebMCP tool so an external agent can fill it (feature-detected;
 *   a no-op when no agent is present).
 * - Themed entirely through the `@webmcpui/tokens` CSS custom properties, with
 *   inline fallbacks so it renders correctly even without the token stylesheet.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle) to
 * register `<wmcp-input>`.
 */
export class WmcpInput extends LitElement {
  static readonly tagName = 'wmcp-input';
  static formAssociated = true;

  static styles = css`
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: var(--input-gap-label, 0.375rem);
      font-family: var(
        --input-font-family,
        ui-sans-serif,
        system-ui,
        sans-serif
      );
    }
    :host([hidden]) {
      display: none;
    }
    label {
      font-size: var(--input-font-size-label, 0.875rem);
      font-weight: var(--input-font-weight-label, 500);
      color: var(--input-label, var(--foreground, oklch(0.145 0 0)));
    }
    input {
      box-sizing: border-box;
      height: var(--input-height-md, 2.25rem);
      padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem);
      font-size: var(--input-font-size, 0.875rem);
      line-height: var(--input-line-height, 1.25rem);
      color: var(--input-text, var(--foreground, oklch(0.145 0 0)));
      background: var(--input-bg, var(--background, oklch(1 0 0)));
      border: var(--input-border-width, 1px) solid
        var(--input-border, var(--input, oklch(0.922 0 0)));
      border-radius: var(--input-radius, var(--radius, 0.625rem));
      transition: border-color
          var(--input-transition-duration, 150ms)
          var(--input-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow var(--input-transition-duration, 150ms)
          var(--input-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
    }
    input::placeholder {
      color: var(--input-placeholder, var(--muted-foreground, oklch(0.556 0 0)));
    }
    input:hover:not(:disabled) {
      border-color: var(--input-border-hover, var(--border, oklch(0.922 0 0)));
    }
    input:focus-visible {
      outline: none;
      border-color: var(--input-border-focus, var(--ring, oklch(0.708 0 0)));
      box-shadow: 0 0 0 var(--ring-width, 3px)
        color-mix(
          in oklch,
          var(--ring, oklch(0.708 0 0)) 40%,
          transparent
        );
    }
    input:disabled {
      color: var(--input-text-disabled, var(--muted-foreground, oklch(0.556 0 0)));
      background: var(--input-bg-disabled, var(--muted, oklch(0.97 0 0)));
      cursor: not-allowed;
    }
    :host([invalid]) input {
      border-color: var(--input-border-error, var(--destructive, oklch(0.577 0.245 27.325)));
    }
    .message {
      font-size: var(--input-font-size-helper, 0.8125rem);
    }
    .helper {
      color: var(--input-helper, var(--muted-foreground, oklch(0.556 0 0)));
    }
    .error {
      color: var(--input-error-text, var(--destructive, oklch(0.577 0.245 27.325)));
    }
  `;

  /** Visible label text. */
  @property() label = '';

  /** Form control name (used for submission and the default tool name). */
  @property() name = '';

  /** HTML input type. */
  @property() type: WmcpInputType = 'text';

  /** Current value (reflected to the form). */
  @property() value = '';

  @property() placeholder = '';

  @property({ type: Boolean, reflect: true }) required = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Helper text shown below the input when there is no error. */
  @property({ attribute: 'helper-text' }) helperText = '';

  /** Whether to expose this input as a WebMCP tool. */
  @property({ type: Boolean }) expose = false;

  /** Override the generated WebMCP tool name. */
  @property({ attribute: 'tool-name' }) toolName = '';

  /** Override the generated WebMCP tool description. */
  @property({ attribute: 'tool-description' }) toolDescription = '';

  /**
   * Standard Schema validator (Zod, Valibot, ArkType, …). Set as a property,
   * not an attribute. Validation runs on input and on form validation.
   */
  @property({ attribute: false })
  schema?: StandardSchemaV1<unknown, unknown>;

  @state() private error = '';

  @query('input') private inputEl!: HTMLInputElement;

  private readonly internals = this.attachInternals();
  private toolDisposer: ToolDisposer = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    this.internals.setFormValue(this.value);
    if (this.expose) this.registerTool();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.toolDisposer();
    this.toolDisposer = () => {};
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('value')) {
      this.internals.setFormValue(this.value);
    }
    if (
      this.expose &&
      (changed.has('expose') ||
        changed.has('name') ||
        changed.has('toolName') ||
        changed.has('toolDescription'))
    ) {
      this.registerTool();
    }
  }

  /** The resolved WebMCP tool name. */
  get resolvedToolName(): string {
    return this.toolName || `fill_${this.name || 'input'}`;
  }

  private registerTool(): void {
    this.toolDisposer();
    this.toolDisposer = exposeTool({
      name: this.resolvedToolName,
      description:
        this.toolDescription ||
        `Set the value of the "${this.label || this.name || 'input'}" field.`,
      inputSchema: this.toolInputSchema(),
      execute: async (args) => {
        const next = args.value;
        await this.setValueFromAgent(next == null ? '' : String(next));
        return {
          content: [
            {
              type: 'text',
              text: this.error
                ? `Set "${this.label || this.name}" but validation failed: ${this.error}`
                : `Set "${this.label || this.name}" to "${this.value}".`,
            },
          ],
          isError: Boolean(this.error),
        };
      },
    });
  }

  private toolInputSchema(): JSONSchema {
    const valueType = this.type === 'number' ? 'number' : 'string';
    return {
      type: 'object',
      properties: {
        value: {
          type: valueType,
          description: this.label || this.name || 'The value to set.',
        },
      },
      required: ['value'],
    };
  }

  /** Apply a value as if a user typed it: update, validate, announce. */
  async setValueFromAgent(value: string): Promise<void> {
    this.value = value;
    await this.validate();
    this.dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    );
    this.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
  }

  private async onInput(event: Event): Promise<void> {
    this.value = (event.target as HTMLInputElement).value;
    await this.validate();
  }

  /** Run schema validation (if any) and reflect the result to the form. */
  async validate(): Promise<boolean> {
    if (!isStandardSchema(this.schema)) {
      this.error = '';
      this.toggleAttribute('invalid', false);
      this.internals.setValidity({});
      return true;
    }
    const outcome = await validateStandard(this.schema, this.value);
    this.error = outcome.valid ? '' : (outcome.errors[0] ?? 'Invalid value');
    this.toggleAttribute('invalid', !outcome.valid);
    if (outcome.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(
        { customError: true },
        this.error,
        this.inputEl ?? undefined,
      );
    }
    return outcome.valid;
  }

  /** Called by the form when it resets. */
  formResetCallback(): void {
    this.value = '';
    this.error = '';
    this.toggleAttribute('invalid', false);
    this.internals.setValidity({});
  }

  override render() {
    const describedBy = this.error
      ? 'wmcp-error'
      : this.helperText
        ? 'wmcp-helper'
        : undefined;
    return html`
      ${this.label
        ? html`<label for="control">${this.label}</label>`
        : nothing}
      <input
        id="control"
        part="input"
        .type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${describedBy ?? nothing}
        @input=${this.onInput}
      />
      ${this.error
        ? html`<span id="wmcp-error" class="message error" role="alert"
            >${this.error}</span
          >`
        : this.helperText
          ? html`<span id="wmcp-helper" class="message helper"
              >${this.helperText}</span
            >`
          : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wmcp-input': WmcpInput;
  }
}
