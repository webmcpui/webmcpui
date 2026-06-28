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
          theme: {
            default: 'github-light',
            dark: 'github-dark',
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
