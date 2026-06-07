import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpFormControl } from './form-control.js';
import type { JSONSchema } from '../webmcp.js';

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
 * `<wmcp-input>` — a form-associated, agent-operable single-line text input.
 *
 * Behavior (form association, validation, WebMCP exposure, theming) comes from
 * {@link WmcpFormControl}; this adds the `type` attribute and the `<input>`.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpInput extends WmcpFormControl {
  static readonly tagName = 'wmcp-input';

  static styles = [
    WmcpFormControl.styles,
    css`
      .control {
        height: var(--input-height-md, 2.25rem);
      }
    `,
  ];

  /** HTML input type. */
  @property() type: WmcpInputType = 'text';

  protected override get controlNoun(): string {
    return 'input';
  }

  protected override toolInputSchema(): JSONSchema {
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

  protected override renderControl() {
    return html`
      <input
        id="control"
        class="control"
        part="control"
        .type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${this.describedBy ?? nothing}
        @input=${this.onInput}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wmcp-input': WmcpInput;
  }
}
