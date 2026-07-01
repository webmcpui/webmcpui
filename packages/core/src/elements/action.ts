import { property } from 'lit/decorators.js';
import { WmcpExposable } from './exposable.js';
import type { WebMCPToolResult } from '../webmcp.js';

/**
 * Base class for agent-operable *action* elements.
 *
 * Where {@link WmcpFormControl} exposes a *value* an agent can set, an action
 * element exposes an *action* an agent can trigger — a click, an open, a
 * dismissal. The WebMCP exposure mechanism (the `expose` surface, the tool
 * lifecycle, the `exposeTool` call) lives in the shared {@link WmcpExposable}
 * base; this layer adds the action-flavored *policy*: a verb-prefixed tool name
 * (`click_save`, `open_booking`), an action-shaped default description, and a
 * no-argument tool by default.
 *
 * A subclass supplies {@link actionVerb} and {@link executeTool}, and may
 * override {@link actionNoun}, {@link defaultNameSuffix}, or
 * {@link toolInputSchema} (e.g. a menu whose action takes which-item). Abstract
 * — not registered on its own.
 *
 * Extracted when the second action element (dialog) landed alongside the first
 * (button) — two data points reveal what's genuinely shared, the same rule
 * that produced `WmcpFormControl`.
 */
export abstract class WmcpAction extends WmcpExposable {
  /** Identifier used to build the default tool name. */
  @property() name = '';

  /** Accessible name and the noun used in the default tool description. */
  @property() label = '';

  /** Verb that prefixes the default tool name, e.g. `click` → `click_save`. */
  protected abstract get actionVerb(): string;

  /** Suffix for the default tool name when `name` is empty. */
  protected get defaultNameSuffix(): string {
    return 'element';
  }

  /** Human-readable noun for the thing being acted on. */
  protected get actionNoun(): string {
    return this.label || this.name || this.defaultNameSuffix;
  }

  override get resolvedToolName(): string {
    return (
      this.toolName || `${this.actionVerb}_${this.name || this.defaultNameSuffix}`
    );
  }

  protected override get defaultToolDescription(): string {
    return `Activate the "${this.actionNoun}".`;
  }

  protected override get toolReactiveProps(): readonly string[] {
    return [...super.toolReactiveProps, 'name', 'label'];
  }

  /**
   * Perform the action and return the agent-facing result. Called when the
   * agent invokes the tool; subclasses implement the actual effect.
   */
  protected abstract override executeTool(
    args: Record<string, unknown>,
  ): WebMCPToolResult | Promise<WebMCPToolResult>;
}
