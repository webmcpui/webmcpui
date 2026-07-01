import {
  html,
  css,
  nothing,
  type CSSResult,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  isStandardSchema,
  validateStandard,
  type StandardSchemaV1,
} from '../standard-schema.js';
import { WmcpExposable } from './exposable.js';
import type { JSONSchema, WebMCPToolResult } from '../webmcp.js';

/**
 * Base class for form-associated, agent-operable controls.
 *
 * Owns everything shared across the form primitives:
 * - native `<form>` participation via ElementInternals (`formAssociated`)
 * - Standard Schema validation + a11y error wiring
 * - imperative WebMCP exposure (feature-detected, no-op when absent)
 * - label / control / message layout and the shared themed appearance
 *
 * Subclasses implement {@link renderControl} (the actual `<input>` /
 * `<textarea>` / …) and may override {@link controlNoun} and
 * {@link toolInputSchema}. Abstract — not registered on its own.
 */

/**
 * Text-field box appearance for the `.control` element. Used by input,
 * textarea, and select — the controls that render as a bordered field.
 */
export const textFieldStyles: CSSResult = css`
  .control {
    box-sizing: border-box;
    width: 100%;
    padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem);
    font-family: inherit;
    font-size: var(--input-font-size, 0.875rem);
    line-height: var(--input-line-height, 1.25rem);
    color: var(--input-text, var(--foreground, oklch(0.145 0 0)));
    background: var(--input-bg, var(--background, oklch(1 0 0)));
    border: var(--input-border-width, 1px) solid
      var(--input-border, var(--input, oklch(0.922 0 0)));
    border-radius: var(--input-radius, var(--radius, 0.625rem));
    transition: border-color var(--input-transition-duration, 150ms)
        var(--input-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow var(--input-transition-duration, 150ms)
        var(--input-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }
  .control::placeholder {
    color: var(--input-placeholder, var(--muted-foreground, oklch(0.556 0 0)));
  }
  .control:hover:not(:disabled) {
    border-color: var(--input-border-hover, var(--border, oklch(0.922 0 0)));
  }
  .control:focus-visible {
    outline: none;
    border-color: var(--input-border-focus, var(--ring, oklch(0.708 0 0)));
    box-shadow: 0 0 0 var(--ring-width, 3px)
      color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
  }
  .control:disabled {
    color: var(--input-text-disabled, var(--muted-foreground, oklch(0.556 0 0)));
    background: var(--input-bg-disabled, var(--muted, oklch(0.97 0 0)));
    cursor: not-allowed;
  }
  :host([invalid]) .control {
    border-color: var(
      --input-border-error,
      var(--destructive, oklch(0.577 0.245 27.325))
    );
  }
`;

/**
 * Shared base for every `<wmcp-*>` form control: form association via
 * `ElementInternals`, Standard Schema validation, accessible error messaging,
 * and opt-in WebMCP tool exposure. Each concrete element is a thin subclass
 * that supplies its control markup and tool schema. Abstract — not registered
 * on its own.
 */
export abstract class WmcpFormControl extends WmcpExposable {
  static formAssociated = true;

  // Shared by every control: host layout, label, and the message/error text.
  // Text-field box styling lives in `textFieldStyles` (opted into by input /
  // textarea / select) so non-text controls like checkbox don't inherit it.
  static styles: CSSResultGroup = css`
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
    .message {
      font-size: var(--input-font-size-helper, 0.8125rem);
    }
    .helper {
      color: var(--input-helper, var(--muted-foreground, oklch(0.556 0 0)));
    }
    .error {
      color: var(
        --input-error-text,
        var(--destructive, oklch(0.577 0.245 27.325))
      );
    }
  `;

  /** Visible label text. */
  @property() label = '';

  /** Form control name (used for submission and the default tool name). */
  @property({ reflect: true }) name = '';

  /** Current value (reflected to the form). */
  @property() value = '';

  @property() placeholder = '';

  @property({ type: Boolean, reflect: true }) required = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Helper text shown below the control when there is no error. */
  @property({ attribute: 'helper-text' }) helperText = '';

  /** Message shown when a `required` control is empty. */
  @property({ attribute: 'required-message' }) requiredMessage = '';

  // `expose`, `tool-name`, and `tool-description` live on WmcpExposable.

  /**
   * Standard Schema validator (Zod, Valibot, ArkType, …). Set as a property,
   * not an attribute. Validation runs on input and on form validation.
   */
  @property({ attribute: false })
  schema?: StandardSchemaV1<unknown, unknown>;

  @state() protected error = '';

  protected readonly internals: ElementInternals = this.attachInternals();

  /** Noun used in default tool names/descriptions when `name` is empty. */
  protected get controlNoun(): string {
    return 'field';
  }

  /** The rendered control element (`<input>` / `<textarea>` / `<select>`). */
  protected get control():
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null {
    return this.renderRoot?.querySelector('input, textarea, select') ?? null;
  }

  /** Id to point the control's `aria-describedby` at, if any. */
  protected get describedBy(): string | undefined {
    return this.error ? 'wmcp-error' : this.helperText ? 'wmcp-helper' : undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback(); // WmcpExposable registers the tool if [expose].
    this.syncFormValue();
    this.addEventListener('invalid', this.onInvalid);
    // Establish initial validity (e.g. a required-empty field) without
    // surfacing the message until the form is reported.
    void this.validate(false);
  }

