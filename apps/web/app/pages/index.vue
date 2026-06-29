<script setup lang="ts">
useHead({ title: 'webmcpui — agent-aware web components' });

const features = [
  {
    icon: 'lucide:blocks',
    title: 'Framework-agnostic',
    body: 'Standard custom elements built with Lit. Drop them into React, Vue, Svelte, or plain HTML — no wrapper required.',
  },
  {
    icon: 'lucide:shield-check',
    title: 'Standard Schema validation',
    body: 'Bring Zod, Valibot, or ArkType. Validation drives aria-invalid, live error messages, and native form constraints.',
  },
  {
    icon: 'lucide:sparkles',
    title: 'WebMCP exposure',
    body: 'Opt in with `expose` and each control registers an imperative WebMCP tool an agent can call — feature-detected, zero-cost when absent.',
  },
  {
    icon: 'lucide:package',
    title: 'No-build CDN',
    body: 'One script tag auto-registers every element. Perfect for Webflow, WordPress, or hand-written HTML.',
  },
  {
    icon: 'lucide:palette',
    title: 'Design tokens',
    body: 'Theming via CSS custom properties from a Style Dictionary pipeline — light and dark out of the box.',
  },
  {
    icon: 'lucide:accessibility',
    title: 'Accessible by default',
    body: 'Real form association through ElementInternals: labels, error live regions, and form participation come built in.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Drop in an element',
    body: 'Add <wmcp-input> to any page. It is a proper, accessible, form-associated control first.',
  },
  {
    n: '02',
    title: 'Opt into exposure',
    body: 'Add the `expose` attribute. The element registers a WebMCP tool on connect, removes it on disconnect.',
  },
  {
    n: '03',
    title: 'Agents fill the form',
    body: 'A WebMCP-aware agent discovers the tool and sets the value exactly as if a user typed it — validated and announced. Submitting stays a deliberate step the browser can gate behind user consent.',
  },
];

const installBuild = `pnpm add @webmcpui/core @webmcpui/tokens`;
const installCdn = `<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@webmcpui/tokens/dist/css/tokens.css" />
<script src="https://cdn.jsdelivr.net/npm/@webmcpui/core/dist/webmcpui.global.js"><\/script>

<wmcp-input label="Email" name="email" type="email" expose></wmcp-input>`;

const tab = ref<'build' | 'cdn'>('build');

const trustedBy = ['Webflow', 'WordPress', 'Astro', 'Vite', 'Next.js', 'Nuxt'];
</script>

