<script setup lang="ts">
// The human side of the example demos: sample chips + an optional paste box.
// Plain Vue on purpose — this panel plays the user↔agent chat, not the page,
// so it isn't built from wmcp elements.

const props = withDefaults(
  defineProps<{
    samples: { label: string; text: string }[];
    placeholder?: string;
    running?: boolean;
    multiline?: boolean;
    buttonLabel?: string;
  }>(),
  {
    placeholder: 'Ask the agent…',
    running: false,
    multiline: false,
    buttonLabel: 'Send',
  },
);

const emit = defineEmits<{ send: [text: string] }>();

const text = ref('');

function pick(sample: { label: string; text: string }) {
  text.value = sample.text;
  // Chips-only prompts send immediately — one click, no extra step.
  if (!props.multiline) submit();
}

function submit() {
  const value = text.value.trim();
  if (!value || props.running) return;
  emit('send', value);
}
</script>

<template>
  <div class="mb-6 rounded-lg border border-border bg-surface-2/40 p-3">
    <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Tell the agent
    </p>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="s in samples"
        :key="s.label"
        type="button"
        class="bouncy rounded-full bg-surface-2 px-3 py-1 text-xs text-foreground hover:bg-brand-soft hover:text-brand disabled:opacity-60"
        :disabled="running"
        @click="pick(s)"
      >
        {{ s.label }}
      </button>
    </div>
    <template v-if="multiline">
      <textarea
        v-model="text"
        rows="5"
        class="mt-2 w-full resize-y rounded-lg border border-border bg-card p-2.5 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
        :placeholder="placeholder"
        :disabled="running"
      />
      <button
        type="button"
        class="bouncy mt-1 flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-medium text-brand-foreground hover:brightness-105 disabled:opacity-60"
        :disabled="running || !text.trim()"
        @click="submit"
      >
        <Icon
          :name="running ? 'lucide:loader-circle' : 'lucide:send'"
          class="h-3.5 w-3.5"
          :class="running ? 'animate-spin' : ''"
        />
        {{ running ? 'Agent working…' : buttonLabel }}
      </button>
    </template>
  </div>
</template>
