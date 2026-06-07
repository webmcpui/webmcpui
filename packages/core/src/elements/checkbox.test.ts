import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { StandardSchemaV1 } from '../standard-schema.js';
import type { WmcpCheckbox } from './checkbox.js';

before(() => defineComponents());

/** Standard Schema requiring the box to be checked (terms-acceptance case). */
const mustAccept: StandardSchemaV1<unknown, boolean> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) =>
      value === true
        ? { value }
        : { issues: [{ message: 'You must accept to continue' }] },
  },
};

describe('wmcp-checkbox', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-checkbox')).to.exist;
  });

  it('renders a checkbox input and label', async () => {
    const el = await fixture<WmcpCheckbox>(
      html`<wmcp-checkbox label="Subscribe"></wmcp-checkbox>`,
    );
    const input = el.shadowRoot!.querySelector('input[type="checkbox"]');
    expect(input).to.exist;
    expect(el.shadowRoot!.querySelector('.label-text')?.textContent?.trim()).to.equal(
      'Subscribe',
    );
  });

  it('defaults its submit value to "on"', async () => {
    const el = await fixture<WmcpCheckbox>(html`<wmcp-checkbox></wmcp-checkbox>`);
    expect(el.value).to.equal('on');
  });

  it('updates checked on toggle', async () => {
    const el = await fixture<WmcpCheckbox>(html`<wmcp-checkbox></wmcp-checkbox>`);
    const input = el.shadowRoot!.querySelector('input')!;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  describe('form association', () => {
    it('contributes nothing when unchecked', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-checkbox name="terms"></wmcp-checkbox></form>`,
      );
      expect(new FormData(form).has('terms')).to.be.false;
    });

    it('contributes its value when checked', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-checkbox name="terms"></wmcp-checkbox></form>`,
      );
      const el = form.querySelector<WmcpCheckbox>('wmcp-checkbox')!;
      el.checked = true;
      await el.updateComplete;
      expect(new FormData(form).get('terms')).to.equal('on');
    });

    it('honors a custom value', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-checkbox name="terms" value="accepted" checked></wmcp-checkbox>
        </form>`,
      );
      await form.querySelector<WmcpCheckbox>('wmcp-checkbox')!.updateComplete;
      expect(new FormData(form).get('terms')).to.equal('accepted');
    });

    it('restores the initial checked state on reset', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-checkbox name="t" checked></wmcp-checkbox></form>`,
      );
      const el = form.querySelector<WmcpCheckbox>('wmcp-checkbox')!;
      el.checked = false;
      await el.updateComplete;
      form.reset();
      await el.updateComplete;
      expect(el.checked).to.be.true;
    });
  });

  describe('Standard Schema validation', () => {
    it('validates the boolean checked state', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-checkbox name="terms"></wmcp-checkbox></form>`,
      );
      const el = form.querySelector<WmcpCheckbox>('wmcp-checkbox')!;
      el.schema = mustAccept;

      await el.validate();
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.true;
      expect(el.shadowRoot!.querySelector('.error')?.textContent).to.contain(
        'must accept',
      );
      expect(form.checkValidity()).to.be.false;

      el.checked = true;
      await el.validate();
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.false;
      expect(form.checkValidity()).to.be.true;
    });
  });

  describe('WebMCP exposure', () => {
    it('exposes a boolean tool and toggles in both directions', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpCheckbox>(
          html`<wmcp-checkbox name="terms" label="Accept" expose></wmcp-checkbox>`,
        );
        await el.updateComplete;

        const tool = agent.get('fill_terms');
        expect(tool).to.exist;
        const checkedSchema = (tool!.inputSchema as any).properties.checked;
        expect(checkedSchema.type).to.equal('boolean');

        const on = await agent.call('fill_terms', { checked: true });
        await el.updateComplete;
        expect(el.checked).to.be.true;
        expect(on.content[0]!.text).to.contain('checked');

        await agent.call('fill_terms', { checked: false });
        await el.updateComplete;
        expect(el.checked).to.be.false;
      } finally {
        agent.restore();
      }
    });
  });
});
