import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  exposeTool,
  type JSONSchema,
  type ToolDisposer,
  type WebMCPToolResult,
} from '../webmcp.js';

/**
 * Base for every element that can register itself as a WebMCP tool — both the
 * *value* controls ({@link WmcpFormControl}) and the *action* elements
 * ({@link WmcpAction}).
 *
 * It owns only the exposure *mechanism*: the `expose` / `tool-name` /
 * `tool-description` opt-in surface, the tool's lifecycle (register on connect,
 * dispose on disconnect, re-register when its identity changes, drop when
 * `expose` is turned off), and the single `exposeTool` call. The spec-sensitive
 * registration/disposal itself lives one layer down in `exposeTool`, so this is
 * thin wiring over a single source of truth.
 *
 * Each subtree supplies the *policy* via four hooks — {@link resolvedToolName},
 * {@link defaultToolDescription}, {@link toolInputSchema}, {@link executeTool} —
 * plus {@link toolReactiveProps} when extra properties feed the tool's name or
 * description. Abstract — not registered on its own.
 */
export abstract class WmcpExposable extends LitElement {
  /** Whether to expose this element as a WebMCP tool. */
  @property({ type: Boolean }) expose = false;

  /** Override the generated WebMCP tool name. */
  @property({ attribute: 'tool-name' }) toolName = '';

  /** Override the generated WebMCP tool description. */
  @property({ attribute: 'tool-description' }) toolDescription = '';

  private toolDisposer: ToolDisposer = () => {};

  /** The resolved WebMCP tool name. */
  abstract get resolvedToolName(): string;

  /** Description used when `tool-description` is not set. */
  protected abstract get defaultToolDescription(): string;

  /** JSON Schema for the tool's args. Defaults to a no-argument tool. */
  protected toolInputSchema(): JSONSchema {
    return { type: 'object', properties: {} };
  }

  /** Invoked when the agent calls the tool; returns the agent-facing result. */
  protected abstract executeTool(
    args: Record<string, unknown>,
  ): WebMCPToolResult | Promise<WebMCPToolResult>;

  /**
   * Property changes that alter the tool's *identity* (name/description) and so
   * require re-registration. State read live inside {@link executeTool} does
   * not belong here. Subclasses extend this with their own naming inputs.
   */
  protected get toolReactiveProps(): readonly string[] {
    return ['expose', 'toolName', 'toolDescription'];
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
      inputSchema: this.toolInputSchema(),
      execute: (args) => this.executeTool(args),
    });
  }
}
