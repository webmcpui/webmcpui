// Generate /llms.txt (index) and /llms-full.txt (full docs) from content/docs,
// following the llmstxt.org convention, so agents have a machine-readable map
// of the library at the site root. Runs before `nuxt build`; output lands in
// public/ and is served at https://webmcpui.com/llms.txt and /llms-full.txt.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS_DIR = join(ROOT, 'content/docs');
const PUBLIC_DIR = join(ROOT, 'public');
const SITE = 'https://webmcpui.com';
const SUMMARY =
  'Framework-agnostic, WebMCP-native web components: accessible form controls an agent can fill and interaction primitives an agent can drive, with Standard Schema validation and design tokens. Each element is a good HTML control first and, when a WebMCP host is present, exposes itself as a tool an agent can call — additive and feature-detected.';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Minimal frontmatter split — the docs use flat `key: value` YAML. */
function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      const num = Number(kv[2]);
      data[kv[1]] = kv[2] !== '' && !Number.isNaN(num) ? num : kv[2];
    }
  }
  return { data, body: m[2].trim() };
}

/** content/docs/elements/button.md -> /docs/elements/button ; index -> parent. */
function urlFor(file) {
  let p = relative(DOCS_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '');
  p = p.replace(/(^|\/)index$/, '');
  return `/docs${p ? `/${p}` : ''}`;
}

const files = await walk(DOCS_DIR);

// Read + parse all pages, then order by (groupOrder, order).
const parsed = await Promise.all(
  files.map(async (file) => {
    const { data, body } = parse(await readFile(file, 'utf8'));
    return { file, url: urlFor(file), data, body };
  }),
);
parsed.sort(
  (a, b) =>
    (a.data.groupOrder ?? 99) - (b.data.groupOrder ?? 99) ||
    (a.data.order ?? 99) - (b.data.order ?? 99),
);

// --- llms.txt: grouped link index ---
const groups = new Map();
for (const p of parsed) {
  const g = p.data.group ?? 'Docs';
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(p);
}
let index = `# webmcpui\n\n> ${SUMMARY}\n`;
for (const [group, items] of groups) {
  index += `\n## ${group}\n`;
  for (const p of items) {
    const title = p.data.title ?? p.data.navTitle ?? p.url;
    const desc = p.data.description ? `: ${p.data.description}` : '';
    index += `- [${title}](${SITE}${p.url})${desc}\n`;
  }
}
index += `\n## Full text\n- [llms-full.txt](${SITE}/llms-full.txt): every doc page concatenated.\n`;

// --- llms-full.txt: the whole corpus, in reading order ---
let full = `# webmcpui — full documentation\n\n> ${SUMMARY}\n\nSource: ${SITE}\n`;
for (const p of parsed) {
  full += `\n\n---\n\n# ${p.data.title ?? p.url}\n`;
  full += `URL: ${SITE}${p.url}\n`;
  if (p.data.description) full += `\n${p.data.description}\n`;
  full += `\n${p.body}\n`;
}

await writeFile(join(PUBLIC_DIR, 'llms.txt'), index);
await writeFile(join(PUBLIC_DIR, 'llms-full.txt'), full);
console.log(
  `gen-llms: wrote public/llms.txt (${groups.size} groups, ${parsed.length} pages) + llms-full.txt`,
);
