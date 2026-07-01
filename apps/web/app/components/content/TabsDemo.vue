<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// The first *stateful* action: the tab set holds a persistent `active` tab, and
// the agent's tool both reads it (via the result) and changes it — switching to
// the same tab a human click would.

const active = ref('overview');
const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;
const TABS = ['usage', 'billing', 'overview'];
let next = 0;

function onChange(e: Event) {
  active.value = (e as CustomEvent<{ value: string }>).detail.value;
}

function refreshTool() {
  const t = agent?.get('switch_account');
  if (t) tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
}

async function onOpen() {
  agent ??= installFakeAgent();
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
}

function reset() {
  log.value = [];
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  const tab = TABS[next++ % TABS.length]!;
  log.value = [{ role: 'agent', text: `call switch_account({ tab: "${tab}" })` }];
  try {
    const result = await agent.call('switch_account', { tab });
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
    url="account.example.com"
    title="Tabs — a stateful selection the agent can move"
    description="The tab set holds a persistent active tab; the tool switches it, as an enum of values."
    icon="lucide:panels-top-left"
    :tool="tool"
    :log="log"
    :running="running"
    :can-run="!!tool"
    @open="onOpen"
    @run="runAgent"
    @reset="reset"
  >
    <template #page>
      <wmcp-tabs name="account" label="Account" active="overview" expose @change="onChange">
        <section tab="overview" tab-label="Overview">
          <p class="text-sm text-muted-foreground">Your account at a glance.</p>
        </section>
        <section tab="usage" tab-label="Usage">
          <p class="text-sm text-muted-foreground">12,480 requests this month.</p>
        </section>
        <section tab="billing" tab-label="Billing">
          <p class="text-sm text-muted-foreground">Pro plan · renews Jul 28.</p>
        </section>
      </wmcp-tabs>
      <p class="mt-3 text-sm text-brand">Active tab: {{ active }}</p>
    </template>
  </DemoStage>
</template>
