<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/components/testing';

// Action exposure at its simplest: a <wmcp-button expose> registers a no-arg
// tool that activates the button exactly as a human click would.

const booked = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;

function onBook() {
  booked.value = true;
}

function refreshTool() {
  const t = agent?.get('book_appointment');
  if (t) tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
}

async function onOpen() {
  agent ??= installFakeAgent();
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
}

function reset() {
  booked.value = false;
  log.value = [];
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  log.value = [{ role: 'agent', text: 'call book_appointment()' }];
  try {
    const result = await agent.call('book_appointment');
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
    url="booking.example.com"
    title="Button — an action the agent can trigger"
    description="A no-argument tool that activates the button just like a human click."
    icon="lucide:mouse-pointer-click"
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
        <wmcp-button
          expose
          tool-name="book_appointment"
          tool-description="Book the selected appointment slot."
          @click="onBook"
        >
          Book appointment
        </wmcp-button>
        <p class="text-sm" :class="booked ? 'text-brand' : 'text-muted-foreground'">
          <template v-if="booked">✓ Appointment booked.</template>
          <template v-else>No booking yet — click the button, or run the agent.</template>
        </p>
      </div>
    </template>
  </DemoStage>
</template>