<template>
  <!-- ===================== HERO ===================== -->
  <section class="relative px-6 pt-16 sm:pt-24">
    <div class="mx-auto max-w-5xl">
      <div class="animate-rise">
        <span
          class="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60"
            />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          WebMCP-native · Phase 1: form primitives
        </span>
      </div>

      <h1
        class="animate-rise mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        style="animation-delay: 60ms"
      >
        <span class="text-foreground">Agent-aware web components.</span><br />
        <span class="text-muted-foreground">Forms your AI can fill.</span>
      </h1>

      <p
        class="animate-rise mt-6 max-w-xl text-lg text-muted-foreground"
        style="animation-delay: 120ms"
      >
        Framework-agnostic custom elements with Standard Schema validation and
        first-class WebMCP exposure — so the same control a person types into,
        an agent can drive.
      </p>

      <div
        class="animate-rise mt-9 flex flex-wrap items-center gap-3"
        style="animation-delay: 180ms"
      >
        <NuxtLink
          to="/#install"
          class="bouncy flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-brand-foreground hover:brightness-105 active:scale-[0.97]"
        >
          Get started
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
        <NuxtLink
          to="/#how"
          class="bouncy glass flex items-center gap-2 rounded-full px-6 py-3 font-medium text-foreground hover:bg-surface-2 active:scale-[0.97]"
        >
          How it works
        </NuxtLink>
      </div>

      <div
        class="animate-rise mt-14"
        style="animation-delay: 240ms"
      >
        <ClientOnly>
          <SiteHeroDemo />
          <template #fallback>
            <div
              class="rounded-card border border-border bg-card shadow-soft"
              style="height: 19rem"
            />
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>

  <!-- ===================== TRUST STRIP ===================== -->
  <section class="px-6 pt-20">
    <div class="mx-auto max-w-5xl">
      <p class="text-center text-xs uppercase tracking-widest text-muted-foreground">
        Drops into anything that renders HTML
      </p>
      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
      >
        <span
          v-for="name in trustedBy"
          :key="name"
          class="font-mono text-sm font-medium text-muted-foreground/70"
        >
          {{ name }}
        </span>
      </div>
    </div>
  </section>

  <!-- ===================== HOW IT WORKS ===================== -->
  <section id="how" class="scroll-mt-24 px-6 pt-28">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center gap-4">
        <span class="font-mono text-sm text-muted-foreground">01</span>
        <div class="h-px flex-1 bg-border" />
        <span class="text-xs uppercase tracking-widest text-muted-foreground">
          How it works
        </span>
      </div>

      <h2 class="mt-8 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        <span class="text-foreground">One element.</span>
        <span class="text-muted-foreground">A human control and an agent tool.</span>
      </h2>

      <div class="mt-12 grid gap-5 sm:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.n"
          class="rounded-card border border-border bg-card p-6"
        >
          <span class="font-mono text-sm text-brand">{{ step.n }}</span>
          <h3 class="mt-3 text-lg font-medium text-foreground">
            {{ step.title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ step.body }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===================== FEATURES ===================== -->
  <section id="features" class="scroll-mt-24 px-6 pt-28">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center gap-4">
        <span class="font-mono text-sm text-muted-foreground">02</span>
        <div class="h-px flex-1 bg-border" />
        <span class="text-xs uppercase tracking-widest text-muted-foreground">
          Features
        </span>
      </div>

      <h2 class="mt-8 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        <span class="text-foreground">Built as a form library.</span>
        <span class="text-muted-foreground">Agent-ready on purpose.</span>
      </h2>

      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="f in features"
          :key="f.title"
          class="rounded-card border border-border bg-card p-6"
        >
          <span
            class="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand"
          >
            <Icon :name="f.icon" class="h-5 w-5" />
          </span>
          <h3 class="mt-4 text-lg font-medium text-foreground">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ f.body }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===================== INSTALL ===================== -->
  <section id="install" class="scroll-mt-24 px-6 pt-28">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center gap-4">
        <span class="font-mono text-sm text-muted-foreground">03</span>
        <div class="h-px flex-1 bg-border" />
        <span class="text-xs uppercase tracking-widest text-muted-foreground">
          Install
        </span>
      </div>

      <h2 class="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        <span class="text-foreground">Add it in one line.</span>
      </h2>
      <p class="mt-4 max-w-xl text-muted-foreground">
        Use the ESM package with your build tool, or drop a single script tag —
        no build step required.
      </p>

      <div class="mt-8 max-w-2xl">
        <div class="mb-3 flex gap-2">
          <button
            v-for="t in (['build', 'cdn'] as const)"
            :key="t"
            class="bouncy rounded-full px-4 py-1.5 text-sm font-medium"
            :class="
              tab === t
                ? 'bg-brand text-brand-foreground'
                : 'glass text-muted-foreground hover:text-foreground'
            "
            @click="tab = t"
          >
            {{ t === 'build' ? 'Build tool' : 'CDN / no build' }}
          </button>
        </div>

        <div
          class="overflow-hidden rounded-card border border-border bg-card shadow-soft"
        >
          <div
            class="flex items-center justify-between border-b border-border px-4 py-2.5"
          >
            <span class="font-mono text-xs text-muted-foreground">
              {{ tab === 'build' ? 'terminal' : 'index.html' }}
            </span>
            <SiteCopyButton :value="tab === 'build' ? installBuild : installCdn" />
          </div>
          <pre class="overflow-x-auto p-4 font-mono text-[0.8rem] leading-relaxed text-foreground"><code>{{ tab === 'build' ? installBuild : installCdn }}</code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- ===================== CTA ===================== -->
  <section class="px-6 pt-28">
    <div
      class="relative mx-auto max-w-5xl overflow-hidden rounded-card border border-border bg-card p-10 text-center shadow-soft sm:p-16"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10"
        style="
          background: radial-gradient(
            50% 80% at 50% 0%,
            var(--brand-soft),
            transparent 70%
          );
        "
      />
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        <span class="text-foreground">Build forms for people</span><br />
        <span class="text-muted-foreground">and the agents working for them.</span>
      </h2>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          to="/#install"
          class="bouncy flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-brand-foreground hover:brightness-105 active:scale-[0.97]"
        >
          Get started
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
        <a
          href="https://github.com/webmcpui/webmcpui"
          target="_blank"
          rel="noreferrer"
          class="bouncy glass flex items-center gap-2 rounded-full px-6 py-3 font-medium text-foreground hover:bg-surface-2 active:scale-[0.97]"
        >
          <Icon name="simple-icons:github" class="h-4 w-4" />
          Star on GitHub
        </a>
      </div>
    </div>
  </section>
</template>
