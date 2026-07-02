<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/components/testing';

// A real, end-to-end demo: we install the fake WebMCP host BEFORE the live
// <wmcp-input expose> mounts, so the element registers its `fill_email` tool
// with us. The "Run agent" button then calls that tool exactly as an agent
// would — and you watch the live field fill itself.

const ready = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(
  null,
);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;

const SAMPLES = [
  'ada@webmcpui.com',
  'grace@webmcpui.com',
  'alan@webmcpui.com',
];
let sample = 0;

function refreshTool() {
  const t = agent?.get('fill_email');
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
  const value = SAMPLES[sample++ % SAMPLES.length]!;
  log.value = [{ role: 'agent', text: `call fill_email({ value: "${value}" })` }];
  try {
    const result = await agent.call('fill_email', { value });
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
    class="bouncy overflow-hidden rounded-card border border-border bg-card shadow-soft"
  >
    <!-- Browser chrome -->
    <div class="flex items-center gap-2 border-b border-border px-4 py-3">
      <span class="flex gap-1.5">
        <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span class="h-3 w-3 rounded-full bg-[#28c840]" />
      </span>
      <div
        class="ml-2 flex-1 truncate rounded-md bg-surface-2 px-3 py-1 text-center font-mono text-xs text-muted-foreground"
      >
        booking.example.com
      </div>
    </div>

    <div class="grid gap-px bg-border sm:grid-cols-[1.1fr_1fr]">
      <!-- The live form -->
      <div class="bg-card p-6">
        <p class="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The page
        </p>
        <div class="min-h-[6.5rem]">
          <wmcp-input
            v-if="ready"
            label="Email"
            name="email"
            type="email"
            expose
            placeholder="you@example.com"
            helper-text="An agent can fill this field."
          />
        </div>
        <button
          type="button"
          class="bouncy mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
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
      </div>

      <!-- The tool the element exposed -->
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
        <p v-else class="font-mono text-xs text-muted-foreground">
          registering…
        </p>

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
