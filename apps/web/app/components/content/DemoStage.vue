<script setup lang="ts">
// Shared chrome for the live element demos. Collapsed, it's a compact launch
// card (a clean trigger, no overflow). Opened, it lifts into a near-fullscreen
// browser-window overlay with a balanced two-zone layout: the live page on one
// side, the exposed WebMCP tool + agent log on the other. Presentational only —
// each demo owns its agent logic and fills the #page slot.

interface ToolInfo {
  name: string;
  description: string;
  schema: unknown;
}
interface LogLine {
  role: 'agent' | 'tool' | 'user';
  text: string;
}

const props = withDefaults(
  defineProps<{
    url?: string;
    title: string;
    description?: string;
    icon?: string;
    tool?: ToolInfo | null;
    log?: LogLine[];
    running?: boolean;
    canRun?: boolean;
  }>(),
  {
    url: 'app.example.com',
    description: '',
    icon: 'lucide:sparkles',
    tool: null,
    log: () => [],
    running: false,
    canRun: true,
  },
);

const emit = defineEmits<{
  run: [];
  reset: [];
  open: [];
  close: [];
}>();

const open = ref(false);

function launch() {
  open.value = true;
  document.body.style.overflow = 'hidden';
  emit('open');
}

function dismiss() {
  open.value = false;
  document.body.style.overflow = '';
  emit('close');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) dismiss();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const roleGlyph = { agent: '→', tool: '←', user: '•' } as const;
</script>

<template>
  <!-- Collapsed: the trigger. Forced `dark` so the demo reads as a distinct
       interactive surface even on light docs pages (it dissolves otherwise). -->
  <button
    type="button"
    class="dark bouncy not-prose group my-6 flex w-full items-center gap-4 rounded-card border border-border bg-card p-5 text-left text-foreground hover:-translate-y-1 hover:shadow-soft"
    @click="launch"
  >
    <span
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"
    >
      <Icon :name="icon" class="h-5 w-5" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="flex items-center gap-2">
        <span class="font-medium text-foreground">{{ title }}</span>
        <span
          class="rounded-full bg-surface-2 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
        >
          Live demo
        </span>
      </span>
      <span v-if="description" class="mt-0.5 block truncate text-sm text-muted-foreground">
        {{ description }}
      </span>
    </span>
    <span
      class="bouncy flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground group-hover:brightness-105"
    >
      Try it
      <Icon name="lucide:arrow-up-right" class="h-4 w-4" />
    </span>
  </button>

  <!-- Expanded: the near-fullscreen interactive overlay -->
  <Teleport to="body">
    <Transition name="stage">
      <div
        v-if="open"
        class="dark fixed inset-0 z-[100] flex items-center justify-center p-4 text-foreground sm:p-6"
        @click.self="dismiss"
      >
        <div class="absolute inset-0 bg-black/65 backdrop-blur-sm" @click="dismiss" />

        <div
          class="stage-panel relative flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-card border border-border bg-card shadow-soft"
        >
          <!-- Browser chrome header -->
          <header class="flex items-center gap-3 border-b border-border px-4 py-3">
            <span class="flex gap-1.5">
              <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span class="h-3 w-3 rounded-full bg-[#28c840]" />
            </span>
            <div
              class="mx-auto flex max-w-xs flex-1 items-center justify-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              <Icon name="lucide:lock" class="h-3 w-3" />
              {{ url }}
            </div>
            <button
              type="button"
              class="bouncy flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              aria-label="Close demo"
              @click="dismiss"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </header>

          <!-- Two-zone body -->
          <div class="grid min-h-0 flex-1 gap-px overflow-auto bg-border md:grid-cols-[1.05fr_1fr]">
            <!-- The live page -->
            <section class="flex flex-col bg-card p-6 sm:p-8">
              <p
                class="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-brand" /> The page
              </p>
              <div class="flex flex-1 flex-col justify-center">
                <slot name="page" />
              </div>
              <div class="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="bouncy flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
                  :disabled="running || !canRun"
                  @click="emit('run')"
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
                  @click="emit('reset')"
                >
                  Reset
                </button>
              </div>
            </section>

            <!-- The exposed tool -->
            <section class="flex min-w-0 flex-col bg-card p-6 sm:p-8">
              <p
                class="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Exposed WebMCP tool
              </p>

              <div v-if="tool" class="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
                <span
                  class="w-fit rounded-md bg-brand-soft px-2 py-1 font-mono text-xs font-semibold text-brand"
                >
                  {{ tool.name }}
                </span>
                <p class="text-sm text-muted-foreground">{{ tool.description }}</p>
                <pre
                  class="min-w-0 max-w-full overflow-auto rounded-lg bg-surface-2 p-3 font-mono text-[0.72rem] leading-relaxed text-foreground"
                >{{ JSON.stringify(tool.schema, null, 2) }}</pre>
              </div>
              <p v-else class="font-mono text-xs text-muted-foreground">registering…</p>

              <div v-if="log.length" class="mt-4 space-y-1.5 border-t border-border pt-4 font-mono text-[0.72rem]">
                <p
                  v-for="(line, i) in log"
                  :key="i"
                  class="break-words"
                  :class="{
                    'text-brand': line.role === 'agent',
                    'text-foreground': line.role === 'user',
                    'text-muted-foreground': line.role === 'tool',
                  }"
                >
                  <span class="opacity-60">{{ roleGlyph[line.role] }}</span>
                  {{ line.text }}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.stage-enter-active,
.stage-leave-active {
  transition: opacity 0.2s ease;
}
.stage-enter-active .stage-panel,
.stage-leave-active .stage-panel {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.stage-enter-from,
.stage-leave-to {
  opacity: 0;
}
.stage-enter-from .stage-panel,
.stage-leave-to .stage-panel {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .stage-enter-active .stage-panel,
  .stage-leave-active .stage-panel {
    transition: none;
  }
}
</style>
