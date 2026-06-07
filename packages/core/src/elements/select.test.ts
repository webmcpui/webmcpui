import { fixture, html, expect } from '@open-wc/testing';
import { defineComponents } from '../register.js';
import { installFakeAgent } from '../testing.js';
import type { StandardSchemaV1 } from '../standard-schema.js';
import type { WmcpSelect } from './select.js';

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

describe('wmcp-select', () => {
  it('registers the custom element', () => {
    expect(customElements.get('wmcp-select')).to.exist;
  });

  it('renders declarative <option> children into the shadow select', async () => {
    const el = await fixture<WmcpSelect>(html`
      <wmcp-select label="Color">
        <option value="red">Red</option>
        <option value="green">Green</option>
      </wmcp-select>
    `);
    const options = el.shadowRoot!.querySelectorAll('option');
    expect([...options].map((o) => o.value)).to.deep.equal(['red', 'green']);
    expect(el.flatOptions().map((o) => o.value)).to.deep.equal(['red', 'green']);
  });

  it('renders from the options property (takes precedence)', async () => {
    const el = await fixture<WmcpSelect>(html`<wmcp-select></wmcp-select>`);
    el.options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    await el.updateComplete;
    const options = el.shadowRoot!.querySelectorAll('option');
    expect([...options].map((o) => o.value)).to.deep.equal(['a', 'b']);
  });

  it('renders option groups', async () => {
    const el = await fixture<WmcpSelect>(html`
      <wmcp-select>
        <optgroup label="Warm"><option value="red">Red</option></optgroup>
        <optgroup label="Cool"><option value="blue">Blue</option></optgroup>
      </wmcp-select>
    `);
    const groups = el.shadowRoot!.querySelectorAll('optgroup');
    expect(groups.length).to.equal(2);
    expect(el.flatOptions().map((o) => o.value)).to.deep.equal(['red', 'blue']);
  });

  it('renders a disabled placeholder option', async () => {
    const el = await fixture<WmcpSelect>(html`
      <wmcp-select placeholder="Choose…">
        <option value="a">A</option>
      </wmcp-select>
    `);
    const first = el.shadowRoot!.querySelector('option')!;
    expect(first.textContent?.trim()).to.equal('Choose…');
    expect(first.disabled).to.be.true;
  });

  it('updates value on selection', async () => {
    const el = await fixture<WmcpSelect>(html`
      <wmcp-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </wmcp-select>
    `);
    const select = el.shadowRoot!.querySelector('select')!;
    select.value = 'b';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.value).to.equal('b');
  });

  describe('form association', () => {
    it('contributes its value to the containing form', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <wmcp-select name="color">
            <option value="red">Red</option>
            <option value="green">Green</option>
          </wmcp-select>
        </form>
      `);
      const el = form.querySelector<WmcpSelect>('wmcp-select')!;
      el.value = 'green';
      await el.updateComplete;
      expect(new FormData(form).get('color')).to.equal('green');
    });

    it('clears on form reset', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <wmcp-select name="color">
            <option value="red">Red</option>
          </wmcp-select>
        </form>
      `);
      const el = form.querySelector<WmcpSelect>('wmcp-select')!;
      el.value = 'red';
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
          <wmcp-select name="color">
            <option value="red">Red</option>
          </wmcp-select>
        </form>
      `);
      const el = form.querySelector<WmcpSelect>('wmcp-select')!;
      el.schema = requiredChoice;
      await el.setValueFromAgent('');
      await el.updateComplete;
      expect(el.hasAttribute('invalid')).to.be.true;
      expect(el.shadowRoot!.querySelector('.error')?.textContent).to.contain(
        'choose',
      );
      expect(form.checkValidity()).to.be.false;
    });
  });

  describe('WebMCP exposure', () => {
    it('exposes a tool whose value is an enum of option values', async () => {
      const agent = installFakeAgent();
      try {
        const el = await fixture<WmcpSelect>(html`
          <wmcp-select name="color" label="Color" expose>
            <option value="red">Red</option>
            <option value="green">Green</option>
          </wmcp-select>
        `);
        await el.updateComplete;

        const tool = agent.get('fill_color');
        expect(tool).to.exist;
        const valueSchema = (tool!.inputSchema as any).properties.value;
        expect(valueSchema.enum).to.deep.equal(['red', 'green']);

        const result = await agent.call('fill_color', { value: 'green' });
        await el.updateComplete;
        expect(el.value).to.equal('green');
        expect(result.content[0]!.text).to.contain('green');
      } finally {
        agent.restore();
      }
    });
  });
});
