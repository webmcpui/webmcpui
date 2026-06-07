import { html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { WmcpFormControl } from './form-control.js';
import type { JSONSchema } from '../webmcp.js';

export interface WmcpSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface WmcpSelectOptionGroup {
  label: string;
  options: WmcpSelectOption[];
}

export type WmcpSelectItem = WmcpSelectOption | WmcpSelectOptionGroup;

function isGroup(item: WmcpSelectItem): item is WmcpSelectOptionGroup {
  return Array.isArray((item as WmcpSelectOptionGroup).options);
}

/**
 * `<wmcp-select>` — a form-associated, agent-operable single-select dropdown.
 *
 * Wraps a native `<select>` (correct keyboard nav, screen-reader behavior, and
 * mobile pickers for free). Options come from declarative `<option>` /
 * `<optgroup>` children (HTML-native, works with no build) or from the
 * `options` property (for JS / framework callers).
 *
 * The value is a single string, so form association and WebMCP fill behavior
 * come from {@link WmcpFormControl}; this adds the option model and a tool
 * schema whose `value` is an `enum` of the valid option values.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpSelect extends WmcpFormControl {
  static readonly tagName = 'wmcp-select';

  static styles = [
    WmcpFormControl.styles,
    css`
      .control {
        height: var(--input-height-md, 2.25rem);
        cursor: pointer;
      }
      .control:disabled {
        cursor: not-allowed;
      }
    `,
  ];

  /**
   * Options as data. When non-empty, takes precedence over declarative
   * `<option>` children. Set as a property, not an attribute.
   */
  @property({ attribute: false }) options: WmcpSelectItem[] = [];

  /** The normalized option model actually rendered (property or declarative). */
  @state() private resolvedOptions: WmcpSelectItem[] = [];

  private optionObserver?: MutationObserver;

  protected override get controlNoun(): string {
    return 'select';
  }

  override connectedCallback(): void {
    this.syncOptions();
    super.connectedCallback();
    // Re-read declarative <option> children if they change at runtime.
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
    // Option set changed → refresh the tool's enum.
    if (this.expose && changed.has('resolvedOptions')) {
      this.registerTool();
    }
  }

  private syncOptions(): void {
    this.resolvedOptions =
      this.options.length > 0 ? this.options : this.readDeclarativeOptions();
  }

  private readDeclarativeOptions(): WmcpSelectItem[] {
    const toOption = (o: HTMLOptionElement): WmcpSelectOption => ({
      value: o.value,
      label: o.textContent?.trim() || o.value,
      disabled: o.disabled,
    });
    const items: WmcpSelectItem[] = [];
    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLOptGroupElement) {
        items.push({
          label: child.label,
          options: Array.from(
            child.querySelectorAll('option'),
          ).map(toOption),
        });
      } else if (child instanceof HTMLOptionElement) {
        items.push(toOption(child));
      }
    }
    return items;
  }

  /** All selectable options, flattened across groups. */
  flatOptions(): WmcpSelectOption[] {
    return this.resolvedOptions.flatMap((item) =>
      isGroup(item) ? item.options : [item],
    );
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          enum: this.flatOptions().map((o) => o.value),
          description: this.label || this.name || 'The option value to select.',
        },
      },
      required: ['value'],
    };
  }

  private renderOption(option: WmcpSelectOption) {
    return html`<option
      value=${option.value}
      ?disabled=${option.disabled ?? false}
      ?selected=${option.value === this.value}
    >
      ${option.label}
    </option>`;
  }

  protected override renderControl() {
    return html`
      <select
        id="control"
        class="control"
        part="control"
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${this.describedBy ?? nothing}
        @change=${this.onInput}
      >
        ${this.placeholder
          ? html`<option value="" disabled ?selected=${!this.value}>
              ${this.placeholder}
            </option>`
          : nothing}
        ${repeat(
          this.resolvedOptions,
          (item, i) => (isGroup(item) ? `g:${item.label}:${i}` : `o:${item.value}`),
          (item) =>
            isGroup(item)
              ? html`<optgroup label=${item.label}>
                  ${item.options.map((o) => this.renderOption(o))}
                </optgroup>`
              : this.renderOption(item),
        )}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wmcp-select': WmcpSelect;
  }
}
