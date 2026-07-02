// Runtime smoke test for the non-DOM utilities, run against the built dist.
// Imports from ./utils (no Lit, no HTMLElement) so this runs cleanly in Node.
// Element/DOM behaviour is covered separately by the browser test runner.
import assert from 'node:assert/strict';
import { validateStandard, exposeTool } from '../dist/utils.js';
import { installFakeAgent } from '../dist/testing.js';

// Node may expose a read-only `navigator`; ensure one exists for the harness.
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {};
}

// 1. Standard Schema validation with a hand-rolled validator (no validator dep).
const emailSchema = {
  '~standard': {
    version: 1,
    vendor: 'smoke',
    validate(value) {
      return typeof value === 'string' && value.includes('@')
        ? { value }
        : { issues: [{ message: 'Must be an email' }] };
    },
  },
};
assert.deepEqual(await validateStandard(emailSchema, 'a@b.com'), {
  valid: true,
  value: 'a@b.com',
  errors: [],
});
const bad = await validateStandard(emailSchema, 'nope');
assert.equal(bad.valid, false);
assert.deepEqual(bad.errors, ['Must be an email']);
console.log('✓ validateStandard: pass/fail outcomes correct');

// 2. WebMCP exposure round-trip via the fake agent.
const agent = installFakeAgent();
let received;
const dispose = exposeTool({
  name: 'fill_email',
  description: 'Set the email field.',
  inputSchema: { type: 'object', properties: { value: { type: 'string' } } },
  execute: (args) => {
    received = args.value;
    return { content: [{ type: 'text', text: `Set to ${args.value}` }] };
  },
});

assert.equal(agent.tools.length, 1);
assert.equal(agent.tools[0].name, 'fill_email');
const result = await agent.call('fill_email', { value: 'agent@webmcpui.com' });
assert.equal(received, 'agent@webmcpui.com');
assert.equal(result.content[0].text, 'Set to agent@webmcpui.com');
console.log('✓ exposeTool + fake agent: register → invoke → execute works');

dispose();
assert.equal(agent.tools.length, 0);
console.log('✓ disposer unregisters the tool');

agent.restore();
console.log('\nAll smoke checks passed.');
