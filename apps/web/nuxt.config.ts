import tailwindcss from '@tailwindcss/vite';

// --- Google tags ------------------------------------------------------------
// Google Tag Manager container for webmcpui.com. GA4 lives INSIDE GTM (a
// "Google Tag" with the G-… measurement ID, published from the GTM UI), so
// analytics changes never need a site deploy. An empty ID omits the snippet
// entirely — set it once the container exists.
const GTM_ID = 'GTM-WBFMN73R';
// Search Console fallback: the `google-site-verification` meta token. Not
// needed when verifying a Domain property over DNS (the recommended path) or
// via the GTM container above; empty omits the tag.
const GOOGLE_SITE_VERIFICATION = '';
// Keep tracking out of `nuxt dev`; `nuxt build`/`generate` run as production.
const isProdBuild = process.env.NODE_ENV === 'production';

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

        // Search Console URL-prefix verification (only when a token is set —
        // see GOOGLE_SITE_VERIFICATION above).
        ...(GOOGLE_SITE_VERIFICATION
          ? [
              {
                name: 'google-site-verification',
                content: GOOGLE_SITE_VERIFICATION,
              },
            ]
          : []),
      ],
      script: [
        // Google AdSense site verification.
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2861080570176925',
          async: true,
          crossorigin: 'anonymous',
        },
        // Google Tag Manager (production builds only, and only once GTM_ID is
        // set). GA4 page views — including SPA navigations after hydration —
        // come from the Google Tag configured inside the container.
        ...(GTM_ID && isProdBuild
          ? [
              {
                innerHTML:
                  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
                  `var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';` +
                  `j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})` +
                  `(window,document,'script','dataLayer','${GTM_ID}');`,
              },
            ]
          : []),
      ],
      noscript: [
        // GTM's no-JS fallback, right after <body> opens.
        ...(GTM_ID && isProdBuild
          ? [
              {
                innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                tagPosition: 'bodyOpen' as const,
              },
            ]
          : []),
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
