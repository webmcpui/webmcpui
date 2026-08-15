import {
  LitElement,
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { WmcpAction } from './action.js';
import {
  attachInternalsSafe,
  supportsFormAssociation,
  warnFormAssociationUnavailable,
} from '../internals.js';
import type { WebMCPToolResult } from '../webmcp.js';

/** Visual variants `<wmcp-button>` supports (shadcn-aligned). */
export type WmcpButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost';

/** Size variants `<wmcp-button>` supports. */
export type WmcpButtonSize = 'sm' | 'md' | 'lg';

/** Native button behaviors `<wmcp-button>` mirrors. */
export type WmcpButtonType = 'button' | 'submit' | 'reset';

/**
 * `<wmcp-button>` — a themeable, agent-operable button. The first Phase 2
 * interaction primitive.
 *
 * Where the form controls expose a *value* an agent can set, a button exposes
 * an *action* an agent can trigger. When a WebMCP host is present and the
 * button opts in (`expose`), it registers a tool that activates the button
 * exactly as a human click would — running light-DOM `click` handlers and, for
 * `type="submit"`/`"reset"`, driving the associated form. The tool's result
 * reports the outcome it observed rather than the outcome it intended: a submit
 * counts as submitted only if the form's `submit` event actually fired. With no
 * agent present (the common case today) it is simply a good, accessible button.
 *
 * Activation has a single path: both a real click and an agent tool call route
 * through the inner native `<button>`, so behavior, focus, and form
 * participation are identical for human and agent. A `disabled` button can be
 * activated by neither.
 *
 * Form-associated, so `type="submit"` and `type="reset"` work from inside the
 * shadow boundary (a native submit button there would not reach the outer
 * form). Visible content is slotted; an explicit `label` is used for the
 * accessible name and the default tool description when set.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpButton extends WmcpAction {
  static readonly tagName = 'wmcp-button';

  static formAssociated = true;

  // Delegate focus to the inner native button so the host is keyboard- and
  // agent-focusable and `:focus-visible` lands on the real control.
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      font-family: var(
        --button-font-family,
        var(--input-font-family, ui-sans-serif, system-ui, sans-serif)
      );
    }
    :host([hidden]) {
      display: none;
    }
    .control {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--button-gap, 0.5rem);
      width: 100%;
      font-family: inherit;
      font-size: var(--button-font-size, 0.875rem);
      font-weight: var(--button-font-weight, 500);
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      border: var(--button-border-width, 1px) solid transparent;
      border-radius: var(--button-radius, var(--radius, 0.625rem));
      transition: background-color var(--button-transition-duration, 150ms)
          var(--button-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
        color var(--button-transition-duration, 150ms)
          var(--button-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--button-transition-duration, 150ms)
          var(--button-transition-easing, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow var(--button-transition-duration, 150ms)
          var(--button-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
    }
    /* Sizes */
    :host([size='sm']) .control {
      height: var(--button-height-sm, 2rem);
      padding-inline: var(--button-padding-x-sm, 0.75rem);
    }
    .control {
      height: var(--button-height-md, 2.25rem);
      padding-inline: var(--button-padding-x-md, 1rem);
    }
    :host([size='lg']) .control {
      height: var(--button-height-lg, 2.5rem);
      padding-inline: var(--button-padding-x-lg, 1.5rem);
    }
    /* Primary (default) */
    .control {
      color: var(--button-primary-text, var(--primary-foreground, oklch(0.985 0 0)));
      background: var(--button-primary-bg, var(--primary, oklch(0.205 0 0)));
    }
    .control:hover:not(:disabled) {
      background: var(
        --button-primary-bg-hover,
        color-mix(in oklch, var(--primary, oklch(0.205 0 0)) 90%, transparent)
      );
    }
    /* Secondary */
    :host([variant='secondary']) .control {
      color: var(--button-secondary-text, var(--secondary-foreground, oklch(0.205 0 0)));
      background: var(--button-secondary-bg, var(--secondary, oklch(0.97 0 0)));
    }
    :host([variant='secondary']) .control:hover:not(:disabled) {
      background: var(
        --button-secondary-bg-hover,
        color-mix(in oklch, var(--secondary, oklch(0.97 0 0)) 80%, var(--foreground, oklch(0.145 0 0)))
      );
    }
    /* Destructive */
    :host([variant='destructive']) .control {
      color: var(--button-destructive-text, var(--destructive-foreground, oklch(0.985 0 0)));
      background: var(--button-destructive-bg, var(--destructive, oklch(0.577 0.245 27.325)));
    }
    :host([variant='destructive']) .control:hover:not(:disabled) {
      background: var(
        --button-destructive-bg-hover,
        color-mix(in oklch, var(--destructive, oklch(0.577 0.245 27.325)) 90%, transparent)
      );
    }
    /* Outline */
    :host([variant='outline']) .control {
      color: var(--button-outline-text, var(--foreground, oklch(0.145 0 0)));
      background: var(--button-outline-bg, var(--background, oklch(1 0 0)));
      border-color: var(--button-outline-border, var(--border, oklch(0.922 0 0)));
    }
    :host([variant='outline']) .control:hover:not(:disabled) {
      background: var(--button-outline-bg-hover, var(--accent, oklch(0.97 0 0)));
      color: var(--button-outline-text-hover, var(--accent-foreground, oklch(0.205 0 0)));
    }
    /* Ghost */
    :host([variant='ghost']) .control {
      color: var(--button-ghost-text, var(--foreground, oklch(0.145 0 0)));
      background: transparent;
    }
    :host([variant='ghost']) .control:hover:not(:disabled) {
      background: var(--button-ghost-bg-hover, var(--accent, oklch(0.97 0 0)));
      color: var(--button-ghost-text-hover, var(--accent-foreground, oklch(0.205 0 0)));
    }
    /* Focus + disabled (shared across variants) */
    .control:focus-visible {
      outline: none;
      box-shadow: 0 0 0 var(--ring-width, 3px)
        color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
    }
    .control:disabled {
      opacity: var(--button-disabled-opacity, 0.5);
      cursor: not-allowed;
    }
  `;

  /** Visual variant. */
  @property({ reflect: true }) variant: WmcpButtonVariant = 'primary';

  /** Size. */
  @property({ reflect: true }) size: WmcpButtonSize = 'md';

  /** Native button behavior: a plain button, a form submit, or a form reset. */
  @property() type: WmcpButtonType = 'button';

  /** Disables the button for both humans and agents. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** `ElementInternals`, or `null` where the platform lacks it (happy-dom). */
  private readonly internals: ElementInternals | null =
    attachInternalsSafe(this);

  /** Whether native `<form>` participation actually works in this environment. */
  private readonly formAssociationAvailable: boolean = supportsFormAssociation(
    this.internals,
  );

  /** The inner native `<button>` that owns activation, focus, and a11y. */
  private get button(): HTMLButtonElement | null {
    return this.renderRoot?.querySelector('button') ?? null;
  }

  /**
   * The form this button drives, or `null` when there is none.
   *
   * Also the button's one form-association touchpoint, so it is where the
   * one-time environment warning fires — and only for a `submit`/`reset` button,
   * the only kind that needs a form. A plain button never asks for one, so a
   * page of plain buttons in jsdom stays quiet.
   */
  private get associatedForm(): HTMLFormElement | null {
    if (this.type !== 'button' && !this.formAssociationAvailable) {
      warnFormAssociationUnavailable();
    }
    return this.internals?.form ?? null;
  }

  // --- WmcpAction hooks ---------------------------------------------------

  protected override get actionVerb(): string {
    return 'click';
  }

  protected override get defaultNameSuffix(): string {
    return 'button';
  }

  // A button's visible name is its slotted text, so fall back to that.
  protected override get actionNoun(): string {
    return this.label || this.textContent?.trim() || this.name || 'button';
  }

  protected override get defaultToolDescription(): string {
    return `Click the "${this.actionNoun}" button.`;
  }

  /**
   * Click the button and report *what actually happened*.
   *
   * The truthful-result contract: a submit is reported as submitted only when
   * the form's `submit` event really dispatched. A submit button with no form,
   * or one whose form is blocked by constraint validation, reports an error —
   * the agent is never told a submission happened that didn't. The click itself
   * always runs (light-DOM handlers may be the point), even when there is no
   * form to drive.
   */
  protected override executeTool(): WebMCPToolResult {
    const noun = this.actionNoun;
    if (this.disabled) {
      return {
        content: [
          {
            type: 'text',
            text: `The "${noun}" button is disabled and can't be activated.`,
          },
        ],
        isError: true,
      };
    }

    if (this.type === 'submit') {
      const form = this.associatedForm;
      if (!form) {
        this.activate();
        return {
          content: [
            {
              type: 'text',
              text: `Clicked the "${noun}" button, but it is not inside a form — nothing was submitted.`,
            },
          ],
          isError: true,
        };
      }
      // `requestSubmit()` dispatches `submit` synchronously when constraint
      // validation passes and fires `invalid` events (no `submit`) when it
      // doesn't — so a listener spanning the click is an exact witness. Capture
      // phase and `once` keep it out of the page's way; a page handler calling
      // `preventDefault()` still counts as submitted.
      let submitted = false;
      const witness = (): void => {
        submitted = true;
      };
      form.addEventListener('submit', witness, { once: true, capture: true });
      try {
        this.activate();
      } finally {
        form.removeEventListener('submit', witness, { capture: true });
      }
      return submitted
        ? {
            content: [
              {
                type: 'text',
                text: `Clicked the "${noun}" button and submitted the form.`,
              },
            ],
          }
        : {
            content: [
              {
                type: 'text',
                text: `Clicked the "${noun}" button, but the form failed validation and was not submitted. Fix the invalid fields and try again.`,
              },
            ],
            isError: true,
          };
    }

    if (this.type === 'reset') {
      // Reset has no constraint gate: it succeeds whenever there is a form.
      const form = this.associatedForm;
      this.activate();
      return form
        ? {
            content: [
              {
                type: 'text',
                text: `Clicked the "${noun}" button and reset the form.`,
              },
            ],
          }
        : {
            content: [
              {
                type: 'text',
                text: `Clicked the "${noun}" button, but it is not inside a form — nothing was reset.`,
              },
            ],
            isError: true,
          };
    }

    this.activate();
    return {
      content: [{ type: 'text', text: `Clicked the "${noun}" button.` }],
    };
  }

  // --- Activation ---------------------------------------------------------

  /**
   * Activate the button as if a human clicked it: routes through the inner
   * native button so light-DOM `click` handlers fire and `type`-driven form
   * submission/reset happens. A no-op when disabled.
   */
  activate(): void {
    this.button?.click();
  }

  /**
   * Inner-button click handler. The native click already bubbles (composed) to
   * the host, so light-DOM listeners fire without help; this only adds the
   * cross-shadow form behavior a native submit/reset button can't do from here.
   */
  private onInnerClick(): void {
    if (this.disabled) return;
    if (this.type === 'submit') {
      this.associatedForm?.requestSubmit();
    } else if (this.type === 'reset') {
      this.associatedForm?.reset();
    }
  }

  override render(): TemplateResult {
    return html`
      <button
        class="control"
        part="control"
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.label || nothing}
        @click=${this.onInnerClick}
      >
        <slot></slot>
      </button>
    `;
  }
}
