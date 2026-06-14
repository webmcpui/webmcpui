<script setup lang="ts">
withDefaults(defineProps<{ withWordmark?: boolean }>(), {
  withWordmark: true,
});
</script>

<template>
  <span class="flex items-center gap-2.5">
    <span
      class="relative flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-brand text-brand-foreground shadow-soft"
    >
      <!-- A control glyph (square field) wired to a node — element ⇄ agent. -->
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="6.5"
          width="11"
          height="11"
          rx="2.6"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path
          d="M14 12h4.2"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
        <circle cx="20" cy="12" r="1.9" fill="currentColor" />
      </svg>
    </span>
    <span
      v-if="withWordmark"
      class="font-mono text-[0.95rem] font-semibold tracking-tight text-foreground"
    >
      webmcp<span class="text-brand">ui</span>
    </span>
  </span>
</template>
