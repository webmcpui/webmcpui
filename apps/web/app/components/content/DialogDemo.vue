<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/components/testing';

// An agent-triggered modal the user reviews and confirms. The agent can OPEN
// the dialog; the confirm itself stays the human's click — the consent gate.

const booked = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool' | 'user'; text: string }[]>([]);
const running = ref(false);

const dialogRef = ref<(HTMLElement & { close: (v?: string) => void }) | null>(null);
let agent: FakeAgent | undefined;

function confirmBooking() {
  booked.value = true;
  dialogRef.value?.close('confirmed');
  log.value.push({ role: 'user', text: 'user confirmed → booked' });
}

function cancel() {
  dialogRef.value?.close('cancelled');
  log.value.push({ role: 'user', text: 'user dismissed the dialog' });
}

function refreshTool() {
  const t = agent?.get('confirm_booking');
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
  log.value = [{ role: 'agent', text: 'call confirm_booking()' }];
  try {
    const result = await agent.call('confirm_booking');
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
    title="Dialog — agent opens, human confirms"
    description="The agent surfaces a modal for review; confirming stays a deliberate human step."
    icon="lucide:square-stack"
    :tool="tool"
    :log="log"
    :running="running"
    :can-run="!!tool"
    @open="onOpen"
    @run="runAgent"
    @reset="reset"
  >
    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">Acme Dental — appointment</p>
        <p class="mt-1 text-sm text-muted-foreground">Tuesday, 3:00 PM · Dr. Reyes</p>
        <p class="mt-3 text-sm" :class="booked ? 'text-brand' : 'text-muted-foreground'">
          <template v-if="booked">✓ Booked — see you then.</template>
          <template v-else>Not booked yet.</template>
        </p>
      </div>

      <wmcp-dialog
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
            <wmcp-button variant="primary" @click="confirmBooking">Confirm booking</wmcp-button>
          </div>
        </div>
      </wmcp-dialog>
    </template>
  </DemoStage>
</template>
