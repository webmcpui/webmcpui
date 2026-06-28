<script setup lang="ts">
const nav = [
  { label: 'Docs', to: '/docs' },
  { label: 'How it works', to: '/#how' },
  { label: 'Features', to: '/#features' },
];

const GITHUB_URL = 'https://github.com/webmcpui/webmcpui';
const year = 2026;
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <!-- Ambient brand glow, dark mode only -->
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40rem] opacity-0 dark:opacity-100"
      style="
        background: radial-gradient(
          60% 50% at 50% -10%,
          var(--brand-soft),
          transparent 70%
        );
      "
    />

    <header class="sticky top-0 z-50 px-4 pt-4">
      <div
        class="glass mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 shadow-soft"
      >
        <NuxtLink to="/" class="bouncy shrink-0 hover:opacity-90">
          <SiteLogo />
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="bouncy rounded-full px-3.5 py-1.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <a
            :href="GITHUB_URL"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            class="bouncy glass hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-95 sm:flex"
          >
            <Icon name="simple-icons:github" class="h-[1.05rem] w-[1.05rem]" />
          </a>
          <SiteThemeToggle />
          <NuxtLink
            to="/#install"
            class="bouncy flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:brightness-105 active:scale-[0.97]"
          >
            Get started
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-32 border-t border-border">
      <div
        class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="space-y-3">
          <SiteLogo />
          <p class="max-w-xs text-sm text-muted-foreground">
            Agent-aware web components for the WebMCP era. Framework-agnostic,
            with Standard Schema validation.
          </p>
        </div>
        <div class="flex flex-col gap-2 text-sm">
          <NuxtLink
            to="/docs"
            class="bouncy text-muted-foreground hover:text-foreground"
          >
            Docs
          </NuxtLink>
          <a
            :href="GITHUB_URL"
            target="_blank"
            rel="noreferrer"
            class="bouncy text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://standardschema.dev"
            target="_blank"
            rel="noreferrer"
            class="bouncy text-muted-foreground hover:text-foreground"
          >
            Standard Schema
          </a>
        </div>
      </div>
      <div class="border-t border-border">
        <p class="mx-auto max-w-5xl px-6 py-5 text-xs text-muted-foreground">
          © {{ year }} webmcpui — MIT licensed.
        </p>
      </div>
    </footer>
  </div>
</template>
