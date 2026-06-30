<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// The first *parameterized* action: the agent doesn't just trigger the menu,
// it picks WHICH item — passing one of the enum values the tool advertises.
// The same `select` a human click produces.

const ready = ref(false);
const chosen = ref<string | null>(null);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(
  null,
);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;
const PICKS = ['duplicate', 'archive', 'delete'];
let next = 0;

function onSelect(e: Event) {
  chosen.value = (e as CustomEvent<{ label: string }>).detail.label;
}

function reset() {
  chosen.value = null;
  log.value = [];
}

function refreshTool() {
  const t = agent?.get('select_row_action');
  if (t) {
    tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
  }
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

onMounted(async () => {
  agent = installFakeAgent();
  ready.value = true;
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
});

onBeforeUnmount(() => agent?.restore());
</script>

<template>
  <div
    class="not-prose my-6 overflow-hidden rounded-card border border-border bg-card shadow-soft"
  >
    <div class="grid gap-px bg-border sm:grid-cols-[1.1fr_1fr]">
      <!-- The live page -->
      <div class="bg-card p-6">
        <p class="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The page
        </p>
        <div class="flex min-h-[6.5rem] flex-col items-start gap-3">
          <wmcp-menu
            v-if="ready"
            name="row_action"
            label="Row actions"
            expose
            @select="onSelect"
          >
            <option value="duplicate">Duplicate</option>
            <option value="archive">Archive</option>
            <option value="delete">Delete</option>
          </wmcp-menu>
          <p class="text-sm" :class="chosen ? 'text-brand' : 'text-muted-foreground'">
            <template v-if="chosen">Selected: {{ chosen }}</template>
            <template v-else>Open the menu, or let the agent pick.</template>
          </p>
        </div>
        <div class="mt-5 flex gap-2">
          <button
            type="button"
            class="bouncy flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
            :disabled="running || !tool"
            @click="runAgent"
          >
            <Icon
              :name="running ? 'lucide:loader-circle' : 'lucide:sparkles'"
              class="h-4 w-4"
              :class="running ? 'animate-spin' : ''"
            />
            {{ running ? 'Agent working…' : 'Run agent' }}
          </button>
          <button
            type="button"
            class="bouncy rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            @click="reset"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- The tool the menu exposed -->
      <div class="bg-card p-6">
        <p class="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Exposed WebMCP tool
        </p>
        <div v-if="tool" class="space-y-3 font-mono text-xs">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-brand-soft px-2 py-1 font-semibold text-brand">
              {{ tool.name }}
            </span>
          </div>
          <p class="text-muted-foreground">{{ tool.description }}</p>
          <pre class="overflow-x-auto rounded-lg bg-surface-2 p-3 text-[0.7rem] leading-relaxed text-foreground">{{ JSON.stringify(tool.schema, null, 2) }}</pre>
        </div>
        <p v-else class="font-mono text-xs text-muted-foreground">registering…</p>

        <div v-if="log.length" class="mt-4 space-y-1.5 font-mono text-[0.7rem]">
          <p
            v-for="(line, i) in log"
            :key="i"
            :class="line.role === 'agent' ? 'text-brand' : 'text-muted-foreground'"
          >
            <span class="opacity-60">{{ line.role === 'agent' ? '→' : '←' }}</span>
            {{ line.text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
