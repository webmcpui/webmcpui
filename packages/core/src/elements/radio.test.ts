import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { StandardSchemaV1 } from '../standard-schema.js';
import type { WmcpRadio, WmcpRadioGroup } from './radio.js';

before(() => defineComponents());

const requiredChoice: StandardSchemaV1<unknown, string> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) =>
      typeof value === 'string' && value.length > 0
        ? { value }
        : { issues: [{ message: 'Please choose an option' }] },
  },
};

describe('wmcp-radio-group', () => {
  it('registers both custom elements', () => {
    expect(customElements.get('wmcp-radio')).to.exist;
    expect(customElements.get('wmcp-radio-group')).to.exist;
  });

  it('renders declarative <wmcp-radio> children into radio inputs', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group label="Size">
        <wmcp-radio value="s" label="Small"></wmcp-radio>
        <wmcp-radio value="m" label="Medium"></wmcp-radio>
      </wmcp-radio-group>
    `);
    const inputs = el.shadowRoot!.querySelectorAll('input[type="radio"]');
    expect([...inputs].map((i) => (i as HTMLInputElement).value)).to.deep.equal([
      's',
      'm',
    ]);
    expect(
      [...el.shadowRoot!.querySelectorAll('.label-text')].map((s) =>
        s.textContent?.trim(),
      ),
    ).to.deep.equal(['Small', 'Medium']);
  });

  it('groups the rendered inputs under one shared name', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group>
        <wmcp-radio value="a" label="A"></wmcp-radio>
        <wmcp-radio value="b" label="B"></wmcp-radio>
      </wmcp-radio-group>
    `);
    const names = [
      ...el.shadowRoot!.querySelectorAll<HTMLInputElement>('input'),
    ].map((i) => i.name);
    expect(names[0]).to.be.a('string').and.not.equal('');
    expect(new Set(names).size).to.equal(1);
  });

  it('uses a <wmcp-radio> label from its text content when no attribute', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group>
        <wmcp-radio value="a">Apple</wmcp-radio>
      </wmcp-radio-group>
    `);
    expect(el.shadowRoot!.querySelector('.label-text')?.textContent?.trim()).to.equal(
      'Apple',
    );
  });

  it('hides its <wmcp-radio> data members (they render nothing themselves)', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group>
        <wmcp-radio value="a" label="A"></wmcp-radio>
      </wmcp-radio-group>
    `);
    const radio = el.querySelector<WmcpRadio>('wmcp-radio')!;
    expect(getComputedStyle(radio).display).to.equal('none');
  });

  it('renders from the options property (takes precedence)', async () => {
    const el = await fixture<WmcpRadioGroup>(
      html`<wmcp-radio-group></wmcp-radio-group>`,
    );
    el.options = [
      { value: 'x', label: 'X' },
      { value: 'y', label: 'Y' },
    ];
    await el.updateComplete;
    const inputs = el.shadowRoot!.querySelectorAll('input[type="radio"]');
    expect([...inputs].map((i) => (i as HTMLInputElement).value)).to.deep.equal([
      'x',
      'y',
    ]);
  });

  it('disables an individual option', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group>
        <wmcp-radio value="a" label="A"></wmcp-radio>
        <wmcp-radio value="b" label="B" disabled></wmcp-radio>
      </wmcp-radio-group>
    `);
    const inputs = el.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
    expect(inputs[0]!.disabled).to.be.false;
    expect(inputs[1]!.disabled).to.be.true;
  });

  it('updates value on selection', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group>
        <wmcp-radio value="a" label="A"></wmcp-radio>
        <wmcp-radio value="b" label="B"></wmcp-radio>
      </wmcp-radio-group>
    `);
    const second = el.shadowRoot!.querySelectorAll<HTMLInputElement>('input')[1]!;
    second.checked = true;
    second.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.value).to.equal('b');
  });

  it('reflects its value to the checked input', async () => {
    const el = await fixture<WmcpRadioGroup>(html`
      <wmcp-radio-group value="b">
        <wmcp-radio value="a" label="A"></wmcp-radio>
        <wmcp-radio value="b" label="B"></wmcp-radio>
      </wmcp-radio-group>
    `);
    const inputs = el.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
    expect(inputs[0]!.checked).to.be.false;
    expect(inputs[1]!.checked).to.be.true;
  });

  describe('form association', () => {
    it('contributes its value to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <wmcp-radio-group name="size">
            <wmcp-radio value="s" label="Small"></wmcp-radio>
            <wmcp-radio value="m" label="Medium"></wmcp-radio>
          </wmcp-radio-group>
        </form>
      `);
      const el = form.querySelector<WmcpRadioGroup>('wmcp-radio-group')!;
      el.value = 'm';
      await el.updateComplete;
      expect(new FormData(form).get('size')).to.equal('m');
    });

    it('clears on form reset', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <wmcp-radio-group name="size">
            <wmcp-radio value="s" label="Small"></wmcp-radio>
          </wmcp-radio-group>
        </form>
      `);
      const el = form.querySelector<WmcpRadioGroup>('wmcp-radio-group')!;
      el.value = 's';
      await el.updateComplete;
      form.reset();
      await el.updateComplete;
      expect(el.value).to.equal('');
    });
  });

  describe('Standard Schema validation', () => {
    it('flags an empty choice and reports to the form', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <wmcp-radio-group name="size">
            <wmcp-radio value="s" label="Small"></wmcp-radio>
          </wmcp-radio-group>
        </form>
      `);
      const el = form.querySelector<WmcpRadioGroup>('wmcp-radio-group')!;
      el.schema = requiredChoice;
      await el.validate();
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.true;
      expect(el.shadowRoot!.querySelector('.error')?.textContent).to.contain(
        'choose',
      );
      expect(form.checkValidity()).to.be.false;

      await el.setValueFromAgent('s');
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.false;
      expect(form.checkValidity()).to.be.true;
    });
  });

  describe('WebMCP exposure', () => {
    it('exposes a tool whose value is an enum of option values', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpRadioGroup>(html`
          <wmcp-radio-group name="size" label="Size" expose>
            <wmcp-radio value="s" label="Small"></wmcp-radio>
            <wmcp-radio value="m" label="Medium"></wmcp-radio>
          </wmcp-radio-group>
        `);
        await el.updateComplete;

        const tool = agent.get('fill_size');
        expect(tool).to.exist;
        const valueSchema = (tool!.inputSchema as any).properties.value;
        expect(valueSchema.enum).to.deep.equal(['s', 'm']);

        const result = await agent.call('fill_size', { value: 'm' });
        await el.updateComplete;
        expect(el.value).to.equal('m');
        expect(result.content[0]!.text).to.contain('m');
      } finally {
        agent.restore();
      }
    });
  });
});
