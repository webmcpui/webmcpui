/**
 * Partial-DOM resilience, run in jsdom against the built `dist`.
 *
 * The browser suite (`wtr`) proves the components work where everything is
 * implemented. This lane proves the opposite end: in an environment that
 * implements custom elements but *not* form association, the components must
 * still construct, render, validate, and expose their WebMCP tools — degrading
 * quietly rather than throwing, with exactly one dev warning for the whole
 * process.
 *
 * jsdom 30 hands back an `ElementInternals` whose form members (`setFormValue`,
 * `setValidity`, `form`, …) are all absent, so it exercises the
 * "internals exist but are useless" path. happy-dom has no `attachInternals` at
 * all and exercises the null path; both funnel through the same gates.
 *
 * Run with `--conditions=browser` so `lit` resolves to its browser build — its
 * default Node condition is the SSR build, which does not render client-side.
 * Lives outside `src/` so neither `tsc` nor the web-test-runner glob picks it up.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// --- 1. Install a DOM, before the library is imported -----------------------

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://webmcpui.test/',
  pretendToBeVisual: true,
});
const { window } = dom;

// Node ships its own versions of a few DOM-ish globals (Event, CustomEvent,
// EventTarget, …). They must be *replaced* by jsdom's, not merely filled in:
// jsdom's `dispatchEvent` rejects an event that isn't one of its own, and the
// components dispatch `input`/`change` events. So copy everything and keep only
// the Node-side globals the test harness itself needs.
const KEEP_NODE = new Set([
  'console',
  'process',
  'global',
  'globalThis',
  'Buffer',
  'setImmediate',
  'clearImmediate',
]);
for (const key of Object.getOwnPropertyNames(window)) {
  if (KEEP_NODE.has(key)) continue;
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (!descriptor) continue;
  try {
    // Force `configurable` so a later definition (and jsdom's own
    // non-configurable `window`) can still be overwritten below.
    Object.defineProperty(globalThis, key, { ...descriptor, configurable: true });
  } catch {
    // Some Node globals are non-configurable; the DOM ones we need aren't.
  }
}
// The loop copies jsdom's own `window`/`document` accessors; pin them to plain
// values so nothing depends on those getters' receiver.
for (const [key, value] of [
  ['window', window],
  ['document', window.document],
]) {
  Object.defineProperty(globalThis, key, {
    value,
    writable: true,
    configurable: true,
  });
}

// --- 2. Spy on console.warn, then import the built library ------------------

const warnings = [];
const realWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.map(String).join(' '));
};

const formAssociationWarnings = () =>
  warnings.filter(
    (message) =>
      message.includes('form association') ||
      message.includes('webmcpui.com/docs/testing#environments'),
  );

const { defineComponents } = await import('../../dist/index.js');
const { installFakeAgent } = await import('../../dist/testing.js');

defineComponents();
const agent = installFakeAgent();

process.on('exit', () => {
  console.warn = realWarn;
});

/** Append an element to the document and let Lit finish its first render. */
async function mount(html) {
  const host = window.document.createElement('div');
  host.innerHTML = html;
  const element = host.firstElementChild;
  window.document.body.append(element);
  await element.updateComplete;
  return element;
}

// --- 3. What jsdom actually provides (documents the path under test) --------

test('jsdom exercises the degraded form-association path', () => {
  // A throwaway element, not a `<wmcp-*>` one — those already consumed their
  // (single allowed) `attachInternals()` call in their constructor.
  class Probe extends window.HTMLElement {
    static formAssociated = true;
  }
  window.customElements.define('probe-el', Probe);
  const probe = new Probe();
  const internals =
    typeof probe.attachInternals === 'function' ? probe.attachInternals() : null;
  // Either jsdom has no attachInternals (null path) or it returns internals
  // without setFormValue (unsupported path). Both must degrade, not throw.
  assert.equal(
    internals === null || typeof internals.setFormValue !== 'function',
    true,
    'jsdom unexpectedly supports form association — this lane no longer tests the degrade path',
  );
});

// --- 4. A control constructs, renders, validates, and exposes its tool ------

test('a form control works in jsdom and warns exactly once', async () => {
  const input = await mount(
    '<wmcp-input name="email" label="Email" expose></wmcp-input>',
  );

  // Constructed and rendered — the attachInternals crash would have happened
  // before this, and the setFormValue crash during connectedCallback.
  assert.ok(input.shadowRoot, 'shadow root attached');
  assert.ok(
    input.shadowRoot.querySelector('input'),
    'inner <input> rendered by Lit',
  );

  // The WebMCP tool is exposed.
  const tool = agent.get('fill_email');
  assert.ok(tool, 'fill_email tool registered');

  // And the agent can drive it.
  const result = await agent.call('fill_email', { value: 'agent@example.com' });
  assert.equal(result.isError ?? false, false);
  assert.match(result.content[0].text, /agent@example\.com/);
  assert.equal(input.value, 'agent@example.com');

  // Exactly one warning, naming the problem and pointing at the docs.
  const warned = formAssociationWarnings();
  assert.equal(warned.length, 1, `expected 1 warning, got: ${warned.length}`);
  assert.match(warned[0], /form association/);
  assert.match(warned[0], /webmcpui\.com\/docs\/testing#environments/);
});

test('validation still runs without form association', async () => {
  const input = await mount(
    '<wmcp-input name="required_field" required></wmcp-input>',
  );
  assert.equal(await input.validate(), false, 'required + empty is invalid');
  assert.ok(input.hasAttribute('invalid'));

  input.value = 'filled';
  assert.equal(await input.validate(), true);
  assert.equal(input.hasAttribute('invalid'), false);
});

// --- 5. The warning is once per process, across every control and button ----

test('a second control does not warn again', async () => {
  await mount('<wmcp-input name="second" expose></wmcp-input>');
  assert.equal(formAssociationWarnings().length, 1);
});

test('a submit button degrades truthfully and does not warn again', async () => {
  const button = await mount(
    '<wmcp-button name="save" type="submit" expose>Save</wmcp-button>',
  );
  assert.ok(button.shadowRoot.querySelector('button'), 'inner <button> rendered');

  // No form association means no form: the tool reports that honestly instead
  // of claiming a submit that never happened, and nothing throws.
  const result = await agent.call('click_save');
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /not inside a form/);

  // The button hit the same unavailable-form-association path — still one warning.
  assert.equal(formAssociationWarnings().length, 1);
});
