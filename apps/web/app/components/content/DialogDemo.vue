<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/core/testing';

// The Phase 2 demo story: an agent-triggered modal the user reviews and
// confirms. The agent can OPEN the dialog (call confirm_booking) — but the
// confirm itself stays the human's click. Action in; consent gate held.

const ready = ref(false);
const booked = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(
  null,
);
const log = ref<{ role: 'agent' | 'tool' | 'user'; text: string }[]>([]);
const running = ref(false);

const dialogRef = ref<(HTMLElement & { close: (v?: string) => void }) | null>(
  null,
);
let agent: FakeAgent | undefined;

function confirm() {
  booked.value = true;
  dialogRef.value?.close('confirmed');
  log.value.push({ role: 'user', text: 'user confirmed → booked' });
}

function cancel() {
  dialogRef.value?.close('cancelled');
  log.value.push({ role: 'user', text: 'user dismissed the dialog' });
}

function reset() {
  booked.value = false;
  log.value = [];
}

function refreshTool() {
  const t = agent?.get('confirm_booking');
  if (t) {
    tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
  }
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  log.value = [{ role: 'agent', text: 'call confirm_booking()' }];
  try {
    const result = await agent.call('confirm_booking');
    log.value.push({
      role: 'tool',
      text: result.content.map((c) => c.text).join(' '),
    });
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
        <div class="rounded-lg border border-border p-4">
          <p class="text-sm font-medium text-foreground">Acme Dental — appointment</p>
          <p class="mt-1 text-sm text-muted-foreground">Tuesday, 3:00 PM · Dr. Reyes</p>
          <p class="mt-3 text-sm" :class="booked ? 'text-brand' : 'text-muted-foreground'">
            <template v-if="booked">✓ Booked — see you then.</template>
            <template v-else>Not booked yet.</template>
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

        <!-- The agent opens this; the human confirms inside it. -->
        <wmcp-dialog
          v-if="ready"
          ref="dialogRef"
          name="booking"
          label="Confirm booking"
          tool-name="confirm_booking"
          tool-description="Open the booking confirmation for the user to review and confirm."
          expose
        >
          <div class="space-y-4" style="font-family: inherit">
            <h3 class="text-base font-semibold text-foreground">Confirm your booking</h3>
            <p class="text-sm text-muted-foreground">
              Book <strong class="text-foreground">Tuesday, 3:00 PM</strong> with Dr. Reyes?
            </p>
            <div class="flex justify-end gap-2">
              <wmcp-button variant="ghost" @click="cancel">Cancel</wmcp-button>
              <wmcp-button variant="primary" @click="confirm">Confirm booking</wmcp-button>
            </div>
          </div>
        </wmcp-dialog>
      </div>

      <!-- The tool the dialog exposed -->
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
            :class="{
              'text-brand': line.role === 'agent',
              'text-foreground': line.role === 'user',
              'text-muted-foreground': line.role === 'tool',
            }"
          >
            <span class="opacity-60">{{
              line.role === 'agent' ? '→' : line.role === 'user' ? '•' : '←'
            }}</span>
            {{ line.text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
