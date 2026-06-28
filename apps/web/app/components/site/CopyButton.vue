<script setup lang="ts">
const props = defineProps<{ value: string }>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1600);
  } catch {
    /* clipboard unavailable — no-op */
  }
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <button
    type="button"
    class="bouncy flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground active:scale-90"
    :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
    @click="copy"
  >
    <Icon
      :name="copied ? 'lucide:check' : 'lucide:copy'"
      class="h-4 w-4"
      :class="copied ? 'text-brand' : ''"
    />
  </button>
</template>
