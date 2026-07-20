<script setup lang="ts">
// One natural-language sentence becomes four tool calls — every tool here is
// element-exposed (three enum-typed selects + a confirm dialog). The parser
// below stands in for a real agent's language understanding; the tools are
// exactly what a real WebMCP host would see.

const agent = useDemoAgent();

const booked = ref(false);
const day = ref('');
const time = ref('');
const party = ref('');
const confirmRef = ref<(HTMLElement & { close: (v?: string) => void }) | null>(null);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
const SIZES = ['1', '2', '3', '4', '5', '6', '7', '8'];

const samples = [
  { label: '“Book a table for 4 on Friday at 7”', text: 'Book a table for 4 on Friday at 7' },
  { label: '“Table for 2, Saturday, 6:30 please”', text: 'Table for 2, Saturday, 6:30 please' },
];

function parseRequest(text: string) {
  const size = /(?:for|of)\s+(\d)\b/i.exec(text)?.[1];
  const dayName = DAYS.find((d) => new RegExp(d, 'i').test(text));
  const t = /(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i.exec(text.replace(/for\s+\d\s*/i, ''));
  let slot: string | undefined;
  if (t) {
    const hour = Number(t[1]);
    const minutes = t[2] ?? '00';
    slot = TIMES.find((s) => s.startsWith(`${hour}:${minutes}`));
  }
  return { size, dayName, slot };
}

async function onOpen() {
  await agent.start();
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text);
    const { size, dayName, slot } = parseRequest(text);
    if (!size && !dayName && !slot) {
      agent.note('Could not read a day, time, or party size from that.');
      return;
    }
    agent.note('Filling in the reservation form.');
    if (size) await agent.call('fill_party_size', { value: size });
    if (dayName) await agent.call('fill_day', { value: dayName });
    if (slot) await agent.call('fill_time', { value: slot });
    await agent.call('confirm_reservation');
  });
}

const fields = { day, time, party } as const;

function onField(name: keyof typeof fields, e: Event) {
  fields[name].value = (e.target as HTMLInputElement).value;
}

// Human select changes don't emit a composed event across the shadow boundary,
// so pull current values straight off the elements before showing a summary.
const selectRefs = {
  day: ref<(HTMLElement & { value: string }) | null>(null),
  time: ref<(HTMLElement & { value: string }) | null>(null),
  party: ref<(HTMLElement & { value: string }) | null>(null),
};

function syncFromElements() {
  for (const key of ['day', 'time', 'party'] as const) {
    const el = selectRefs[key].value;
    if (el?.value) fields[key].value = el.value;
  }
}

function reviewBooking() {
  syncFromElements();
  (confirmRef.value as (HTMLElement & { show: () => void }) | null)?.show();
}

function confirmBooking() {
  syncFromElements();
  booked.value = true;
  confirmRef.value?.close('confirmed');
  agent.say('user confirmed → table booked');
}

function cancelBooking() {
  confirmRef.value?.close('cancelled');
}

function reset() {
  booked.value = false;
  day.value = '';
  time.value = '';
  party.value = '';
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="bistro.example.com"
    title="Book a table in one sentence"
    description="“Table for 4 on Friday at 7” — the agent fills the form; confirming stays your click."
    icon="lucide:utensils"
    :tools="agent.tools.value"
    :log="agent.log.value"
    :running="agent.running.value"
    :show-run="false"
    @open="onOpen"
    @close="agent.stop"
    @reset="reset"
  >
    <template #prompt>
      <DemoPrompt :samples="samples" :running="agent.running.value" @send="onSend" />
    </template>

    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">Chez Wmcp — reserve a table</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <wmcp-select :ref="selectRefs.day" name="day" label="Day" placeholder="Day" expose :value="day" @change="onField('day', $event)">
            <option v-for="d in DAYS" :key="d" :value="d">{{ d }}</option>
          </wmcp-select>
          <wmcp-select :ref="selectRefs.time" name="time" label="Time" placeholder="Time" expose :value="time" @change="onField('time', $event)">
            <option v-for="t in TIMES" :key="t" :value="t">{{ t }}</option>
          </wmcp-select>
          <wmcp-select :ref="selectRefs.party" name="party_size" label="Guests" placeholder="Guests" expose :value="party" @change="onField('party', $event)">
            <option v-for="s in SIZES" :key="s" :value="s">{{ s }}</option>
          </wmcp-select>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <wmcp-button variant="ghost" @click="reviewBooking">Review &amp; book</wmcp-button>
          <p class="text-sm" :class="booked ? 'text-brand' : 'text-muted-foreground'">
            <template v-if="booked">✓ Booked — {{ party }} guests, {{ day }} at {{ time }}.</template>
            <template v-else>No reservation yet.</template>
          </p>
        </div>
      </div>

      <wmcp-dialog
        ref="confirmRef"
        name="reservation"
        label="Confirm reservation"
        tool-name="confirm_reservation"
        tool-description="Open the reservation summary for the user to review and confirm."
        expose
      >
        <div class="space-y-4" style="font-family: inherit">
          <h3 class="text-base font-semibold text-foreground">Confirm your reservation</h3>
          <p class="text-sm text-muted-foreground">
            Table for <strong class="text-foreground">{{ party || '?' }}</strong> ·
            <strong class="text-foreground">{{ day || '?' }}</strong> at
            <strong class="text-foreground">{{ time || '?' }}</strong>
          </p>
          <div class="flex justify-end gap-2">
            <wmcp-button variant="ghost" @click="cancelBooking">Cancel</wmcp-button>
            <wmcp-button variant="primary" @click="confirmBooking">Confirm</wmcp-button>
          </div>
        </div>
      </wmcp-dialog>
    </template>
  </DemoStage>
</template>
