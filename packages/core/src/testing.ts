/**
 * Fake WebMCP host for tests, demos, and the eventual inspector.
 *
 * No mainstream agent calls WebMCP yet, so this is the only way to exercise
 * tool exposure end to end: install a stub WebMCP host on
 * `document.modelContext` (the canonical Chrome 149+ origin trial surface)
 * and `navigator.modelContext` (the original location, deprecated in Chrome
 * 150, still used as a fallback) that records registered tools and lets you
 * invoke them as an agent would. Pass `surface` to stub just one of the two.
 */

import type { WebMCPToolResult } from '@webmcpui/webmcp';

/** A tool an element registered with the {@link FakeAgent}, as recorded for inspection. */
export interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => WebMCPToolResult | Promise<WebMCPToolResult>;
}

/** Handle to the fake WebMCP host returned by {@link installFakeAgent}. */
export interface FakeAgent {
  /** All currently-registered tools, in registration order. */
  readonly tools: readonly RegisteredTool[];
  /** Look up a registered tool by name. */
  get(name: string): RegisteredTool | undefined;
  /** Invoke a tool the way an agent would. Throws if the tool is unknown. */
  call(name: string, args?: Record<string, unknown>): Promise<WebMCPToolResult>;
  /** Restore the previous `document.modelContext` and `navigator.modelContext` (or remove the stubs). */
  restore(): void;
}

/** Options for {@link installFakeAgent}. */
export interface FakeAgentOptions {
  /** Which host surface(s) to stub. Default `'both'`. */
  surface?: 'document' | 'navigator' | 'both';
}

type DocumentWithModelContext = Document & { modelContext?: unknown };
type NavigatorWithModelContext = Navigator & { modelContext?: unknown };

/**
 * Install a fake WebMCP host and return a handle for inspecting and invoking
 * the tools components register. By default the same host object is set on
 * both `document.modelContext` (the surface the library prefers) and
 * `navigator.modelContext` (the deprecated fallback), so exposure works no
 * matter which one a component's environment happens to check. Pass
 * `{ surface: 'document' }` or `{ surface: 'navigator' }` to stub only one.
 *
 * Call `restore()` when done (e.g. in test teardown) to put back whatever was
 * there before — including removing the property entirely if it was absent.
 */
export function installFakeAgent(options: FakeAgentOptions = {}): FakeAgent {
  const surface = options.surface ?? 'both';
  const useDocument = surface === 'document' || surface === 'both';
  const useNavigator = surface === 'navigator' || surface === 'both';

  const hasDocument = useDocument && typeof document !== 'undefined';
  const hasNavigator = useNavigator && typeof navigator !== 'undefined';

  const doc = hasDocument ? (document as DocumentWithModelContext) : undefined;
  const nav = hasNavigator ? (navigator as NavigatorWithModelContext) : undefined;

  const hadDocumentModelContext = !!doc && 'modelContext' in doc;
  const previousDocumentModelContext = doc?.modelContext;
  const hadNavigatorModelContext = !!nav && 'modelContext' in nav;
  const previousNavigatorModelContext = nav?.modelContext;

  const tools = new Map<string, RegisteredTool>();

  const host = {
    registerTool(tool: RegisteredTool) {
      tools.set(tool.name, {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema ?? {},
        execute: tool.execute,
      });
      return { unregister: () => tools.delete(tool.name) };
    },
    unregisterTool(name: string) {
      tools.delete(name);
    },
  };

  if (doc) doc.modelContext = host;
  if (nav) nav.modelContext = host;

  return {
    get tools() {
      return [...tools.values()];
    },
    get(name) {
      return tools.get(name);
    },
    async call(name, args = {}) {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`No WebMCP tool registered named "${name}"`);
      }
      return tool.execute(args);
    },
    restore() {
      if (doc) {
        if (hadDocumentModelContext) {
          doc.modelContext = previousDocumentModelContext;
        } else {
          delete doc.modelContext;
        }
      }
      if (nav) {
        if (hadNavigatorModelContext) {
          nav.modelContext = previousNavigatorModelContext;
        } else {
          delete nav.modelContext;
        }
      }
    },
  };
}
