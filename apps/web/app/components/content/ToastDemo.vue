<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// The one component whose agent surface is *perceiving*, not actuating. Page
// code throws toasts the way it always has; the agent reads them back via
// `read_notifications` — the machine-readable twin of the aria-live region.

const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool' | 'user'; text: string }[]>([]);
const running = ref(false);

const toastRef = ref<(HTMLElement & { show: (o: Record<string, unknown>) => void; clear: () => void }) | null>(null);
let agent: FakeAgent | undefined;

const EVENTS = [
  { message: 'Payment received', variant: 'success' },
  { message: 'Export ready to download', variant: 'info' },
  { message: 'Card declined — please retry', variant: 'error' },
];

function throwEvent(i: number) {
  const e = EVENTS[i]!;
  toastRef.value?.show({ ...e, duration: 0 });
  log.value.push({ role: 'user', text: `page threw a toast: "${e.message}"` });
}

function refreshTool() {
  const t = agent?.get('read_notifications');
  if (t) tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
}

async function onOpen() {
  agent ??= installFakeAgent();
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
}

function reset() {
  toastRef.value?.clear();
  log.value = [];
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  log.value.push({ role: 'agent', text: 'call read_notifications()' });
  try {
    const result = await agent.call('read_notifications');
    log.value.push({ role: 'tool', text: result.content.map((c) => c.text).join(' ') });
  } catch (err) {
    log.value.push({ role: 'tool', text: String(err) });
  } finally {
    running.value = false;
  }
}

onBeforeUnmount(() => agent?.restore());
</script>

<template>
  <DemoStage
    url="checkout.example.com"
    title="Toast — notifications the agent can read"
    description="The page throws the toast; the agent perceives it via read_notifications, not by posting it."
    icon="lucide:bell"
    :tool="tool"
    :log="log"
    :running="running"
    :can-run="!!tool"
    @open="onOpen"
    @run="runAgent"
    @reset="reset"
  >
    <template #page>
      <p class="mb-3 text-sm text-muted-foreground">
        Trigger a page event — then ask the agent what it sees.
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(e, i) in EVENTS"
          :key="i"
          type="button"
          class="bouncy rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-surface-2 active:scale-[0.98]"
          @click="throwEvent(i)"
        >
          {{ e.message }}
        </button>
      </div>

      <wmcp-toast ref="toastRef" name="notifications" label="Notifications" expose />
    </template>
  </DemoStage>
</template>
