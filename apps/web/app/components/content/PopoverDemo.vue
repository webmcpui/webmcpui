<script setup lang="ts">
import { installFakeAgent, type FakeAgent } from '@webmcpui/components/testing';

// Like the dialog, the agent's action is *open* — but non-modal and anchored.
// The agent surfaces the panel; closing stays a light-dismiss / human step.

const opened = ref(false);
const tool = ref<{ name: string; description: string; schema: unknown } | null>(null);
const log = ref<{ role: 'agent' | 'tool'; text: string }[]>([]);
const running = ref(false);

let agent: FakeAgent | undefined;

function onOpenEvent() {
  opened.value = true;
}

function refreshTool() {
  const t = agent?.get('open_account_menu');
  if (t) tool.value = { name: t.name, description: t.description, schema: t.inputSchema };
}

async function onOpen() {
  agent ??= installFakeAgent();
  await nextTick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  refreshTool();
}

function reset() {
  opened.value = false;
  log.value = [];
}

async function runAgent() {
  if (!agent || running.value) return;
  running.value = true;
  log.value = [{ role: 'agent', text: 'call open_account_menu()' }];
  try {
    const result = await agent.call('open_account_menu');
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
    url="app.example.com"
    title="Popover — an anchored panel the agent can open"
    description="Non-modal and anchored to its trigger; the agent opens it, light-dismiss closes it."
    icon="lucide:message-square-more"
    :tool="tool"
    :log="log"
    :running="running"
    :can-run="!!tool"
    @open="onOpen"
    @run="runAgent"
    @reset="reset"
  >
    <template #page>
      <div class="flex flex-col items-start gap-3">
        <wmcp-popover
          name="account_menu"
          label="Account ▾"
          placement="bottom"
          expose
          @open="onOpenEvent"
        >
          <div class="flex w-44 flex-col gap-1 text-sm">
            <p class="font-medium text-foreground">Signed in as Ada</p>
            <p class="text-muted-foreground">ada@webmcpui.com</p>
          </div>
        </wmcp-popover>
        <p class="text-sm" :class="opened ? 'text-brand' : 'text-muted-foreground'">
          <template v-if="opened">✓ Popover opened.</template>
          <template v-else>Click the trigger, or let the agent open it.</template>
        </p>
      </div>
    </template>
  </DemoStage>
</template>
