<script setup lang="ts">
// Expense filing without the retyping: paste receipt text, the agent fills
// vendor / amount / date / category and adds the row. Every tool here is
// element-exposed — four fills and a click.

const agent = useDemoAgent();

interface Expense {
  vendor: string;
  amount: string;
  date: string;
  category: string;
}

const form = ref<Expense>({ vendor: '', amount: '', date: '', category: '' });
const expenses = ref<Expense[]>([]);

const CATEGORIES = ['Meals', 'Travel', 'Software', 'Office'];

const samples = [
  {
    label: 'Coffee with a client',
    text: `BLUE DOOR ESPRESSO
414 5th Ave
07/14/2026 9:41 AM

2x flat white      $11.00
1x almond croissant $5.50

Subtotal  $16.50
Tip        $3.00
Total    $19.50
Thank you!`,
  },
  {
    label: 'Airport ride',
    text: `RIDESHARE RECEIPT
Trip with Dana — Jul 2, 2026
Downtown → SFO International

Trip fare   $52.80
Airport fee  $5.00
Total      $57.80`,
  },
];

const CATEGORY_HINTS: [RegExp, string][] = [
  [/espresso|coffee|restaurant|cafe|croissant|pizza|lunch|dinner/i, 'Meals'],
  [/rideshare|uber|lyft|airline|airport|flight|hotel|trip/i, 'Travel'],
  [/subscription|license|saas|\.io|\.dev|software/i, 'Software'],
];

function parseReceipt(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const vendor = lines[0]
    ?.toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s*(receipt|invoice)\s*$/i, '')
    .trim();
  // \b keeps "Subtotal" from matching before the real "Total" line.
  const amount = /\btotal\s*:?\s*\$?\s*([\d,]+\.?\d*)/i.exec(text)?.[1]?.replace(/,/g, '');
  const date =
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/.exec(text)?.[1] ??
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/i.exec(text)?.[1];
  const category = CATEGORY_HINTS.find(([re]) => re.test(text))?.[1] ?? 'Office';
  return { vendor, amount, date, category };
}

async function onOpen() {
  await agent.start();
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text.length > 90 ? `${text.slice(0, 87)}…` : text);
    const { vendor, amount, date, category } = parseReceipt(text);
    if (!amount) {
      agent.note('Could not find a total on that receipt.');
      return;
    }
    agent.note('Reading the receipt into the expense form.');
    if (vendor) await agent.call('fill_vendor', { value: vendor });
    await agent.call('fill_amount', { value: Number(amount) });
    if (date) await agent.call('fill_date', { value: date });
    await agent.call('fill_category', { value: category });
    await agent.call('add_expense');
  });
}

function onField(name: keyof Expense, e: Event) {
  form.value[name] = (e.target as HTMLInputElement).value;
}

const categoryRef = ref<(HTMLElement & { value: string }) | null>(null);

function addExpense() {
  form.value.category = categoryRef.value?.value ?? form.value.category;
  if (!form.value.amount) return;
  expenses.value.push({ ...form.value });
  form.value = { vendor: '', amount: '', date: '', category: '' };
}

const total = computed(() =>
  expenses.value.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
);

function reset() {
  form.value = { vendor: '', amount: '', date: '', category: '' };
  expenses.value = [];
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="expenses.example.com"
    title="Receipt → expense report"
    description="Paste any receipt; the agent files the expense — vendor, amount, date, category."
    icon="lucide:receipt"
    :tools="agent.tools.value"
    :log="agent.log.value"
    :running="agent.running.value"
    :show-run="false"
    @open="onOpen"
    @close="agent.stop"
    @reset="reset"
  >
    <template #prompt>
      <DemoPrompt
        multiline
        :samples="samples"
        :running="agent.running.value"
        placeholder="Paste the receipt text…"
        button-label="File expense"
        @send="onSend"
      />
    </template>

    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">New expense</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <wmcp-input
            name="vendor"
            label="Vendor"
            placeholder="Where"
            expose
            :value="form.vendor"
            @input="onField('vendor', $event)"
          />
          <wmcp-input
            name="amount"
            label="Amount ($)"
            type="number"
            placeholder="0.00"
            expose
            :value="form.amount"
            @input="onField('amount', $event)"
          />
          <wmcp-input
            name="date"
            label="Date"
            placeholder="When"
            expose
            :value="form.date"
            @input="onField('date', $event)"
          />
          <wmcp-select
            ref="categoryRef"
            name="category"
            label="Category"
            placeholder="Pick one"
            expose
            :value="form.category"
            @change="onField('category', $event)"
          >
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </wmcp-select>
        </div>
        <div class="mt-3">
          <wmcp-button
            variant="primary"
            expose
            name="expense"
            tool-name="add_expense"
            tool-description="Add the filled-in expense to the report."
            @click="addExpense"
          >
            Add expense
          </wmcp-button>
        </div>
      </div>

      <div v-if="expenses.length" class="mt-4 rounded-lg border border-border p-4">
        <p class="flex items-center justify-between text-sm font-medium text-foreground">
          This month
          <span class="font-mono text-xs text-muted-foreground">${{ total.toFixed(2) }}</span>
        </p>
        <ul class="mt-2 space-y-1.5">
          <li
            v-for="(e, i) in expenses"
            :key="i"
            class="flex items-baseline gap-2 text-sm text-muted-foreground"
          >
            <span class="text-foreground">{{ e.vendor || '—' }}</span>
            <span class="text-xs">{{ e.date }} · {{ e.category }}</span>
            <span class="ml-auto font-mono text-xs text-foreground">${{ e.amount }}</span>
          </li>
        </ul>
      </div>
    </template>
  </DemoStage>
</template>
