/**
 * The imperative WebMCP exposure layer.
 *
 * Per the current spec (see the project's webmcp-spec-state note), WebMCP is an
 * imperative API: `navigator.modelContext.registerTool(...)`. As of 2026 it is
 * behind the `enable-webmcp-testing` flag in Chrome and undefined for almost
 * everyone, and no mainstream agent consumes it yet. So everything here is
 * additive and feature-detected: a component must be a perfectly good form
 * control with zero agent present.
 */

/** A JSON-Schema-ish description of a tool's parameters. */
export type JSONSchema = Record<string, unknown>;

export interface WebMCPToolResultContent {
  type: 'text';
  text: string;
}

export interface WebMCPToolResult {
  content: WebMCPToolResultContent[];
  isError?: boolean;
}

export interface WebMCPToolDefinition {
  /** Stable, unique tool name (snake_case by convention). */
  name: string;
  /** Natural-language description the agent reads to decide when to call it. */
  description: string;
  /** JSON Schema for the tool's arguments. */
  inputSchema?: JSONSchema;
  /** Invoked when the agent calls the tool. */
  execute: (
    args: Record<string, unknown>,
  ) => WebMCPToolResult | Promise<WebMCPToolResult>;
}

/** Disposer returned by {@link exposeTool}; safe to call when nothing was registered. */
export type ToolDisposer = () => void;

interface ModelContextLike {
  registerTool?: (tool: unknown) => { unregister?: () => void } | void;
  unregisterTool?: (name: string) => void;
}

function getModelContext(): ModelContextLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const mc = (navigator as Navigator & { modelContext?: ModelContextLike })
    .modelContext;
  return mc && typeof mc.registerTool === 'function' ? mc : undefined;
}

/** True when a WebMCP host is present in this environment. */
export function isWebMCPAvailable(): boolean {
  return getModelContext() !== undefined;
}

/**
 * Register a tool with the page's WebMCP host. Returns a disposer that
 * unregisters it. If no host is present (the common case today), this is a
 * no-op and the returned disposer does nothing — callers never need to branch.
 */
export function exposeTool(definition: WebMCPToolDefinition): ToolDisposer {
  const mc = getModelContext();
  if (!mc?.registerTool) return () => {};

  const handle = mc.registerTool({
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema ?? { type: 'object', properties: {} },
    execute: definition.execute,
  });

  return () => {
    if (handle && typeof handle.unregister === 'function') {
      handle.unregister();
    } else if (typeof mc.unregisterTool === 'function') {
      mc.unregisterTool(definition.name);
    }
  };
}
