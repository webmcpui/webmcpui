/**
 * Fake WebMCP host for tests, demos, and the eventual inspector.
 *
 * No mainstream agent calls WebMCP yet, so this is the only way to exercise
 * tool exposure end to end: install a stub on both `document.modelContext` and
 * `navigator.modelContext` that records registered tools and lets you invoke
 * them as an agent would.
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
  /** Restore the previous modelContext values on both document and navigator. */
  restore(): void;
}

type ModelContextHost = { modelContext?: unknown };

/**
 * Install a fake WebMCP host onto both `document.modelContext` (the canonical
 * Chrome 149+ surface) and `navigator.modelContext` (the deprecated fallback),
 * matching the precedence order in `getModelContext()`. Call `restore()` when
 * done (e.g. in test teardown).
 */
export function installFakeAgent(): FakeAgent {
  const doc = typeof document !== 'undefined'
    ? (document as Document & ModelContextHost)
    : undefined;
  const nav = navigator as Navigator & ModelContextHost;

  const previousDoc = doc?.modelContext;
  const previousNav = nav.modelContext;

  const tools = new Map<string, RegisteredTool>();

  const stub = {
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

  if (doc) doc.modelContext = stub;
  nav.modelContext = stub;

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
        if (previousDoc === undefined) {
          delete doc.modelContext;
        } else {
          doc.modelContext = previousDoc;
        }
      }
      if (previousNav === undefined) {
        delete nav.modelContext;
      } else {
        nav.modelContext = previousNav;
      }
    },
  };
}
