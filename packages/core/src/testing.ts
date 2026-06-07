/**
 * Fake WebMCP host for tests, demos, and the eventual inspector.
 *
 * No mainstream agent calls WebMCP yet, so this is the only way to exercise
 * tool exposure end to end: install a stub `navigator.modelContext` that
 * records registered tools and lets you invoke them as an agent would.
 */

import type { WebMCPToolResult } from './webmcp.js';

export interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => WebMCPToolResult | Promise<WebMCPToolResult>;
}

export interface FakeAgent {
  /** All currently-registered tools, in registration order. */
  readonly tools: readonly RegisteredTool[];
  /** Look up a registered tool by name. */
  get(name: string): RegisteredTool | undefined;
  /** Invoke a tool the way an agent would. Throws if the tool is unknown. */
  call(name: string, args?: Record<string, unknown>): Promise<WebMCPToolResult>;
  /** Restore the previous `navigator.modelContext` (or remove the stub). */
  restore(): void;
}

/**
 * Install a fake WebMCP host onto `navigator.modelContext` and return a handle
 * for inspecting and invoking the tools components register. Call `restore()`
 * when done (e.g. in test teardown).
 */
export function installFakeAgent(): FakeAgent {
  const nav = navigator as Navigator & { modelContext?: unknown };
  const previous = nav.modelContext;
  const tools = new Map<string, RegisteredTool>();

  nav.modelContext = {
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
      if (previous === undefined) {
        delete nav.modelContext;
      } else {
        nav.modelContext = previous;
      }
    },
  };
}