  /**
   * The value contributed to the containing form. Defaults to the string
   * `value`; controls with a conditional contribution (e.g. an unchecked
   * checkbox) override this and may return `null` to contribute nothing.
   */
  protected getFormValue(): string | File | FormData | null {
    return this.value;
  }

  /** Push the current form value into ElementInternals. */
  protected syncFormValue(): void {
    this.internals.setFormValue(this.getFormValue());
  }

  /**
   * The value passed to the schema validator. Defaults to the string `value`;
   * boolean controls (checkbox) override to validate their checked state.
   */
  protected get validationValue(): unknown {
    return this.value;
  }

  /**
   * Whether the control counts as empty for the `required` constraint.
   * Defaults to an empty string value; boolean controls (checkbox) override.
   */
  protected get isEmpty(): boolean {
    return this.value === '';
  }

  /** Default message for the `required` constraint when none is provided. */
  protected get requiredMessageDefault(): string {
    return 'This field is required.';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback(); // WmcpExposable disposes the tool.
    this.removeEventListener('invalid', this.onInvalid);
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed); // WmcpExposable re-registers / disposes the tool.
    this.syncFormValue();
  }

  override get resolvedToolName(): string {
    return this.toolName || `fill_${this.name || this.controlNoun}`;
  }

  protected override get defaultToolDescription(): string {
    return `Set the value of the "${this.label || this.name || this.controlNoun}" field.`;
  }

  protected override get toolReactiveProps(): readonly string[] {
    return [...super.toolReactiveProps, 'name'];
  }

  protected override async executeTool(
    args: Record<string, unknown>,
  ): Promise<WebMCPToolResult> {
    const noun = this.label || this.name || this.controlNoun;
    await this.applyAgentValue(args);
    return {
      content: [
        {
          type: 'text',
          text: this.error
            ? `Set "${noun}" but validation failed: ${this.error}`
            : `Set "${noun}" to "${this.stateDescription()}".`,
        },
      ],
      isError: Boolean(this.error),
    };
  }

  /**
   * Apply the agent's tool arguments to component state. Defaults to treating
   * `args.value` as the new string value; controls with a different shape
   * (e.g. checkbox's `args.checked`) override this.
   */
  protected async applyAgentValue(
    args: Record<string, unknown>,
  ): Promise<void> {
    const next = args.value;
    await this.setValueFromAgent(next == null ? '' : String(next));
  }

  /** Human-readable current state, used in the tool's result message. */
  protected stateDescription(): string {
    return this.value;
  }

  /** JSON Schema for the WebMCP tool's args. Defaults to a single string. */
  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        value: {
          type: 'string',
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
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  protected async onInput(event: Event): Promise<void> {
    this.value = (
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ).value;
    await this.validate();
  }

  /** Compute validity: the `required` constraint first, then the schema. */
  private async computeValidity(): Promise<{
    valid: boolean;
    message: string;
    flags: ValidityStateFlags;
  }> {
    if (this.required && this.isEmpty) {
      return {
        valid: false,
        message: this.requiredMessage || this.requiredMessageDefault,
        flags: { valueMissing: true },
      };
    }
    if (isStandardSchema(this.schema)) {
      const outcome = await validateStandard(this.schema, this.validationValue);
      if (!outcome.valid) {
        return {
          valid: false,
          message: outcome.errors[0] ?? 'Invalid value',
          flags: { customError: true },
        };
      }
    }
    return { valid: true, message: '', flags: {} };
  }

  /**
   * Validate and reflect the result to the form via ElementInternals.
   *
   * @param show When true (default, on interaction) the error is also made
   *   visible. When false (on connect/reset) validity is set for
   *   `form.checkValidity()` but the message stays hidden until the form is
   *   actually reported (native-style — the `invalid` event reveals it).
   */
  async validate(show = true): Promise<boolean> {
    const { valid, message, flags } = await this.computeValidity();
    if (valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(flags, message, this.control ?? undefined);
    }
    if (show) {
      this.error = valid ? '' : message;
      this.toggleAttribute('invalid', !valid);
    }
    return valid;
  }

  /** Reveal the validation message when the form reports validity (submit). */
  private readonly onInvalid = (): void => {
    this.error = this.internals.validationMessage;
    this.toggleAttribute('invalid', true);
  };

  /** Called by the form when it resets. */
  formResetCallback(): void {
    this.value = '';
    this.error = '';
    this.toggleAttribute('invalid', false);
    void this.validate(false);
  }

  /** Subclasses render their control element here (id/class "control"). */
  protected abstract renderControl(): TemplateResult;

  protected renderMessage(): TemplateResult | typeof nothing {
    return this.error
      ? html`<span id="wmcp-error" class="message error" role="alert"
          >${this.error}</span
        >`
      : this.helperText
        ? html`<span id="wmcp-helper" class="message helper"
            >${this.helperText}</span
          >`
        : nothing;
  }

  override render(): TemplateResult {
    return html`
      ${this.label
        ? html`<label for="control">${this.label}</label>`
        : nothing}
      ${this.renderControl()}
      ${this.renderMessage()}
    `;
  }
}
