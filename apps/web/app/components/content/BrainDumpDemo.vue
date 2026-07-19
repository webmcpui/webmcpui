<script setup lang="ts">
// Paste a rambling brain-dump; the agent splits it into prioritized tasks and
// even checks off the ones you said you'd already done. The task list is a
// dynamic collection, so its tools are page-level (`exposeTool`) — the
// checkboxes themselves stay ordinary wmcp elements the human clicks.

const agent = useDemoAgent();

interface Task {
  title: string;
  priority: 'low' | 'medium' | 'high';
  done: boolean;
}

const tasks = ref<Task[]>([]);

const samples = [
  {
    label: 'Monday brain-dump',
    text: `ok so this week is packed. I urgently need to send the invoice to Data Plus today. Also have to book the dentist sometime, no rush. Already emailed Sam about the offsite so that's handled. Need to prep the Q3 slides asap. And maybe clean up the garage eventually.`,
  },
  {
    label: 'Weekend list',
    text: `Gotta fix the leaking tap today, it's urgent. Pick up groceries. Already watered the plants. Sometime I should sort the photo albums.`,
  },
];

function priorityFor(sentence: string): Task['priority'] {
  if (/\b(urgent(ly)?|asap|today|right away)\b/i.test(sentence)) return 'high';
  if (/\b(sometime|eventually|maybe|no rush|someday)\b/i.test(sentence)) return 'low';
  return 'medium';
}

/** Trim a sentence down to a short task title. */
function titleFor(sentence: string): string {
  const cleaned = sentence
    .replace(/^(ok so|also|and|gotta|so)\s+/i, '')
    .replace(/\b(i\s+)?(urgently\s+)?(need to|have to|should|must)\s+/i, '')
    .replace(/\b(asap|today|sometime|eventually|maybe|no rush|it's urgent)\b/gi, '')
    .replace(/\s+([.,;!?])/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[,.]+\s*$/, '')
    .trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function parseDump(text: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  const add: { title: string; priority: Task['priority'] }[] = [];
  const completed: string[] = [];
  for (const s of sentences) {
    const doneMatch = /already\s+(.*?)(?:\s+so that's.*)?$/i.exec(s);
    if (doneMatch) {
      const title = titleFor(doneMatch[1]!);
      add.push({ title, priority: 'low' });
      completed.push(title);
      continue;
    }
    if (!/\b(need to|have to|should|must|gotta|pick up|fix|book|prep|clean|send|sort)\b/i.test(s)) continue;
    add.push({ title: titleFor(s), priority: priorityFor(s) });
  }
  return { add, completed };
}

const pageTools = [
  {
    name: 'add_task',
    description: 'Add a task to the to-do list with a priority.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title.' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title'],
    },
    execute: ({ title, priority }: Record<string, unknown>) => {
      tasks.value.push({
        title: String(title),
        priority: (priority as Task['priority']) ?? 'medium',
        done: false,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: `Added "${String(title)}" (${String(priority ?? 'medium')} priority).`,
          },
        ],
      };
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task on the to-do list as done, by title.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string' } },
      required: ['title'],
    },
    execute: ({ title }: Record<string, unknown>) => {
      const task = tasks.value.find(
        (t) => t.title.toLowerCase() === String(title).toLowerCase(),
      );
      if (task) task.done = true;
      return {
        content: [
          {
            type: 'text' as const,
            text: task ? `Checked off "${task.title}".` : `No task titled "${String(title)}".`,
          },
        ],
        isError: !task,
      };
    },
  },
  {
    name: 'read_tasks',
    description: 'Read the current to-do list with priorities and status.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => ({
      content: [
        {
          type: 'text' as const,
          text: tasks.value.length
            ? tasks.value
                .map((t) => `${t.done ? '[x]' : '[ ]'} ${t.title} (${t.priority})`)
                .join('; ')
            : 'The list is empty.',
        },
      ],
    }),
  },
];

async function onOpen() {
  await agent.start(pageTools);
}

async function onSend(text: string) {
  await agent.run(async () => {
    agent.say(text.length > 90 ? `${text.slice(0, 87)}…` : text);
    const { add, completed } = parseDump(text);
    if (!add.length) {
      agent.note('No tasks found in that — try describing things you need to do.');
      return;
    }
    agent.note(`Found ${add.length} tasks — adding them with priorities.`);
    for (const t of add) {
      await agent.call('add_task', { title: t.title, priority: t.priority }, 350);
    }
    for (const title of completed) {
      await agent.call('complete_task', { title });
    }
    await agent.call('read_tasks');
  });
}

function toggle(task: Task, e: Event) {
  task.done = (e.target as HTMLInputElement & { checked: boolean }).checked;
}

const badgeVariant = { high: 'destructive', medium: 'primary', low: 'secondary' } as const;

function reset() {
  tasks.value = [];
  agent.clearLog();
}

onBeforeUnmount(() => agent.destroy());
</script>

<template>
  <DemoStage
    url="todo.example.com"
    title="Brain-dump → to-do list"
    description="Paste a rambling paragraph; the agent turns it into prioritized tasks — and checks off what you already did."
    icon="lucide:list-checks"
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
        placeholder="Dump everything on your mind…"
        button-label="Sort it out"
        @send="onSend"
      />
    </template>

    <template #page>
      <div class="rounded-lg border border-border p-4">
        <p class="text-sm font-medium text-foreground">This week</p>
        <p v-if="!tasks.length" class="mt-3 text-sm text-muted-foreground">
          Nothing yet — dump your week on the agent.
        </p>
        <ul v-else class="mt-3 space-y-2">
          <li v-for="t in tasks" :key="t.title" class="flex items-center gap-2">
            <wmcp-checkbox
              :name="`task-${t.title}`"
              :label="t.title"
              :checked="t.done"
              @change="toggle(t, $event)"
            />
            <wmcp-badge :variant="badgeVariant[t.priority]" class="ml-auto">
              {{ t.priority }}
            </wmcp-badge>
          </li>
        </ul>
      </div>
    </template>
  </DemoStage>
</template>
