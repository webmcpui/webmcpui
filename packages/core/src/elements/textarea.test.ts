import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { StandardSchemaV1 } from '../standard-schema.js';
import type { WmcpTextarea } from './textarea.js';

before(() => defineComponents());

/** A hand-rolled Standard Schema requiring a minimum length. */
const minLenSchema: StandardSchemaV1<unknown, string> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) =>
      typeof value === 'string' && value.trim().length >= 10
        ? { value }
        : { issues: [{ message: 'Please write at least 10 characters' }] },
  },
};

describe('wmcp-textarea', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-textarea')).to.exist;
  });

  it('renders a label and a textarea with the given rows', async () => {
    const el = await fixture<WmcpTextarea>(
      html`<wmcp-textarea label="Bio" rows="6"></wmcp-textarea>`,
    );
    const label = el.shadowRoot!.querySelector('label');
    const control = el.shadowRoot!.querySelector('textarea');
    expect(label?.textContent?.trim()).to.equal('Bio');
    expect(control).to.exist;
    expect(control!.rows).to.equal(6);
  });

  it('updates value when the user types', async () => {
    const el = await fixture<WmcpTextarea>(html`<wmcp-textarea></wmcp-textarea>`);
    const control = el.shadowRoot!.querySelector('textarea')!;
    control.value = 'multi\nline';
    control.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.value).to.equal('multi\nline');
  });

  describe('form association', () => {
    it('contributes its value to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-textarea name="bio"></wmcp-textarea></form>`,
      );
      const el = form.querySelector<WmcpTextarea>('wmcp-textarea')!;
      el.value = 'hello world';
      await el.updateComplete;
      expect(new FormData(form).get('bio')).to.equal('hello world');
    });

    it('clears on form reset', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-textarea name="bio"></wmcp-textarea></form>`,
      );
      const el = form.querySelector<WmcpTextarea>('wmcp-textarea')!;
      el.value = 'hello world';
      await el.updateComplete;
      form.reset();
      await el.updateComplete;
      expect(el.value).to.equal('');
    });
  });

  describe('Standard Schema validation', () => {
    it('flags an invalid value with a11y wiring', async () => {
      const el = await fixture<WmcpTextarea>(html`<wmcp-textarea></wmcp-textarea>`);
      el.schema = minLenSchema;
      await el.setValueFromAgent('too short');
      await el.updateComplete;

      expect(el.hasAttribute('invalid')).to.be.true;
      const error = el.shadowRoot!.querySelector('.error');
      expect(error?.textContent).to.contain('at least 10');
      expect(error?.getAttribute('role')).to.equal('alert');
      const control = el.shadowRoot!.querySelector('textarea')!;
      expect(control.getAttribute('aria-invalid')).to.equal('true');
      expect(control.getAttribute('aria-describedby')).to.equal('wmcp-error');
    });

    it('reports invalidity to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wmcp-textarea name="bio"></wmcp-textarea></form>`,
      );
      const el = form.querySelector<WmcpTextarea>('wmcp-textarea')!;
      el.schema = minLenSchema;
      await el.setValueFromAgent('nope');
      await el.updateComplete;
      expect(form.checkValidity()).to.be.false;
    });
  });

  describe('WebMCP exposure', () => {
    it('exposes a fillable tool when [expose] is set', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTextarea>(
          html`<wmcp-textarea name="bio" label="Bio" expose></wmcp-textarea>`,
        );
        await el.updateComplete;

        expect(agent.tools.map((t) => t.name)).to.include('fill_bio');
        const result = await agent.call('fill_bio', {
          value: 'a longer agent-written bio',
        });
        await el.updateComplete;

        expect(el.value).to.equal('a longer agent-written bio');
        expect(result.content[0]!.text).to.contain('a longer agent-written bio');
      } finally {
        agent.restore();
      }
    });

    it('defaults the tool name to the textarea noun when unnamed', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpTextarea>(
          html`<wmcp-textarea expose></wmcp-textarea>`,
        );
        await el.updateComplete;
        expect(agent.tools.map((t) => t.name)).to.include('fill_textarea');
      } finally {
        agent.restore();
      }
    });
  });
});
