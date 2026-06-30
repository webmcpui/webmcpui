import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  exposeTool,
  type JSONSchema,
  type ToolDisposer,
  type WebMCPToolResult,
} from '../webmcp.js';

/**
 * Base class for agent-operable *action* elements.
 *
 * Where {@link WmcpFormControl} exposes a *value* an agent can set, an action
 * element exposes an *action* an agent can trigger — a click, an open, a
 * dismissal. This base owns the WebMCP plumbing shared by every such element:
 * the `expose` / `tool-name` / `tool-description` opt-in surface, the tool's
 * lifecycle (register on connect, dispose on disconnect, re-register when its
 * identity changes), and the `exposeTool` call itself.
 *
 * A subclass supplies only the specifics: {@link actionVerb} (the default
 * tool-name prefix), {@link runAction} (what the tool actually does), and
 * optionally {@link actionNoun}, {@link defaultToolDescription}, or
 * {@link actionInputSchema}. Abstract — not registered on its own.
 *
 * Extracted when the second action element (dialog) landed alongside the first
 * (button) — two data points reveal what's genuinely shared, the same rule
 * that produced `WmcpFormControl`.
 */
export abstract class WmcpAction extends LitElement {
  /** Identifier used to build the default tool name. */
  @property() name = '';

  /** Accessible name and the noun used in the default tool description. */
  @property() label = '';

  /** Whether to expose this element as a WebMCP tool. */
  @property({ type: Boolean }) expose = false;

  /** Override the generated WebMCP tool name. */
  @property({ attribute: 'tool-name' }) toolName = '';

  /** Override the generated WebMCP tool description. */
  @property({ attribute: 'tool-description' }) toolDescription = '';

  private toolDisposer: ToolDisposer = () => {};

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

  /** The resolved WebMCP tool name. */
  get resolvedToolName(): string {
    return this.toolName || `${this.actionVerb}_${this.name || this.defaultNameSuffix}`;
  }

  /** Default tool description when none is supplied. Subclasses sharpen this. */
  protected get defaultToolDescription(): string {
    return `Activate the "${this.actionNoun}".`;
  }

  /** JSON Schema for the tool's args. Defaults to a no-argument action. */
  protected actionInputSchema(): JSONSchema {
    return { type: 'object', properties: {} };
  }

  /**
   * Perform the action and return the agent-facing result. Called when the
   * agent invokes the tool; subclasses implement the actual effect.
   */
  protected abstract runAction(
    args: Record<string, unknown>,
  ): WebMCPToolResult | Promise<WebMCPToolResult>;

  /**
   * Property changes that alter the tool's *identity* and so require
   * re-registration. State the action reads at call time (a button's
   * `disabled`, a dialog's `open`) is read live in {@link runAction} and does
   * not belong here. Subclasses that add naming inputs can extend this.
   */
  protected get toolReactiveProps(): readonly string[] {
    return ['expose', 'name', 'label', 'toolName', 'toolDescription'];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.expose) this.registerTool();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.toolDisposer();
    this.toolDisposer = () => {};
  }

  override updated(changed: Map<string, unknown>): void {
    if (this.expose && this.toolReactiveProps.some((p) => changed.has(p))) {
      this.registerTool();
    } else if (!this.expose && changed.has('expose')) {
      this.toolDisposer();
      this.toolDisposer = () => {};
    }
  }

  protected registerTool(): void {
    this.toolDisposer();
    this.toolDisposer = exposeTool({
      name: this.resolvedToolName,
      description: this.toolDescription || this.defaultToolDescription,
      inputSchema: this.actionInputSchema(),
      execute: (args) => this.runAction(args),
    });
  }
}
