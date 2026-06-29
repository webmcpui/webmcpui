import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpFormControl, textFieldStyles } from './form-control.js';

/**
 * `<wmcp-textarea>` — a form-associated, agent-operable multi-line text input.
 *
 * Behavior comes from {@link WmcpFormControl}; this adds the `rows` attribute
 * and the `<textarea>`. It shares the input token surface (`--input-*`) and
 * adds `--textarea-min-height`.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpTextarea extends WmcpFormControl {
  static readonly tagName = 'wmcp-textarea';

  static styles = [
    WmcpFormControl.styles,
    textFieldStyles,
    css`
      .control {
        min-height: var(--textarea-min-height, 4.5rem);
        resize: vertical;
      }
    `,
  ];

  /** Initial visible number of text lines. */
  @property({ type: Number }) rows = 3;

  protected override get controlNoun(): string {
    return 'textarea';
  }

  protected override renderControl() {
    return html`
      <textarea
        id="control"
        class="control"
        part="control"
        rows=${this.rows}
        .value=${this.value}
        placeholder=${this.placeholder || nothing}
        ?required=${this.required}
        ?disabled=${this.disabled}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${this.describedBy ?? nothing}
        @input=${this.onInput}
      ></textarea>
    `;
  }
}
