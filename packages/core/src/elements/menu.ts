import {
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { WmcpAction } from './action.js';
import type { JSONSchema, WebMCPToolResult } from '@webmcpui/webmcp';

/** A single selectable item in a `<wmcp-menu>`. */
export interface WmcpMenuItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * `<wmcp-menu>` — a menu-button whose exposed action is *selecting an item*.
 * The first **parameterized** interaction primitive: where button and dialog
 * expose no-argument actions, the menu's tool takes *which item* — an `enum`
 * of the item values — so it pressure-tests the {@link WmcpAction} base the
 * way `<wmcp-select>` did for `WmcpFormControl`.
 *
 * The popup uses the native Popover API (top layer, light-dismiss, and Escape
 * for free); items come from declarative `<option>` children (no build) or the
 * `items` property. Selecting an item — by human click, keyboard, or agent
 * tool call — fires a composed `select` event (`detail: { value, label }`) and
 * closes the menu. A menu dispatches actions; it does not hold a value.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpMenu extends WmcpAction {
  static readonly tagName = 'wmcp-menu';

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      font-family: var(
        --menu-font-family,
        var(--input-font-family, ui-sans-serif, system-ui, sans-serif)
      );
    }
    :host([hidden]) {
      display: none;
    }
    .trigger {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--menu-trigger-gap, 0.375rem);
      height: var(--menu-trigger-height, 2.25rem);
      padding-inline: var(--menu-trigger-padding-x, 1rem);
      font: inherit;
      font-size: var(--menu-font-size, 0.875rem);
      font-weight: var(--menu-trigger-font-weight, 500);
      color: var(--menu-trigger-text, var(--foreground, oklch(0.145 0 0)));
      background: var(--menu-trigger-bg, var(--background, oklch(1 0 0)));
      border: 1px solid var(--menu-trigger-border, var(--border, oklch(0.922 0 0)));
      border-radius: var(--menu-radius, var(--radius, 0.625rem));
      cursor: pointer;
      anchor-name: --wmcp-menu-anchor;
    }
    .trigger:hover {
      background: var(--menu-trigger-bg-hover, var(--accent, oklch(0.97 0 0)));
    }
    .trigger:focus-visible {
      outline: none;
      box-shadow: 0 0 0 var(--ring-width, 3px)
        color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
    }
    .caret {
      width: 0.75rem;
      height: 0.75rem;
      transition: rotate 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .trigger[aria-expanded='true'] .caret {
      rotate: 180deg;
    }
    .menu {
      box-sizing: border-box;
      min-width: var(--menu-min-width, 11rem);
      margin: 0;
      padding: var(--menu-padding, 0.25rem);
      color: var(--menu-text, var(--popover-foreground, oklch(0.145 0 0)));
      background: var(--menu-bg, var(--popover, oklch(1 0 0)));
      border: 1px solid var(--menu-border, var(--border, oklch(0.922 0 0)));
      border-radius: var(--menu-radius, var(--radius, 0.625rem));
      box-shadow: var(
        --menu-shadow,
        0 10px 38px -10px color-mix(in oklch, oklch(0 0 0) 35%, transparent)
      );
      /* Anchor the popover under the trigger; margin is the no-anchor fallback. */
      position-anchor: --wmcp-menu-anchor;
      inset: auto;
      top: anchor(bottom);
      left: anchor(left);
      margin-top: var(--menu-offset, 0.25rem);
    }
    @media (prefers-reduced-motion: no-preference) {
      .menu {
        transition: opacity 130ms ease, translate 130ms ease,
          overlay 130ms allow-discrete, display 130ms allow-discrete;
      }
      .menu:not(:popover-open) {
        opacity: 0;
        translate: 0 -0.25rem;
      }
      @starting-style {
        .menu:popover-open {
          opacity: 0;
          translate: 0 -0.25rem;
        }
      }
    }
    .item {
      display: flex;
      width: 100%;
      align-items: center;
      gap: var(--menu-item-gap, 0.5rem);
      padding: var(--menu-item-padding, 0.4rem 0.6rem);
      font: inherit;
      font-size: var(--menu-font-size, 0.875rem);
      color: inherit;
      text-align: start;
      background: transparent;
      border: 0;
      border-radius: var(--menu-item-radius, 0.4rem);
      cursor: pointer;
    }
    .item:hover:not(:disabled),
    .item:focus-visible {
      outline: none;
      background: var(--menu-item-bg-hover, var(--accent, oklch(0.97 0 0)));
      color: var(--menu-item-text-hover, var(--accent-foreground, oklch(0.205 0 0)));
    }
    .item:disabled {
      opacity: var(--menu-item-disabled-opacity, 0.5);
      cursor: not-allowed;
    }
  `;

  /** Trigger label. */
  @property() label = '';

  /**
   * Items as data. When non-empty, takes precedence over declarative
   * `<option>` children. Set as a property, not an attribute.
   */
  @property({ attribute: false }) items: WmcpMenuItem[] = [];

  /** Whether the popup is open (reflected). */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The normalized item model actually rendered (property or declarative). */
  @state() private resolvedItems: WmcpMenuItem[] = [];

  private itemObserver?: MutationObserver;

  private get menuEl(): HTMLElement | null {
    return this.renderRoot?.querySelector('.menu') ?? null;
  }

  private get itemButtons(): HTMLButtonElement[] {
    return Array.from(
      this.renderRoot?.querySelectorAll<HTMLButtonElement>('.item') ?? [],
    );
  }

  // --- WmcpAction hooks ---------------------------------------------------

  protected override get actionVerb(): string {
    return 'select';
  }

  protected override get defaultNameSuffix(): string {
    return 'menu';
  }

  protected override get actionNoun(): string {
    return this.label || this.name || 'menu';
  }

  protected override get defaultToolDescription(): string {
    return `Select an item from the "${this.actionNoun}" menu.`;
  }

  // Re-register the tool when the item set changes so its enum stays in sync.
  protected override get toolReactiveProps(): readonly string[] {
    return [...super.toolReactiveProps, 'resolvedItems'];
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          enum: this.resolvedItems
            .filter((i) => !i.disabled)
            .map((i) => i.value),
          description: `Which item to select from the "${this.actionNoun}" menu.`,
        },
      },
      required: ['item'],
    };
  }

  protected override executeTool(args: Record<string, unknown>): WebMCPToolResult {
    const value = args.item == null ? '' : String(args.item);
    const item = this.resolvedItems.find((i) => i.value === value);
    if (!item) {
      return {
        content: [
          {
            type: 'text',
            text: `No item "${value}" in the "${this.actionNoun}" menu.`,
          },
        ],
        isError: true,
      };
    }
    if (item.disabled) {
      return {
        content: [
          { type: 'text', text: `The "${item.label}" item is disabled.` },
        ],
        isError: true,
      };
    }
    this.selectItem(item);
    return {
      content: [
        {
          type: 'text',
          text: `Selected "${item.label}" from the "${this.actionNoun}" menu.`,
        },
      ],
    };
  }

  // --- Item model ---------------------------------------------------------

  override connectedCallback(): void {
    this.syncItems();
    super.connectedCallback();
    this.itemObserver = new MutationObserver(() => this.syncItems());
    // Items are direct `<option>` children, so watch the child list only —
    // no need to re-read on every nested mutation.
    this.itemObserver.observe(this, { childList: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.itemObserver?.disconnect();
    this.itemObserver = undefined;
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('items')) this.syncItems();
  }

  private syncItems(): void {
    this.resolvedItems =
      this.items.length > 0 ? this.items : this.readDeclarativeItems();
  }

  private readDeclarativeItems(): WmcpMenuItem[] {
    return Array.from(this.querySelectorAll('option')).map((o) => ({
      value: o.value,
      label: o.textContent?.trim() || o.value,
      disabled: o.disabled,
    }));
  }

  // --- Selection + keyboard ----------------------------------------------

  /** Dispatch the selection and close the menu. */
  private selectItem(item: WmcpMenuItem): void {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { value: item.value, label: item.label },
        bubbles: true,
        composed: true,
      }),
    );
    this.menuEl?.hidePopover();
  }

  private onItemClick(item: WmcpMenuItem): void {
    if (item.disabled) return;
    this.selectItem(item);
  }

  /** Sync `open`/`aria-expanded` and move focus into the menu when it opens. */
  private onToggle(event: ToggleEvent): void {
    this.open = event.newState === 'open';
    if (this.open) {
      this.itemButtons.find((b) => !b.disabled)?.focus();
    }
  }

  /** Roving focus among items with the arrow / Home / End keys. */
  private onMenuKeydown(event: KeyboardEvent): void {
    const buttons = this.itemButtons.filter((b) => !b.disabled);
    if (buttons.length === 0) return;
    const current = buttons.indexOf(
      this.shadowRoot?.activeElement as HTMLButtonElement,
    );
    let next = -1;
    switch (event.key) {
      case 'ArrowDown':
        next = current < 0 ? 0 : (current + 1) % buttons.length;
        break;
      case 'ArrowUp':
        next = current <= 0 ? buttons.length - 1 : current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = buttons.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons[next]?.focus();
  }

  override render(): TemplateResult {
    return html`
      <button
        type="button"
        class="trigger"
        part="trigger"
        popovertarget="menu-pop"
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
      >
        <span>${this.label || 'Menu'}</span>
        <svg class="caret" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div
        id="menu-pop"
        class="menu"
        part="menu"
        popover="auto"
        role="menu"
        aria-label=${this.label || 'Menu'}
        @toggle=${this.onToggle}
        @keydown=${this.onMenuKeydown}
      >
        ${this.resolvedItems.length === 0
          ? nothing
          : repeat(
              this.resolvedItems,
              (item) => item.value,
              (item) => html`
                <button
                  type="button"
                  class="item"
                  role="menuitem"
                  part="item"
                  ?disabled=${item.disabled ?? false}
                  @click=${() => this.onItemClick(item)}
                >
                  ${item.label}
                </button>
              `,
            )}
      </div>
    `;
  }
}
