<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// The first *parameterized* action: the agent doesn't just trigger the menu,
// it picks WHICH item — passing one of the enum values the tool advertises.

const chosen = ref<string | null>(null);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;
const PICKS = ['duplicate', 'archive', 'delete'];
let next = 0;

function onSelect(e: Event) {
  chosen.value = (e as CustomEvent<{ label: string }>).detail.label;
}

function refreshTool() {
  const t = agent?.get('select_row_action');
  if (t) tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
}

async function onOpen() {
  agent ??= installFakeAgent();
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
}

function reset() {
  chosen.value = null;
  log.value = [];
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  const item = PICKS[next++ % PICKS.length]!;
  log.value = [{ role: 'agent', text: `call select_row_action({ item: "${item}" })` }];
  try {
    const result = await agent.call('select_row_action', { item });
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
    url="dashboard.example.com"
    title="Menu — the agent picks an item"
    description="A parameterized action: the tool takes which item, as an enum of values."
    icon="lucide:list"
    :tool="tool"
    :log="log"
    :running="running"
    :can-run="!!tool"
    @open="onOpen"
    @run="runAgent"
    @reset="reset"
  >
    <template #page>
      <div class="flex flex-col items-start gap-4">
        <wmcp-menu name="row_action" label="Row actions" expose @select="onSelect">
          <option value="duplicate">Duplicate</option>
          <option value="archive">Archive</option>
          <option value="delete">Delete</option>
        </wmcp-menu>
        <p class="text-sm" :class="chosen ? 'text-brand' : 'text-muted-foreground'">
          <template v-if="chosen">Selected: {{ chosen }}</template>
          <template v-else>Open the menu, or let the agent pick.</template>
        </p>
      </div>
    </template>
  </DemoStage>
</template>
