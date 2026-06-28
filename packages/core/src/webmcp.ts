/**
 * The imperative WebMCP exposure layer.
 *
 * WebMCP is an imperative API: `document.modelContext.registerTool(...)`. The
 * surface is still churning — `document.modelContext` is canonical as of the
 * Chrome 149+ origin trial, and `navigator.modelContext` is the original
 * location, deprecated in Chrome 150 — so we feature-detect both and prefer
 * `document`. As of mid-2026 it ships only behind the origin trial and is
 * undefined for almost everyone, with no mainstream agent consuming it yet. So
 * everything here is additive and feature-detected: a component must be a
 * perfectly good form control with zero agent present.
 *
 * The API is `[SecureContext]`, so it only exists on HTTPS pages (localhost
 * counts as secure); on plain-HTTP origins detection is a no-op by design.
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
  registerTool?: (
    tool: unknown,
    options?: { signal?: AbortSignal },
  ) => { unregister?: () => void } | void;
  unregisterTool?: (name: string) => void;
}

function getModelContext(): ModelContextLike | undefined {
  // `document.modelContext` is the canonical surface (Chrome 149+ origin
  // trial); `navigator.modelContext` is the original location, deprecated in
  // Chrome 150. Prefer document, fall back to navigator so we light up on both.
  const fromDocument =
    typeof document !== 'undefined'
      ? (document as Document & { modelContext?: ModelContextLike }).modelContext
      : undefined;
  const fromNavigator =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { modelContext?: ModelContextLike })
          .modelContext
      : undefined;
  const mc = fromDocument ?? fromNavigator;
  return mc && typeof mc.registerTool === 'function' ? mc : undefined;
}

/** True when a WebMCP host is present in this environment. */
export function isWebMCPAvailable(): boolean {
  return getModelContext() !== undefined;
}

// Warn only outside production builds. We read NODE_ENV off globalThis (no
// Node types in this browser package) — it's undefined in the browser, so the
// CDN bundle warns, while bundlers that define NODE_ENV silence it for
// production. Fail-open: anything but an explicit "production" warns.
const isDevEnv =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV !== 'production';

// Tool names are page-global; a host rejects a duplicate registration. We track
// the names we've registered so we can surface the collision as a clear dev
// warning instead of a silent no-op (two `expose`d controls sharing a `name`).
const registeredToolNames = new Set<string>();

/**
 * Register a tool with the page's WebMCP host. Returns a disposer that
 * unregisters it. If no host is present (the common case today), this is a
 * no-op and the returned disposer does nothing — callers never need to branch.
 */
export function exposeTool(definition: WebMCPToolDefinition): ToolDisposer {
  const mc = getModelContext();
  if (!mc?.registerTool) return () => {};

  const descriptor = {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema ?? { type: 'object', properties: {} },
    execute: definition.execute,
  };

  if (isDevEnv && registeredToolNames.has(descriptor.name)) {
    console.warn(
      `[webmcpui] A WebMCP tool named "${descriptor.name}" is already ` +
        `registered on this page. Tool names are page-global, so the host ` +
        `rejects the duplicate and this control won't be agent-callable. ` +
        `Give one control a unique \`name\`, or override it with \`tool-name\`.`,
    );
  }
  registeredToolNames.add(descriptor.name);

  // The current spec unregisters via an `AbortSignal` passed at registration
  // (`registerTool(descriptor, { signal })` → `controller.abort()`). Older and
  // polyfill hosts instead returned a handle with `unregister()` or exposed
  // `unregisterTool(name)`. Support all three so disposal works across the
  // still-churning surface.
  const controller =
    typeof AbortController === 'function' ? new AbortController() : undefined;

  const handle = mc.registerTool(
    descriptor,
    controller ? { signal: controller.signal } : undefined,
  );

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    registeredToolNames.delete(descriptor.name);
    try {
      controller?.abort();
      if (handle && typeof handle.unregister === 'function') {
        handle.unregister();
      } else if (typeof mc.unregisterTool === 'function') {
        mc.unregisterTool(definition.name);
      }
    } catch {
      // Host already torn down — disposal is best-effort.
    }
  };
}
