<script setup lang="ts">
const route = useRoute();

// The current page.
const { data: page } = await useAsyncData(`doc-${route.path}`, () =>
  queryCollection('docs').path(route.path).first(),
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Doc not found', fatal: true });
}

// Sidebar list (all docs, grouped client-side by frontmatter).
const { data: docs } = await useAsyncData('docs-sidebar', () =>
  queryCollection('docs')
    .select('path', 'title', 'navTitle', 'group', 'order', 'groupOrder')
    .all(),
);

// Prev / next in *reading order* — the same (groupOrder, order) sort the
// sidebar uses. queryCollectionItemSurroundings orders by file path, which
// doesn't match the curated nav, so we compute neighbours from the nav list.
const ordered = computed(() =>
  [...(docs.value ?? [])].sort(
    (a, b) =>
      (a.groupOrder ?? 99) - (b.groupOrder ?? 99) ||
      (a.order ?? 99) - (b.order ?? 99),
  ),
);

const currentIndex = computed(() =>
  ordered.value.findIndex((d) => d.path === route.path),
);

const prev = computed(() => {
  const i = currentIndex.value;
  return i > 0 ? ordered.value[i - 1] : null;
});
const next = computed(() => {
  const i = currentIndex.value;
  return i >= 0 && i < ordered.value.length - 1 ? ordered.value[i + 1] : null;
});

const toc = computed(() => page.value?.body?.toc?.links ?? []);

useHead(() => ({
  title: page.value ? `${page.value.title} — webmcpui docs` : 'webmcpui docs',
}));
useSeoMeta({ description: () => page.value?.description });
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 pt-10">
    <div class="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)_13rem]">
      <!-- Sidebar -->
      <aside class="hidden lg:block">
        <div class="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-10">
          <DocsSidebar :items="docs ?? []" />
        </div>
      </aside>

      <!-- Content -->
      <article class="min-w-0">
        <SiteProse v-if="page">
          <ContentRenderer :value="page" />
        </SiteProse>

        <!-- Prev / next -->
        <div class="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          <NuxtLink
            v-if="prev"
            :to="prev.path"
            class="bouncy group rounded-card border border-border bg-card p-4 hover:-translate-y-1 hover:shadow-soft"
          >
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="lucide:arrow-left" class="h-3.5 w-3.5" /> Previous
            </span>
            <span class="mt-1 block font-medium text-foreground group-hover:text-brand">
              {{ prev.navTitle ?? prev.title }}
            </span>
          </NuxtLink>
          <NuxtLink
            v-if="next"
            :to="next.path"
            class="bouncy group rounded-card border border-border bg-card p-4 text-right hover:-translate-y-1 hover:shadow-soft sm:col-start-2"
          >
            <span
              class="flex items-center justify-end gap-1.5 text-xs text-muted-foreground"
            >
              Next <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
            </span>
            <span class="mt-1 block font-medium text-foreground group-hover:text-brand">
              {{ next.navTitle ?? next.title }}
            </span>
          </NuxtLink>
        </div>
      </article>

      <!-- TOC -->
      <aside class="hidden xl:block">
        <div class="sticky top-24">
          <p
            v-if="toc.length"
            class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            On this page
          </p>
          <ul class="space-y-2 border-l border-border">
            <li v-for="link in toc" :key="link.id">
              <a
                :href="`#${link.id}`"
                class="bouncy -ml-px block border-l border-transparent pl-3 text-sm text-muted-foreground hover:border-brand hover:text-foreground"
              >
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
