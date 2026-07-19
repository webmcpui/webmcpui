<script setup lang="ts">
// The business classic: paste a messy inquiry email, the agent extracts the
// who/where/how-much/what and fills the CRM lead form — every field an
// element-exposed tool, submission an exposed button. You review the filled
// form before anything is saved.

const agent = useDemoAgent();

interface Lead {
  contact: string;
  company: string;
  budget: string;
  need: string;
}

const form = ref<Lead>({ contact: '', company: '', budget: '', need: '' });
const leads = ref<Lead[]>([]);

const BUDGETS = ['< $5k', '$5–25k', '$25–100k', '$100k+'];

const samples = [
  {
    label: 'Inquiry from Priya',
    text: `Subject: website help??

Hi there — found you via the syntax podcast. I'm Priya Sharma and I run ops at Brightleaf Coffee. Our online store is falling apart and we're looking for someone to rebuild it before the holiday rush. We've set aside about $40,000 for this. Can you help?

Priya`,
  },
  {
    label: 'Inquiry from Marcus',
    text: `hey! quick one. marcus here from stackline.io — we need an audit of our checkout flow, conversion is tanking. budget is tight, maybe $8k tops. lmk

Marcus Webb
Growth Lead, Stackline`,
  },
];

function bucketBudget(amount: number): string {
  if (amount < 5000) return BUDGETS[0]!;
  if (amount < 25000) return BUDGETS[1]!;
  if (amount < 100000) return BUDGETS[2]!;
  return BUDGETS[3]!;
}

function parseEmail(text: string) {
  const contact =
    /\bI'm ([A-Z][a-z]+ [A-Z][a-z]+)/.exec(text)?.[1] ??
    /^([A-Z][a-z]+ [A-Z][a-z]+)$/m.exec(text)?.[1] ??
    /\b([a-z]+) here\b/i.exec(text)?.[1];
  const company =
    /\b(?:at|from) ([A-Z][\w]*(?: [A-Z][\w]*)*|[a-z]+\.\w{2,})/.exec(text)?.[1] ??
    /^.*,\s*(.+)$/m.exec(text.trim().split('\n').at(-1) ?? '')?.[1];
  const amountText = /\$\s?([\d,]+(?:\.\d+)?)\s*(k)?/i.exec(text);
  let budget: string | undefined;
  if (amountText) {
    const amount =
      parseFloat(amountText[1]!.replace(/,/g, '')) * (amountText[2] ? 1000 : 1);
    budget = bucketBudget(amount);
  }
  const need = text
    .split(/(?<=[.!?])\s+/)
    .find((s) => /\b(looking for|need|want|help with|rebuild|audit)\b/i.test(s))
    ?.replace(/\s+/g, ' ')
    .trim();
  return { contact, company, budget, need };
}

async function onOpen() {
  await agent.start();
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text.length > 90 ? `${text.slice(0, 87)}…` : text);
    const { contact, company, budget, need } = parseEmail(text);
    if (!contact && !company && !budget && !need) {
      agent.note('Could not extract lead details — paste an inquiry email.');
      return;
    }
    agent.note('Extracting lead details from the email.');
    if (contact) await agent.call('fill_contact', { value: contact });
    if (company) await agent.call('fill_company', { value: company });
    if (budget) await agent.call('fill_budget', { value: budget });
    if (need) await agent.call('fill_need', { value: need });
    await agent.call('create_lead');
  });
}

function onField(name: keyof Lead, e: Event) {
  form.value[name] = (e.target as HTMLInputElement).value;
}

// A human changing the native <select> doesn't emit a composed event, so read
// the element's value directly when the lead is saved.
const budgetRef = ref<(HTMLElement & { value: string }) | null>(null);

function createLead() {
  form.value.budget = budgetRef.value?.value ?? form.value.budget;
  if (!form.value.contact && !form.value.company) return;
  leads.value.push({ ...form.value });
  form.value = { contact: '', company: '', budget: '', need: '' };
}

function reset() {
  form.value = { contact: '', company: '', budget: '', need: '' };
  leads.value = [];
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="crm.example.com"
    title="Email → CRM lead"
    description="Paste a messy inquiry email; the agent fills the lead form and files it — no retyping."
    icon="lucide:contact"
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
        placeholder="Paste the inquiry email…"
        button-label="File this lead"
        @send="onSend"
      />
    </template>

    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">New lead</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <wmcp-input
            name="contact"
            label="Contact"
            placeholder="Full name"
            expose
            :value="form.contact"
            @input="onField('contact', $event)"
          />
          <wmcp-input
            name="company"
            label="Company"
            placeholder="Company"
            expose
            :value="form.company"
            @input="onField('company', $event)"
          />
          <wmcp-select
            ref="budgetRef"
            name="budget"
            label="Budget"
            placeholder="Select range"
            expose
            :value="form.budget"
            @change="onField('budget', $event)"
          >
            <option v-for="b in BUDGETS" :key="b" :value="b">{{ b }}</option>
          </wmcp-select>
          <wmcp-textarea
            name="need"
            label="What they need"
            placeholder="Summary of the request"
            :rows="2"
            expose
            :value="form.need"
            @input="onField('need', $event)"
            class="sm:col-span-2"
          />
        </div>
        <div class="mt-3">
          <wmcp-button
            variant="primary"
            expose
            name="create-lead"
            tool-name="create_lead"
            tool-description="Save the filled-in lead form as a new CRM lead."
            @click="createLead"
          >
            Create lead
          </wmcp-button>
        </div>
      </div>

      <div v-if="leads.length" class="mt-4 rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">Leads</p>
        <ul class="mt-2 space-y-1.5">
          <li v-for="(l, i) in leads" :key="i" class="text-sm text-muted-foreground">
            <span class="text-foreground">{{ l.contact }}</span>
            · {{ l.company }} · {{ l.budget || '—' }}
          </li>
        </ul>
      </div>
    </template>
  </DemoStage>
</template>
