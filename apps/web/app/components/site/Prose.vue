<template>
  <div class="prose-doc">
    <slot />
  </div>
</template>

<style>
/* Typography for rendered Markdown. Scoped via the .prose-doc wrapper rather
   than a Tailwind plugin so the site keeps full control of the token theme. */
.prose-doc {
  color: var(--foreground);
  font-size: 0.975rem;
  line-height: 1.75;
}

.prose-doc h1 {
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}
.prose-doc h2 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 2.75rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 6rem;
}
.prose-doc h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  scroll-margin-top: 6rem;
}
.prose-doc h1 + p {
  font-size: 1.075rem;
  color: var(--muted-foreground);
}
/* Heading anchor links (added by Content) inherit the heading color, not the
   brand link color. */
.prose-doc :is(h1, h2, h3) a {
  color: inherit;
  font-weight: inherit;
  text-decoration: none;
}
.prose-doc p,
.prose-doc ul,
.prose-doc ol {
  margin-block: 1rem;
}
.prose-doc a {
  color: var(--brand);
  font-weight: 500;
  text-underline-offset: 3px;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--brand) 40%, transparent);
  transition: text-decoration-color 0.2s ease;
}
.prose-doc a:hover {
  text-decoration-color: var(--brand);
}
.prose-doc strong {
  color: var(--foreground);
  font-weight: 650;
}
.prose-doc ul {
  list-style: none;
  padding-left: 0;
}
.prose-doc ul > li {
  position: relative;
  padding-left: 1.5rem;
}
.prose-doc ul > li::before {
  content: '';
  position: absolute;
  left: 0.25rem;
  top: 0.7rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: var(--brand);
}
.prose-doc ol {
  padding-left: 1.25rem;
}
.prose-doc li {
  margin-block: 0.35rem;
}

/* Inline code */
.prose-doc :not(pre) > code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--brand-soft);
  color: var(--brand);
  padding: 0.15em 0.4em;
  border-radius: 0.4rem;
}

/* Code blocks (Shiki). Dual-theme: swap to the dark palette under .dark. */
.prose-doc pre {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.7;
  background: var(--surface-2) !important;
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  padding: 1rem 1.15rem;
  overflow-x: auto;
  margin-block: 1.25rem;
}
.prose-doc pre code {
  font-family: inherit;
  background: none;
  padding: 0;
}
.dark .prose-doc .shiki,
.dark .prose-doc .shiki span {
  color: var(--shiki-dark, inherit) !important;
  background-color: transparent !important;
  font-style: var(--shiki-dark-font-style, inherit) !important;
  font-weight: var(--shiki-dark-font-weight, inherit) !important;
}

.prose-doc blockquote {
  border-left: 3px solid var(--brand);
  padding-left: 1rem;
  margin-block: 1.25rem;
  color: var(--muted-foreground);
}
.prose-doc blockquote p {
  margin-block: 0.5rem;
}

.prose-doc hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin-block: 2.5rem;
}

.prose-doc table {
  width: 100%;
  border-collapse: collapse;
  margin-block: 1.5rem;
  font-size: 0.9rem;
}
.prose-doc th,
.prose-doc td {
  text-align: left;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid var(--border);
}
.prose-doc th {
  font-weight: 600;
  color: var(--foreground);
  background: var(--surface-2);
}
.prose-doc td {
  color: var(--muted-foreground);
}
.prose-doc td code {
  white-space: nowrap;
}
</style>
