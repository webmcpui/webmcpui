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
import type { JSONSchema, WebMCPToolResult } from '../webmcp.js';

/** A single tab derived from a `[tab]` panel child of `<wmcp-tabs>`. */
export interface WmcpTabInfo {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * `<wmcp-tabs>` — a tab set whose exposed action is *switching the active tab*.
 * The first **stateful** interaction primitive: where button/dialog/menu are
 * fire-and-forget dispatchers, a tab set holds a persistent `active` selection
 * (reflected), and the agent's tool both reads and changes it.
 *
 * It confirms the {@link WmcpAction} base needs no "current value" concept — a
 * stateful action element simply owns its own state (here `active`, like the
 * dialog owns `open`) and its `executeTool` mutates it.
 *
 * Panels are declarative light-DOM children carrying a `tab` attribute (and an
 * optional `tab-label`); the tablist is derived from them. Switching — by
 * click, arrow keys, or agent — updates `active`, reveals the matching panel,
 * and fires a composed `change` event (`detail: { value }`).
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpTabs extends WmcpAction {
  static readonly tagName = 'wmcp-tabs';

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: var(
        --tabs-font-family,
        var(--input-font-family, ui-sans-serif, system-ui, sans-serif)
      );
    }
    :host([hidden]) {
      display: none;
    }
    [role='tablist'] {
      display: flex;
      gap: var(--tabs-gap, 0.25rem);
      border-bottom: 1px solid var(--tabs-border, var(--border, oklch(0.922 0 0)));
    }
    .tab {
      position: relative;
      appearance: none;
      border: 0;
      background: transparent;
      padding: var(--tabs-tab-padding, 0.5rem 0.875rem);
      margin-bottom: -1px;
      font: inherit;
      font-size: var(--tabs-font-size, 0.875rem);
      font-weight: var(--tabs-font-weight, 500);
      color: var(--tabs-tab-text, var(--muted-foreground, oklch(0.556 0 0)));
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 150ms ease, border-color 150ms ease;
    }
    .tab:hover:not(:disabled) {
      color: var(--tabs-tab-text-hover, var(--foreground, oklch(0.145 0 0)));
    }
    .tab[aria-selected='true'] {
      color: var(--tabs-tab-text-active, var(--foreground, oklch(0.145 0 0)));
      border-bottom-color: var(--tabs-indicator, var(--primary, oklch(0.205 0 0)));
    }
    .tab:focus-visible {
      outline: none;
      border-radius: 0.375rem;
      box-shadow: 0 0 0 var(--ring-width, 3px)
        color-mix(in oklch, var(--ring, oklch(0.708 0 0)) 40%, transparent);
    }
    .tab:disabled {
      opacity: var(--tabs-tab-disabled-opacity, 0.5);
      cursor: not-allowed;
    }
    .panels {
      padding-top: var(--tabs-panel-padding-top, 1rem);
    }
  `;

  /** The value of the active tab (reflected — this is the persistent state). */
  @property({ reflect: true }) active = '';

  /** Accessible name for the tablist. */
  @property() label = '';

  /** The tab model derived from the `[tab]` panel children. */
  @state() private tabs: WmcpTabInfo[] = [];

  private panelObserver?: MutationObserver;

  // --- WmcpAction hooks ---------------------------------------------------

  protected override get actionVerb(): string {
    return 'switch';
  }

  protected override get defaultNameSuffix(): string {
    return 'tabs';
  }

  protected override get actionNoun(): string {
    return this.label || this.name || 'tabs';
  }

  protected override get defaultToolDescription(): string {
    return `Switch the active tab in the "${this.actionNoun}" tabs.`;
  }

  // The enum tracks the live tab set; the description need not track `active`.
  protected override get toolReactiveProps(): readonly string[] {
    return [...super.toolReactiveProps, 'tabs'];
  }

  protected override toolInputSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        tab: {
          type: 'string',
          enum: this.tabs.filter((t) => !t.disabled).map((t) => t.value),
          description: `Which tab to switch to in the "${this.actionNoun}" tabs.`,
        },
      },
      required: ['tab'],
    };
  }

  protected override executeTool(args: Record<string, unknown>): WebMCPToolResult {
    const value = args.tab == null ? '' : String(args.tab);
    const tab = this.tabs.find((t) => t.value === value);
    if (!tab) {
      return {
        content: [
          { type: 'text', text: `No tab "${value}" in the "${this.actionNoun}" tabs.` },
        ],
        isError: true,
      };
    }
    if (tab.disabled) {
      return {
        content: [{ type: 'text', text: `The "${tab.label}" tab is disabled.` }],
        isError: true,
      };
    }
    this.switchTo(tab.value);
    return {
      content: [
        {
          type: 'text',
          text: `Switched to the "${tab.label}" tab in the "${this.actionNoun}" tabs.`,
        },
      ],
    };
  }

  // --- Tab model + state --------------------------------------------------

  override connectedCallback(): void {
    this.syncTabs();
    this.ensureActive();
    super.connectedCallback();
    this.panelObserver = new MutationObserver(() => {
      this.syncTabs();
      this.ensureActive();
    });
    this.panelObserver.observe(this, { childList: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.panelObserver?.disconnect();
    this.panelObserver = undefined;
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('active') || changed.has('tabs')) this.applyPanels();
  }

  /** Light-DOM children that declare a tab via the `tab` attribute. */
  private get panelEls(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>('[tab]'));
  }

  private syncTabs(): void {
    this.tabs = this.panelEls.map((el) => ({
      value: el.getAttribute('tab') ?? '',
      label: el.getAttribute('tab-label') || el.getAttribute('tab') || '',
      disabled: el.hasAttribute('tab-disabled'),
    }));
  }

  /** Fall back to the first enabled tab when `active` is unset or invalid. */
  private ensureActive(): void {
    const valid = this.tabs.some((t) => t.value === this.active && !t.disabled);
    if (!valid) this.active = this.tabs.find((t) => !t.disabled)?.value ?? '';
  }

  /** Reflect the active tab onto the slotted panels (roles, labels, hidden). */
  private applyPanels(): void {
    for (const el of this.panelEls) {
      const value = el.getAttribute('tab') ?? '';
      const tab = this.tabs.find((t) => t.value === value);
      el.setAttribute('role', 'tabpanel');
      el.setAttribute('tabindex', '0');
      // aria-controls/labelledby can't cross the shadow boundary, so the panel
      // self-labels instead of pointing back at its (shadow-DOM) tab button.
      if (tab?.label) el.setAttribute('aria-label', tab.label);
      el.toggleAttribute('hidden', value !== this.active);
    }
  }

  /** Switch the active tab, firing `change` when it actually moves. */
  switchTo(value: string): void {
    if (value === this.active) return;
    this.active = value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private get tabButtons(): HTMLButtonElement[] {
    return Array.from(this.renderRoot?.querySelectorAll<HTMLButtonElement>('.tab') ?? []);
  }

  /** Arrow / Home / End roving with automatic activation (ARIA tabs pattern). */
  private onKeydown(event: KeyboardEvent): void {
    const enabled = this.tabs.filter((t) => !t.disabled);
    if (enabled.length === 0) return;
    const order = enabled.map((t) => t.value);
    const current = order.indexOf(this.active);
    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % order.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = current <= 0 ? order.length - 1 : current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = order.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const value = order[next]!;
    this.switchTo(value);
    void this.updateComplete.then(() => {
      this.tabButtons.find((b) => b.dataset.value === value)?.focus();
    });
  }

  override render(): TemplateResult {
    return html`
      <div role="tablist" aria-label=${this.label || nothing} @keydown=${this.onKeydown}>
        ${repeat(
          this.tabs,
          (tab) => tab.value,
          (tab) => {
            const selected = tab.value === this.active;
            return html`<button
              type="button"
              class="tab"
              part="tab"
              role="tab"
              data-value=${tab.value}
              aria-selected=${selected ? 'true' : 'false'}
              tabindex=${selected ? '0' : '-1'}
              ?disabled=${tab.disabled ?? false}
              @click=${() => this.switchTo(tab.value)}
            >
              ${tab.label}
            </button>`;
          },
        )}
      </div>
      <div class="panels" part="panels"><slot></slot></div>
    `;
  }
}
