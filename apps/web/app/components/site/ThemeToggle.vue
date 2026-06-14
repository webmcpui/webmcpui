<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => (colorMode.preference = v ? 'dark' : 'light'),
});
</script>

<template>
  <button
    type="button"
    class="bouncy glass flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-95"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="isDark = !isDark"
  >
    <ClientOnly>
      <Icon
        :name="isDark ? 'lucide:sun' : 'lucide:moon'"
        class="h-[1.05rem] w-[1.05rem]"
      />
      <template #fallback>
        <span class="h-[1.05rem] w-[1.05rem]" />
      </template>
    </ClientOnly>
  </button>
</template>
