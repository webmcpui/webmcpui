<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// A live demo of action exposure: a <wmcp-button expose> registers a no-arg
// `book_appointment` tool with the fake WebMCP host. "Run agent" calls that
// tool exactly as an agent would — and the very same click handler a human
// would trigger runs, booking the slot. Action in, action out.

const ready = ref(false);
const booked = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(
  null,
);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;

// Fires for BOTH a human click and an agent tool call — they route through the
// same inner button, so this handler can't tell them apart. That's the point.
function onBook() {
  booked.value = true;
}

function reset() {
  booked.value = false;
  log.value = [];
}

function refreshTool() {
  const t = agent?.get('book_appointment');
  if (t) {
    tool.value = {
      name: t.name,
      description: t.description,
      schema: t.inputSchema,
    };
  }
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  log.value = [{ role: 'agent', text: 'call book_appointment()' }];
  try {
    const result = await agent.call('book_appointment');
    const text = result.content.map((c) => c.text).join(' ');
    log.value.push({ role: 'tool', text });
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
  // Let the custom element upgrade + connectedCallback register its tool.
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
          <wmcp-button
            v-if="ready"
            expose
            tool-name="book_appointment"
            tool-description="Book the selected appointment slot."
            @click="onBook"
          >
            Book appointment
          </wmcp-button>
          <p
            class="text-sm"
            :class="booked ? 'text-brand' : 'text-muted-foreground'"
          >
            <template v-if="booked">✓ Appointment booked.</template>
            <template v-else>No booking yet — click the button, or run the agent.</template>
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

      <!-- The tool the button exposed -->
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
