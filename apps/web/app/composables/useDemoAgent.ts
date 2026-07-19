import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';
// Type-only import: the core entry defines Lit custom elements at module
// scope, which would crash Nitro's server-side render. The runtime
// `exposeTool` is loaded lazily in `start()`, which only runs in the browser.
import type { ToolDisposer, WebMCPToolDefinition } from '@webmcpui/core';

export interface DemoToolInfo {
  name: string;
  description: string;
  schema: unknown;
}

export interface DemoLogLine {
  role: 'agent' | 'tool' | 'user';
  text: string;
}

/**
 * Shared agent plumbing for the multi-tool example demos: installs the fake
 * WebMCP host, registers optional page-level tools via `exposeTool`, and
 * sequences logged `agent.call()`s with a human-watchable delay.
 *
 * Lifecycle: `start(pageTools)` from DemoStage @open, `stop()` from @close
 * (disposes page tools so reopening re-registers cleanly), `destroy()` from
 * `onBeforeUnmount` (also restores `navigator.modelContext`).
 */
export function useDemoAgent() {
  const tools = ref<DemoToolInfo[]>([]);
  const log = ref<DemoLogLine[]>([]);
  const running = ref(false);

  let agent: FakeAgent | undefined;
  let disposers: ToolDisposer[] = [];

  async function start(pageTools: WebMCPToolDefinition[] = []) {
    agent ??= installFakeAgent();
    // Page tools go through the same public `exposeTool` API an app would use;
    // it feature-detects the (fake) host at call time.
    const { exposeTool } = await import('@webmcpui/core');
    disposers = pageTools.map((t) => exposeTool(t));
    // Let the wmcp elements in the just-opened overlay upgrade and register.
    await nextTick();
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    refreshTools();
  }

  function refreshTools() {
    tools.value = (agent?.tools ?? []).map((t) => ({
      name: t.name,
      description: t.description,
      schema: t.inputSchema,
    }));
  }

  /** A user chat line in the log. */
  function say(text: string) {
    log.value.push({ role: 'user', text });
  }

  /** Agent narration (thinking out loud) — no tool call. */
  function note(text: string) {
    log.value.push({ role: 'agent', text });
  }

  /** One logged tool call, paced so humans can watch it happen. */
  async function call(
    name: string,
    args?: Record<string, unknown>,
    delay = 450,
  ) {
    log.value.push({
      role: 'agent',
      text: `call ${name}(${args ? JSON.stringify(args) : ''})`,
    });
    await new Promise((r) => setTimeout(r, delay));
    try {
      const result = await agent!.call(name, args);
      log.value.push({
        role: 'tool',
        text: result.content.map((c) => c.text).join(' '),
      });
      return result;
    } catch (err) {
      log.value.push({ role: 'tool', text: String(err) });
      return null;
    }
  }

  /** Wrap a multi-step agent script so `running` tracks it. */
  async function run(script: () => Promise<void>) {
    if (!agent || running.value) return;
    running.value = true;
    try {
      await script();
    } finally {
      running.value = false;
    }
  }

  function clearLog() {
    log.value = [];
  }

  function stop() {
    disposers.forEach((d) => d());
    disposers = [];
    tools.value = [];
  }

  function destroy() {
    stop();
    agent?.restore();
    agent = undefined;
  }

  return {
    tools,
    log,
    running,
    start,
    stop,
    destroy,
    refreshTools,
    say,
    note,
    call,
    run,
    clearLog,
  };
}
