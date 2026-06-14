<script setup lang="ts">
interface DocLink {
  path: string;
  title: string;
  navTitle?: string;
  group?: string;
  order?: number;
  groupOrder?: number;
}

const props = defineProps<{ items: DocLink[] }>();

const groups = computed(() => {
  const map = new Map<string, { name: string; order: number; links: DocLink[] }>();
  for (const item of props.items) {
    const name = item.group ?? 'Docs';
    if (!map.has(name)) {
      map.set(name, { name, order: item.groupOrder ?? 99, links: [] });
    }
    map.get(name)!.links.push(item);
  }
  return [...map.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({
      ...g,
      links: g.links.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    }));
});
</script>

<template>
  <nav class="space-y-7">
    <div v-for="group in groups" :key="group.name">
      <p
        class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {{ group.name }}
      </p>
      <ul class="space-y-0.5">
        <li v-for="link in group.links" :key="link.path">
          <NuxtLink
            :to="link.path"
            class="bouncy block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            active-class="!bg-brand-soft !text-brand font-medium"
          >
            {{ link.navTitle ?? link.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
