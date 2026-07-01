import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxt/content', '@nuxtjs/color-mode', '@nuxt/icon', '@nuxt/fonts'],

  content: {
    // Code blocks: Shiki themes for light + dark, driven by the `.dark` class.
    build: {
      markdown: {
        highlight: {
          // Ayu Dark for dark mode (the dark-first default). Ayu *Light* fails
          // WCAG AA on our near-white code background (strings/tags/attrs land
          // ~2.0–2.4:1, well under 4.5:1), so the light pair is GitHub's
          // contrast-tuned light theme instead.
          theme: {
            default: 'github-light-default',
            dark: 'ayu-dark',
          },
          langs: ['html', 'ts', 'js', 'bash', 'json', 'vue', 'css'],
        },
      },
    },
  },

  css: [
    // Component theme tokens (defines :root + .dark CSS custom properties that
    // the <wmcp-*> elements consume). Loaded before our Tailwind layer so the
    // site can reference the same variables.
    '@webmcpui/tokens/css',
    '~/assets/css/main.css',
  ],

  // The <wmcp-*> custom elements are real DOM custom elements, not Vue
  // components — tell the Vue compiler to leave them alone.
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('wmcp-'),
    },
  },

  colorMode: {
    classSuffix: '', // emit `.dark` / `.light` (matches the token CSS selectors)
    preference: 'dark',
    fallback: 'dark',
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'JetBrains Mono', provider: 'google' },
    ],
  },

  icon: {
    mode: 'svg',
    // Bundle every icon used in source into the client so the site is fully
    // static — no runtime /api/_nuxt_icon fetch (which a server function would
    // otherwise have to serve).
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    serverBundle: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'webmcpui — agent-aware web components',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Framework-agnostic, WebMCP-native web components. Form primitives your AI agent can fill — with Standard Schema validation and design tokens.',
        },

        // Open Graph (Facebook, LinkedIn, Slack, Discord, iMessage). The image
        // URL must be absolute for scrapers to resolve it.
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'webmcpui' },
        { property: 'og:url', content: 'https://webmcpui.com' },
        {
          property: 'og:title',
          content: 'webmcpui — agent-aware web components',
        },
        {
          property: 'og:description',
          content:
            'Framework-agnostic, WebMCP-native web components. Form primitives your AI agent can fill — with Standard Schema validation and design tokens.',
        },
        { property: 'og:image', content: 'https://webmcpui.com/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        {
          property: 'og:image:alt',
          content: 'webmcpui — agent-aware web components for the WebMCP era',
        },

        // Twitter / X large-image card.
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'webmcpui — agent-aware web components',
        },
        {
          name: 'twitter:description',
          content:
            'Framework-agnostic, WebMCP-native web components. Form primitives your AI agent can fill — with Standard Schema validation and design tokens.',
        },
        { name: 'twitter:image', content: 'https://webmcpui.com/og.png' },
      ],
    },
  },

  // Static site: prerender everything to plain HTML for Cloudflare Pages.
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
});
