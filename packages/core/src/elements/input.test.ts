import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { StandardSchemaV1 } from '../standard-schema.js';
import type { WmcpInput } from './input.js';

before(() => defineComponents());

/** A hand-rolled Standard Schema (no validator dependency in tests). */
const emailSchema: StandardSchemaV1<unknown, string> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) =>
      typeof value === 'string' && value.includes('@')
        ? { value }
        : { issues: [{ message: 'Enter a valid email address' }] },
  },
};

describe('wmcp-input', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-input')).to.exist;
  });

  it('renders the label and an input', async () => {
    const el = await fixture<WmcpInput>(
      html`<wmcp-input label="Email"></wmcp-input>`,
    );
    const label = el.shadowRoot!.querySelector('label');
    const input = el.shadowRoot!.querySelector('input');
    expect(label?.textContent?.trim()).to.equal('Email');
    expect(input).to.exist;
  });

  it('updates value when the user types', async () => {
    const el = await fixture<WmcpInput>(html`<wmcp-input></wmcp-input>`);
    const input = el.shadowRoot!.querySelector('input')!;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.value).to.equal('hello');
  });

  describe('form association', () => {
    it('contributes its value to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-input name="email"></wmcp-input>
        </form>`,
      );
      const el = form.querySelector<WmcpInput>('wmcp-input')!;
      el.value = 'a@b.com';
      await el.updateComplete;
      const data = new FormData(form);
      expect(data.get('email')).to.equal('a@b.com');
    });

    it('clears on form reset', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-input name="email"></wmcp-input>
        </form>`,
      );
      const el = form.querySelector<WmcpInput>('wmcp-input')!;
      el.value = 'a@b.com';
      await el.updateComplete;
      form.reset();
      await el.updateComplete;
      expect(el.value).to.equal('');
      expect(new FormData(form).get('email')).to.equal('');
    });
  });

  describe('Standard Schema validation', () => {
    it('flags an invalid value with a11y wiring', async () => {
      const el = await fixture<WmcpInput>(html`<wmcp-input></wmcp-input>`);
      el.schema = emailSchema;
      await el.setValueFromAgent('not-an-email');
      await el.updateComplete;

      expect(el.hasAttribute('invalid')).to.be.true;
      const error = el.shadowRoot!.querySelector('.error');
      expect(error?.textContent).to.contain('valid email');
      expect(error?.getAttribute('role')).to.equal('alert');
      const input = el.shadowRoot!.querySelector('input')!;
      expect(input.getAttribute('aria-invalid')).to.equal('true');
      expect(input.getAttribute('aria-describedby')).to.equal('wmcp-error');
    });

    it('clears the error when the value becomes valid', async () => {
      const el = await fixture<WmcpInput>(html`<wmcp-input></wmcp-input>`);
      el.schema = emailSchema;
      await el.setValueFromAgent('nope');
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.true;

      await el.setValueFromAgent('a@b.com');
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.false;
      expect(el.shadowRoot!.querySelector('.error')).to.not.exist;
      expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-invalid')).to.equal(
        'false',
      );
    });

    it('reports invalidity to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wmcp-input name="email"></wmcp-input>
        </form>`,
      );
      const el = form.querySelector<WmcpInput>('wmcp-input')!;
      el.schema = emailSchema;
      await el.setValueFromAgent('bad');
      await el.updateComplete;
      expect(form.checkValidity()).to.be.false;
    });
  });

  describe('WebMCP exposure', () => {
    it('registers no tool by default', async () => {
      const agent = installFakeAgent();
      try {
        await fixture<WmcpInput>(html`<wmcp-input name="email"></wmcp-input>`);
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });

    it('exposes a fillable tool when [expose] is set', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpInput>(
          html`<wmcp-input name="email" label="Email" expose></wmcp-input>`,
        );
        await el.updateComplete;

        expect(agent.tools.map((t) => t.name)).to.include('fill_email');

        const result = await agent.call('fill_email', {
          value: 'agent@webmcpui.com',
        });
        await el.updateComplete;

        expect(el.value).to.equal('agent@webmcpui.com');
        expect(result.content[0]!.text).to.contain('agent@webmcpui.com');
      } finally {
        agent.restore();
      }
    });

    it('unregisters the tool on disconnect', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpInput>(
          html`<wmcp-input name="email" expose></wmcp-input>`,
        );
        await el.updateComplete;
        expect(agent.tools).to.have.length(1);

        el.remove();
        expect(agent.tools).to.have.length(0);
      } finally {
        agent.restore();
      }
    });
  });
});
