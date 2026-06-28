import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        // Short label used in the sidebar (falls back to title).
        navTitle: z.string().optional(),
        // Sidebar ordering within a section.
        order: z.number().optional(),
        // Sidebar group heading, e.g. "Getting started" / "Elements".
        group: z.string().optional(),
        groupOrder: z.number().optional(),
      }),
    }),
  },
});
