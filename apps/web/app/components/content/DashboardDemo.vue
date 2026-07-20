<script setup lang="ts">
// Ask a dashboard a question in plain language. The agent actuates the
// controls (two enum-typed tab tools), then *perceives* the answer through a
// page-level read tool — the same number the human sees on screen.

const agent = useDemoAgent();

const quarter = ref('q3');
const region = ref('global');

const QUARTERS = [
  { value: 'q1', label: 'Q1' },
  { value: 'q2', label: 'Q2' },
  { value: 'q3', label: 'Q3' },
  { value: 'q4', label: 'Q4' },
];
const REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'amer', label: 'AMER' },
  { value: 'emea', label: 'EMEA' },
  { value: 'apac', label: 'APAC' },
];

// Revenue in $k, plus QoQ delta in %.
const DATA: Record<string, Record<string, { revenue: number; qoq: number }>> = {
  q1: {
    global: { revenue: 4120, qoq: 3 },
    amer: { revenue: 2210, qoq: 4 },
    emea: { revenue: 1240, qoq: 1 },
    apac: { revenue: 670, qoq: 9 },
  },
  q2: {
    global: { revenue: 4480, qoq: 9 },
    amer: { revenue: 2340, qoq: 6 },
    emea: { revenue: 1420, qoq: 15 },
    apac: { revenue: 720, qoq: 7 },
  },
  q3: {
    global: { revenue: 5030, qoq: 12 },
    amer: { revenue: 2580, qoq: 10 },
    emea: { revenue: 1690, qoq: 19 },
    apac: { revenue: 760, qoq: 6 },
  },
  q4: {
    global: { revenue: 5610, qoq: 12 },
    amer: { revenue: 2790, qoq: 8 },
    emea: { revenue: 1880, qoq: 11 },
    apac: { revenue: 940, qoq: 24 },
  },
};

const current = computed(() => DATA[quarter.value]![region.value]!);

/** Bar heights as % of the region's best quarter. */
const bars = computed(() => {
  const values = QUARTERS.map((q) => DATA[q.value]![region.value]!.revenue);
  const max = Math.max(...values);
  return QUARTERS.map((q, i) => ({ value: q.value, pct: (values[i]! / max) * 100 }));
});

const fmt = (k: number) =>
  k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${k}k`;

const samples = [
  { label: '“Show me Q3 EMEA revenue”', text: 'Show me Q3 EMEA revenue' },
  { label: '“How did APAC do in Q1?”', text: 'How did APAC do in Q1?' },
  { label: '“Global picture for Q4”', text: 'Global picture for Q4' },
];

const pageTools = [
  {
    name: 'read_revenue',
    description:
      'Read the revenue figure the dashboard currently displays, for the selected quarter and region.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => {
      const q = QUARTERS.find((x) => x.value === quarter.value)!.label;
      const r = REGIONS.find((x) => x.value === region.value)!.label;
      const { revenue, qoq } = DATA[quarter.value]![region.value]!;
      return {
        content: [
          {
            type: 'text' as const,
            text: `${q} ${r} revenue is ${fmt(revenue)}, ${qoq >= 0 ? 'up' : 'down'} ${Math.abs(qoq)}% QoQ.`,
          },
        ],
      };
    },
  },
];

async function onOpen() {
  await agent.start(pageTools);
}

function parseQuestion(text: string) {
  const q = /q([1-4])/i.exec(text)?.[1];
  const r = REGIONS.find((x) => new RegExp(`\\b${x.label}\\b`, 'i').test(text));
  return { q: q ? `q${q}` : undefined, r: r?.value };
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text);
    const { q, r } = parseQuestion(text);
    if (!q && !r) {
      agent.note('Could not read a quarter or region from that question.');
      return;
    }
    agent.note('Setting the dashboard to the requested view.');
    if (q) await agent.call('switch_quarter', { tab: q });
    if (r) await agent.call('switch_region', { tab: r });
    const result = await agent.call('read_revenue');
    const answer = result?.content.map((c) => c.text).join(' ');
    if (answer) agent.note(`Answer: ${answer}`);
  });
}

function onQuarter(e: Event) {
  quarter.value = (e as CustomEvent<{ value: string }>).detail.value;
}

function onRegion(e: Event) {
  region.value = (e as CustomEvent<{ value: string }>).detail.value;
}

function reset() {
  quarter.value = 'q3';
  region.value = 'global';
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="revenue.example.com"
    title="Ask the dashboard a question"
    description="“Show me Q3 EMEA revenue” — the agent sets the filters, then reads the answer off the page."
    icon="lucide:chart-column"
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
        <p class="text-sm font-medium text-foreground">Revenue</p>

        <div class="mt-3 flex flex-wrap gap-4">
          <wmcp-tabs
            name="quarter"
            label="Quarter"
            :active="quarter"
            expose
            tool-name="switch_quarter"
            tool-description="Switch the dashboard to a quarter (q1–q4)."
            @change="onQuarter"
          >
            <section v-for="q in QUARTERS" :key="q.value" :tab="q.value" :tab-label="q.label" />
          </wmcp-tabs>
          <wmcp-tabs
            name="region"
            label="Region"
            :active="region"
            expose
            tool-name="switch_region"
            tool-description="Switch the dashboard to a sales region."
            @change="onRegion"
          >
            <section v-for="r in REGIONS" :key="r.value" :tab="r.value" :tab-label="r.label" />
          </wmcp-tabs>
        </div>

        <div class="mt-4">
          <p class="font-mono text-3xl font-semibold text-foreground">
            {{ fmt(current.revenue) }}
          </p>
          <p class="mt-1 text-sm" :class="current.qoq >= 0 ? 'text-brand' : 'text-muted-foreground'">
            {{ current.qoq >= 0 ? '↑' : '↓' }} {{ Math.abs(current.qoq) }}% vs last quarter
          </p>
          <div class="mt-3 flex h-12 items-end gap-1.5">
            <div
              v-for="b in bars"
              :key="b.value"
              class="w-8 rounded-sm"
              :class="b.value === quarter ? 'bg-brand' : 'bg-surface-2'"
              :style="{ height: `${b.pct}%` }"
            />
          </div>
        </div>
      </div>
    </template>
  </DemoStage>
</template>
