import {
  html,
  css,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { WmcpExposable } from './exposable.js';
import type { WebMCPToolResult } from '@webmcpui/webmcp';

/** A toast's severity, used for styling and the agent-readable summary. */
export type WmcpToastVariant = 'info' | 'success' | 'warning' | 'error';

/** Options accepted by {@link WmcpToast.show}. */
export interface WmcpToastOptions {
  title?: string;
  message: string;
  variant?: WmcpToastVariant;
  /** Auto-dismiss after this many ms; `0` keeps it until dismissed. */
  duration?: number;
}

interface ToastRecord extends WmcpToastOptions {
  id: number;
  variant: WmcpToastVariant;
  shownAt: number;
}

/** Recently-shown toasts are still readable for this long after they vanish. */
const RECENT_WINDOW_MS = 30_000;

/**
 * `<wmcp-toast>` — a notification region, and the one component whose agent
 * surface is *perceiving* rather than *actuating*.
 *
 * Page code throws toasts the way it always has — `el.show({ message })` — and
 * they announce to screen readers via an `aria-live` region. When `expose` is
 * set, the very same notifications become readable by an agent through a
 * `read_<name>` tool: the machine-readable twin of the `aria-live`
 * announcement. An agent acting on the user's behalf often has no other way to
 * learn an outcome ("Payment declined", an async "Export ready"), so it reads
 * the toasts rather than posting them.
 *
 * Extends {@link WmcpExposable} directly — not {@link WmcpAction} — because the
 * tool reports state instead of triggering an action.
 *
 * Not auto-registered — call `defineComponents()` (or load the CDN bundle).
 */
export class WmcpToast extends WmcpExposable {
  static readonly tagName = 'wmcp-toast';

  static styles: CSSResultGroup = css`
    :host {
      position: fixed;
      z-index: var(--toast-z, 1000);
      display: flex;
      flex-direction: column;
      gap: var(--toast-gap, 0.5rem);
      width: max-content;
      max-width: var(--toast-max-width, min(92vw, 22rem));
      pointer-events: none;
      font-family: var(
        --toast-font-family,
        var(--input-font-family, ui-sans-serif, system-ui, sans-serif)
      );
    }
    :host([placement='bottom-right']) {
      right: var(--toast-inset, 1rem);
      bottom: var(--toast-inset, 1rem);
    }
    :host([placement='bottom-left']) {
      left: var(--toast-inset, 1rem);
      bottom: var(--toast-inset, 1rem);
    }
    :host([placement='top-right']) {
      right: var(--toast-inset, 1rem);
      top: var(--toast-inset, 1rem);
    }
    :host([placement='top-left']) {
      left: var(--toast-inset, 1rem);
      top: var(--toast-inset, 1rem);
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: start;
      gap: var(--toast-item-gap, 0.625rem);
      padding: var(--toast-padding, 0.75rem 0.875rem);
      color: var(--toast-text, var(--popover-foreground, oklch(0.145 0 0)));
      background: var(--toast-bg, var(--popover, oklch(1 0 0)));
      border: 1px solid var(--toast-border, var(--border, oklch(0.922 0 0)));
      border-left: 3px solid var(--toast-accent, var(--border, oklch(0.922 0 0)));
      border-radius: var(--toast-radius, var(--radius, 0.625rem));
      box-shadow: var(
        --toast-shadow,
        0 10px 38px -10px color-mix(in oklch, oklch(0 0 0) 35%, transparent)
      );
      font-size: var(--toast-font-size, 0.875rem);
    }
    .toast[data-variant='success'] {
      --toast-accent: var(--toast-accent-success, oklch(0.627 0.13 160));
    }
    .toast[data-variant='warning'] {
      --toast-accent: var(--toast-accent-warning, oklch(0.7 0.16 75));
    }
    .toast[data-variant='error'] {
      --toast-accent: var(--toast-accent-error, var(--destructive, oklch(0.577 0.245 27.325)));
    }
    .toast[data-variant='info'] {
      --toast-accent: var(--toast-accent-info, var(--primary, oklch(0.205 0 0)));
    }
    .body {
      flex: 1;
      min-width: 0;
    }
    .title {
      font-weight: 600;
    }
    .message {
      color: var(--toast-message, var(--muted-foreground, oklch(0.556 0 0)));
    }
    .title + .message {
      margin-top: 0.125rem;
    }
    .close {
      appearance: none;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: 0;
      border-radius: 0.25rem;
      background: transparent;
      color: var(--toast-message, var(--muted-foreground, oklch(0.556 0 0)));
      cursor: pointer;
      line-height: 1;
    }
    .close:hover {
      color: var(--toast-text, var(--foreground, oklch(0.145 0 0)));
    }
    @media (prefers-reduced-motion: no-preference) {
      .toast {
        animation: toast-in 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes toast-in {
        from {
          opacity: 0;
          translate: 0 0.5rem;
        }
      }
    }
  `;

  /** Identifier used for the default tool name (`read_<name>`). */
  @property() name = '';

  /** Accessible name for the live region. */
  @property() label = '';

  /** Corner the toasts stack in. */
  @property({ reflect: true }) placement:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left' = 'bottom-right';

  /** Default auto-dismiss in ms; `0` keeps toasts until dismissed. */
  @property({ type: Number }) duration = 5000;

  @state() private toasts: ToastRecord[] = [];

  // A short history so an agent that reads *after* a toast auto-dismisses still
  // learns what happened (async outcomes vanish before the agent polls).
  private recent: ToastRecord[] = [];
  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  // --- Imperative API (what page code calls) ------------------------------

  /** Show a toast. Returns its id (pass to {@link dismiss}). */
  show(options: WmcpToastOptions): number {
    const record: ToastRecord = {
      ...options,
      id: this.nextId++,
      variant: options.variant ?? 'info',
      shownAt: Date.now(),
    };
    this.toasts = [...this.toasts, record];
    this.recent = [record, ...this.recent].slice(0, 10);
    const ms = options.duration ?? this.duration;
    if (ms > 0) {
      this.timers.set(
        record.id,
        setTimeout(() => this.dismiss(record.id), ms),
      );
    }
    return record.id;
  }

  /** Dismiss a toast by id. */
  dismiss(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /** Dismiss all visible toasts. */
  clear(): void {
    for (const t of [...this.toasts]) this.dismiss(t.id);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  // --- WmcpExposable hooks (the agent's *read* surface) -------------------

  override get resolvedToolName(): string {
    return this.toolName || `read_${this.name || 'notifications'}`;
  }

  protected override get defaultToolDescription(): string {
    return 'Read the notifications currently shown to the user (with any that appeared in the last few seconds), so you can tell what just happened on the page.';
  }

  protected override get toolReactiveProps(): readonly string[] {
    return [...super.toolReactiveProps, 'name'];
  }

  protected override executeTool(): WebMCPToolResult {
    const describe = (t: ToastRecord) =>
      `[${t.variant}] ${t.title ? `${t.title}: ` : ''}${t.message}`;

    if (this.toasts.length > 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              `${this.toasts.length} notification(s) showing:\n` +
              this.toasts.map(describe).join('\n'),
          },
        ],
      };
    }

    const cutoff = Date.now() - RECENT_WINDOW_MS;
    const recent = this.recent.filter((t) => t.shownAt >= cutoff);
    if (recent.length > 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              'No notifications are showing now. Recently shown:\n' +
              recent.map(describe).join('\n'),
          },
        ],
      };
    }
    return { content: [{ type: 'text', text: 'No notifications.' }] };
  }

  // --- Render -------------------------------------------------------------

  override render(): TemplateResult {
    return html`
      <div role="region" aria-label=${this.label || 'Notifications'} aria-live="polite">
        ${repeat(
          this.toasts,
          (t) => t.id,
          (t) => html`
            <div
              class="toast"
              part="toast"
              data-variant=${t.variant}
              role=${t.variant === 'error' ? 'alert' : 'status'}
            >
              <div class="body">
                ${t.title ? html`<div class="title">${t.title}</div>` : nothing}
                <div class="message">${t.message}</div>
              </div>
              <button
                class="close"
                part="close"
                type="button"
                aria-label="Dismiss notification"
                @click=${() => this.dismiss(t.id)}
              >
                ✕
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }
}
